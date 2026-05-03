from celery import shared_task
from django.utils import timezone
from datetime import timedelta


@shared_task(queue="default")
def cleanup_expired_tokens():
    """
    Remove expired blacklisted JWT tokens from DB.
    Runs daily via Celery Beat.
    """
    try:
        from rest_framework_simplejwt.token_blacklist.models import (
            OutstandingToken, BlacklistedToken,
        )
        cutoff = timezone.now() - timedelta(days=7)
        deleted, _ = BlacklistedToken.objects.filter(
            token__created_at__lt=cutoff
        ).delete()
        return f"Deleted {deleted} expired tokens."
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task(queue="default")
def send_welcome_email(user_id):
    """Send welcome email to newly registered user."""
    from django.contrib.auth import get_user_model
    from django.core.mail import send_mail
    from django.conf import settings

    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
        send_mail(
            subject="Welcome to PlanMyShaadi!",
            message=f"Hi {user.full_name},\n\nWelcome to PlanMyShaadi! Start planning your dream event today.\n\nTeam PlanMyShaadi",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email] if user.email else [],
            fail_silently=True,
        )
        return f"Welcome email sent to {user.email}"
    except Exception as e:
        return f"Error: {str(e)}"