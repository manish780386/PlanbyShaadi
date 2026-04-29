from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Booking(models.Model):

    class Status(models.TextChoices):
        PENDING   = "PENDING",   "Pending"
        CONFIRMED = "CONFIRMED", "Confirmed"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        REJECTED  = "REJECTED",  "Rejected"

    user                = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bookings")
    vendor              = models.ForeignKey("vendors.VendorProfile",  on_delete=models.CASCADE, related_name="bookings")
    package             = models.ForeignKey("vendors.VendorPackage",  on_delete=models.SET_NULL, null=True, blank=True)
    event_type          = models.CharField(max_length=50)
    event_date          = models.DateField()
    guest_count         = models.PositiveIntegerField(default=50)
    message             = models.TextField(blank=True)
    status              = models.CharField(max_length=12, choices=Status.choices, default=Status.PENDING)
    total_amount        = models.PositiveIntegerField(default=0)
    platform_fee        = models.PositiveIntegerField(default=0)
    vendor_amount       = models.PositiveIntegerField(default=0)
    razorpay_order_id   = models.CharField(max_length=100, blank=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True)
    is_paid             = models.BooleanField(default=False)
    created_at          = models.DateTimeField(auto_now_add=True)
    updated_at          = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bookings"
        ordering = ["-created_at"]
        indexes  = [
            models.Index(fields=["user", "status"]),
            models.Index(fields=["vendor", "status"]),
            models.Index(fields=["event_date"]),
        ]

    def __str__(self):
        return f"Booking #{self.id} — {self.user} to {self.vendor.business_name}"

    def calculate_amounts(self, amount):
        fee_pct            = getattr(settings, "PLATFORM_FEE_PERCENT", 5)
        self.total_amount  = amount
        self.platform_fee  = int(amount * fee_pct / 100)
        self.vendor_amount = amount - self.platform_fee
        self.save(update_fields=["total_amount", "platform_fee", "vendor_amount"])


class Review(models.Model):
    booking    = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name="review")
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reviews")
    vendor     = models.ForeignKey("vendors.VendorProfile",  on_delete=models.CASCADE, related_name="reviews")
    rating     = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "reviews"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review by {self.user} for {self.vendor.business_name} — {self.rating} stars"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.vendor.update_rating()