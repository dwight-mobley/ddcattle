from django.db import models
from animals.models.animal import Animal

class DogBreed(models.Model):
    name = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return f"{self.name}"

class Dog(Animal):

    breed = models.ForeignKey(
        DogBreed,
        on_delete=models.PROTECT,
        blank=True,
        null=True,
        related_name='dogs'
    )

    registration_number = models.CharField(
        max_length=150,
        blank=True,
    )

    microchip_number = models.CharField(
        max_length=100,
        blank=True,
    )

    rabies_tag_number = models.CharField(
        max_length=100,
        blank=True,
    )

    spayed_neutered = models.BooleanField(
        null=True,
        blank=True,
    )

    notes = models.TextField(
        blank=True,
    )

    def __str__(self):
        return f"{self.name}"