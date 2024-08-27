from rest_framework import serializers
from .models import Conversation

class ChatSerializer(serializers.Serializer):
    response = serializers.CharField()
    context = serializers.CharField()
