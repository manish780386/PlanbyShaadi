from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Event
        fields = ["id", "name", "slug", "icon", "description", "is_active", "order"]