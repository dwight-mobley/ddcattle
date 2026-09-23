from django.conf import settings
from django.db import models

from animals.models.animal import Animal


class Appointment(models.Model):

    class AppointmentType(models.TextChoices):
        VET = "vet", "Veterinarian"
        FARRIER = "farrier", "Farrier"
        DENTIST = "dentist", "Dentist"
        TRAINING = "training", "Training"
        GROOMING = "grooming", "Grooming"
        OTHER = "other", "Other"

    class Recurrence(models.TextChoices):
        NONE = "none", "Does not repeat"
        DAILY = "daily", "Daily"
        WEEKLY = "weekly", "Weekly"
        BIWEEKLY = "biweekly", "Every 2 weeks"
        MONTHLY = "monthly", "Monthly"
        YEARLY = "yearly", "Yearly"

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="appointments",
    )

    appointment_type = models.CharField(
        max_length=30,
        choices=AppointmentType.choices,
        default=AppointmentType.OTHER,
    )

    title = models.CharField(max_length=200)

    starts_at = models.DateTimeField()

    ends_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    location = models.CharField(
        max_length=250,
        blank=True,
    )

    provider = models.CharField(
        max_length=200,
        blank=True,
    )

    notes = models.TextField(blank=True)

    recurrence = models.CharField(
        max_length=30,
        choices=Recurrence.choices,
        default=Recurrence.NONE,
    )

    recurrence_until = models.DateField(
        null=True,
        blank=True,
    )

    reminder_days_before = models.PositiveIntegerField(
        default=1,
    )

    completed = models.BooleanField(
        default=False,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="appointments_created",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.animal.name}: {self.title}"