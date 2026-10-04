from django.contrib.contenttypes.models import ContentType
from django.db import transaction
from django.db.models import Q
from django.db.models.deletion import ProtectedError
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated, IsAdminUser, SAFE_METHODS
from rest_framework.response import Response
from media_library.models import AnimalMedia
from media_library.serializers import MediaLibrarySerializer
from .models import RidingLocation, Ride, TrainingSession, TrainingSkill, SessionSkillProgress
from .serializers import RidingLocationSerializer, RideSerializer, TrainingSessionSerializer, TrainingSkillSerializer, SessionSkillProgressSerializer
from .access import accessible_animals, require_manage, visible_rides, accessible_locations


class RecordViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_destroy(self, instance):
        if isinstance(instance, Ride):
            require_manage(self.request.user, [p.animal for p in instance.participants.all()])
        elif isinstance(instance, TrainingSession):
            require_manage(self.request.user, [instance.animal])
        elif isinstance(instance, SessionSkillProgress):
            require_manage(self.request.user, [instance.session.animal])
        elif instance.created_by_id != self.request.user.pk and not self.request.user.is_staff:
            raise PermissionDenied()
        # Preserve uploads and avoid dangling GFK targets. Explicitly detach first.
        if isinstance(instance, (Ride, TrainingSession)) and AnimalMedia.objects.filter(content_type=ContentType.objects.get_for_model(instance), object_id=instance.pk).exists():
            raise ValidationError("Detach attached media before deleting this record.")
        if isinstance(instance, Ride) and instance.training_sessions.exists():
            raise ValidationError("Unlink training sessions before deleting this ride.")
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("This record is referenced by history; preserve or archive it instead.")

    def filter_dates(self, queryset):
        for param, lookup in [("date_from", "date__gte"), ("date_to", "date__lte")]:
            value = self.request.query_params.get(param)
            if value:
                from rest_framework.fields import DateField
                queryset = queryset.filter(**{lookup: DateField().run_validation(value)})
        for param in ["animal", "location"]:
            value = self.request.query_params.get(param)
            if value:
                from rest_framework.fields import IntegerField
                lookup = "participants__animal_id" if param == "animal" and self.queryset.model == Ride else param + "_id"
                queryset = queryset.filter(**{lookup: IntegerField(min_value=1).run_validation(value)})
        return queryset.distinct()


class RidingLocationViewSet(RecordViewSet):
    serializer_class = RidingLocationSerializer

    def get_queryset(self):
        queryset = accessible_locations(self.request.user)
        if self.request.method not in SAFE_METHODS and not self.request.user.is_staff:
            queryset = queryset.filter(created_by=self.request.user)
        return queryset


class MediaAttachmentMixin:
    @action(detail=True, methods=["get", "post"], url_path="media")
    def media(self, request, pk=None):
        record = self.get_object()
        animals = [p.animal for p in record.participants.all()] if isinstance(record, Ride) else [record.animal]
        content_type = ContentType.objects.get_for_model(record)
        if request.method == "GET":
            queryset = AnimalMedia.objects.filter(content_type=content_type, object_id=record.pk, animal__in=accessible_animals(request.user)).order_by("sort_order", "pk")
            return Response(MediaLibrarySerializer(queryset, many=True, context={"request": request}).data)
        serializer = MediaLibrarySerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        animal = serializer.validated_data["animal"]
        if animal.pk not in [a.pk for a in animals]:
            raise ValidationError({"animal": "This horse is not part of the selected record."})
        if serializer.validated_data["media_type"] not in ["image", "video"]:
            raise ValidationError({"media_type": "Use a photo or video for training and riding media."})
        require_manage(request.user, [animal], media=True)
        serializer.save(content_type=content_type, object_id=record.pk)
        return Response(serializer.data, status=201)


class RideViewSet(MediaAttachmentMixin, RecordViewSet):
    queryset = Ride.objects.all()
    serializer_class = RideSerializer

    def get_queryset(self):
        return self.filter_dates(visible_rides(self.request.user).select_related("location").prefetch_related("participants__animal", "participants__rider"))


class TrainingSessionViewSet(MediaAttachmentMixin, RecordViewSet):
    queryset = TrainingSession.objects.all()
    serializer_class = TrainingSessionSerializer

    def get_queryset(self):
        return self.filter_dates(TrainingSession.objects.filter(animal__in=accessible_animals(self.request.user)).select_related("animal", "location", "trainer", "ride"))


class TrainingSkillViewSet(viewsets.ModelViewSet):
    queryset = TrainingSkill.objects.all()
    serializer_class = TrainingSkillSerializer

    def get_permissions(self):
        return [IsAuthenticated()] if self.request.method in SAFE_METHODS else [IsAdminUser()]

    def perform_destroy(self, instance):
        from .rating import RUBRICS
        if any(instance.code in dict(skills) for skills in RUBRICS.values()):
            raise ValidationError("Rubric skills must be preserved. Set active to false instead.")
        try:
            instance.delete()
        except ProtectedError:
            raise ValidationError("This skill has assessment history. Set active to false instead.")


class SessionSkillProgressViewSet(RecordViewSet):
    serializer_class = SessionSkillProgressSerializer

    def get_queryset(self):
        queryset = SessionSkillProgress.objects.filter(session__animal__in=accessible_animals(self.request.user)).select_related("session__animal", "skill")
        for param, lookup in [("session", "session_id"), ("animal", "session__animal_id"), ("skill", "skill_id")]:
            value = self.request.query_params.get(param)
            if value:
                from rest_framework.fields import IntegerField
                queryset = queryset.filter(**{lookup: IntegerField(min_value=1).run_validation(value)})
        return queryset
