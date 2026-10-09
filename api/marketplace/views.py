from django.db.models import Prefetch, Q
from animals.models.animal import Animal
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.http import Http404
from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .inquiries import notify_inquiry
from .throttles import ListingInquiryIPThrottle, ListingInquiryUserThrottle
from .serializers import ListingInquirySerializer
from rest_framework.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import AllowAny
from media_library.models import AnimalMedia
from .models import SaleInquiry, SaleListing
from .permissions import IsMarketplaceStaff, manageable_animals
from .serializers import PublicSaleListingSerializer, StaffSaleListingSerializer


class ListingPagination(PageNumberPagination):
    page_size = 20


def listing_queryset():
    return SaleListing.objects.select_related("animal", "animal__sale_listing").prefetch_related(
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
            if sale_status and sale_status != "all":
                qs = qs.filter(status=sale_status)
            elif sale_status != "all":
                qs = qs.filter(status__in=["available", "pending"])
            featured = self.request.query_params.get("featured")
            if featured is not None:
                if featured not in ("true", "false"):
                    raise ValidationError({"featured": "Use true or false."})
                qs = qs.filter(featured=featured == "true")
            species = self.request.query_params.get("species")
            if species:
                if species not in Animal.Species.values:
                    raise ValidationError({"species": "Select a valid species."})
                qs = qs.filter(animal__species=species)
            search = self.request.query_params.get("search", "").strip()
            if len(search) > 100:
                raise ValidationError({"search": "Use at most 100 characters."})
            if search:
                qs = qs.filter(Q(title__icontains=search) | Q(animal__name__icontains=search))
            return qs
        return qs


    @action(detail=True, methods=["post"], url_path="inquire",
            throttle_classes=[ListingInquiryIPThrottle, ListingInquiryUserThrottle])
    def inquire(self, request, pk=None):
        if not str(pk).isdigit():
            raise Http404
        # Resolve listing/public animal under a lock; never trust client animal/contact fields.
        with transaction.atomic():
            listing = get_object_or_404(SaleListing.objects.select_for_update(), pk=pk,
                                       published=True, active=True)
            animal = get_object_or_404(Animal.objects.select_for_update(), pk=listing.animal_id, public=True)
            listing.animal = animal
            if listing.status == SaleListing.Status.SOLD:
                return Response({"detail": "This listing is sold and no longer accepts inquiries."}, status=400)
            if request.data.get("honeypot"):
                return Response({"detail": "Your inquiry has been recorded. The ranch will review it."}, status=201)
            serializer = ListingInquirySerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            defaults = {"name": data["sender_name"], "email": data["sender_email"], "phone": data["phone"],
                        "message": data["message"], "delivery_state": SaleInquiry.DeliveryState.PENDING}
            inquiry, created = SaleInquiry.objects.get_or_create(listing=listing,
                submission_key=data["submission_key"], defaults=defaults)
            if not created and any(getattr(inquiry, field) != defaults[field] for field in ["name", "email", "phone", "message"]):
                return Response({"detail": "This submission key has already been used for another message."}, status=409)
        # The row is committed before transport. Claim permits safe duplicate POSTs to
        # recover a crash before notification started, without repeating attempted sends.
        notify_inquiry(inquiry, listing, data)
        return Response({"detail": "Your inquiry has been recorded. The ranch will review it."}, status=201 if created else 200)


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


class StaffListingAnimalViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsMarketplaceStaff]
    pagination_class = ListingPagination

    def get_serializer_class(self):
        from .serializers import StaffListingAnimalSerializer
        return StaffListingAnimalSerializer

    def get_queryset(self):
        qs = manageable_animals(self.request.user).select_related("sale_listing").order_by("name", "id")
        unlisted = self.request.query_params.get("unlisted")
        if unlisted is not None:
            if unlisted not in ("true", "false"):
                raise ValidationError({"unlisted": "Use true or false."})
            qs = qs.filter(sale_listing__isnull=unlisted == "true")
        search = self.request.query_params.get("search", "").strip()
        if len(search) > 100:
            raise ValidationError({"search": "Use at most 100 characters."})
        if search:
            qs = qs.filter(name__icontains=search)
        return qs


class StaffListingMediaViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [IsMarketplaceStaff]
    pagination_class = ListingPagination

    def get_serializer_class(self):
        from .serializers import PublicMediaSerializer
        return PublicMediaSerializer

    def get_queryset(self):
        animal_id = self.request.query_params.get("animal", "")
        if not animal_id.isdigit() or len(animal_id) > 18 or int(animal_id) < 1:
            raise ValidationError({"animal": "Select an animal."})
        animal = get_object_or_404(manageable_animals(self.request.user), pk=animal_id)
        return AnimalMedia.objects.filter(animal=animal, public=True, media_type__in=["image", "video"],
            content_type__isnull=True, object_id__isnull=True).order_by("sort_order", "id")
