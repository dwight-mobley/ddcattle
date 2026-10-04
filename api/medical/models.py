from django.conf import settings
from django.db import models

from animals.models.animal import Animal


class MedicalRecord(models.Model):

    class RecordType(models.TextChoices):
        GENERAL = "general", "General"
        EXAM = "exam", "Exam"
        VACCINATION = "vaccination", "Vaccination"
        MEDICATION = "medication", "Medication"
        INJURY = "injury", "Injury"
        SURGERY = "surgery", "Surgery"
        DENTAL = "dental", "Dental"
        LAB = "lab", "Lab/Test"
        DEWORMING = "deworming", "Deworming"
        OTHER = "other", "Other"

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="medical_records",
    )

    record_type = models.CharField(
        max_length=30,
        choices=RecordType.choices,
        default=RecordType.GENERAL,
    )

    title = models.CharField(max_length=200)

    date = models.DateField()

    description = models.TextField(blank=True)

    weight = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Weight in pounds at the time of this record.",
    )

    height = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Height at the time of this record.",
    )

    veterinarian = models.CharField(
        max_length=200,
        blank=True,
    )

    clinic = models.CharField(
        max_length=200,
        blank=True,
    )

    medication = models.CharField(
        max_length=250,
        blank=True,
    )

    dosage = models.CharField(
        max_length=150,
        blank=True,
    )

    follow_up_date = models.DateField(
        null=True,
        blank=True,
    )

    private_notes = models.TextField(blank=True)

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="medical_records_created",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.animal.name}: {self.title}"