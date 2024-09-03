from django.urls import path
from .views import CustomTokenObtainPairView, handle_conversation

urlpatterns = [
<<<<<<< HEAD
    # JWT token endpoint
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # Chatbot interaction endpoint
    path('chatbot/', handle_conversation, name='chatbot_interaction'),
]
=======
    
    path('', handle_conversation, name='handle_conversation'),
]
>>>>>>> ce291b2d906ead87d6e3ec88148b5c1a83fd82ac
