from collections import Counter, defaultdict
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
    help = "Send grouped push notifications for active reminders."

    def handle(self, *args, **options):
        today = timezone.localdate()

        reminders = (
            Reminder.objects
            .filter(active=True)
            .select_related("animal", "created_by")
        )

        groups = defaultdict(list)

        skipped = 0
        failed = 0
        pushes_sent = 0
        reminders_logged = 0

        #
        # Step 1:
        # Find reminders that need notifications and group them.
        #
        for reminder in reminders:
            notification = self.get_notification(
                reminder,
                today,
            )

            if notification is None:
                continue

            notification_type, log_date = notification

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

            key = (
                user.id,
                notification_type,
                log_date,
            )

            groups[key].append(reminder)

        #
        # Step 2:
        # Send one push for each group.
        #
        for (
            user_id,
            notification_type,
            log_date,
        ), grouped_reminders in groups.items():

            subscriptions = PushSubscription.objects.filter(
                user_id=user_id,
                active=True,
            )

            if not subscriptions.exists():
                skipped += len(grouped_reminders)
                continue

            title = self.build_title(
                notification_type,
                len(grouped_reminders),
            )

            body = self.build_summary_body(
                grouped_reminders,
            )

            notification_sent = False

            for subscription in subscriptions:
                try:
                    send_push_notification(
                        subscription=subscription,
                        title=title,
                        body=body,
                        url="/reminders/",
                    )

                    notification_sent = True
                    pushes_sent += 1

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

            #
            # Only log the reminders if at least one
            # device successfully received the push.
            #
            if notification_sent:
                NotificationLog.objects.bulk_create([
                    NotificationLog(
                        user_id=user_id,
                        reminder=reminder,
                        notification_type=notification_type,
                        scheduled_date=log_date,
                    )
                    for reminder in grouped_reminders
                ])

                reminders_logged += len(
                    grouped_reminders
                )

        self.stdout.write(
            self.style.SUCCESS(
                f"Finished. "
                f"Pushes sent: {pushes_sent}, "
                f"Reminders logged: {reminders_logged}, "
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
            )

        if reminder.due_date == today:
            return (
                NotificationLog.NotificationType
                .REMINDER_DUE,
                reminder.due_date,
            )

        if reminder.due_date < today:
            return (
                NotificationLog.NotificationType
                .REMINDER_OVERDUE,
                today,
            )

        return None

    def build_title(
        self,
        notification_type,
        count,
    ):
        reminder_word = (
            "Reminder"
            if count == 1
            else "Reminders"
        )

        if (
            notification_type
            == NotificationLog.NotificationType
            .REMINDER_UPCOMING
        ):
            return (
                f"{count} {reminder_word} "
                f"Due Tomorrow"
            )

        if (
            notification_type
            == NotificationLog.NotificationType
            .REMINDER_DUE
        ):
            return (
                f"{count} {reminder_word} "
                f"Due Today"
            )

        return (
            f"{count} Overdue "
            f"{reminder_word}"
        )

    def build_summary_body(self, reminders):
        #
        # Count reminders by their title.
        #
        counts = Counter(
            reminder.title
            for reminder in reminders
        )

        parts = [
            f"{title} — {count}"
            for title, count in counts.items()
        ]

        return " • ".join(parts)