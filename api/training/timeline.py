from datetime import datetime, time
from django.utils import timezone
from .models import TrainingSession
from .serializers import RideSerializer, TrainingSessionSerializer
from .access import accessible_animals, visible_rides


def activity_events(animal, request):
    if not accessible_animals(request.user).filter(pk=animal.pk).exists():
        return []
    events = []
    rides = visible_rides(request.user).filter(participants__animal=animal).select_related("location").prefetch_related("participants__animal", "participants__rider")
    sessions = TrainingSession.objects.filter(animal=animal).select_related("location", "trainer", "ride")
    for kind, queryset, serializer in [("ride", rides, RideSerializer), ("training", sessions, TrainingSessionSerializer)]:
        for record in queryset:
            events.append({"id": f"{kind}-{record.pk}", "source_id": record.pk, "type": kind, "date": timezone.make_aware(datetime.combine(record.date, time.min)), "title": record.title, "description": record.notes, "data": serializer(record, context={"request": request}).data})
    return events
