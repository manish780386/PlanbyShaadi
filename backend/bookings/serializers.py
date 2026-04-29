from rest_framework import serializers
from .models import Booking, Review
from vendors.serializers import VendorListSerializer


class BookingCreateSerializer(serializers.ModelSerializer):

    class Meta:
        model  = Booking
        fields = [
            "id",
            "vendor",
            "package",
            "event_type",
            "event_date",
            "guest_count",
            "message",
        ]

    def validate(self, attrs):
        vendor     = attrs.get("vendor")
        event_date = attrs.get("event_date")
        if vendor.unavailable_dates.filter(date=event_date).exists():
            raise serializers.ValidationError({
                "event_date": "Vendor is not available on this date."
            })
        return attrs

    def create(self, validated_data):
        user    = self.context["request"].user
        booking = Booking.objects.create(user=user, **validated_data)
        if booking.package:
            booking.calculate_amounts(booking.package.price)
        return booking


class BookingListSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.business_name", read_only=True)
    vendor_city = serializers.CharField(source="vendor.city",          read_only=True)
    vendor_cat  = serializers.CharField(source="vendor.category",      read_only=True)

    class Meta:
        model  = Booking
        fields = [
            "id",
            "vendor",
            "vendor_name",
            "vendor_city",
            "vendor_cat",
            "event_type",
            "event_date",
            "guest_count",
            "status",
            "total_amount",
            "is_paid",
            "created_at",
        ]


class BookingDetailSerializer(serializers.ModelSerializer):
    vendor     = VendorListSerializer(read_only=True)
    has_review = serializers.SerializerMethodField()

    class Meta:
        model  = Booking
        fields = [
            "id",
            "vendor",
            "package",
            "event_type",
            "event_date",
            "guest_count",
            "message",
            "status",
            "total_amount",
            "platform_fee",
            "vendor_amount",
            "is_paid",
            "razorpay_order_id",
            "razorpay_payment_id",
            "has_review",
            "created_at",
            "updated_at",
        ]

    def get_has_review(self, obj):
        return hasattr(obj, "review")


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.full_name", read_only=True)

    class Meta:
        model  = Review
        fields = ["id", "rating", "comment", "user_name", "created_at"]
        read_only_fields = ["id", "user_name", "created_at"]

    def create(self, validated_data):
        booking = self.context["booking"]
        if hasattr(booking, "review"):
            raise serializers.ValidationError("Review already submitted for this booking.")
        if booking.status != "COMPLETED":
            raise serializers.ValidationError("Can only review after booking is completed.")
        return Review.objects.create(
            booking=booking,
            user=booking.user,
            vendor=booking.vendor,
            **validated_data,
        )