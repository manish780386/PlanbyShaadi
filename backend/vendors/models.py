from django.db import models
from django.conf import settings
from django.db.models import Avg


class VendorCategory(models.TextChoices):
    PHOTOGRAPHER   = "PHOTOGRAPHER",   "Photographer"
    DECORATOR      = "DECORATOR",      "Decorator"
    CATERER        = "CATERER",        "Caterer"
    VENUE          = "VENUE",          "Venue"
    DJ_MUSIC       = "DJ_MUSIC",       "DJ & Music"
    MAKEUP         = "MAKEUP",         "Makeup Artist"
    MEHNDI         = "MEHNDI",         "Mehndi Artist"
    INVITATION     = "INVITATION",     "Invitation Designer"
    DHOL_BAND      = "DHOL_BAND",      "Dhol & Band"
    PANDIT         = "PANDIT",         "Pandit / Priest"
    TRANSPORT      = "TRANSPORT",      "Transport & Cars"
    TENT_FURNITURE = "TENT_FURNITURE", "Tent & Furniture"


class VendorProfile(models.Model):
    user             = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="vendor_profile")
    business_name    = models.CharField(max_length=200)
    category         = models.CharField(max_length=30, choices=VendorCategory.choices)
    description      = models.TextField(blank=True)
    city             = models.CharField(max_length=100)
    state            = models.CharField(max_length=100, blank=True)
    address          = models.TextField(blank=True)
    starting_price   = models.PositiveIntegerField(default=0)
    experience_years = models.PositiveSmallIntegerField(default=0)
    is_verified      = models.BooleanField(default=False)
    is_active        = models.BooleanField(default=True)
    rating           = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    total_reviews    = models.PositiveIntegerField(default=0)
    total_bookings   = models.PositiveIntegerField(default=0)
    cover_image      = models.ImageField(upload_to="vendors/covers/", null=True, blank=True)
    gstin            = models.CharField(max_length=15, blank=True)
    instagram_url    = models.URLField(blank=True)
    youtube_url      = models.URLField(blank=True)
    website_url      = models.URLField(blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "vendor_profiles"
        ordering = ["-rating", "-total_reviews"]
        indexes  = [
            models.Index(fields=["city"]),
            models.Index(fields=["category"]),
            models.Index(fields=["is_verified", "is_active"]),
            models.Index(fields=["starting_price"]),
        ]

    def __str__(self):
        return f"{self.business_name} ({self.city})"

    def update_rating(self):
        from bookings.models import Review
        reviews = Review.objects.filter(vendor=self)
        if reviews.exists():
            avg = reviews.aggregate(avg=Avg("rating"))["avg"]
            self.rating        = round(avg, 2)
            self.total_reviews = reviews.count()
            self.save(update_fields=["rating", "total_reviews"])


class VendorImage(models.Model):
    vendor      = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="images")
    image       = models.ImageField(upload_to="vendors/portfolio/")
    caption     = models.CharField(max_length=200, blank=True)
    is_cover    = models.BooleanField(default=False)
    event_type  = models.CharField(max_length=50, blank=True)
    order       = models.PositiveSmallIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vendor_images"
        ordering = ["order", "-uploaded_at"]

    def __str__(self):
        return f"{self.vendor.business_name} — image {self.id}"


class VendorPackage(models.Model):
    vendor      = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="packages")
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price       = models.PositiveIntegerField()
    includes    = models.JSONField(default=list)
    is_popular  = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "vendor_packages"
        ordering = ["price"]

    def __str__(self):
        return f"{self.vendor.business_name} — {self.name} (Rs.{self.price})"


class VendorAvailability(models.Model):
    vendor = models.ForeignKey(VendorProfile, on_delete=models.CASCADE, related_name="unavailable_dates")
    date   = models.DateField()
    reason = models.CharField(max_length=200, blank=True)

    class Meta:
        db_table        = "vendor_availability"
        unique_together = ["vendor", "date"]

    def __str__(self):
        return f"{self.vendor.business_name} unavailable on {self.date}"