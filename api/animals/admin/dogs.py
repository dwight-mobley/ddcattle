from animals.models.dog import Dog, DogBreed
from animals.forms.dog_form import DogAdminForm
from django.contrib import admin

@admin.register(Dog)
class AdminDog(admin.ModelAdmin):
    form=DogAdminForm
    exclude=['created_by']
    list_display = ('name', 'age', 'breed', 'color', 'sex', 'spayed_neutered')
    fieldsets = (
        ('General Info', {'fields':('species','name', 'sex','spayed_neutered', 'birth_date', 'status', 'public')}),
        ('Descriptors', {'fields':('breed', 'color', 'description', 'profile_image')}),
        ('Health/Wellbeing', {'fields':('weight', 'rabies_tag_number', 'microchip_number')}),
        ('Pedigree', {'fields':('registration_number',)}),
        ('Notes', {'fields':('notes',)}),
    )

    def save_model(self, request, obj, form, change):
            if not obj.pk:
                obj.created_by = request.user
            super().save_model(request, obj, form, change)


admin.site.register(DogBreed)