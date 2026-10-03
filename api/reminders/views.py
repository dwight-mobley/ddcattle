from dateutil.relativedelta import relativedelta
from django.utils import timezone
from django.db import transaction

from rest_framework import status, viewsets, serializers
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Reminder, ReminderCompletion, MedicalReminder
from .serializers import ReminderSerializer, CompleteReminderSerializer, BulkReminderSerializer

from animals.models.animal import Animal
from medical.models import MedicalRecord


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

    @action(
        detail=False,
        methods=["post"],
        url_path="bulk-create",
    )
    @transaction.atomic
    def bulk_create(self, request):
        bulk_serializer = BulkReminderSerializer(
            data=request.data
        )
        bulk_serializer.is_valid(raise_exception=True)

        data = bulk_serializer.validated_data

        animal_ids = data.pop("animals")
        medical_data = data.pop("medical", None)

        animals = Animal.objects.filter(
            id__in=animal_ids
        )

        animals_by_id = {
            animal.id: animal
            for animal in animals
        }

        missing_ids = [
            animal_id
            for animal_id in animal_ids
            if animal_id not in animals_by_id
        ]

        if missing_ids:
            raise serializers.ValidationError({
                "animals": (
                    "The following animal IDs do not exist: "
                    + ", ".join(
                        str(animal_id)
                        for animal_id in missing_ids
                    )
                )
            })

        created_reminders = []

        for animal_id in animal_ids:
            animal = animals_by_id[animal_id]

            reminder_data = {
                **data,
                "animal": animal.id,
            }

            if medical_data is not None:
                reminder_data["medical"] = medical_data.copy()

            reminder_serializer = ReminderSerializer(
                data=reminder_data
            )

            reminder_serializer.is_valid(
                raise_exception=True
            )

            reminder = reminder_serializer.save(
                created_by=request.user
            )

            created_reminders.append(reminder)

        response_serializer = ReminderSerializer(
            created_reminders,
            many=True,
        )

        return Response(
            {
                "count": len(created_reminders),
                "reminders": response_serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def complete(self, request, pk=None):
        reminder = self.get_object()

        if not reminder.active:
            return Response(
                {
                    "detail": "This reminder is already inactive."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = CompleteReminderSerializer(
            data=request.data
        )
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        completed_at = data.get(
            "completed_at",
            timezone.now(),
        )

        completion = ReminderCompletion.objects.create(
            reminder=reminder,
            completed_by=request.user,
            completed_at=completed_at,
            notes=data.get("notes", ""),
        )

        medical_record = None

        try:
            medical_config = reminder.medical_config
        except MedicalReminder.DoesNotExist:
            medical_config = None

        if (
            medical_config
            and medical_config.create_record_on_completion
        ):
            if reminder.animal is None:
                raise serializers.ValidationError({
                    "animal":
                        "A medical reminder must be associated with an animal."
                })

            medical_record = MedicalRecord.objects.create(
                animal=reminder.animal,
                record_type=medical_config.record_type,
                title=reminder.title,
                date=completed_at.date(),
                description=data.get("description", ""),
                veterinarian=data.get("veterinarian", ""),
                clinic=data.get("clinic", ""),
                medication=data.get("medication", ""),
                dosage=data.get("dosage", ""),
                private_notes=data.get("notes", ""),
                created_by=request.user,
            )

        if reminder.recurring:
            reminder.due_date = self._get_next_due_date(
                reminder,
                completed_at.date(),
            )
        else:
            reminder.active = False

        reminder.save()

        return Response(
            {
                "detail": "Reminder completed successfully.",
                "completion_id": completion.id,
                "completed_at": completion.completed_at,
                "medical_record_id": (
                    medical_record.id
                    if medical_record
                    else None
                ),
                "next_due_date": (
                    reminder.due_date
                    if reminder.recurring
                    else None
                ),
                "active": reminder.active,
            },
            status=status.HTTP_200_OK,
        )
    def _get_next_due_date(self, reminder, completed_date):
        interval = reminder.recurrence_interval

        if reminder.recurrence_unit == Reminder.RecurrenceUnit.DAYS:
            return completed_date + relativedelta(
                days=interval
            )

        if reminder.recurrence_unit == Reminder.RecurrenceUnit.WEEKS:
            return completed_date + relativedelta(
                weeks=interval
            )

        if reminder.recurrence_unit == Reminder.RecurrenceUnit.MONTHS:
            return completed_date + relativedelta(
                months=interval
            )

        if reminder.recurrence_unit == Reminder.RecurrenceUnit.YEARS:
            return completed_date + relativedelta(
                years=interval
            )

        raise ValueError(
            f"Unsupported recurrence unit: "
            f"{reminder.recurrence_unit}"
        )

