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
        elif self.action == 'retrieve':
            ordered_media = Prefetch(
                'media', 
                queryset=AnimalMedia.objects.all().order_by('-media_type')
            )
            qs = qs.select_related('profile_image').prefetch_related(ordered_media, 'medical_records')
            
        return qs.order_by('-featured', 'name')   

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