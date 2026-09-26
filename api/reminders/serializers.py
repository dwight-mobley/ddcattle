from rest_framework import serializers

from .models import Reminder, ReminderCompletion


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
            "completed_at",
            "completed_by",
            "completed_by_name",
        ]


class ReminderSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(
        source="animal.name",
        read_only=True,
    )

    completions = ReminderCompletionSerializer(
        many=True,
        read_only=True,
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

        return attrs