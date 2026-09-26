from rest_framework import permissions
from .models.animal_access import AnimalAccess


class AnimalAccessPermission(permissions.BasePermission):
    permission_field = None
    message = "You do not have permission to perform this action."

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True

        try:
            access = AnimalAccess.objects.get(
                animal=obj,
                user=request.user,
                active=True,
            )
        except AnimalAccess.DoesNotExist:
            return False

        return getattr(access, self.permission_field, False)
    
class CanEditAnimalProfile(AnimalAccessPermission):
    permission_field = "can_edit_profile"
    message = "You do not have permission to edit this animal's profile."

class CanManageAnimalMedical(AnimalAccessPermission):
    permission_field = "can_manage_medical"
    message = "You do not have permission to manage this animal's medical records."

class CanUploadAnimalMedia(AnimalAccessPermission):
    permission_field = "can_upload_media"
    message = "You do not have permission to upload media for this animal."

class CanManageAnimalDocuments(AnimalAccessPermission):
    permission_field = "can_manage_documents"
    message = "You do not have permission to manage this animal's documents."


class CanManageAnimalAccess(AnimalAccessPermission):
    permission_field = "can_manage_access"
    message = "You do not have permission to manage access to this animal."

   



