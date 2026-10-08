from django.db import transaction
from rest_framework import serializers
from animals.models.animal import Animal
from .models import RidingLocation, Ride, RideParticipant, TrainingSession, TrainingSkill, SessionSkillProgress
from .access import accessible_animals, require_manage, visible_rides, accessible_locations


class CheckedSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        attrs = super().validate(attrs)
        user = self.context["request"].user
        animal = attrs.get("animal", getattr(self.instance, "animal", None))
        if animal:
            if animal.species != Animal.Species.HORSE:
                raise serializers.ValidationError({"animal": "Choose a horse."})
            require_manage(user, [animal])
        if self.instance and hasattr(self.instance, "animal"):
            require_manage(user, [self.instance.animal])
        location = attrs.get("location")
        if location and not accessible_locations(user).filter(pk=location.pk).exists():
            raise serializers.ValidationError({"location": "Choose a location you manage."})
        return attrs


class RidingLocationSerializer(CheckedSerializer):
    class Meta:
        model = RidingLocation
        fields = ["id", "name", "address", "city", "state", "latitude", "longitude", "notes", "active", "created_by", "created_at", "updated_at"]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        lat = attrs.get("latitude", getattr(self.instance, "latitude", None))
        lon = attrs.get("longitude", getattr(self.instance, "longitude", None))
        if (lat is None) != (lon is None):
            raise serializers.ValidationError("Supply both coordinates or neither.")
        return attrs


class ParticipantSerializer(CheckedSerializer):
    class Meta:
        model = RideParticipant
        fields = ["id", "animal", "rider", "rider_name", "notes", "duration_minutes", "distance_miles"]


ACTIVITY_FIELDS = ["id", "title", "date", "location", "location_name", "duration_minutes", "notes", "created_by", "created_at", "updated_at"]


class RideSerializer(CheckedSerializer):
    participants = ParticipantSerializer(many=True)

    class Meta:
        model = Ride
        fields = ACTIVITY_FIELDS + ["ride_type", "distance_miles", "route", "terrain", "weather", "participants"]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        user = self.context["request"].user
        if self.instance:
            require_manage(user, [p.animal for p in self.instance.participants.all()])
        participants = attrs.get("participants")
        if participants is not None:
            ids = [p["animal"].pk for p in participants]
            if not ids or len(ids) != len(set(ids)):
                raise serializers.ValidationError({"participants": "Supply at least one horse, once each."})
            require_manage(user, [p["animal"] for p in participants])
            if self.instance:
                linked = set(self.instance.training_sessions.values_list("animal_id", flat=True))
                if not linked.issubset(ids):
                    raise serializers.ValidationError({"participants": "A linked training session still belongs to a removed horse."})
                from django.contrib.contenttypes.models import ContentType
                from media_library.models import AnimalMedia
                attached = set(AnimalMedia.objects.filter(content_type=ContentType.objects.get_for_model(Ride), object_id=self.instance.pk).values_list("animal_id", flat=True))
                if not attached.issubset(ids):
                    raise serializers.ValidationError({"participants": "Detach this horse's ride media before removing it."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        participants = validated_data.pop("participants")
        ride = super().create(validated_data)
        for participant in participants:
            RideParticipant.objects.create(ride=ride, **participant)
        return ride

    @transaction.atomic
    def update(self, instance, validated_data):
        participants = validated_data.pop("participants", None)
        instance = super().update(instance, validated_data)
        if participants is not None:
            wanted = {p["animal"].pk for p in participants}
            instance.participants.exclude(animal_id__in=wanted).delete()
            for participant in participants:
                animal = participant.pop("animal")
                RideParticipant.objects.update_or_create(ride=instance, animal=animal, defaults=participant)
        return instance


class TrainingSessionSerializer(CheckedSerializer):
    class Meta:
        model = TrainingSession
        fields = ACTIVITY_FIELDS + ["animal", "trainer", "trainer_name", "session_type", "ride", "goals", "successes", "next_steps"]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        animal = attrs.get("animal", getattr(self.instance, "animal", None))
        ride = attrs.get("ride", getattr(self.instance, "ride", None))
        if ride and (not visible_rides(self.context["request"].user).filter(pk=ride.pk).exists() or not ride.participants.filter(animal=animal).exists()):
            raise serializers.ValidationError({"ride": "Choose an accessible ride containing this horse."})
        if self.instance and animal.pk != self.instance.animal_id:
            raise serializers.ValidationError({"animal": "Create a new session to change its horse; existing evidence must retain its subject."})
        return attrs


class TrainingSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingSkill
        fields = ["id", "code", "name", "category", "assessment_criteria", "active"]

    def validate_code(self, value):
        if self.instance and value != self.instance.code:
            raise serializers.ValidationError("Skill codes are stable identifiers; create a new skill instead.")
        return value


class SessionSkillProgressSerializer(serializers.ModelSerializer):
    context = serializers.CharField(required=False, allow_blank=True, default="")
    class Meta:
        model = SessionSkillProgress
        fields = ["id", "session", "skill", "proficiency", "accomplished", "context", "accomplishment", "evidence", "created_by", "created_at", "updated_at"]
        read_only_fields = ["created_by", "created_at", "updated_at"]

    def validate(self, attrs):
        attrs = super().validate(attrs)
        session = attrs.get("session", getattr(self.instance, "session", None))
        if session:
            require_manage(self.context["request"].user, [session.animal])
        if self.instance:
            require_manage(self.context["request"].user, [self.instance.session.animal])
            if session.pk != self.instance.session_id:
                raise serializers.ValidationError({"session": "Assessment history cannot be reassigned to another session."})
        if (attrs.get("proficiency", getattr(self.instance, "proficiency", "")) or attrs.get("accomplished", getattr(self.instance, "accomplished", False))) and not attrs.get("evidence", getattr(self.instance, "evidence", "")).strip():
            raise serializers.ValidationError({"evidence": "Describe the evidence supporting this assessment."})
        return attrs
