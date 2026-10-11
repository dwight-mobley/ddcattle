"""Version 1 staff-only private track protocol. No Ride/Animal/public writes."""
import hashlib
import json
import math
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import APIException, ValidationError
from rest_framework.parsers import JSONParser
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.throttling import UserRateThrottle
from .models import RecordedTrack, RecordedTrackBatch

BATCH_SIZE = 500
MAX_SAMPLES = 20000
MAX_BYTES = 512 * 1024

def digest(text):
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

class Conflict(APIException):
    status_code = 409
    default_detail = "Upload identity already has different immutable data."

class Disabled(APIException):
    status_code = 503
    default_detail = "Private ride sync is disabled on this server."

class PrivateSyncPermission(IsAdminUser):
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        if not getattr(settings, "RIDE_SYNC_ENABLED", False):
            raise Disabled()
        return True

class TrackThrottle(UserRateThrottle):
    rate = "240/min"
    scope = "private_track_sync"

class TrackPages(PageNumberPagination):
    page_size = 20

class StrictSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        if not isinstance(data, dict) or set(data) - set(self.fields):
            raise ValidationError({"non_field_errors": ["Unexpected fields. Ownership/publication and animal IDs cannot be submitted."]})
        for name, field in self.fields.items():
            value = data.get(name)
            if value is None:
                continue
            if isinstance(field, serializers.BooleanField) and type(value) is not bool:
                raise ValidationError({"non_field_errors": ["Expected JSON boolean."]})
            if isinstance(field, serializers.IntegerField) and type(value) is not int:
                raise ValidationError({"non_field_errors": ["Expected JSON integer."]})
            if isinstance(field, serializers.FloatField) and type(value) not in (int, float):
                raise ValidationError({"non_field_errors": ["Expected JSON number."]})
            if isinstance(field, serializers.CharField) and not isinstance(value, str):
                raise ValidationError({"non_field_errors": ["Expected JSON string."]})
        return super().to_internal_value(data)

class Manifest(StrictSerializer):
    format_version = serializers.IntegerField(min_value=1, max_value=1)
    client_ride_uuid = serializers.UUIDField()
    revision = serializers.IntegerField(min_value=1, max_value=1)  # One frozen snapshot in the initial slice.
    source = serializers.ChoiceField(choices=["ANDROID_FUSED"])
    kind = serializers.ChoiceField(choices=["HORSE", "FOUR_WHEELER_TEST", "VEHICLE_TEST"])
    filter_version = serializers.ChoiceField(choices=["android-1"])
    started_at_ms = serializers.IntegerField(min_value=0, max_value=253402300799999)
    ended_at_ms = serializers.IntegerField(min_value=0, max_value=253402300799999)
    active_ms = serializers.IntegerField(min_value=0, max_value=2592000000)
    moving_ms = serializers.IntegerField(min_value=0, max_value=2592000000)
    expected_samples = serializers.IntegerField(min_value=0, max_value=MAX_SAMPLES)
    batch_digests = serializers.ListField(child=serializers.RegexField(r"^[0-9a-f]{64}$"), max_length=40)
    payload_digest = serializers.RegexField(r"^[0-9a-f]{64}$")
    title = serializers.CharField(max_length=120, allow_blank=True, trim_whitespace=False)
    notes = serializers.CharField(max_length=4000, allow_blank=True, trim_whitespace=False)
    horse_name = serializers.CharField(max_length=120, allow_blank=True, trim_whitespace=False)
    location_name = serializers.CharField(max_length=200, allow_blank=True, trim_whitespace=False)
    distance_m = serializers.FloatField(min_value=0, max_value=10000000)
    gain_m = serializers.FloatField(min_value=0, max_value=1000000)
    loss_m = serializers.FloatField(min_value=0, max_value=1000000)

    def validate(self, data):
        if data["moving_ms"] > data["active_ms"]:
            raise ValidationError("Moving duration exceeds recording duration.")
        # Wall clock can change during a ride; do not infer recording duration from UTC endpoints.
        if len(data["batch_digests"]) != (data["expected_samples"] + BATCH_SIZE - 1) // BATCH_SIZE:
            raise ValidationError("Batch count does not match sample count.")
        if data["payload_digest"] != digest("\n".join(data["batch_digests"])):
            raise ValidationError("Invalid complete payload digest.")
        if not all(math.isfinite(data[k]) for k in ["distance_m", "gain_m", "loss_m"]):
            raise ValidationError("Metrics must be finite client estimates.")
        return data

