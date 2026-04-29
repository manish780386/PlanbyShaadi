from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.core.cache import cache

from .models import VendorProfile, VendorImage, VendorPackage, VendorAvailability
from .serializers import (
    VendorListSerializer,
    VendorDetailSerializer,
    VendorRegisterSerializer,
    VendorUpdateSerializer,
    VendorImageSerializer,
    VendorPackageSerializer,
    VendorAvailabilitySerializer,
)
from .filters import VendorFilter
from users.permissions import IsVendorUser, IsAdminUser


class VendorListView(generics.ListAPIView):
    """Public: list all active vendors with filters, search, ordering."""
    serializer_class   = VendorListSerializer
    permission_classes = [permissions.AllowAny]
    filterset_class    = VendorFilter
    search_fields      = ["business_name", "city", "description"]
    ordering_fields    = ["rating", "starting_price", "total_reviews", "experience_years", "created_at"]
    ordering           = ["-rating"]

    def get_queryset(self):
        return VendorProfile.objects.filter(is_active=True).select_related("user")


class VendorDetailView(generics.RetrieveAPIView):
    """Public: full vendor detail with images and packages."""
    serializer_class   = VendorDetailSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        vendor_id = self.kwargs["pk"]
        cache_key = f"vendor_detail_{vendor_id}"
        cached    = cache.get(cache_key)
        if cached:
            return cached
        vendor = get_object_or_404(VendorProfile, pk=vendor_id, is_active=True)
        cache.set(cache_key, vendor, 300)
        return vendor


class VendorRegisterView(APIView):
    """Vendor: create own business profile."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def post(self, request):
        serializer = VendorRegisterSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        vendor = serializer.save()
        return Response({
            "success": True,
            "message": "Vendor profile created successfully.",
            "vendor":  VendorDetailSerializer(vendor, context={"request": request}).data,
        }, status=status.HTTP_201_CREATED)


class VendorProfileUpdateView(generics.RetrieveUpdateAPIView):
    """Vendor: view and update own profile."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]
    parser_classes     = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return VendorUpdateSerializer
        return VendorDetailSerializer

    def get_object(self):
        return get_object_or_404(VendorProfile, user=self.request.user)

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        response = super().update(request, *args, **kwargs)
        obj = self.get_object()
        cache.delete(f"vendor_detail_{obj.pk}")
        return response


class VendorImageUploadView(APIView):
    """Vendor: upload and delete portfolio images."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        vendor     = get_object_or_404(VendorProfile, user=request.user)
        serializer = VendorImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(vendor=vendor)
        return Response({
            "success": True,
            "image":   serializer.data,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        vendor = get_object_or_404(VendorProfile, user=request.user)
        image  = get_object_or_404(VendorImage, pk=pk, vendor=vendor)
        image.delete()
        return Response({
            "success": True,
            "message": "Image deleted.",
        })


class VendorPackageView(APIView):
    """Vendor: list, create and delete service packages."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def get(self, request):
        vendor   = get_object_or_404(VendorProfile, user=request.user)
        packages = vendor.packages.all()
        return Response(VendorPackageSerializer(packages, many=True).data)

    def post(self, request):
        vendor     = get_object_or_404(VendorProfile, user=request.user)
        serializer = VendorPackageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(vendor=vendor)
        return Response({
            "success": True,
            "package": serializer.data,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        vendor  = get_object_or_404(VendorProfile, user=request.user)
        package = get_object_or_404(VendorPackage, pk=pk, vendor=vendor)
        package.delete()
        return Response({
            "success": True,
            "message": "Package deleted.",
        })


class VendorAvailabilityView(APIView):
    """Vendor: manage unavailable dates."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def get(self, request):
        vendor = get_object_or_404(VendorProfile, user=request.user)
        dates  = vendor.unavailable_dates.all()
        return Response(VendorAvailabilitySerializer(dates, many=True).data)

    def post(self, request):
        vendor     = get_object_or_404(VendorProfile, user=request.user)
        serializer = VendorAvailabilitySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(vendor=vendor)
        return Response({
            "success":      True,
            "availability": serializer.data,
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        vendor = get_object_or_404(VendorProfile, user=request.user)
        entry  = get_object_or_404(VendorAvailability, pk=pk, vendor=vendor)
        entry.delete()
        return Response({
            "success": True,
            "message": "Date removed.",
        })


class VendorEarningsView(APIView):
    """Vendor: view earnings summary."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def get(self, request):
        from bookings.models import Booking
        vendor   = get_object_or_404(VendorProfile, user=request.user)
        bookings = Booking.objects.filter(vendor=vendor, is_paid=True)
        total    = sum(b.vendor_amount for b in bookings)
        pending  = Booking.objects.filter(vendor=vendor, status="CONFIRMED", is_paid=False).count()
        return Response({
            "total_earned":    total,
            "pending_bookings": pending,
            "total_bookings":  vendor.total_bookings,
            "rating":          str(vendor.rating),
            "total_reviews":   vendor.total_reviews,
        })