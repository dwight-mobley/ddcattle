from django.core.exceptions import ValidationError as ModelValidationError
from rest_framework import serializers
from animals.models.animal import Animal
from media_library.models import AnimalMedia
from .models import SaleListing
from .permissions import manageable_animals


def validate_gallery(animal, media):
    if any(item.animal_id != animal.pk or not item.public or
           item.media_type not in ("image", "video") or item.content_type_id is not None or
           item.object_id is not None for item in media):
        raise serializers.ValidationError({"gallery": "Select public, unattached animal images/videos from this animal only."})


class PublicAnimalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Animal
        fields = ("id", "slug", "name", "species", "sex", "birth_date", "color")


class PublicMediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = AnimalMedia
        fields = ("id", "media_type", "url", "caption", "sort_order")

    def get_url(self, obj):
        return obj.get_url()


class PublicSaleListingSerializer(serializers.ModelSerializer):
    animal = PublicAnimalSerializer(read_only=True)
    gallery = serializers.SerializerMethodField()

    class Meta:
        model = SaleListing
        fields = ("id", "title", "description", "animal", "status", "featured",
                  "show_price", "price", "gallery")

    def get_gallery(self, obj):
        # Recheck every read: media may have become private or been reassigned.
        media = [m for m in obj.gallery.all() if m.animal_id == obj.animal_id and m.public
                 and m.media_type in ("image", "video") and m.content_type_id is None
                 and m.object_id is None]
        return PublicMediaSerializer(media, many=True).data

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if not instance.show_price:
            data.pop("price", None)
        return data


class StaffSaleListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SaleListing
        fields = ("id", "animal", "title", "description", "price", "show_price", "active",
                  "published", "status", "featured", "gallery", "contact_user",
                  "actual_sale_price", "sale_date", "buyer_name", "buyer_email",
                  "buyer_phone", "internal_notes", "created_at", "updated_at")
        read_only_fields = ("id", "contact_user", "created_at", "updated_at")

    def get_fields(self):
        fields = super().get_fields()
        user = self.context["request"].user
        fields["animal"].queryset = manageable_animals(user)
        fields["gallery"].child_relation.queryset = AnimalMedia.objects.filter(
            animal__in=manageable_animals(user), public=True, media_type__in=["image", "video"],
            content_type__isnull=True, object_id__isnull=True)
        return fields

    def validate(self, attrs):
        instance = self.instance
        animal = attrs.get("animal", instance.animal if instance else None)
        if instance and animal.pk != instance.animal_id:
            raise serializers.ValidationError({"animal": "A listing cannot be reassigned to another animal."})
        gallery = attrs.get("gallery", list(instance.gallery.all()) if instance else [])
        if "gallery" in attrs or attrs.get("published", instance.published if instance else False):
            validate_gallery(animal, gallery)
        values = {field.name: getattr(instance, field.name) for field in SaleListing._meta.fields} if instance else {}
        values.update({key: value for key, value in attrs.items() if key != "gallery"})
        candidate = SaleListing(**values)
        try:
            candidate.clean()
        except ModelValidationError as exc:
            raise serializers.ValidationError(exc.message_dict)
        return attrs


from animals.serializers import AnimalInquirySerializer


class ListingInquirySerializer(AnimalInquirySerializer):
    sender_email = serializers.EmailField(max_length=254)
    submission_key = serializers.UUIDField()
    phone = serializers.CharField(max_length=50, allow_blank=True, required=False, default="")
    honeypot = serializers.CharField(max_length=200, allow_blank=True, required=False, default="")
