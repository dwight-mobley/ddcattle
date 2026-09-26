from rest_framework import serializers

from .models import MedicalRecord


class MedicalRecordSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(
        source="animal.name",
        read_only=True,
    )

    created_by_name = serializers.CharField(
        source="created_by.get_full_name",
        read_only=True,
    )

    class Meta:
        model = MedicalRecord
        fields = [
            "id",
            "animal",
            "animal_name",
            "record_type",
            "title",
            "date",
            "description",
            "veterinarian",
            "clinic",
            "medication",
            "dosage",
            "follow_up_date",
            "private_notes",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
            "animal_name",
            "created_by_name",
        ]