from urllib.parse import urljoin

from django.conf import settings
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

from animals.models.animal import Animal


class AnimalMedia(models.Model):

    class MediaType(models.TextChoices):
        IMAGE = "image", "Image"
        VIDEO = "video", "Video"
        DOCUMENT = "document", "Document"

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="media",
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
    )

    object_id = models.PositiveBigIntegerField(
        null=True,
        blank=True,
    )

    content_object = GenericForeignKey(
        "content_type",
        "object_id",
    )


    media_type = models.CharField(
        max_length=20,
        choices=MediaType.choices,
    )

    file = models.FileField(
        upload_to="animals/%Y/%m/",
    )

    caption = models.CharField(
        max_length=250,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    public = models.BooleanField(
        default=False,
    )

    sort_order = models.PositiveIntegerField(
        default=0,
    )

    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="animal_media_uploaded",
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        verbose_name="Media"
        verbose_name_plural = "Media"

    def get_url(self):
        if self.public:
            return f"https://media.ddcattle.company/{self.file.name}"

        return self.file.url

    def __str__(self):
        return f"{self.animal.name}: {self.file.name}"