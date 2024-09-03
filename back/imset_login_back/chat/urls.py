from django.urls import path
from . import views
from .views import handle_conversation

urlpatterns = [
    
    path('', handle_conversation, name='handle_conversation'),
]