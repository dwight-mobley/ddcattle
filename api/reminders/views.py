from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Reminder
from .serializers import ReminderSerializer


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = (
            Reminder.objects
            .select_related(
                "animal",
                "created_by",
            )
            .prefetch_related(
                "completions",
            )
            .order_by("due_date")
        )

        animal_id = self.request.query_params.get("animal")
        active = self.request.query_params.get("active")

        if animal_id:
            queryset = queryset.filter(animal_id=animal_id)

        if active is not None:
            if active.lower() == "true":
                queryset = queryset.filter(active=True)
            elif active.lower() == "false":
                queryset = queryset.filter(active=False)

        return queryset

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )