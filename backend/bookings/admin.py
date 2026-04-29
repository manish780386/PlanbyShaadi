from django.contrib import admin
from .models import Booking, Review


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display   = ["id", "user", "vendor", "event_type", "event_date", "status", "total_amount", "is_paid", "created_at"]
    list_filter    = ["status", "is_paid", "event_type"]
    search_fields  = ["user__email", "user__phone", "vendor__business_name"]
    readonly_fields = ["total_amount", "platform_fee", "vendor_amount", "razorpay_order_id", "razorpay_payment_id", "created_at", "updated_at"]
    ordering       = ["-created_at"]


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ["user", "vendor", "rating", "created_at"]
    list_filter   = ["rating"]
    search_fields = ["user__email", "vendor__business_name"]
    readonly_fields = ["created_at"]