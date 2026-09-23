from rest_framework import viewsets
from .models import AnimalMedia
from .serializers import MediaLibrarySerializer

class MediaLibraryViewSet(viewsets.ModelViewSet):
    queryset = AnimalMedia.objects.all()
    serializer_class = MediaLibrarySerializer