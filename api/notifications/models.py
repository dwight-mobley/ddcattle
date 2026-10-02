from django.conf import settings
from django.db import models


class PushSubscription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="push_subscriptions",
    )

    endpoint = models.TextField(unique=True)

    p256dh = models.TextField()
    auth = models.TextField()

    device_name = models.CharField(
        max_length=100,
        blank=True,
    )

    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user} - {self.device_name or 'Device'}"

class NotificationLog(models.Model):
    class NotificationType(models.TextChoices):
        REMINDER_UPCOMING = "reminder_upcoming", "Reminder Upcoming"
        REMINDER_DUE = "reminder_due", "Reminder Due"
        REMINDER_OVERDUE = "reminder_overdue", "Reminder Overdue"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notification_logs",
    )

    reminder = models.ForeignKey(
        "reminders.Reminder",
        on_delete=models.CASCADE,
        related_name="notification_logs",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NotificationType.choices,
    )

    scheduled_date = models.DateField()

    sent_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-sent_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "reminder",
                    "notification_type",
                    "scheduled_date",
                ],
                name="unique_reminder_notification",
            ),
        ]

    def __str__(self):
        return (
            f"{self.user} - "
            f"{self.reminder} - "
            f"{self.notification_type}"
        )