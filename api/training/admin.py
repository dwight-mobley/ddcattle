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


from django.utils.html import format_html
from .models import RecordedTrack, RecordedTrackBatch
import json

@admin.register(RecordedTrack)
class RecordedTrackAdmin(admin.ModelAdmin):
    list_display = ["__str__", "owner", "kind", "distance_miles", "sample_count", "completed_at", "created_at"]
    list_filter = ["completed_at", "owner"]
    search_fields = ["client_ride_uuid", "owner__username"]
    readonly_fields = ["owner", "client_ride_uuid", "revision", "manifest_digest", "completed_at", "created_at", "private_details"]
    fields = readonly_fields

    def kind(self, obj): return obj.manifest["kind"]
    def distance_miles(self, obj): return round(obj.manifest["distance_m"] / 1609.344, 2)
    def sample_count(self, obj): return obj.manifest["expected_samples"]
    def private_details(self, obj):
        return format_html('<pre style="white-space:pre-wrap">{}</pre>', json.dumps(obj.manifest, indent=2, ensure_ascii=False))
    private_details.short_description = "Private test manifest (client-estimated metrics; no horse history linkage)"
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False

@admin.register(RecordedTrackBatch)
class RecordedTrackBatchAdmin(admin.ModelAdmin):
    list_display = ["track", "index", "digest"]
    list_filter = ["track"]
    readonly_fields = ["track", "index", "digest", "payload"]
    fields = readonly_fields
    def has_add_permission(self, request): return False
    def has_change_permission(self, request, obj=None): return False
    def has_delete_permission(self, request, obj=None): return False  # Delete whole test tracks, never individual immutable batches.
