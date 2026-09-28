from rest_framework import serializers
from .models import AnimalMedia

class MediaLibrarySerializer(serializers.ModelSerializer):    
    uploaded_by = serializers.HiddenField(default=serializers.CurrentUserDefault())
    url = serializers.SerializerMethodField()       
    class Meta:
        model = AnimalMedia
        fields = [
            "id",
            "animal",
            "media_type",
            "url",
            "file",
            "caption",
            "description",
            "public",
            "sort_order",
            "uploaded_at",  
            "uploaded_by"                     
        ]
       
    def get_url(self, obj):
        return obj.get_url()