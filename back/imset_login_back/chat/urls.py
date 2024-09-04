from django.urls import path
from .views import handle_conversation

urlpatterns = [
    path('chatbot/', handle_conversation, name='chatbot_interaction'),
]
