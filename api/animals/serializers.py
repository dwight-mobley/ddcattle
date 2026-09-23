from rest_framework import serializers
from animals.models.animal import Animal
from animals.models.dog import Dog, DogBreed
from animals.models.horse import Horse, HorseBreed
from animals.models.cattle import CattleDetails
from media_library.serializers import MediaLibrarySerializer
from media_library.models import AnimalMedia
from medical.models import MedicalRecord

class MediaSerializer(MediaLibrarySerializer):    
    class Meta:
        model = AnimalMedia
        fields = ['id', 'description', 'media_type', 'url']
   

class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = ['id', 'title', 'description', 'date']

# --- SPECIFIC FIELD SERIALIZERS ---
class HorseSpecificSerializer(serializers.ModelSerializer):
    breed = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=HorseBreed.objects.all(), 
        required=False, 
        allow_null=True
    )
    class Meta:
        model = Horse
        fields = [
            'breed', 'brand', 'herd_management_area', 'adoption_date', 
            'height', 'registration_number', 'breed_registry', 'sire', 'dam', 'notes'
        ]

class DogSpecificSerializer(serializers.ModelSerializer):
    breed = serializers.SlugRelatedField(
        slug_field='name', 
        queryset=DogBreed.objects.all(), 
        required=False, 
        allow_null=True
    )
    class Meta:
        model = Dog
        fields = [
            'breed', 'registration_number', 'microchip_number', 
            'rabies_tag_number', 'spayed_neutered', 'notes', 
        ]

class CattleDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CattleDetails
        exclude = ('animal', 'id')

class HorseBreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorseBreed
        fields = ['id', 'name']

class DogBreedSerializer(serializers.ModelSerializer):
    class Meta:
        model = DogBreed
        fields = ['id', 'name']
        
# --- BASE SERIALIZERS ---
class BaseListAnimalSerializer(serializers.ModelSerializer):
    profile_image = serializers.SerializerMethodField()
    created_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    age = serializers.ReadOnlyField()
    sex = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    class Meta:
        model = Animal       
        fields = '__all__'

    def get_profile_image(self, obj):
        if not obj.profile_image:
            return None
        return obj.profile_image.get_url()
    
    def to_representation(self, instance):
        # 1. Get base animal data
        data = super().to_representation(instance)
        
        # 2. Append species-specific data
        if instance.species == Animal.Species.HORSE and hasattr(instance, 'horse'):
            data.update(HorseSpecificSerializer(instance.horse).data)
        elif instance.species == Animal.Species.DOG and hasattr(instance, 'dog'):
            data.update(DogSpecificSerializer(instance.dog).data)
        elif instance.species == Animal.Species.CATTLE and hasattr(instance, 'cattle_details'):
            data.update(CattleDetailsSerializer(instance.cattle_details).data)

        # 3. Clean empty values (Preserving your existing logic)
        return {
            key: value for key, value in data.items()
            if value is not None and value != '' and value != [] and value != {}
        }

    def create(self, validated_data):
        species = validated_data.get('species')
        request_data = self.context['request'].data if 'request' in self.context else self.initial_data
       
        if species == Animal.Species.HORSE:
            specific_serializer = HorseSpecificSerializer(data=request_data)
            specific_serializer.is_valid(raise_exception=True)
            return Horse.objects.create(**validated_data, **specific_serializer.validated_data)
            
        elif species == Animal.Species.DOG:
            specific_serializer = DogSpecificSerializer(data=request_data)
            specific_serializer.is_valid(raise_exception=True)
            return Dog.objects.create(**validated_data, **specific_serializer.validated_data)
            
        elif species == Animal.Species.CATTLE:
            specific_serializer = CattleDetailsSerializer(data=request_data)
            specific_serializer.is_valid(raise_exception=True)
            animal = Animal.objects.create(**validated_data)
            CattleDetails.objects.create(animal=animal, **specific_serializer.validated_data)
            return animal
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Update base animal fields
        instance = super().update(instance, validated_data)
        request_data = self.context['request'].data if 'request' in self.context else self.initial_data        
        # Update specific child fields
        if instance.species == Animal.Species.HORSE and hasattr(instance, 'horse'):
            specific_serializer = HorseSpecificSerializer(instance.horse, data=request_data, partial=True)
            specific_serializer.is_valid(raise_exception=True)
            instance.horse.refresh_from_db()
            specific_serializer.save()
            
        elif instance.species == Animal.Species.DOG and hasattr(instance, 'dog'):
            specific_serializer = DogSpecificSerializer(instance.dog, data=request_data, partial=True)
            specific_serializer.is_valid(raise_exception=True)
            instance.dog.refresh_from_db()
            specific_serializer.save()
            
        elif instance.species == Animal.Species.CATTLE:
            cattle_details, _ = CattleDetails.objects.get_or_create(animal=instance)
            specific_serializer = CattleDetailsSerializer(cattle_details, data=request_data, partial=True)
            specific_serializer.is_valid(raise_exception=True)
            instance.cattle.refresh_from_db()
            specific_serializer.save()
        
        return instance

class BaseAnimalSerializer(BaseListAnimalSerializer):
    media = MediaSerializer(many=True, read_only=True)
    medical_records = MedicalRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Animal
        exclude = ['slug']

    def get_media(self, obj):
        media = obj.media.all().order_by('-media_type')
        return MediaSerializer(media, many=True).data



class AnimalInquirySerializer(serializers.Serializer):
    sender_name = serializers.CharField(max_length=100)
    sender_email = serializers.EmailField()
    message = serializers.CharField(max_length=1000)