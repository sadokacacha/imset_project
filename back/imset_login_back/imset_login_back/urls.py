from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('users.urls')), 
<<<<<<< HEAD
    path('chat/', include('chat.urls')), 
=======
    path('chatbot/', include('chat.urls')),
>>>>>>> ce291b2d906ead87d6e3ec88148b5c1a83fd82ac
]
