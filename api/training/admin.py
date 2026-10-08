from django.contrib import admin
from .models import RidingLocation, Ride, RideParticipant, TrainingSession, TrainingSkill, SessionSkillProgress, RideSkillProgress


class ParticipantInline(admin.TabularInline):
    model = RideParticipant
    extra = 0


class ProgressInline(admin.TabularInline):
    model = SessionSkillProgress
    extra = 0
    readonly_fields = ["created_by"]


class CreatorAdmin(admin.ModelAdmin):
    readonly_fields = ["created_by", "created_at", "updated_at"]

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)

    def save_formset(self, request, form, formset, change):
        instances = formset.save(commit=False)
        for obj in formset.deleted_objects:
            obj.delete()
        for obj in instances:
            if hasattr(obj, "created_by_id") and not obj.created_by_id:
                obj.created_by = request.user
            obj.save()
        formset.save_m2m()


@admin.register(Ride)
class RideAdmin(CreatorAdmin):
    list_display = ["title", "date", "location", "distance_miles", "duration_minutes"]
    list_filter = ["ride_type", "date"]
    search_fields = ["title", "notes", "participants__animal__name"]
    inlines = [ParticipantInline]


@admin.register(TrainingSession)
class TrainingSessionAdmin(CreatorAdmin):
    list_display = ["title", "animal", "date", "session_type"]
    list_filter = ["session_type", "date"]
    search_fields = ["title", "notes", "animal__name"]
    inlines = [ProgressInline]


admin.site.register(RidingLocation, CreatorAdmin)
admin.site.register(TrainingSkill)
admin.site.register(SessionSkillProgress, CreatorAdmin)


@admin.register(RideSkillProgress)
class RideSkillProgressAdmin(admin.ModelAdmin):
    list_display = ("ride", "animal", "skill")
    list_filter = ("skill",)
    search_fields = ("ride__title", "animal__name", "skill__name")
    readonly_fields = ("created_by", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
