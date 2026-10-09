from django.db.models import Q
from rest_framework.permissions import BasePermission
from animals.models.animal import Animal


def manageable_animals(user):
    if not user.is_authenticated or not user.is_active or not user.is_staff:
        return Animal.objects.none()
    if user.is_superuser:
        return Animal.objects.all()
    return Animal.objects.filter(
        Q(created_by=user) | Q(access_entries__user=user, access_entries__active=True,
                              access_entries__can_edit_profile=True,
                              access_entries__role__in=["owner", "manager"])
    ).distinct()


class IsMarketplaceStaff(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and request.user.is_active and request.user.is_staff)
