from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import PushSubscription
from .serializers import PushSubscriptionSerializer


class PushSubscriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PushSubscriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PushSubscription.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        endpoint = request.data.get("endpoint")

        if not endpoint:
            return Response(
                {"endpoint": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        subscription, created = PushSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                "user": request.user,
                "p256dh": request.data.get("p256dh", ""),
                "auth": request.data.get("auth", ""),
                "device_name": request.data.get("device_name", ""),
                "active": True,
            },
        )

        serializer = self.get_serializer(subscription)

        return Response(
            serializer.data,
            status=(
                status.HTTP_201_CREATED
                if created
                else status.HTTP_200_OK
            ),
        )