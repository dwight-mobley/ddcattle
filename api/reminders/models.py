from django.conf import settings
from django.db import models

from animals.models.animal import Animal
from medical.models import MedicalRecord


class Reminder(models.Model):

    class ReminderType(models.TextChoices):
        GENERAL = "general", "General"
        MEDICAL = "medical", "Medical"
        APPOINTMENT = "appointment", "Appointment"
        FEED = "feed", "Feed / Supplies"
        OTHER = "other", "Other"

    class RecurrenceUnit(models.TextChoices):
        DAYS = "days", "Days"
        WEEKS = "weeks", "Weeks"
        MONTHS = "months", "Months"
        YEARS = "years", "Years"

    title = models.CharField(
        max_length=200,
    )

    description = models.TextField(
        blank=True,
    )

    reminder_type = models.CharField(
        max_length=30,
        choices=ReminderType.choices,
        default=ReminderType.GENERAL,
    )

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="reminders",
        null=True,
        blank=True,
    )

    due_date = models.DateField()

    # Recurrence
    recurring = models.BooleanField(
        default=False,
    )

    recurrence_interval = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    recurrence_unit = models.CharField(
        max_length=20,
        choices=RecurrenceUnit.choices,
        null=True,
        blank=True,
    )

    active = models.BooleanField(
        default=True,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reminders_created",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title

class ReminderCompletion(models.Model):
    reminder = models.ForeignKey(
        Reminder,
        on_delete=models.CASCADE,
        related_name="completions",
    )

    completed_at = models.DateTimeField(
        auto_now_add=True,
    )

    completed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="reminder_completions",
    )

    notes = models.TextField(
        blank=True,
    )

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.reminder.title} - {self.completed_at.date()}"

class MedicalReminder(models.Model):
    reminder = models.OneToOneField(
        "reminders.Reminder",
        on_delete=models.CASCADE,
        related_name="medical_config",
    )

    record_type = models.CharField(
        max_length=30,
        choices=MedicalRecord.RecordType.choices,
    )

    create_record_on_completion = models.BooleanField(
        default=True,
    )

    def __str__(self):
        return f"Medical reminder: {self.reminder.title}"