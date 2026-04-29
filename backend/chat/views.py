import uuid
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import ChatRoom, ChatMessage, AIChatSession, AIChatMessage
from .serializers import (
    ChatRoomSerializer,
    ChatMessageSerializer,
    AIChatSessionSerializer,
    StartSessionSerializer,
    SendAIMessageSerializer,
)
from .ai_service import generate_event_plan, build_history_from_db
from users.permissions import IsVendorUser, IsRegularUser


# ─────────────────────────────────────────────────────────────────
# Vendor-User Real-time Chat
# ─────────────────────────────────────────────────────────────────

class ChatRoomListView(generics.ListAPIView):
    """User or Vendor: list all chat rooms they belong to."""
    serializer_class   = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "VENDOR":
            return ChatRoom.objects.filter(vendor__user=user).select_related("vendor", "user")
        return ChatRoom.objects.filter(user=user).select_related("vendor", "user")


class ChatMessageListView(generics.ListAPIView):
    """User or Vendor: list all messages in a chat room."""
    serializer_class   = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs["room_id"]
        user    = self.request.user

        if user.role == "VENDOR":
            room = get_object_or_404(ChatRoom, pk=room_id, vendor__user=user)
        else:
            room = get_object_or_404(ChatRoom, pk=room_id, user=user)

        # Mark all messages as read
        room.messages.exclude(sender=user).update(is_read=True)

        return room.messages.select_related("sender")


class SendChatMessageView(APIView):
    """User or Vendor: send a message inside a chat room."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, room_id):
        user = request.user

        if user.role == "VENDOR":
            room = get_object_or_404(ChatRoom, pk=room_id, vendor__user=user)
        else:
            room = get_object_or_404(ChatRoom, pk=room_id, user=user)

        message_text = request.data.get("message", "").strip()
        if not message_text:
            return Response(
                {"error": "Message cannot be empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        msg = ChatMessage.objects.create(
            room=room,
            sender=user,
            message=message_text,
        )

        return Response({
            "success": True,
            "message": ChatMessageSerializer(msg).data,
        }, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────
# AI Chatbot — Plan My Event
# ─────────────────────────────────────────────────────────────────

class StartAISessionView(APIView):
    """
    User: start a new AI planning session.
    Accepts event_type, city, budget, guest_count.
    Returns 3 plans (Budget / Standard / Premium) + real vendor suggestions.
    Saves session and messages in DB.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StartSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data

        try:
            result = generate_event_plan(
                event_type  = data["event_type"],
                city        = data["city"],
                budget      = data["budget"],
                guest_count = data["guest_count"],
                history     = [],
            )
        except Exception as e:
            return Response(
                {"error": f"AI service error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Save session in DB
        session = AIChatSession.objects.create(
            user        = request.user,
            session_key = str(uuid.uuid4()),
            event_type  = data["event_type"],
            city        = data["city"],
            budget      = data["budget"],
            guest_count = data["guest_count"],
        )

        # Save user message
        user_msg = (
            f"Plan a {data['event_type']} in {data['city']} "
            f"for {data['guest_count']} guests "
            f"with a total budget of Rs.{data['budget']:,}."
        )
        AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.USER,
            content=user_msg,
        )

        # Save assistant response
        AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.ASSISTANT,
            content=result["raw_text"],
        )

        return Response({
            "success":     True,
            "session_key": session.session_key,
            "summary":     result["summary"],
            "plans":       result["plans"],
            "vendors":     result["vendors"],
        }, status=status.HTTP_201_CREATED)


class SendAIMessageView(APIView):
    """
    User: send a follow-up message in an existing AI session.
    Full conversation history is sent to Claude each time.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SendAIMessageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_key = serializer.validated_data["session_key"]
        user_msg    = serializer.validated_data["message"]

        session = get_object_or_404(
            AIChatSession,
            session_key=session_key,
            user=request.user,
        )

        # Build history from DB
        history = build_history_from_db(session)

        try:
            from .ai_service import call_claude
            messages  = history + [{"role": "user", "content": user_msg}]
            raw_reply = call_claude(messages)
        except Exception as e:
            return Response(
                {"error": f"AI service error: {str(e)}"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # Save both messages
        AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.USER,
            content=user_msg,
        )
        AIChatMessage.objects.create(
            session=session,
            role=AIChatMessage.Role.ASSISTANT,
            content=raw_reply,
        )

        return Response({
            "success": True,
            "reply":   raw_reply,
        })


class AISessionHistoryView(generics.ListAPIView):
    """User: list all past AI chat sessions."""
    serializer_class   = AIChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AIChatSession.objects.filter(
            user=self.request.user
        ).prefetch_related("messages")


class AISessionDetailView(generics.RetrieveAPIView):
    """User: retrieve full message history of one AI session."""
    serializer_class   = AIChatSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return get_object_or_404(
            AIChatSession,
            session_key=self.kwargs["session_key"],
            user=self.request.user,
        )