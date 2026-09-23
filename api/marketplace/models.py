from django.conf import settings
from django.db import models

from animals.models.animal import Animal


class SaleListing(models.Model):

    animal = models.OneToOneField(
        Animal,
        on_delete=models.CASCADE,
        related_name="sale_listing",
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    show_price = models.BooleanField(default=True)

    active = models.BooleanField(default=True)

    featured = models.BooleanField(default=False)

    contact_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="sale_listings",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title

class SaleInquiry(models.Model):

    listing = models.ForeignKey(
        SaleListing,
        on_delete=models.CASCADE,
        related_name="inquiries",
    )

    name = models.CharField(max_length=150)

    email = models.EmailField()

    phone = models.CharField(
        max_length=50,
        blank=True,
    )

    message = models.TextField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    handled = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.name} → {self.listing}"