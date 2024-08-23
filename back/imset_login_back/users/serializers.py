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
        
class UploadedFileSerializer(serializers.ModelSerializer):
    fileType = serializers.SerializerMethodField()
    classes = ClassNameSerializer(many=True)
    teacher = serializers.SerializerMethodField()

    class Meta:
        model = UploadedFile
        fields = ['id', 'name', 'fileType', 'uploaded_at', 'classes', 'teacher']

    def get_fileType(self, obj):
        return obj.file.name.split('.')[-1]

    def get_teacher(self, obj):
        return {
            "first_name": obj.user.first_name,
            "last_name": obj.user.last_name
        }
