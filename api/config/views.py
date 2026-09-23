from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from django.core.mail import EmailMultiAlternatives, get_connection
from django.template.loader import render_to_string
from rest_framework import serializers
import os
class ContactSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    message = serializers.CharField(max_length=2000)
    topic = serializers.CharField(max_length=1000)

class ContactFormView(APIView):
    permission_classes = [AllowAny] # Ensure anyone can use the contact page
    throttle_classes = [AnonRateThrottle]

    def post(self, request):
        serializer = ContactSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if request.data.get('honeypot'):
            return Response({"detail": "Message sent successfully."}, status=status.HTTP_200_OK)
        
        context = {'data': data}
        
        try:
            # 1. Admin Email
            admin_msg = EmailMultiAlternatives(
                subject="New General Contact Message",
                body=render_to_string('emails/contact_admin.txt', context),
                from_email=['NoReply@ddcattle.company'],
                to=[os.getenv("ADMIN_EMAIL")],
                reply_to=[data['email']]
            )
            print(context)
            admin_msg.attach_alternative(render_to_string('emails/contact_admin.html', context), "text/html")

            # 2. Sender Confirmation (Optional)
            sender_msg = EmailMultiAlternatives(
                subject="We received your message",
                body=render_to_string('emails/contact_confirmation.txt', context),
                from_email=['NoReply@ddcattle.company'],
                to=[data['email']]
            )
            sender_msg.attach_alternative(render_to_string('emails/contact_confirmation.html', context), "text/html")

            with get_connection() as connection:
                admin_msg.connection = connection
                sender_msg.connection = connection
                admin_msg.send(fail_silently=False)
                sender_msg.send(fail_silently=False)
                
            return Response({"detail": "Message sent successfully."}, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"Failed to send contact email: {e}")
            return Response(
                {"detail": "Failed to send message."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )