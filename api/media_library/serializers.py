from rest_framework import serializers
from .models import AnimalMedia

class MediaLibrarySerializer(serializers.ModelSerializer):
    uploaded_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    class Meta:
        model = AnimalMedia
        fields = '__all__'