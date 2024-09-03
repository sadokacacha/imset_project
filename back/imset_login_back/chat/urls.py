from django.urls import path
from .views import CustomTokenObtainPairView, handle_conversation

urlpatterns = [
    # JWT token endpoint
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Chatbot interaction endpoint
    path('chatbot/', handle_conversation, name='chatbot_interaction'),
]
