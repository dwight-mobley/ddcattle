from django.contrib import admin
from .models import AnimalMedia
from medical.models import MedicalRecord
from django import forms
from django.contrib.contenttypes.models import ContentType
from django.http import JsonResponse
from django.urls import path

def get_urls(self):
    urls = super().get_urls()

    custom_urls = [
        path(
            "record-options/",
            self.admin_site.admin_view(self.record_options),
            name="animal_media_record_options",
        ),
    ]

    return custom_urls + urls

def record_options(self, request):
    animal_id = request.GET.get("animal")
    record_type = request.GET.get("record_type")

    if not animal_id or not record_type:
        return JsonResponse([], safe=False)

    model = MEDIA_RECORD_MODELS.get(record_type)

    if not model:
        return JsonResponse([], safe=False)

    records = model.objects.filter(
        animal_id=animal_id
    ).order_by("-id")

    results = []

    for record in records:
        results.append({
            "id": record.pk,
            "label": str(record),
        })

    return JsonResponse(results, safe=False)

MEDIA_RECORD_MODELS = {
    "medical": MedicalRecord,
}

#Form
class MediaAdminForm(forms.ModelForm):

    record_type = forms.ChoiceField(
        choices=[
            ("", "---------"),
            ("medical", "Medical Record"),
            ("training", "Training Record"),
            ("vaccination", "Vaccination Record"),
            ("worming", "Worming Record"),
        ],
        required=False,
    )

    associated_record = forms.ChoiceField(
        choices=[
            ("", "---------"),
        ],
        required=False,
    )

    class Meta:
        model = AnimalMedia
        fields = [
            "animal",
            "record_type",
            "associated_record",
            "media_type",
            "file",
            "caption",
            "description",
            "public",
            "sort_order",
            "uploaded_by"
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance and self.instance.pk:
            if self.instance.content_type:
                for key, model in MEDIA_RECORD_MODELS.items():
                    content_type = ContentType.objects.get_for_model(model)

                    if content_type == self.instance.content_type:
                        self.fields["record_type"].initial = key
                        break

                self.fields["associated_record"].initial = str(
                    self.instance.object_id
                )

    def save(self, commit=True):
        instance = super().save(commit=False)

        record_type = self.cleaned_data.get("record_type")
        object_id = self.cleaned_data.get("associated_record")

        if record_type and object_id:
            model = MEDIA_RECORD_MODELS[record_type]

            instance.content_type = ContentType.objects.get_for_model(model)
            instance.object_id = int(object_id)
        else:
            instance.content_type = None
            instance.object_id = None

       

        if commit:
            instance.save()

        return instance

@admin.register(AnimalMedia)
class AdminMedia(admin.ModelAdmin):
    form=MediaAdminForm
    list_display=("animal", 'content_object', 'media_type', 'file', 'uploaded_by')

    def get_urls(self):
        urls = super().get_urls()

        custom_urls = [
            path(
                "record-options/",
                self.admin_site.admin_view(self.record_options),
                name="animal_media_record_options",
            ),
        ]

        return custom_urls + urls

    def record_options(self, request):
        animal_id = request.GET.get("animal")
        record_type = request.GET.get("record_type")

        if not animal_id or not record_type:
            return JsonResponse([], safe=False)

        model = MEDIA_RECORD_MODELS.get(record_type)

        if not model:
            return JsonResponse([], safe=False)

        records = model.objects.filter(
            animal_id=animal_id
        ).order_by("-id")

        results = []

        for record in records:
            results.append({
                "id": record.pk,
                "label": str(record),
            })

        return JsonResponse(results, safe=False)

    class Media:
        js = (
            "media_library/js/media_admin.js",
        )

