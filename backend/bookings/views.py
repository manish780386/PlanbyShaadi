from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings

from .models import Booking, Review
from .serializers import (
    BookingCreateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    ReviewSerializer,
)
from users.permissions import IsVendorUser, IsRegularUser

import razorpay


class BookingCreateView(APIView):
    """User: send booking request to a vendor."""
    permission_classes = [permissions.IsAuthenticated, IsRegularUser]

    def post(self, request):
        serializer = BookingCreateSerializer(
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        return Response({
            "success": True,
            "message": "Booking request sent to vendor.",
            "booking": BookingDetailSerializer(booking).data,
        }, status=status.HTTP_201_CREATED)


class UserBookingListView(generics.ListAPIView):
    """User: list own bookings."""
    serializer_class   = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Booking.objects
            .filter(user=self.request.user)
            .select_related("vendor")
        )


class BookingDetailView(generics.RetrieveAPIView):
    """User or Vendor: view booking detail."""
    serializer_class   = BookingDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "VENDOR":
            return Booking.objects.filter(vendor__user=user)
        return Booking.objects.filter(user=user)


class VendorLeadsView(generics.ListAPIView):
    """Vendor: list all incoming booking requests."""
    serializer_class   = BookingListSerializer
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def get_queryset(self):
        return (
            Booking.objects
            .filter(vendor__user=self.request.user)
            .select_related("user")
        )


class BookingAcceptView(APIView):
    """Vendor: accept a pending booking."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def post(self, request, pk):
        booking = get_object_or_404(
            Booking, pk=pk, vendor__user=request.user, status="PENDING"
        )
        booking.status = "CONFIRMED"
        booking.save()
        return Response({
            "success": True,
            "message": "Booking confirmed.",
            "status":  booking.status,
        })


class BookingDeclineView(APIView):
    """Vendor: decline a pending booking."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def post(self, request, pk):
        booking = get_object_or_404(
            Booking, pk=pk, vendor__user=request.user, status="PENDING"
        )
        booking.status = "REJECTED"
        booking.save()
        return Response({
            "success": True,
            "message": "Booking declined.",
            "status":  booking.status,
        })


class BookingCompleteView(APIView):
    """Vendor: mark a confirmed booking as completed."""
    permission_classes = [permissions.IsAuthenticated, IsVendorUser]

    def post(self, request, pk):
        booking = get_object_or_404(
            Booking, pk=pk, vendor__user=request.user, status="CONFIRMED"
        )
        booking.status = "COMPLETED"
        booking.save()
        booking.vendor.total_bookings += 1
        booking.vendor.save(update_fields=["total_bookings"])
        return Response({
            "success": True,
            "message": "Booking marked as completed.",
        })


class CreatePaymentOrderView(APIView):
    """User: create Razorpay order for a confirmed booking."""
    permission_classes = [permissions.IsAuthenticated, IsRegularUser]

    def post(self, request, pk):
        booking = get_object_or_404(
            Booking, pk=pk, user=request.user, status="CONFIRMED"
        )
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        order = client.order.create({
            "amount":   booking.total_amount * 100,
            "currency": "INR",
            "receipt":  f"booking_{booking.id}",
            "notes":    {"booking_id": str(booking.id)},
        })
        booking.razorpay_order_id = order["id"]
        booking.save(update_fields=["razorpay_order_id"])
        return Response({
            "success":      True,
            "order_id":     order["id"],
            "amount":       booking.total_amount * 100,
            "currency":     "INR",
            "razorpay_key": settings.RAZORPAY_KEY_ID,
        })


class VerifyPaymentView(APIView):
    """User: verify Razorpay payment signature after checkout."""
    permission_classes = [permissions.IsAuthenticated, IsRegularUser]

    def post(self, request, pk):
        booking = get_object_or_404(Booking, pk=pk, user=request.user)
        client  = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        try:
            client.utility.verify_payment_signature({
                "razorpay_order_id":   request.data["razorpay_order_id"],
                "razorpay_payment_id": request.data["razorpay_payment_id"],
                "razorpay_signature":  request.data["razorpay_signature"],
            })
            booking.razorpay_payment_id = request.data["razorpay_payment_id"]
            booking.is_paid = True
            booking.save(update_fields=["razorpay_payment_id", "is_paid"])
            return Response({
                "success": True,
                "message": "Payment verified successfully.",
            })
        except Exception:
            return Response({
                "success": False,
                "error":   "Payment verification failed.",
            }, status=status.HTTP_400_BAD_REQUEST)


class SubmitReviewView(APIView):
    """User: submit a review after booking is completed."""
    permission_classes = [permissions.IsAuthenticated, IsRegularUser]

    def post(self, request, pk):
        booking    = get_object_or_404(Booking, pk=pk, user=request.user)
        serializer = ReviewSerializer(
            data=request.data,
            context={"booking": booking},
        )
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response({
            "success": True,
            "review":  ReviewSerializer(review).data,
        }, status=status.HTTP_201_CREATED)