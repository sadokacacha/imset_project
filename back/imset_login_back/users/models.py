from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)


class ClassName(models.Model):
    id = models.AutoField(primary_key=True)  # Add this line
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name
    
class User(AbstractUser):
    ROLES = (
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    username = None 
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLES)
    date_of_birth = models.DateField(null=True, blank=True)
    id_card_or_passport = models.CharField(max_length=100, null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    classes_name = models.ManyToManyField(ClassName, blank=True, related_name='teachers')
    class_name = models.ForeignKey(ClassName, null=True, blank=True, related_name='students', on_delete=models.SET_NULL)
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']  # Make first_name and last_name required

    objects = UserManager()

    def __str__(self):
        return self.email

class UploadedFile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/')
    name = models.CharField(max_length=255, blank=True, null=True)  # Custom name field
    classes = models.ManyToManyField(ClassName)  # Allow multiple classes
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name or self.file.name} uploaded by {self.user}"