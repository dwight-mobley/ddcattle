"""Persist first, then one notification attempt per unique submission.

SMTP acceptance is not exactly-once delivery. Automatic retries after ambiguous
failure can duplicate email, so staff review failures/stalled sends instead.
"""
import logging
from django.core.mail import get_connection
from django.utils import timezone
from animals.inquiry_email import inquiry_messages
from .models import SaleInquiry

logger = logging.getLogger(__name__)


def notify_inquiry(inquiry, listing, data):
    claimed = SaleInquiry.objects.filter(pk=inquiry.pk, notification_started_at__isnull=True).update(
        notification_started_at=timezone.now(), delivery_state=SaleInquiry.DeliveryState.SENDING)
    if not claimed:
        return
    try:
        admin, confirmation = inquiry_messages(listing.animal, data, listing)
        with get_connection() as connection:
            for message, field in [(admin, "admin_sent_at"), (confirmation, "confirmation_sent_at")]:
                message.connection = connection
                if message.send(fail_silently=False) != 1:
                    raise RuntimeError("Email backend did not acknowledge this send.")
                SaleInquiry.objects.filter(pk=inquiry.pk).update(**{field: timezone.now()})
        SaleInquiry.objects.filter(pk=inquiry.pk).update(delivery_state=SaleInquiry.DeliveryState.SENT)
    except Exception:
        SaleInquiry.objects.filter(pk=inquiry.pk).update(delivery_state=SaleInquiry.DeliveryState.NEEDS_REVIEW)
        logger.warning("Inquiry notification requires staff review: inquiry %s", inquiry.pk)
