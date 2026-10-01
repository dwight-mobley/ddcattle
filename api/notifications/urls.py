from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    PushSubscriptionViewSet,
    TestPushNotificationView,
)


router = DefaultRouter()

router.register(
    r"subscriptions",
    PushSubscriptionViewSet,
    basename="push-subscription",
)


urlpatterns = [
    path("", include(router.urls)),
    path(
        "test/",
        TestPushNotificationView.as_view(),
        name="test-push-notification",
    ),
]