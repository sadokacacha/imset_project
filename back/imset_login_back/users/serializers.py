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
    classes_name = serializers.PrimaryKeyRelatedField(
        queryset=ClassName.objects.all(), many=True, required=False
    )
    class_name = serializers.PrimaryKeyRelatedField(
        queryset=ClassName.objects.all(), required=False
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'first_name', 'last_name', 'password', 
            'date_of_birth', 'id_card_or_passport', 'phone', 'picture', 
            'classes_name', 'class_name'
        ]
        extra_kwargs = {'password': {'write_only': True}}

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
    name = serializers.SerializerMethodField()
    fileType = serializers.SerializerMethodField()
    classes = ClassNameSerializer(many=True)  # Serialize related classes

    class Meta:
        model = UploadedFile
        fields = ['id', 'name', 'fileType', 'uploaded_at', 'classes']

    def get_name(self, obj):
        return obj.file.name

    def get_fileType(self, obj):
        return obj.file.name.split('.')[-1]