class Point(StrictSerializer):
    sequence = serializers.IntegerField(min_value=0, max_value=MAX_SAMPLES-1)
    segment = serializers.IntegerField(min_value=0, max_value=100000)
    timestamp_ms = serializers.IntegerField(min_value=0, max_value=253402300799999)
    monotonic_ns = serializers.RegexField(r"^[0-9]{1,19}$")
    latitude = serializers.FloatField(min_value=-90, max_value=90, allow_null=True)
    longitude = serializers.FloatField(min_value=-180, max_value=180, allow_null=True)
    accuracy_m = serializers.FloatField(min_value=0, allow_null=True)
    speed_mps = serializers.FloatField(min_value=0, allow_null=True)
    altitude_m = serializers.FloatField(allow_null=True)
    vertical_accuracy_m = serializers.FloatField(min_value=0, allow_null=True)
    accepted = serializers.BooleanField()
    rejection = serializers.CharField(max_length=100, allow_blank=True, allow_null=True, trim_whitespace=False)
    invalid_fields = serializers.ListField(child=serializers.ChoiceField(choices=["latitude", "longitude", "accuracy_m", "speed_mps", "altitude_m", "vertical_accuracy_m"]), max_length=6)

    def validate(self, data):
        for k in ["latitude", "longitude", "accuracy_m", "speed_mps", "altitude_m", "vertical_accuracy_m"]:
            if data[k] is not None and not math.isfinite(data[k]):
                raise ValidationError("Coordinates and observations must be finite or null.")
        if any(data[k] is not None for k in data["invalid_fields"]):
            raise ValidationError("Invalid raw observations must be null with a marker.")
        if data["accepted"] and (data["latitude"] is None or data["longitude"] is None or data["accuracy_m"] is None or data["accuracy_m"] > 25 or any(k in data["invalid_fields"] for k in ["latitude", "longitude", "accuracy_m", "speed_mps"]) or data["rejection"] not in (None, "", "gap")):
            raise ValidationError("Invalid accepted fix.")
        return data

def parse_exact(text, supplied):
    if not isinstance(text, str) or len(text.encode("utf-8")) > MAX_BYTES:
        raise ValidationError("JSON payload exceeds 512 KiB.")
    if digest(text) != supplied:
        raise ValidationError("Digest does not match payload.")
    try:
        def unique(pairs):
            obj = {}
            for key, value in pairs:
                if key in obj:
                    raise ValueError("Duplicate JSON key")
                obj[key] = value
            return obj
        return json.loads(text, parse_constant=lambda _: (_ for _ in ()).throw(ValueError()), object_pairs_hook=unique)
    except (ValueError, RecursionError):
        raise ValidationError("Invalid finite JSON payload.")

def summary(track):
    return {"id": track.pk, "client_ride_uuid": str(track.client_ride_uuid), "revision": track.revision,
            "manifest_digest": track.manifest_digest, "payload_digest": track.manifest["payload_digest"],
            "state": "COMPLETE" if track.completed_at else "UPLOADING", "visibility": "PRIVATE_TEST",
            "title": track.manifest["title"], "kind": track.manifest["kind"],
            "owner_id": str(track.owner_id), "completed_at": track.completed_at,
            **{key: track.manifest[key] for key in ["started_at_ms", "ended_at_ms", "active_ms", "moving_ms", "distance_m", "gain_m", "loss_m", "expected_samples"]}}

