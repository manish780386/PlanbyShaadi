from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Avg
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404

from users.permissions import IsAdminUser
from users.serializers import UserProfileSerializer
from vendors.models import VendorProfile
from vendors.serializers import VendorDetailSerializer
from bookings.models import Booking, Review
from bookings.serializers import BookingDetailSerializer
from chat.models import AIChatSession
from chat.serializers import AIChatSessionSerializer

User = get_user_model()


class AdminDashboardView(APIView):
    """
    Admin: full platform analytics.
    Returns users, vendors, bookings, revenue stats.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        now        = timezone.now()
        last_30    = now - timedelta(days=30)
        last_7     = now - timedelta(days=7)

        total_users    = User.objects.filter(role="USER").count()
        total_vendors  = VendorProfile.objects.count()
        active_vendors = VendorProfile.objects.filter(is_active=True, is_verified=True).count()
        total_bookings = Booking.objects.count()
        paid_bookings  = Booking.objects.filter(is_paid=True).count()

        total_revenue = (
            Booking.objects
            .filter(is_paid=True)
            .aggregate(total=Sum("platform_fee"))["total"] or 0
        )

        new_users_30d = User.objects.filter(
            role="USER", date_joined__gte=last_30
        ).count()

        new_bookings_7d = Booking.objects.filter(
            created_at__gte=last_7
        ).count()

        ai_sessions_total = AIChatSession.objects.count()

        top_cities = (
            VendorProfile.objects
            .values("city")
            .annotate(count=Count("id"))
            .order_by("-count")[:5]
        )

        top_categories = (
            VendorProfile.objects
            .values("category")
            .annotate(count=Count("id"))
            .order_by("-count")[:6]
        )

        booking_by_status = (
            Booking.objects
            .values("status")
            .annotate(count=Count("id"))
        )

        return Response({
            "overview": {
                "total_users":        total_users,
                "total_vendors":      total_vendors,
                "active_vendors":     active_vendors,
                "total_bookings":     total_bookings,
                "paid_bookings":      paid_bookings,
                "total_revenue":      total_revenue,
                "new_users_30d":      new_users_30d,
                "new_bookings_7d":    new_bookings_7d,
                "ai_sessions_total":  ai_sessions_total,
            },
            "top_cities":        list(top_cities),
            "top_categories":    list(top_categories),
            "booking_by_status": list(booking_by_status),
        })


class AdminUserListView(generics.ListAPIView):
    """Admin: list all users with search."""
    serializer_class   = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    search_fields      = ["email", "phone", "full_name", "city"]
    ordering_fields    = ["date_joined", "full_name"]
    ordering           = ["-date_joined"]

    def get_queryset(self):
        role = self.request.query_params.get("role", None)
        qs   = User.objects.all()
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: view, update or delete a user."""
    serializer_class   = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    queryset           = User.objects.all()


class AdminVendorListView(generics.ListAPIView):
    """Admin: list all vendors."""
    serializer_class   = VendorDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    search_fields      = ["business_name", "city", "user__email"]
    ordering_fields    = ["rating", "created_at", "total_bookings"]
    ordering           = ["-created_at"]

    def get_queryset(self):
        qs          = VendorProfile.objects.select_related("user")
        is_verified = self.request.query_params.get("is_verified", None)
        is_active   = self.request.query_params.get("is_active",   None)
        category    = self.request.query_params.get("category",    None)

        if is_verified is not None:
            qs = qs.filter(is_verified=is_verified.lower() == "true")
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() == "true")
        if category:
            qs = qs.filter(category=category)

        return qs


class AdminVendorVerifyView(APIView):
    """Admin: verify a vendor profile."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        vendor = get_object_or_404(VendorProfile, pk=pk)
        vendor.is_verified = True
        vendor.save(update_fields=["is_verified"])
        return Response({
            "success": True,
            "message": f"{vendor.business_name} has been verified.",
        })


class AdminVendorDeactivateView(APIView):
    """Admin: deactivate a vendor."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        vendor = get_object_or_404(VendorProfile, pk=pk)
        vendor.is_active = False
        vendor.save(update_fields=["is_active"])
        return Response({
            "success": True,
            "message": f"{vendor.business_name} has been deactivated.",
        })


class AdminVendorDeleteView(APIView):
    """Admin: permanently delete a vendor and their user account."""
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def delete(self, request, pk):
        vendor = get_object_or_404(VendorProfile, pk=pk)
        name   = vendor.business_name
        vendor.user.delete()
        return Response({
            "success": True,
            "message": f"{name} has been permanently deleted.",
        }, status=status.HTTP_204_NO_CONTENT)


class AdminBookingListView(generics.ListAPIView):
    """Admin: list all bookings across the platform."""
    serializer_class   = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    ordering_fields    = ["created_at", "event_date", "total_amount"]
    ordering           = ["-created_at"]

    def get_queryset(self):
        qs     = Booking.objects.select_related("user", "vendor")
        status = self.request.query_params.get("status", None)
        if status:
            qs = qs.filter(status=status)
        return qs


class AdminAISessionListView(generics.ListAPIView):
    """Admin: list all AI chatbot sessions across all users."""
    serializer_class   = AIChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]
    search_fields      = ["user__email", "event_type", "city"]
    ordering           = ["-created_at"]

    def get_queryset(self):
        return AIChatSession.objects.select_related("user").prefetch_related("messages")


class AdminAISessionDetailView(generics.RetrieveAPIView):
    """Admin: view full message history of any AI session."""
    serializer_class   = AIChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get_object(self):
        return get_object_or_404(
            AIChatSession,
            session_key=self.kwargs["session_key"],
        )