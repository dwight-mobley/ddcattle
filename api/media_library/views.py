from rest_framework import viewsets, filters
from .models import AnimalMedia
from .serializers import MediaLibrarySerializer

from rest_framework.pagination import PageNumberPagination


class MediaPagination(PageNumberPagination):
    page_size = 10

class MediaLibraryViewSet(viewsets.ModelViewSet):
    queryset = AnimalMedia.objects.all()
    serializer_class = MediaLibrarySerializer
    pagination_class = MediaPagination

    filter_backends = [
        filters.SearchFilter,
        filters.OrderingFilter
    ]

    search_fields = [
        "caption",
        "description",
        "animal__name"
    ]

    ordering_fields = [
        "uploaded_at",
        "sort_order",
        "id"
    ]
     # Newest first. ID breaks ties when upload times match.
    ordering = ["-uploaded_at", "-id"]

    def get_queryset(self):
        queryset = super().get_queryset()

        # These filters apply to browsing the library, not
        # retrieving, updating, or deleting an individual item.
        if self.action != "list":
            return queryset

        params = self.request.query_params

        animal = params.get("animal")
        if animal:
            try:
                animal_id = int(animal)
            except (TypeError, ValueError):
                raise ValidationError({
                    "animal": "Enter a valid animal ID."
                })

            if animal_id < 1:
                raise ValidationError({
                    "animal": "Enter a valid animal ID."
                })

            queryset = queryset.filter(animal_id=animal_id)

        media_type = params.get("media_type")
        if media_type:
            queryset = queryset.filter(media_type=media_type)

        public = params.get("public")
        if public is not None:
            value = public.lower()

            if value not in ("true", "false"):
                raise ValidationError({
                    "public": "Use true or false."
                })

            queryset = queryset.filter(public=(value == "true"))

        return queryset