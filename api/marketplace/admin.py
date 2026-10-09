from django import forms
from django.contrib import admin
from rest_framework.exceptions import ValidationError
from .models import SaleInquiry, SaleListing
from .permissions import manageable_animals
from .serializers import validate_gallery


class SaleListingForm(forms.ModelForm):
    class Meta:
        model = SaleListing
        fields = "__all__"

    def clean(self):
        data = super().clean()
        if data.get("animal") and "gallery" in data:
            try:
                validate_gallery(data["animal"], data["gallery"])
            except ValidationError:
                self.add_error("gallery", "Select public, unattached images/videos from this animal only.")
        if self.instance.pk and data.get("animal") and data["animal"].pk != self.instance.animal_id:
            self.add_error("animal", "A listing cannot be reassigned.")
        return data


@admin.register(SaleListing)
class SaleListingAdmin(admin.ModelAdmin):
    form = SaleListingForm
    list_display = ("title", "animal", "status", "published", "active")
    list_filter = ("status", "published", "active")
    readonly_fields = ("contact_user", "created_at", "updated_at")
    filter_horizontal = ("gallery",)

    def get_queryset(self, request):
        return super().get_queryset(request).filter(animal__in=manageable_animals(request.user))

    def has_view_permission(self, request, obj=None):
        return super().has_view_permission(request, obj) and (obj is None or manageable_animals(request.user).filter(pk=obj.animal_id).exists())

    def has_change_permission(self, request, obj=None):
        return super().has_change_permission(request, obj) and (obj is None or manageable_animals(request.user).filter(pk=obj.animal_id).exists())

    def has_delete_permission(self, request, obj=None):
        return False  # Unpublish to preserve listing/inquiry history.

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "animal":
            kwargs["queryset"] = manageable_animals(request.user)
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def formfield_for_manytomany(self, db_field, request, **kwargs):
        if db_field.name == "gallery":
            from media_library.models import AnimalMedia
            kwargs["queryset"] = AnimalMedia.objects.filter(animal__in=manageable_animals(request.user), public=True,
                media_type__in=["image", "video"], content_type__isnull=True, object_id__isnull=True)
        return super().formfield_for_manytomany(db_field, request, **kwargs)

    def save_model(self, request, obj, form, change):
        if not change:
            obj.contact_user = request.user
        super().save_model(request, obj, form, change)


@admin.register(SaleInquiry)
class SaleInquiryAdmin(admin.ModelAdmin):
    list_display = ("listing", "name", "created_at", "delivery_state", "handled")
    list_filter = ("handled", "delivery_state")
    readonly_fields = ("listing", "name", "email", "phone", "message", "submission_key", "created_at",
                       "delivery_state", "notification_started_at", "admin_sent_at", "confirmation_sent_at")

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("listing", "listing__animal").filter(
            listing__animal__in=manageable_animals(request.user))

    def has_view_permission(self, request, obj=None):
        return super().has_view_permission(request, obj) and (obj is None or manageable_animals(request.user).filter(pk=obj.listing.animal_id).exists())

    def has_change_permission(self, request, obj=None):
        return super().has_change_permission(request, obj) and (obj is None or manageable_animals(request.user).filter(pk=obj.listing.animal_id).exists())

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False
