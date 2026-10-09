from django.db.models import Prefetch
from rest_framework import mixins, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from media_library.models import AnimalMedia
from .models import SaleListing
from .permissions import IsMarketplaceStaff, manageable_animals
from .serializers import PublicSaleListingSerializer, StaffSaleListingSerializer


class ListingPagination(PageNumberPagination):
    page_size = 20


def listing_queryset():
    return SaleListing.objects.select_related("animal").prefetch_related(
        Prefetch("gallery", queryset=AnimalMedia.objects.order_by("sort_order", "id"))
    ).order_by("-featured", "-created_at", "-id")


class PublicSaleListingViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    serializer_class = PublicSaleListingSerializer
    pagination_class = ListingPagination

    def get_queryset(self):
        qs = listing_queryset().filter(published=True, active=True, animal__public=True)
        if self.action == "list":
            sale_status = self.request.query_params.get("status")
            if sale_status and sale_status not in [*SaleListing.Status.values, "all"]:
                raise ValidationError({"status": "Use available, pending, sold or all."})
            if sale_status == "all":
                return qs
            if sale_status:
                return qs.filter(status=sale_status)
            return qs.filter(status__in=["available", "pending"])
        return qs


class StaffSaleListingViewSet(mixins.CreateModelMixin, mixins.ListModelMixin,
                              mixins.RetrieveModelMixin, mixins.UpdateModelMixin,
                              viewsets.GenericViewSet):
    permission_classes = [IsMarketplaceStaff]
    serializer_class = StaffSaleListingSerializer
    pagination_class = ListingPagination

    def get_queryset(self):
        return listing_queryset().filter(animal__in=manageable_animals(self.request.user))

    def perform_create(self, serializer):
        serializer.save(contact_user=self.request.user)
