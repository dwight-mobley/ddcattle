from rest_framework.routers import DefaultRouter
from .views import PublicSaleListingViewSet, StaffSaleListingViewSet

router = DefaultRouter()
router.register("listings", PublicSaleListingViewSet, basename="sale-listing")
router.register("manage/listings", StaffSaleListingViewSet, basename="manage-sale-listing")
urlpatterns = router.urls
