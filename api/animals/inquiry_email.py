"""Shared animal inquiry templates/transport; callers own persistence and retries."""
import os
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import EmailMultiAlternatives
from django.core.validators import validate_email
from django.template.loader import render_to_string


def inquiry_messages(animal, data, listing=None):
    recipient = getattr(settings, "INQUIRY_ADMIN_EMAIL", None) or os.getenv("ADMIN_EMAIL")
    if not recipient:
        raise ImproperlyConfigured("Inquiry admin email is not configured.")
    validate_email(recipient)
    context = {"animal": animal, "data": data}
    if listing is not None:
        context.update({"listing_title": listing.title, "listing_status": listing.get_status_display(),
                        "listing_url": getattr(settings, "PUBLIC_SITE_URL", "https://ddcattle.company").rstrip("/") + f"/marketplace/{listing.pk}"})
    subject_name = " ".join(animal.name.splitlines())
    sender = "DD Cattle Company <inquiries@ddcattle.company>"
    admin = EmailMultiAlternatives(subject=f"New Inquiry: {subject_name} ({animal.species})", body=render_to_string("emails/inquiry_admin.txt", context),
                                  from_email=sender, to=[recipient], reply_to=[data["sender_email"]])
    admin.attach_alternative(render_to_string("emails/inquiry_admin.html", context), "text/html")
    confirmation = EmailMultiAlternatives(subject=f"We received your inquiry about {subject_name}", body=render_to_string("emails/inquiry_confirmation.txt", context),
                                         from_email=sender, to=[data["sender_email"]])
    confirmation.attach_alternative(render_to_string("emails/inquiry_confirmation.html", context), "text/html")
    return admin, confirmation
