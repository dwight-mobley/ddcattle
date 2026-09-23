from django.conf import settings
from django.db import models

from animals.models.animal import Animal


class AuditLog(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
    )

    animal = models.ForeignKey(
        Animal,
        on_delete=models.CASCADE,
        related_name="audit_logs",
    )

    action = models.CharField(max_length=50)

    description = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.user} - {self.action}"