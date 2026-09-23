from django.db import models
from django.conf import settings
from datetime import date
from django.utils.text import slugify

class Animal(models.Model):

    class Species(models.TextChoices):
        HORSE = "horse", "Horse"
        DOG = "dog", "Dog"
        CATTLE = "cattle", "Cattle"
        OTHER = "other", "Other"

    class Sex(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"
        UNKNOWN = "unknown", "Unknown"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        SOLD = "sold", "Sold"
        DECEASED = "deceased", "Deceased"
        INACTIVE = "inactive", "Inactive"
        OTHER = "other", "Other"

    name = models.CharField(max_length=150)

    slug = models.SlugField(
        max_length=180,
        unique=True,
        blank=True,
    )

    species = models.CharField(
        max_length=30,
        choices=Species.choices,
    )

    sex = models.CharField(
        max_length=20,
        choices=Sex.choices,
        default=Sex.UNKNOWN,
    )

    birth_date = models.DateField(
        null=True,
        blank=True,
    )

    weight = models.DecimalField(
        max_digits=7,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Current weight in pounds.",
    )

    color = models.CharField(
        max_length=100,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    profile_image = models.ForeignKey(
        'media_library.AnimalMedia',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='+',
    )

    featured = models.BooleanField(
        default=False,
    )

    public = models.BooleanField(
        default=False,
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="animals_created",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )



    @property
    def age(self):
        today = date.today()
        years = (today.year - self.birth_date.year)
        months = (today.month - self.birth_date.month)
        if years <= 0:
            return f"{months} months"
        return f"{years} years {months} months"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name