from rest_framework.routers import DefaultRouter
from .views import PublicSaleListingViewSet, StaffSaleListingViewSet, StaffListingAnimalViewSet, StaffListingMediaViewSet

router = DefaultRouter()
router.register("listings", PublicSaleListingViewSet, basename="sale-listing")
router.register("manage/listings", StaffSaleListingViewSet, basename="manage-sale-listing")
router.register("manage/animals", StaffListingAnimalViewSet, basename="listing-animal-options")
router.register("manage/media", StaffListingMediaViewSet, basename="listing-media-options")
urlpatterns = router.urls
