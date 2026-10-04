import json

from django.conf import settings
from py_vapid import Vapid
from pywebpush import webpush


def get_vapid_key():
    private_key = settings.VAPID_PRIVATE_KEY

    # Production: PEM stored directly in an environment variable.
    if "-----BEGIN" in private_key:
        return Vapid.from_pem(
            private_key.encode("utf-8")
        )

    # Local development: path to private_key.pem.
    return Vapid.from_file(private_key)


def send_push_notification(
    subscription,
    title,
    body,
    url="/admin/",
):
    vapid = get_vapid_key()

    payload = {
        "title": title,
        "body": body,
        "url": url,
    }

    return webpush(
        subscription_info={
            "endpoint": subscription.endpoint,
            "keys": {
                "p256dh": subscription.p256dh,
                "auth": subscription.auth,
            },
        },
        data=json.dumps(payload),
        vapid_private_key=vapid,
        vapid_claims={
            "sub": settings.VAPID_SUBJECT,
        },
        ttl=60,
    )