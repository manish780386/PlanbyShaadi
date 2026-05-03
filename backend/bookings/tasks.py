from celery import shared_task


@shared_task(queue="high_priority")
def send_booking_confirmation(booking_id):
    """Send booking confirmation email to user after vendor accepts."""
    from bookings.models import Booking
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        booking = Booking.objects.select_related("user", "vendor").get(id=booking_id)
        user_email = booking.user.email

        if not user_email:
            return "User has no email."

        send_mail(
            subject=f"Booking Confirmed — {booking.vendor.business_name}",
            message=(
                f"Hi {booking.user.full_name},\n\n"
                f"Great news! Your booking with {booking.vendor.business_name} "
                f"for {booking.event_type} on {booking.event_date} has been confirmed.\n\n"
                f"Amount: Rs.{booking.total_amount:,}\n\n"
                f"Login to complete payment:\n"
                f"https://planmyshaadi.com/dashboard\n\n"
                f"Team PlanMyShaadi"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=True,
        )
        return f"Confirmation sent to {user_email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task(queue="high_priority")
def send_payment_receipt(booking_id):
    """Send payment receipt after successful payment."""
    from bookings.models import Booking
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        booking = Booking.objects.select_related("user", "vendor").get(id=booking_id)
        user_email = booking.user.email

        if not user_email:
            return "User has no email."

        send_mail(
            subject=f"Payment Received — PlanMyShaadi",
            message=(
                f"Hi {booking.user.full_name},\n\n"
                f"Your payment of Rs.{booking.total_amount:,} for "
                f"{booking.vendor.business_name} has been received.\n\n"
                f"Booking ID: #{booking.id}\n"
                f"Event: {booking.event_type} on {booking.event_date}\n\n"
                f"Team PlanMyShaadi"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user_email],
            fail_silently=True,
        )
        return f"Receipt sent to {user_email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task(queue="default")
def send_booking_reminders():
    """
    Send reminders for bookings happening in next 7 days.
    Runs daily via Celery Beat.
    """
    from bookings.models import Booking
    from django.core.mail import send_mail
    from django.conf import settings
    from django.utils import timezone
    from datetime import timedelta

    upcoming = Booking.objects.filter(
        status="CONFIRMED",
        event_date=timezone.now().date() + timedelta(days=7),
    ).select_related("user", "vendor")

    count = 0
    for booking in upcoming:
        if booking.user.email:
            send_mail(
                subject=f"Reminder — Your event is in 7 days!",
                message=(
                    f"Hi {booking.user.full_name},\n\n"
                    f"This is a reminder that your {booking.event_type} "
                    f"with {booking.vendor.business_name} is on {booking.event_date}.\n\n"
                    f"Team PlanMyShaadi"
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[booking.user.email],
                fail_silently=True,
            )
            count += 1

    return f"Sent {count} booking reminders."