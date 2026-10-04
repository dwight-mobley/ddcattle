"""Guard training attachments when accessed via the pre-existing gallery API."""
from django.contrib.contenttypes.models import ContentType
from django.db.models import Q
from rest_framework.exceptions import ValidationError
from .models import Ride, TrainingSession
from .access import accessible_animals, require_manage


def training_content_types():
    return [ContentType.objects.get_for_model(model).pk for model in (Ride, TrainingSession)]


def scope_training_media(queryset, user):
    return queryset.filter(~Q(content_type_id__in=training_content_types()) | Q(animal__in=accessible_animals(user)))


def check_training_media_write(instance, user, animal=None):
    if instance.content_type_id not in training_content_types():
        return
    require_manage(user, [instance.animal], media=True)
    animal = animal or instance.animal
    target = instance.content_object
    valid = target and (target.participants.filter(animal=animal).exists() if isinstance(target, Ride) else target.animal_id == animal.pk)
    if not valid:
        raise ValidationError({"animal": "This horse does not belong to the attached training or ride record."})
    require_manage(user, [animal], media=True)
