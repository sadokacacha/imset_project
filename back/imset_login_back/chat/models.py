from django.db import models

# Create your models here.

class Conversation(models.Model):
    input = models.TextField()
    context = models.TextField()
    response = models.TextField()