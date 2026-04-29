from rest_framework import generics, permissions
from django.core.cache import cache
from .models import Event
from .serializers import EventSerializer


class EventListView(generics.ListAPIView):
    """
    Public: returns all active event types.
    Used by chatbot step 1 — user picks event type from this list.
    Response is cached in Redis for 1 hour.
    """
    serializer_class   = EventSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        cache_key = "events_list"
        cached    = cache.get(cache_key)
        if cached is not None:
            return cached
        events = Event.objects.filter(is_active=True)
        cache.set(cache_key, list(events), 3600)
        return events