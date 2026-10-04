import os
from rest_framework.decorators import action
from django.core.mail import send_mail
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework import status
from animals.models.animal import Animal
from animals.models.animal_access import AnimalAccess
from animals.permissions import CanEditAnimalProfile
from .serializers import BaseAnimalSerializer, BaseListAnimalSerializer, HorseBreedSerializer, DogBreedSerializer, AnimalInquirySerializer
from animals.models.horse import HorseBreed
from animals.models.dog import DogBreed
from django.db.models import Prefetch
from media_library.models import AnimalMedia
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives, get_connection
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from datetime import datetime, time

from django.utils import timezone
from medical.models import MedicalRecord
from reminders.models import ReminderCompletion

class BaseAnimalViewSet(viewsets.ModelViewSet):
    """
    Base ViewSet that handles universal access control
    for all animal types.
    """
    permission_classes = [IsAuthenticatedOrReadOnly, CanEditAnimalProfile]
    lookup_field = 'slug'
   
    def get_serializer_class(self):
        if self.action == 'list':
            return getattr(self, 'list_serializer_class', self.serializer_class)
        return self.serializer_class

    def get_queryset(self):
        # Use select_related to eagerly load polymorphic relationships and prevent N+1 queries
        qs = Animal.objects.select_related('horse', 'dog', 'cattledetails')
        
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            qs = qs.filter(featured=featured)
            
        if self.action == 'list':
            qs = qs.select_related('profile_image')      
            
        return qs.order_by('-featured', 'name')   

    @action(
    detail=True,
    methods=["get"],
    url_path="timeline",
    )
    def timeline(self, request, slug=None):
        animal = self.get_object()

        events = []

        # ---------------------------------------------------------
        # Medical records
        # ---------------------------------------------------------
        medical_records = (
            MedicalRecord.objects
            .filter(animal=animal)
            .order_by("-date", "-created_at")
        )

        for record in medical_records:
            event_datetime = timezone.make_aware(
                datetime.combine(
                    record.date,
                    time.min,
                )
            )

            events.append({
                "id": f"medical-{record.id}",
                "source_id": record.id,
                "type": "medical",
                "date": event_datetime,
                "title": record.title,
                "description": record.description,
                "data": {
                    "record_type": record.record_type,
                    "record_type_display": record.get_record_type_display(),
                    "weight": record.weight,
                    "height": record.height,
                    "veterinarian": record.veterinarian,
                    "clinic": record.clinic,
                    "medication": record.medication,
                    "dosage": record.dosage,
                    "follow_up_date": record.follow_up_date,
                },
            })

        # ---------------------------------------------------------
        # Completed reminders
        # ---------------------------------------------------------
        completions = (
            ReminderCompletion.objects
            .filter(reminder__animal=animal)
            .select_related("reminder")
            .order_by("-completed_at")
        )

        for completion in completions:
            reminder = completion.reminder

            events.append({
                "id": f"reminder-{completion.id}",
                "source_id": completion.id,
                "type": "reminder",
                "date": completion.completed_at,
                "title": reminder.title,
                "description": reminder.description,
                "data": {
                    "reminder_type": reminder.reminder_type,
                    "reminder_type_display":
                        reminder.get_reminder_type_display(),
                    "notes": completion.notes,
                    "recurring": reminder.recurring,
                },
            })

        # ---------------------------------------------------------
        # Media
        # ---------------------------------------------------------
        media_items = (
            AnimalMedia.objects
            .filter(animal=animal)
            .order_by("-uploaded_at")
        )

        from training.media import scope_training_media
        media_items = scope_training_media(media_items, request.user)

        for media in media_items:
            events.append({
                "id": f"media-{media.id}",
                "source_id": media.id,
                "type": "media",
                "date": media.uploaded_at,
                "title": media.caption or media.get_media_type_display(),
                "description": media.description,
                "data": {
                    "media_type": media.media_type,
                    "url": media.get_url(),
                    "public": media.public,
                },
            })

        # ---------------------------------------------------------
        # Newest first
        # ---------------------------------------------------------
        from training.timeline import activity_events
        events.extend(activity_events(animal, request))

        events.sort(
            key=lambda event: event["date"],
            reverse=True,
        )

        return Response(events)

    @action(detail=True, methods=["get"], url_path="training-rating")
    def training_rating(self, request, slug=None):
        from training.access import accessible_animals
        from training.rating import training_rating, RUBRICS
        from rest_framework.exceptions import PermissionDenied, ValidationError
        animal = self.get_object()
        if not accessible_animals(request.user).filter(pk=animal.pk).exists():
            raise PermissionDenied()
        if animal.species != Animal.Species.HORSE:
            raise ValidationError("Training ratings apply to horses.")
        rubric = request.query_params.get("rubric", "foundation-v1")
        if rubric not in RUBRICS:
            raise ValidationError({"rubric": "Unknown training rubric."})
        return Response(training_rating(animal, rubric))

    @action(detail=True, methods=['post'], url_path='inquire', permission_classes=[AllowAny], throttle_classes=[AnonRateThrottle])
    def inquire(self, request, slug=None):
        
        animal = self.get_object()
        if request.data.get('honeypot'):
            return Response({"detail": "Inquiry sent successfully."}, status=status.HTTP_200_OK)
        
        serializer = AnimalInquirySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Package the data to send to the HTML files
        context = {
            'animal': animal,
            'data': data
        }
        
        try:
            # 1. Admin Email
            admin_msg = EmailMultiAlternatives(
                subject=f"New Inquiry: {animal.name} ({animal.species})",
                body=render_to_string('emails/inquiry_admin.txt', context),
                from_email="DD Cattle Company <inquiries@ddcattle.company>",
                to=[os.getenv('ADMIN_EMAIL')],
                reply_to=[data['sender_email']]
            )
            admin_msg.attach_alternative(render_to_string('emails/inquiry_admin.html', context), "text/html")

            # 2. Sender Confirmation Email
            sender_msg = EmailMultiAlternatives(
                subject=f"We received your inquiry about {animal.name}",
                body=render_to_string('emails/inquiry_confirmation.txt', context),
                from_email="DD Cattle Company <inquiries@ddcattle.company>",
                to=[data['sender_email']]
            )
            sender_msg.attach_alternative(render_to_string('emails/inquiry_confirmation.html', context), "text/html")

            with get_connection() as connection:
                admin_msg.connection = connection
                sender_msg.connection = connection
                admin_msg.send(fail_silently=False)
                sender_msg.send(fail_silently=False)
            
            return Response({"detail": "Inquiry sent successfully."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Failed to send email notification: {e}")
            return Response(
                {"detail": "Failed to send inquiry."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):  
        try:      
            animal_instance = serializer.save()
       
            send_mail(
                subject="New Animal Created",
                message=f"A new animal profile has been created: {animal_instance.name}",
                from_email=None,
                recipient_list=[self.request.user.email],
                fail_silently=False,
            )
        except Exception as e:
            print(f"Failed to send email notification: {e}")

        AnimalAccess.objects.create(
            animal=animal_instance,
            user=self.request.user,
            role=AnimalAccess.Role.OWNER,
            can_edit_profile=True,
            can_manage_medical=True,
            can_manage_appointments=True,
            can_upload_media=True,
            can_manage_documents=True,
            can_manage_access=True
        )

class AnimalViewSet(BaseAnimalViewSet):
    serializer_class = BaseAnimalSerializer
    list_serializer_class = BaseListAnimalSerializer

class HorseBreedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = HorseBreed.objects.all().order_by('name')
    serializer_class = HorseBreedSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = None # Disable pagination for simple dropdown lists

class DogBreedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DogBreed.objects.all().order_by('name')
    serializer_class = DogBreedSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = None