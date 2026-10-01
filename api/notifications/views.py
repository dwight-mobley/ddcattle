from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from pywebpush import WebPushException
from .services import send_push_notification

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

class TestPushNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        subscriptions = PushSubscription.objects.filter(
            user=request.user,
            active=True,
        )

        if not subscriptions.exists():
            return Response(
                {
                    "detail": "No active push subscriptions found."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        sent = 0
        failed = 0

        for subscription in subscriptions:
            try:
                send_push_notification(
                    subscription=subscription,
                    title="DD Cattle Company",
                    body="Push notifications are working!",
                    url="/",
                )

                sent += 1

            except WebPushException as exc:
                failed += 1

                print("WEB PUSH ERROR:", repr(exc))

                if exc.response is not None:
                    print(
                        "PUSH RESPONSE STATUS:",
                        exc.response.status_code
                    )
                    print(
                        "PUSH RESPONSE BODY:",
                        exc.response.text
                    )

                    if exc.response.status_code in (404, 410):
                        subscription.active = False
                        subscription.save(
                            update_fields=["active"]
                        )
            except Exception as exc:
                failed += 1
                print("UNEXPECTED PUSH ERROR:", repr(exc))

        return Response({
            "sent": sent,
            "failed": failed,
        })