class RecordedTrackViewSet(viewsets.GenericViewSet):
    permission_classes = [PrivateSyncPermission]
    throttle_classes = [TrackThrottle]
    parser_classes = [JSONParser]
    pagination_class = TrackPages
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        # Staff does not bypass API ownership. Cross-owner inspection is Django admin only.
        return RecordedTrack.objects.filter(owner=self.request.user)

    def finalize_response(self, request, response, *args, **kwargs):
        response = super().finalize_response(request, response, *args, **kwargs)
        response["Cache-Control"] = "private, no-store"
        response["X-Robots-Tag"] = "noindex, noarchive"
        return response

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        if request.method == "POST":
            # DRF reads the body through the Django size guard; explicitly bound this endpoint too.
            try:
                if int(request.META.get("CONTENT_LENGTH") or 0) > MAX_BYTES + 32768:
                    raise ValidationError("Request is too large.")
            except ValueError:
                raise ValidationError("Invalid request length.")
            if len(request.body) > MAX_BYTES + 32768:
                raise ValidationError("Request is too large.")

    @action(detail=False, methods=["get"])
    def capabilities(self, request):
        return Response({"format_version": 1, "visibility": "PRIVATE_TEST", "staff_only": True,
                         "batch_size": BATCH_SIZE, "max_samples": MAX_SAMPLES, "user_id": str(request.user.pk)})

    def list(self, request):
        page = self.paginate_queryset(self.get_queryset())
        return self.get_paginated_response([summary(x) for x in page])

    def retrieve(self, request, pk=None):
        track = self.get_object()
        result = summary(track)
        result["manifest"] = track.manifest
        result["received_batches"] = list(track.batches.values_list("index", flat=True))
        return Response(result)

    @action(detail=True, methods=["get"])
    def samples(self, request, pk=None):
        track = self.get_object()
        if not track.completed_at:
            raise ValidationError("Only completed private tracks can be viewed on a map.")
        index = serializers.IntegerField(min_value=0, max_value=39).run_validation(request.query_params.get("batch", 0))
        if index >= len(track.manifest["batch_digests"]):
            raise ValidationError("Batch index out of range.")
        batch = track.batches.filter(index=index).first()
        if not batch or digest(batch.payload) != track.manifest["batch_digests"][index]:
            raise Conflict("Stored batch is missing or damaged; ask the administrator to review.")
        return Response({"index": index, "owner_id": str(track.owner_id), "track_id": track.pk,
                         "samples": json.loads(batch.payload), "total_batches": len(track.manifest["batch_digests"])})

    def create(self, request):
        if not isinstance(request.data, dict) or set(request.data) != {"manifest", "digest"}:
            raise ValidationError("Expected manifest and digest only.")
        raw = parse_exact(request.data["manifest"], request.data["digest"])
        ser = Manifest(data=raw); ser.is_valid(raise_exception=True)
        key = {"owner": request.user, "client_ride_uuid": ser.validated_data["client_ride_uuid"], "revision": 1}
        # Serializes per-owner creation (including first-use race) in databases with row locks.
        with transaction.atomic():
            type(request.user).objects.select_for_update().get(pk=request.user.pk)
            if not RecordedTrack.objects.filter(**key).exists() and RecordedTrack.objects.filter(owner=request.user, completed_at__isnull=True).count() >= 100:
                raise ValidationError("Too many incomplete uploads; ask the administrator to review them.")
            track, created = RecordedTrack.objects.get_or_create(**key, defaults={"manifest": raw, "manifest_digest": request.data["digest"]})
            if track.manifest_digest != request.data["digest"]:
                raise Conflict()
        return Response(summary(track), status=201 if created else 200)

    @action(detail=True, methods=["post"])
    def batch(self, request, pk=None):
        track = self.get_object()
        if not isinstance(request.data, dict) or set(request.data) != {"index", "payload", "digest"} or type(request.data["index"]) is not int:
            raise ValidationError("Expected integer index, payload and digest only.")
        index = request.data["index"]
        hashes = track.manifest["batch_digests"]
        if not 0 <= index < len(hashes):
            raise ValidationError("Batch index out of range.")
        if request.data["digest"] != hashes[index]:
            raise Conflict()
        raw = parse_exact(request.data["payload"], request.data["digest"])
        if not isinstance(raw, list):
            raise ValidationError("Expected sample array.")
        expected = min(BATCH_SIZE, track.manifest["expected_samples"] - index * BATCH_SIZE)
        if len(raw) != expected:
            raise ValidationError("Batch sample count mismatch.")
        ser = Point(data=raw, many=True); ser.is_valid(raise_exception=True)
        if any(p["sequence"] != index * BATCH_SIZE + i for i, p in enumerate(ser.validated_data)):
            raise ValidationError("Samples must be contiguous in insertion order.")
        with transaction.atomic():
            track = self.get_queryset().select_for_update().get(pk=track.pk)
            old = track.batches.filter(index=index).first()
            if old:
                if old.digest != request.data["digest"]:
                    raise Conflict()
            elif track.completed_at:
                raise Conflict()
            else:
                RecordedTrackBatch.objects.create(track=track, index=index, digest=request.data["digest"], payload=request.data["payload"])
        return Response({"index": index, "digest": hashes[index]})

    @action(detail=True, methods=["post"])
    def finalize(self, request, pk=None):
        track = self.get_object()
        if not isinstance(request.data, dict) or set(request.data) != {"payload_digest"} or request.data["payload_digest"] != track.manifest["payload_digest"]:
            raise Conflict()
        with transaction.atomic():
            track = self.get_queryset().select_for_update().get(pk=track.pk)
            batches = list(track.batches.all())
            if [b.index for b in batches] != list(range(len(track.manifest["batch_digests"]))):
                raise ValidationError("Missing batches. Resume upload before finalizing.")
            count = 0; last_segment = -1; accepted_clocks = {}
            for batch in batches:
                if digest(batch.payload) != track.manifest["batch_digests"][batch.index]:
                    raise Conflict()
                for point in json.loads(batch.payload):
                    seg = point["segment"]; mono = int(point["monotonic_ns"])
                    if seg < last_segment or (point["accepted"] and mono <= accepted_clocks.get(seg, -1)):
                        raise ValidationError("Segment/accepted monotonic order is invalid; review the local diagnostics.")
                    if point["accepted"]:
                        accepted_clocks[seg] = mono
                    last_segment = seg; count += 1
            if count != track.manifest["expected_samples"]:
                raise ValidationError("Incomplete sample count.")
            if not track.completed_at:
                track.completed_at = timezone.now(); track.save(update_fields=["completed_at"])
        return Response(summary(track))
