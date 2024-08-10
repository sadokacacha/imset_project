from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer , UserSerializer  , UploadedFileSerializer
from .models import UploadedFile
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse, Http404
from django.utils.encoding import smart_str

import logging

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        return Response({
            'username': user.username,
            'role': user.role,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })
    
User = get_user_model()

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        teachers = User.objects.filter(role='teacher').values('id', 'username', 'email')
        students = User.objects.filter(role='student').values('id', 'username', 'email')
        return Response({'teachers': list(teachers), 'students': list(students)})


class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        return Response({'message': 'Welcome, teacher!'})

class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        return Response({'message': 'Welcome, student!'})
    


logger = logging.getLogger(__name__)

User = get_user_model()

class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        logger.debug(f"Request data: {request.data}")
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=400)
    

class TeacherFileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)

        uploaded_file = UploadedFile(
            user=request.user, 
            file=file
        )
        uploaded_file.save()
        return Response({'message': 'File uploaded successfully'}, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        
        uploaded_files = UploadedFile.objects.filter(user=request.user)
        serializer = UploadedFileSerializer(uploaded_files, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class TeacherFileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        try:
            uploaded_file = UploadedFile.objects.get(id=file_id, user=request.user)
            response = HttpResponse(uploaded_file.file.read(), content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename={uploaded_file.file.name}'
            return response
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=404)