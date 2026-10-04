from collections import Counter, defaultdict
from datetime import datetime, time, timedelta

from django.core.management.base import BaseCommand, CommandError
from django.utils import timezone
from pywebpush import WebPushException

from notifications.models import (
    NotificationLog,
    PushSubscription,
)
from notifications.services import send_push_notification
from reminders.models import Reminder


class Command(BaseCommand):
    help = (
        "Send grouped push notifications for active reminders. "
        "Notifications may repeat until the reminder is completed."
    )

    DEFAULT_TIME = "0900"

    def add_arguments(self, parser):
        parser.add_argument(
            "--frequency",
            type=str,
            help=(
                "Repeat notification frequency. "
                "Examples: 30min, 1hr, 6hr, 12hr, 24hr."
            ),
        )

        parser.add_argument(
            "--time",
            type=str,
            help=(
                "Daily notification time in HHMM format. "
                "Example: 0900 for 9:00 AM."
            ),
        )

    def handle(self, *args, **options):
        frequency_value = options.get("frequency")
        time_value = options.get("time")

        if frequency_value and time_value:
            raise CommandError(
                "Use either --frequency or --time, not both."
            )

        # If neither option is supplied, default to 9:00 AM.
        if not frequency_value and not time_value:
            time_value = self.DEFAULT_TIME

        frequency = None
        notification_time = None

        if frequency_value:
            frequency = self.parse_frequency(
                frequency_value
            )

            self.stdout.write(
                f"Notification mode: every "
                f"{frequency_value}"
            )

        else:
            notification_time = self.parse_time(
                time_value
            )

            self.stdout.write(
                f"Notification mode: daily at "
                f"{notification_time.strftime('%H:%M')}"
            )

        now = timezone.localtime()
        today = timezone.localdate()

        reminders = (
            Reminder.objects
            .filter(active=True)
            .select_related(
                "animal",
                "created_by",
            )
        )

        groups = defaultdict(list)

        skipped = 0
        failed = 0
        pushes_sent = 0
        reminders_logged = 0

        #
        # Step 1:
        # Find reminders that currently need a
        # notification.
        #
        for reminder in reminders:
            notification = self.get_notification(
                reminder,
                today,
            )

            if notification is None:
                continue

            notification_type, log_date = (
                notification
            )

            user = reminder.created_by

            should_send = (
                self.should_send_notification(
                    reminder=reminder,
                    user=user,
                    notification_type=notification_type,
                    now=now,
                    today=today,
                    frequency=frequency,
                    notification_time=notification_time,
                )
            )

            if not should_send:
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

            subscriptions = (
                PushSubscription.objects.filter(
                    user_id=user_id,
                    active=True,
                )
            )

            if not subscriptions.exists():
                skipped += len(
                    grouped_reminders
                )
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
                        url="/admin/",
                    )

                    notification_sent = True
                    pushes_sent += 1

                except WebPushException as exc:
                    failed += 1

                    self.stderr.write(
                        self.style.ERROR(
                            f"Push failed for subscription {subscription.pk}"
                        )
                    )

                    self.stderr.write(
                        f"Device: {subscription.device_name}"
                    )

                    self.stderr.write(
                        f"Endpoint: {subscription.endpoint[:100]}"
                    )

                    self.stderr.write(
                        f"Exception: {exc}"
                    )

                    if exc.response is not None:
                        self.stderr.write(
                            f"Status code: {exc.response.status_code}"
                        )

                        self.stderr.write(
                            f"Response body: {exc.response.text!r}"
                        )

                        self.stderr.write(
                            f"Response headers: {dict(exc.response.headers)}"
                        )

                        if exc.response.status_code in (404, 410):
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
            # Only create NotificationLog entries
            # when at least one device successfully
            # received the push.
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

    def should_send_notification(
        self,
        reminder,
        user,
        notification_type,
        now,
        today,
        frequency,
        notification_time,
    ):
        """
        Determine whether this reminder should send
        another notification.

        Frequency mode:
            Send if enough time has passed since the
            last successful notification.

        Daily time mode:
            Send once per day after the configured
            notification time.
        """

        logs = NotificationLog.objects.filter(
            user=user,
            reminder=reminder,
            notification_type=notification_type,
        )

        #
        # Frequency mode
        #
        if frequency is not None:
            last_log = (
                logs
                .order_by("-sent_at")
                .first()
            )

            if last_log is None:
                return True

            next_allowed = (
                last_log.sent_at + frequency
            )

            return now >= next_allowed

        #
        # Daily time mode
        #
        current_time = now.time().replace(
            tzinfo=None
        )

        if current_time < notification_time:
            return False

        #
        # Has this particular notification type
        # already been sent today?
        #
        sent_today = logs.filter(
            sent_at__date=today,
        ).exists()

        return not sent_today

    def parse_frequency(self, value):
        """
        Convert values such as:

            30min
            1hr
            6hr
            12hr
            24hr

        into timedelta objects.
        """

        value = value.strip().lower()

        if value.endswith("min"):
            number = value[:-3]

            try:
                minutes = int(number)
            except ValueError:
                raise CommandError(
                    f"Invalid frequency: {value}"
                )

            if minutes <= 0:
                raise CommandError(
                    "Frequency must be greater than zero."
                )

            return timedelta(
                minutes=minutes
            )

        if value.endswith("hr"):
            number = value[:-2]

            try:
                hours = int(number)
            except ValueError:
                raise CommandError(
                    f"Invalid frequency: {value}"
                )

            if hours <= 0:
                raise CommandError(
                    "Frequency must be greater than zero."
                )

            return timedelta(
                hours=hours
            )

        raise CommandError(
            "Invalid frequency. "
            "Use values such as "
            "30min, 1hr, 6hr, 12hr, or 24hr."
        )

    def parse_time(self, value):
        """
        Convert HHMM into a Python time object.

        Examples:

            0900 -> 09:00
            1430 -> 14:30
            2100 -> 21:00
        """

        value = value.strip()

        try:
            parsed = datetime.strptime(
                value,
                "%H%M",
            )
        except ValueError:
            raise CommandError(
                "Invalid time. "
                "Use 24-hour HHMM format. "
                "Examples: 0900, 1430, 2100."
            )

        return time(
            hour=parsed.hour,
            minute=parsed.minute,
        )

    def get_notification(
        self,
        reminder,
        today,
    ):
        if (
            reminder.due_date
            == today + timedelta(days=1)
        ):
            return (
                NotificationLog
                .NotificationType
                .REMINDER_UPCOMING,
                reminder.due_date,
            )

        if reminder.due_date == today:
            return (
                NotificationLog
                .NotificationType
                .REMINDER_DUE,
                reminder.due_date,
            )

        if reminder.due_date < today:
            return (
                NotificationLog
                .NotificationType
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
            == NotificationLog
            .NotificationType
            .REMINDER_UPCOMING
        ):
            return (
                f"{count} {reminder_word} "
                f"Due Tomorrow"
            )

        if (
            notification_type
            == NotificationLog
            .NotificationType
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

    def build_summary_body(
        self,
        reminders,
    ):
        counts = Counter(
            reminder.title
            for reminder in reminders
        )

        parts = [
            f"{title} — {count}"
            for title, count in counts.items()
        ]

        return " • ".join(parts)