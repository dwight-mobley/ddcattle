from rest_framework import serializers

from .models import MedicalReminder, Reminder, ReminderCompletion

class MedicalReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalReminder
        fields = [
            "record_type",
            "create_record_on_completion",
        ]

class ReminderCompletionSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.CharField(
        source="completed_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = ReminderCompletion
        fields = [
            "id",
            "completed_at",
            "completed_by",
            "completed_by_name",
            "notes",
        ]
        read_only_fields = [
            "id",
            "completed_by",
            "completed_by_name",
        ]

class CompleteReminderSerializer(serializers.Serializer):
    completed_at = serializers.DateTimeField(
        required=False,
    )

    notes = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    description = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    veterinarian = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    clinic = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    medication = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )

    dosage = serializers.CharField(
        required=False,
        allow_blank=True,
        default="",
    )
class ReminderSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(
        source="animal.name",
        read_only=True,
    )

    completions = ReminderCompletionSerializer(
        many=True,
        read_only=True,
    )

    medical = MedicalReminderSerializer(
    source="medical_config",
    required=False,
    allow_null=True,
)

    class Meta:
        model = Reminder
        fields = [
            "id",
            "title",
            "description",
            "reminder_type",
            "animal",
            "animal_name",
            "due_date",
            "recurring",
            "recurrence_interval",
            "recurrence_unit",
            "active",
            "created_by",
            "created_at",
            "updated_at",
            "completions",
            "medical",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
            "animal_name",
            "completions",
        ]

    def validate(self, attrs):
        recurring = attrs.get(
            "recurring",
            getattr(self.instance, "recurring", False),
        )

        interval = attrs.get(
            "recurrence_interval",
            getattr(self.instance, "recurrence_interval", None),
        )

        unit = attrs.get(
            "recurrence_unit",
            getattr(self.instance, "recurrence_unit", None),
        )

        # Validate recurrence settings
        if recurring:
            if not interval:
                raise serializers.ValidationError({
                    "recurrence_interval":
                        "A recurring reminder requires an interval."
                })

            if not unit:
                raise serializers.ValidationError({
                    "recurrence_unit":
                        "A recurring reminder requires a recurrence unit."
                })

        # Validate medical reminder settings
        medical_provided = "medical_config" in attrs
        medical_data = attrs.get("medical_config")

        animal = attrs.get(
            "animal",
            getattr(self.instance, "animal", None),
        )

        creates_medical_record = False

        if medical_provided:
            if medical_data is not None:
                creates_medical_record = medical_data.get(
                    "create_record_on_completion",
                    True,
                )
        else:
            if self.instance is not None:
                try:
                    creates_medical_record = (
                        self.instance
                        .medical_config
                        .create_record_on_completion
                    )
                except MedicalReminder.DoesNotExist:
                    creates_medical_record = False

        if creates_medical_record and animal is None:
            raise serializers.ValidationError({
                "animal":
                    "An animal is required when a reminder "
                    "creates a medical record."
            })

        # Clear recurrence settings when the reminder is not recurring
        if not recurring:
            attrs["recurrence_interval"] = None
            attrs["recurrence_unit"] = None

        return attrs

    def create(self, validated_data):
        medical_data = validated_data.pop(
            "medical_config",
            None,
        )

        reminder = Reminder.objects.create(
            **validated_data
        )

        if medical_data:
            MedicalReminder.objects.create(
                reminder=reminder,
                **medical_data,
            )

        return reminder

    def update(self, instance, validated_data):
        medical_provided = "medical_config" in validated_data

        medical_data = validated_data.pop(
            "medical_config",
            None,
        )

        instance = super().update(
            instance,
            validated_data,
        )

        if medical_provided:
            if medical_data is None:
                MedicalReminder.objects.filter(
                    reminder=instance
                ).delete()

            else:
                MedicalReminder.objects.update_or_create(
                    reminder=instance,
                    defaults=medical_data,
                )

        return instance