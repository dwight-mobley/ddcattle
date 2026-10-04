from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from medical.models import MedicalRecord
from medical.services import sync_animal_measurements


@receiver(post_save, sender=MedicalRecord)
def medical_record_saved(sender, instance, **kwargs):
    sync_animal_measurements(instance.animal)


@receiver(post_delete, sender=MedicalRecord)
def medical_record_deleted(sender, instance, **kwargs):
    sync_animal_measurements(instance.animal)