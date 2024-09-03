from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import UploadedFile , ClassName 

import os

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        credentials = {
            'email': attrs.get('email'),
            'password': attrs.get('password')
        }
        user = authenticate(**credentials)

        if user:
            data = super().validate(attrs)
            data.update({
                'email': user.email,
                'role': user.role,
            })
            return data
        else:
            raise serializers.ValidationError('No active account found with the given credentials')

class ClassNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassName
        fields = ['id', 'name']



class UserSerializer(serializers.ModelSerializer):
    picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'role', 'first_name', 'last_name', 'picture']


    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.picture:
            data['picture'] = instance.picture.url  
        if instance.role == 'teacher':
            data['classes_name'] = [cls.name for cls in instance.classes_name.all()]
        elif instance.role == 'student':
            data['class_name'] = instance.class_name.name if instance.class_name else None
        return data

    def create(self, validated_data):
        classes_name = validated_data.pop('classes_name', [])
        class_name = validated_data.pop('class_name', None)
        picture = validated_data.pop('picture', None)

        user = User.objects.create_user(**validated_data)

        if picture:
            user.picture = picture
            user.save()

        if user.role == 'teacher':
            user.classes_name.set(classes_name)
        elif user.role == 'student' and class_name:
            user.class_name = class_name
        user.save()

        return user
    
    def update(self, instance, validated_data):
        # Handle updating fields normally
        for attr, value in validated_data.items():
            if attr == 'picture' and value:
                instance.picture = value
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance
        
class UploadedFileSerializer(serializers.ModelSerializer):
    file_name = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = ['id', 'file', 'file_name', 'file_extension']

    def get_file_name(self, obj):
        return obj.file.name.split('/')[-1]  # Extract the file name from the path

    def get_file_extension(self, obj):
        return obj.file.name.split('.')[-1] if '.' in obj.file.name else ''  # Extract the file extension
