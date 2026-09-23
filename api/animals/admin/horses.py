from animals.models.horse import Horse, HorseBreed
from animals.models.animal_access import AnimalAccess
from animals.forms.horse_forms import HorseAdminForm
from django.contrib import admin

from animals.models.animal import Animal



@admin.register(Horse)
class HorseAdmin(admin.ModelAdmin):
    form = HorseAdminForm
    list_display = ('name','brand','foal_year', 'age', 'color', 'weight', 'height')
    fieldsets= (
        ('General Info', {
            'fields':('name', 'species', 'sex', 'birth_date', 'status', 'public','featured', 'profile_image')
        }),
        ('Equine Details', {
            'fields': ('breed','color', 'height','weight', 'registration_number', 'breed_registry', 'sire', 'dam', 'notes')
        }),
        ('Mustang Specifics', {
            # We wrap these in a CSS class 'form-row mustang-field' so JS can find them easily
            'classes': ('mustang-group',),
            'fields': ('brand', 'herd_management_area', 'adoption_date')
        }),
    )

    def save_model(self, request, obj, form, change):
        if not obj.pk:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

admin.site.register(HorseBreed)
admin.site.register(AnimalAccess)
admin.site.register(Animal)
