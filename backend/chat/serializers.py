from rest_framework import serializers
from .models import ChatRoom, ChatMessage, AIChatSession, AIChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.full_name", read_only=True)
    sender_role = serializers.CharField(source="sender.role",      read_only=True)

    class Meta:
        model  = ChatMessage
        fields = ["id", "sender", "sender_name", "sender_role", "message", "is_read", "created_at"]
        read_only_fields = ["id", "sender", "sender_name", "sender_role", "is_read", "created_at"]


class ChatRoomSerializer(serializers.ModelSerializer):
    last_message   = serializers.SerializerMethodField()
    unread_count   = serializers.SerializerMethodField()
    vendor_name    = serializers.CharField(source="vendor.business_name", read_only=True)
    vendor_city    = serializers.CharField(source="vendor.city",          read_only=True)

    class Meta:
        model  = ChatRoom
        fields = [
            "id", "booking", "vendor", "vendor_name", "vendor_city",
            "last_message", "unread_count", "created_at",
        ]

    def get_last_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {"content": msg.message, "created_at": msg.created_at}
        return None

    def get_unread_count(self, obj):
        user = self.context["request"].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class AIChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AIChatMessage
        fields = ["id", "role", "content", "created_at"]
        read_only_fields = ["id", "created_at"]


class AIChatSessionSerializer(serializers.ModelSerializer):
    messages = AIChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model  = AIChatSession
        fields = [
            "id", "session_key", "event_type", "city",
            "budget", "guest_count", "messages",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "session_key", "created_at", "updated_at"]


class StartSessionSerializer(serializers.Serializer):
    """Called when user starts a new AI chat session."""
    event_type  = serializers.CharField(max_length=50)
    city        = serializers.CharField(max_length=100)
    budget      = serializers.IntegerField(min_value=10000)
    guest_count = serializers.IntegerField(min_value=1)


class SendAIMessageSerializer(serializers.Serializer):
    """Called when user sends a follow-up message in an AI session."""
    session_key = serializers.CharField(max_length=100)
    message     = serializers.CharField()