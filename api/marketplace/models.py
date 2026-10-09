from django.conf import settings
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator

from animals.models.animal import Animal


class SaleListing(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        PENDING = "pending", "Pending"
        SOLD = "sold", "Sold"

    # Publication is opt-in; legacy active values are retained without publishing.
    published = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)
    gallery = models.ManyToManyField("media_library.AnimalMedia", blank=True, related_name="sale_listings")
    actual_sale_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0)])
    sale_date = models.DateField(null=True, blank=True)
    buyer_name = models.CharField(max_length=150, blank=True)
    buyer_email = models.EmailField(blank=True)
    buyer_phone = models.CharField(max_length=50, blank=True)
    internal_notes = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(price__gte=0) | models.Q(price__isnull=True), name="listing_price_nonnegative"),
            models.CheckConstraint(condition=models.Q(actual_sale_price__gte=0) | models.Q(actual_sale_price__isnull=True), name="listing_actual_price_nonnegative"),
            models.CheckConstraint(condition=models.Q(status__in=["available", "pending", "sold"]), name="listing_valid_status"),
        ]

    def clean(self):
        super().clean()
        if self.published and self.animal_id and not self.animal.public:
            raise ValidationError({"published": "Only explicitly public animals can be published."})

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)


    animal = models.OneToOneField(
        Animal,
        on_delete=models.CASCADE,
        related_name="sale_listing",
    )

    title = models.CharField(max_length=200)

    description = models.TextField()

    price = models.DecimalField(
        validators=[MinValueValidator(0)],
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
    class DeliveryState(models.TextChoices):
        LEGACY = "legacy", "Legacy (delivery unknown)"
        PENDING = "pending", "Pending notification"
        SENDING = "sending", "Notification started (review if stalled)"
        SENT = "sent", "Both email sends acknowledged"
        NEEDS_REVIEW = "needs_review", "Notification needs review"

    submission_key = models.UUIDField(null=True, blank=True, editable=False)
    delivery_state = models.CharField(max_length=20, choices=DeliveryState.choices, default=DeliveryState.LEGACY, editable=False)
    notification_started_at = models.DateTimeField(null=True, blank=True, editable=False)
    admin_sent_at = models.DateTimeField(null=True, blank=True, editable=False)
    confirmation_sent_at = models.DateTimeField(null=True, blank=True, editable=False)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["listing", "submission_key"], name="unique_listing_inquiry_submission")]


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