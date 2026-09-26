from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import MedicalRecord
from .serializers import MedicalRecordSerializer


class MedicalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = MedicalRecordSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            MedicalRecord.objects
            .select_related(
                "animal",
                "created_by",
            )
            .order_by("-date", "-created_at")
        )

        animal_id = self.request.query_params.get("animal")

        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )