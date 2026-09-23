from animals.models.animal import Animal
from django.db import models

class CattleDetails(Animal):
    
    breed = models.CharField(
        max_length=150,
        blank=True,
    )

    registration_number = models.CharField(
        max_length=150,
        blank=True,
    )

    ear_tag = models.CharField(
        max_length=100,
        blank=True,
    )

    brand = models.CharField(
        max_length=150,
        blank=True,
    )

    sire = models.CharField(
        max_length=150,
        blank=True,
    )

    dam = models.CharField(
        max_length=150,
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    class Meta:
        verbose_name= "Cattle Details"
        verbose_name_plural= "Cattle Details"

    def __str__(self):
        return f"Cattle details: {self.name}"