from django.db.models.signals import post_delete
from django.dispatch import receiver

from .models import AnimalMedia


@receiver(post_delete, sender=AnimalMedia)
def delete_animal_media_file(sender, instance, **kwargs):
    if instance.file:
        instance.file.delete(save=False)