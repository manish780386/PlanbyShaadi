from celery import shared_task


@shared_task(queue="default")
def send_new_lead_notification(booking_id):
    """
    Notify vendor via email when a new booking request arrives.
    """
    from bookings.models import Booking
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        booking = Booking.objects.select_related("vendor__user", "user").get(id=booking_id)
        vendor_email = booking.vendor.user.email

        if not vendor_email:
            return "Vendor has no email."

        send_mail(
            subject=f"New Booking Request — {booking.event_type}",
            message=(
                f"Hi {booking.vendor.business_name},\n\n"
                f"You have a new booking request for a {booking.event_type} "
                f"on {booking.event_date} with {booking.guest_count} guests.\n\n"
                f"Login to your dashboard to accept or decline:\n"
                f"https://planmyshaadi.com/vendor/dashboard\n\n"
                f"Team PlanMyShaadi"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[vendor_email],
            fail_silently=True,
        )
        return f"Lead notification sent to {vendor_email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task(queue="default")
def update_vendor_stats(vendor_id):
    """Recalculate and update vendor rating and total bookings."""
    from vendors.models import VendorProfile
    from bookings.models import Booking, Review
    from django.db.models import Avg

    try:
        vendor = VendorProfile.objects.get(id=vendor_id)
        reviews = Review.objects.filter(vendor=vendor)
        if reviews.exists():
            avg = reviews.aggregate(avg=Avg("rating"))["avg"]
            vendor.rating        = round(avg, 2)
            vendor.total_reviews = reviews.count()
        vendor.total_bookings = Booking.objects.filter(
            vendor=vendor, status="COMPLETED"
        ).count()
        vendor.save(update_fields=["rating", "total_reviews", "total_bookings"])
        return f"Updated stats for {vendor.business_name}"
    except Exception as e:
        return f"Error: {str(e)}"