import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import ChatRoom, ChatMessage

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time vendor-user chat.
    Each chat room gets its own group: chat_room_{room_id}
    """

    async def connect(self):
        self.room_id    = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group = f"chat_room_{self.room_id}"
        self.user       = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        # Verify the user belongs to this room
        has_access = await self.check_access()
        if not has_access:
            await self.close()
            return

        await self.channel_layer.group_add(
            self.room_group,
            self.channel_name,
        )
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group,
            self.channel_name,
        )

    async def receive(self, text_data):
        try:
            data    = json.loads(text_data)
            message = data.get("message", "").strip()
        except (json.JSONDecodeError, KeyError):
            return

        if not message:
            return

        # Save to database
        saved = await self.save_message(message)

        # Broadcast to room group
        await self.channel_layer.group_send(
            self.room_group,
            {
                "type":        "chat_message",
                "message":     message,
                "sender_id":   self.user.id,
                "sender_name": self.user.full_name,
                "sender_role": self.user.role,
                "message_id":  saved.id,
                "created_at":  str(saved.created_at),
            },
        )

    async def chat_message(self, event):
        """Handler: sends message to WebSocket client."""
        await self.send(text_data=json.dumps({
            "message":     event["message"],
            "sender_id":   event["sender_id"],
            "sender_name": event["sender_name"],
            "sender_role": event["sender_role"],
            "message_id":  event["message_id"],
            "created_at":  event["created_at"],
        }))

    @database_sync_to_async
    def check_access(self):
        user = self.user
        try:
            if user.role == "VENDOR":
                ChatRoom.objects.get(pk=self.room_id, vendor__user=user)
            else:
                ChatRoom.objects.get(pk=self.room_id, user=user)
            return True
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, message):
        room = ChatRoom.objects.get(pk=self.room_id)
        return ChatMessage.objects.create(
            room=room,
            sender=self.user,
            message=message,
        )