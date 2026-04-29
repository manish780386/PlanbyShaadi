from django.contrib import admin
from .models import VendorProfile, VendorImage, VendorPackage, VendorAvailability


@admin.register(VendorProfile)
class VendorProfileAdmin(admin.ModelAdmin):
    list_display    = ["business_name", "category", "city", "rating", "is_verified", "is_active", "created_at"]
    list_filter     = ["category", "city", "is_verified", "is_active"]
    search_fields   = ["business_name", "city", "user__email", "user__phone"]
    readonly_fields = ["rating", "total_reviews", "total_bookings", "created_at", "updated_at"]
    actions         = ["verify_vendors", "deactivate_vendors"]

    def verify_vendors(self, request, queryset):
        queryset.update(is_verified=True)
    verify_vendors.short_description = "Mark selected vendors as verified"

    def deactivate_vendors(self, request, queryset):
        queryset.update(is_active=False)
    deactivate_vendors.short_description = "Deactivate selected vendors"


@admin.register(VendorImage)
class VendorImageAdmin(admin.ModelAdmin):
    list_display = ["vendor", "event_type", "is_cover", "uploaded_at"]
    list_filter  = ["event_type", "is_cover"]


@admin.register(VendorPackage)
class VendorPackageAdmin(admin.ModelAdmin):
    list_display = ["vendor", "name", "price", "is_popular"]
    list_filter  = ["is_popular"]


@admin.register(VendorAvailability)
class VendorAvailabilityAdmin(admin.ModelAdmin):
    list_display = ["vendor", "date", "reason"]