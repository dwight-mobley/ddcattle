from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone
from pywebpush import WebPushException

from notifications.models import (
    NotificationLog,
    PushSubscription,
)
from notifications.services import send_push_notification
from reminders.models import Reminder


class Command(BaseCommand):
    help = "Send push notifications for active reminders."

    def handle(self, *args, **options):
        today = timezone.localdate()

        reminders = (
            Reminder.objects
            .filter(active=True)
            .select_related("animal", "created_by")
        )

        sent = 0
        skipped = 0
        failed = 0

        for reminder in reminders:
            notification = self.get_notification(
                reminder,
                today,
            )

            if notification is None:
                continue

            notification_type, log_date, title, body = (
                notification
            )

            # For now, reminders go to the user who
            # created the reminder.
            user = reminder.created_by

            already_sent = NotificationLog.objects.filter(
                user=user,
                reminder=reminder,
                notification_type=notification_type,
                scheduled_date=log_date,
            ).exists()

            if already_sent:
                skipped += 1
                continue

            subscriptions = PushSubscription.objects.filter(
                user=user,
                active=True,
            )

            if not subscriptions.exists():
                skipped += 1
                continue

            notification_sent = False

            for subscription in subscriptions:
                try:
                    send_push_notification(
                        subscription=subscription,
                        title=title,
                        body=body,
                        url=self.get_reminder_url(reminder),
                    )

                    notification_sent = True
                    sent += 1

                except WebPushException as exc:
                    failed += 1

                    self.stderr.write(
                        f"Push failed for subscription "
                        f"{subscription.pk}: {exc}"
                    )

                    if (
                        exc.response is not None
                        and exc.response.status_code
                        in (404, 410)
                    ):
                        subscription.active = False
                        subscription.save(
                            update_fields=["active"]
                        )

                except Exception as exc:
                    failed += 1

                    self.stderr.write(
                        f"Unexpected push error for "
                        f"subscription "
                        f"{subscription.pk}: {exc}"
                    )

            if notification_sent:
                NotificationLog.objects.create(
                    user=user,
                    reminder=reminder,
                    notification_type=notification_type,
                    scheduled_date=log_date,
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished. "
                f"Sent: {sent}, "
                f"Skipped: {skipped}, "
                f"Failed: {failed}"
            )
        )

    def get_notification(self, reminder, today):
        if reminder.due_date == today + timedelta(days=1):
            return (
                NotificationLog.NotificationType
                .REMINDER_UPCOMING,
                reminder.due_date,
                "Reminder Tomorrow",
                self.build_body(
                    reminder,
                    "is due tomorrow",
                ),
            )

        if reminder.due_date == today:
            return (
                NotificationLog.NotificationType
                .REMINDER_DUE,
                reminder.due_date,
                "Reminder Due Today",
                self.build_body(
                    reminder,
                    "is due today",
                ),
            )

        if reminder.due_date < today:
            return (
                NotificationLog.NotificationType
                .REMINDER_OVERDUE,
                today,
                "Overdue Reminder",
                self.build_body(
                    reminder,
                    "is overdue",
                ),
            )

        return None

    def build_body(self, reminder, status):
        if reminder.animal:
            return (
                f"{reminder.title} for "
                f"{reminder.animal.name} {status}."
            )

        return f"{reminder.title} {status}."

    def get_reminder_url(self, reminder):
        return "/reminders/"