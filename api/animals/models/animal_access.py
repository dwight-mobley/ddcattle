from django.conf import settings
from django.db import models
from animals.models.animal import Animal

class AnimalAccess(models.Model):

    class Role(models.TextChoices):
        OWNER = "owner", "Owner"
        MANAGER = "manager", "Manager"
        CARETAKER = "caretaker", "Caretaker"
        TRAINER = "trainer", "Trainer"
        VET = "vet", "Veterinarian"
        VIEWER = "viewer", "Viewer"

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="access_entries",
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="animal_access",
    )

    role = models.CharField(
        max_length=30,
        choices=Role.choices,
    )

    can_edit_profile = models.BooleanField(default=False)

    can_manage_medical = models.BooleanField(default=False)

    can_manage_appointments = models.BooleanField(default=False)

    can_upload_media = models.BooleanField(default=False)

    can_manage_documents = models.BooleanField(default=False)

    can_manage_access = models.BooleanField(default=False)

    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["animal", "user"],
                name="unique_animal_access",
            )
        ]
        verbose_name= "Animal Access"
        verbose_name_plural="Animal Access"

    def __str__(self):
        return f"{self.user} → {self.animal} ({self.role})"
