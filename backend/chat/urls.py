from django.urls import path
from . import views

app_name = "chat"

urlpatterns = [
    # Vendor-User real-time chat
    path("rooms/",                              views.ChatRoomListView.as_view(),     name="room-list"),
    path("rooms/<int:room_id>/messages/",       views.ChatMessageListView.as_view(),  name="message-list"),
    path("rooms/<int:room_id>/send/",           views.SendChatMessageView.as_view(),  name="send-message"),

    # AI Chatbot
    path("ai/start/",                           views.StartAISessionView.as_view(),   name="ai-start"),
    path("ai/message/",                         views.SendAIMessageView.as_view(),    name="ai-message"),
    path("ai/history/",                         views.AISessionHistoryView.as_view(), name="ai-history"),
    path("ai/session/<str:session_key>/",       views.AISessionDetailView.as_view(),  name="ai-session-detail"),
]