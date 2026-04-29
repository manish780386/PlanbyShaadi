from django.contrib import admin
from .models import ChatRoom, ChatMessage, AIChatSession, AIChatMessage


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display  = ["id", "user", "vendor", "booking", "created_at"]
    search_fields = ["user__email", "vendor__business_name"]
    readonly_fields = ["created_at"]


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = ["room", "sender", "message", "is_read", "created_at"]
    list_filter   = ["is_read"]
    search_fields = ["sender__email", "message"]
    readonly_fields = ["created_at"]


@admin.register(AIChatSession)
class AIChatSessionAdmin(admin.ModelAdmin):
    list_display  = ["session_key", "user", "event_type", "city", "budget", "guest_count", "created_at"]
    list_filter   = ["event_type", "city"]
    search_fields = ["user__email", "session_key", "event_type", "city"]
    readonly_fields = ["session_key", "created_at", "updated_at"]


@admin.register(AIChatMessage)
class AIChatMessageAdmin(admin.ModelAdmin):
    list_display  = ["session", "role", "created_at"]
    list_filter   = ["role"]
    readonly_fields = ["created_at"]