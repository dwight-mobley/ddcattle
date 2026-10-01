from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PushSubscriptionViewSet


router = DefaultRouter()

router.register(
    r"subscriptions",
    PushSubscriptionViewSet,
    basename="push-subscription",
)


urlpatterns = [
    path("", include(router.urls)),
]