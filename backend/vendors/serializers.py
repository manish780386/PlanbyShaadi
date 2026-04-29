from rest_framework import serializers
from .models import VendorProfile, VendorImage, VendorPackage, VendorAvailability


class VendorImageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VendorImage
        fields = ["id", "image", "caption", "is_cover", "event_type", "order", "uploaded_at"]
        read_only_fields = ["id", "uploaded_at"]


class VendorPackageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = VendorPackage
        fields = ["id", "name", "description", "price", "includes", "is_popular"]
        read_only_fields = ["id"]


class VendorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model  = VendorAvailability
        fields = ["id", "date", "reason"]
        read_only_fields = ["id"]


class VendorListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for vendor listing and search results."""
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model  = VendorProfile
        fields = [
            "id",
            "business_name",
            "category",
            "city",
            "state",
            "starting_price",
            "rating",
            "total_reviews",
            "total_bookings",
            "experience_years",
            "is_verified",
            "cover_image_url",
        ]

    def get_cover_image_url(self, obj):
        request = self.context.get("request")
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        return None


class VendorDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for vendor profile page."""
    images   = VendorImageSerializer(many=True, read_only=True)
    packages = VendorPackageSerializer(many=True, read_only=True)

    class Meta:
        model  = VendorProfile
        fields = [
            "id",
            "business_name",
            "category",
            "city",
            "state",
            "address",
            "description",
            "starting_price",
            "experience_years",
            "is_verified",
            "is_active",
            "rating",
            "total_reviews",
            "total_bookings",
            "cover_image",
            "gstin",
            "instagram_url",
            "youtube_url",
            "website_url",
            "images",
            "packages",
            "created_at",
        ]


class VendorRegisterSerializer(serializers.ModelSerializer):
    """Used when a vendor creates their profile for the first time."""

    class Meta:
        model  = VendorProfile
        fields = [
            "business_name",
            "category",
            "city",
            "state",
            "address",
            "description",
            "starting_price",
            "experience_years",
            "gstin",
            "instagram_url",
            "youtube_url",
            "website_url",
        ]

    def create(self, validated_data):
        user = self.context["request"].user
        if hasattr(user, "vendor_profile"):
            raise serializers.ValidationError("Vendor profile already exists.")
        return VendorProfile.objects.create(user=user, **validated_data)


class VendorUpdateSerializer(serializers.ModelSerializer):
    """Used when vendor updates their own profile."""

    class Meta:
        model  = VendorProfile
        fields = [
            "business_name",
            "category",
            "city",
            "state",
            "address",
            "description",
            "starting_price",
            "experience_years",
            "cover_image",
            "gstin",
            "instagram_url",
            "youtube_url",
            "website_url",
        ]