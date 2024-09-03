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
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'role',
            'first_name',
            'last_name',
            'picture',
            'password',          
            'classes_name',
            'class_name',
            'date_of_birth',  
            'id_card_or_passport',  
            'phone' 
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.picture:
            data['picture'] = instance.picture.url  
        if instance.role == 'teacher':
            data['classes_name'] = ClassNameSerializer(instance.classes_name.all(), many=True).data
        elif instance.role == 'student':
            data['class_name'] = ClassNameSerializer(instance.class_name).data if instance.class_name else None
        return data
    def create(self, validated_data):
        password = validated_data.pop('password', None)  # Extract password
        classes_name = validated_data.pop('classes_name', [])
        class_name = validated_data.pop('class_name', None)
        picture = validated_data.pop('picture', None)

        user = User.objects.create_user(**validated_data)  # This handles password if provided

        if password:
            user.set_password(password)  # Explicitly set password if provided
            user.save()

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
        password = validated_data.pop('password', None)  # Handle password update
        classes_name = validated_data.pop('classes_name', None)
        class_name = validated_data.pop('class_name', None)
        picture = validated_data.pop('picture', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        if picture:
            instance.picture = picture

        if instance.role == 'teacher' and classes_name is not None:
            instance.classes_name.set(classes_name)
        elif instance.role == 'student' and class_name is not None:
            instance.class_name = class_name

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