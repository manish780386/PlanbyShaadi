from celery import shared_task


@shared_task(queue="low_priority")
def send_new_message_notification(message_id):
    """
    Notify the other party when a new chat message arrives.
    """
    from chat.models import ChatMessage
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        msg    = ChatMessage.objects.select_related("room__user", "room__vendor__user", "sender").get(id=message_id)
        room   = msg.room
        sender = msg.sender

        # Determine recipient
        if sender == room.user:
            recipient = room.vendor.user
        else:
            recipient = room.user

        if not recipient.email:
            return "Recipient has no email."

        send_mail(
            subject="New message on PlanMyShaadi",
            message=(
                f"Hi {recipient.full_name},\n\n"
                f"You have a new message from {sender.full_name}.\n\n"
                f"Login to reply:\nhttps://planmyshaadi.com/dashboard\n\n"
                f"Team PlanMyShaadi"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient.email],
            fail_silently=True,
        )
        return f"Message notification sent to {recipient.email}"
    except Exception as e:
        return f"Error: {str(e)}"


@shared_task(queue="low_priority")
def cleanup_old_ai_sessions():
    """
    Delete AI chat sessions older than 90 days with no user attached.
    Runs weekly via Celery Beat.
    """
    from chat.models import AIChatSession
    from django.utils import timezone
    from datetime import timedelta

    cutoff  = timezone.now() - timedelta(days=90)
    deleted, _ = AIChatSession.objects.filter(
        user__isnull=True,
        created_at__lt=cutoff,
    ).delete()
    return f"Deleted {deleted} old anonymous AI sessions."