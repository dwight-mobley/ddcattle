from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess


def accessible_animals(user):
    if not user.is_authenticated:
        return Animal.objects.none()
    if user.is_staff:
        return Animal.objects.all()
    return Animal.objects.filter(Q(created_by=user) | Q(access_entries__user=user, access_entries__active=True)).distinct()


def require_manage(user, animals, media=False):
    for animal in animals:
        if user.is_staff or animal.created_by_id == user.pk:
            continue
        entries = AnimalAccess.objects.filter(animal=animal, user=user, active=True)
        allowed = entries.filter(can_upload_media=True).exists() if media else entries.filter(Q(can_manage_training=True) | Q(role__in=["owner", "manager"])).exists()
        if not allowed:
            raise PermissionDenied("You cannot manage this horse's training or riding records.")


def visible_rides(user):
    from .models import Ride
    # A shared record reveals every participant; require access to all of them.
    ids = accessible_animals(user).values("pk")
    return Ride.objects.exclude(participants__animal__in=Animal.objects.exclude(pk__in=ids)).filter(participants__isnull=False).distinct()


def accessible_locations(user):
    from .models import RidingLocation
    if user.is_staff:
        return RidingLocation.objects.all()
    return RidingLocation.objects.filter(
        Q(created_by=user)
        | Q(ride_records__in=visible_rides(user))
        | Q(trainingsession_records__animal__in=accessible_animals(user))
    ).distinct()
