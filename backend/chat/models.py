from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    """
    Real-time chat room between a user and vendor.
    Created automatically when a booking request is sent.
    Phone/email of vendor is never exposed — all contact via this room only.
    """
    booking    = models.OneToOneField(
        "bookings.Booking",
        on_delete=models.CASCADE,
        related_name="chat_room",
    )
    user       = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="chat_rooms_as_user",
    )
    vendor     = models.ForeignKey(
        "vendors.VendorProfile",
        on_delete=models.CASCADE,
        related_name="chat_rooms",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_rooms"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Room #{self.id}: {self.user} <-> {self.vendor.business_name}"


class ChatMessage(models.Model):
    """
    A single message inside a ChatRoom.
    Sender can be either the user or the vendor.
    """
    room       = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender     = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "chat_messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"Msg from {self.sender} in Room #{self.room_id}"


class AIChatSession(models.Model):
    """
    One AI chatbot planning session per user per event.
    Saves the event context: type, city, budget, guest count.
    Admin can view all sessions.
    """
    user        = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ai_sessions",
    )
    session_key = models.CharField(max_length=100, unique=True)
    event_type  = models.CharField(max_length=50,  blank=True)
    city        = models.CharField(max_length=100, blank=True)
    budget      = models.PositiveIntegerField(null=True, blank=True)
    guest_count = models.PositiveIntegerField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "ai_chat_sessions"
        ordering = ["-created_at"]

    def __str__(self):
        return f"AI Session {self.session_key[:8]} — {self.event_type} in {self.city}"


class AIChatMessage(models.Model):
    """
    Individual message inside an AI chat session.
    Role is either 'user' or 'assistant' (Claude).
    Full history is sent to Claude on each new message.
    """
    class Role(models.TextChoices):
        USER      = "user",      "User"
        ASSISTANT = "assistant", "Assistant"

    session    = models.ForeignKey(
        AIChatSession,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role       = models.CharField(max_length=10, choices=Role.choices)
    content    = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "ai_chat_messages"
        ordering = ["created_at"]

    def __str__(self):
        return f"[{self.role}] Session #{self.session_id} — {self.content[:50]}"