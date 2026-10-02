from django.contrib import admin

from .models import NotificationLog, PushSubscription


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "device_name",
        "active",
        "created_at",
    )

    list_filter = (
        "active",
        "created_at",
    )

    search_fields = (
        "user__username",
        "device_name",
        "endpoint",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )


@admin.register(NotificationLog)
class NotificationLogAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "reminder",
        "notification_type",
        "scheduled_date",
        "sent_at",
    )

    list_filter = (
        "notification_type",
        "scheduled_date",
        "sent_at",
    )

    search_fields = (
        "user__username",
        "reminder__title",
    )

    readonly_fields = (
        "sent_at",
    )