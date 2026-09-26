from django.contrib import admin
from .models import Reminder, MedicalReminder, ReminderCompletion

class ReminderAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "reminder_type", "animal", "due_date", "active")
    list_filter = ("reminder_type", "active")
    search_fields = ("title", "description", "animal__name")

admin.site.register(Reminder, ReminderAdmin)
admin.site.register(MedicalReminder)
admin.site.register(ReminderCompletion)