from django.conf import settings
from django.db import models
from animals.models.animal import Animal
from django.db.models.functions import ExtractYear

class HorseBreed(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class Horse(Animal):

    class HorseSex(models.TextChoices):
        STALLION = "stallion", "Stallion"
        GELDING = "gelding", "Gelding"
        MARE = "mare", "Mare"
        FILLY = "filly", "Filly"
        COLT = "colt", "Colt"
        UNKNOWN = "unknown", "Unknown"

    foal_year = models.IntegerField(editable=False, null=True, blank=True)

    breed = models.ForeignKey(
        HorseBreed,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='horses'

    )

    brand = models.CharField(
        max_length=50,
        blank=True,
        verbose_name="BLM Brand"
    )

    herd_management_area = models.CharField(
        max_length=100,
        blank=True
    )

    adoption_date = models.DateField(
        null=True,
        blank=True
    )

    height = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Height in hands.",
    )

    registration_number = models.CharField(
        max_length=150,
        blank=True,
    )

    breed_registry = models.CharField(
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


    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamically change the allowed choices for THIS subclass in Python memory
        self._meta.get_field('sex').choices = self.HorseSex.choices

    def save(self, *args, **kwargs):
        # Automatically force species to HORSE upon save
        self.species = Animal.Species.HORSE
        #Calculate Foal Year
        if self.birth_date:
            self.foal_year = self.birth_date.year
        else:
            self.foal_year = None
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} :: {self.brand or 'Domestic'}"

