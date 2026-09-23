from rest_framework import permissions
from .models.animal_access import AnimalAccess

class CanEditAnimalProfile(permissions.BasePermission):
    message = "You do not have permission to edit this animal's profile."

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request (if they passed the queryset filter)
        if request.method in permissions.SAFE_METHODS:
            return True

        # For write methods (PUT, PATCH, DELETE), check the access model
        try:
            access = AnimalAccess.objects.get(
                animal=obj,
                user=request.user,
                active=True
            )
            # You can check the specific boolean, or if they are the outright owner
            return access.can_edit_profile or access.role == AnimalAccess.Role.OWNER
        except AnimalAccess.DoesNotExist:
            return False