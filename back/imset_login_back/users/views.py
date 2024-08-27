
from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer , UserSerializer  , UploadedFileSerializer , ClassNameSerializer
from .models import UploadedFile , ClassName
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import HttpResponse, Http404
from django.utils.encoding import smart_str
from django.db import IntegrityError
from mimetypes import guess_type
from rest_framework_simplejwt.views import TokenRefreshView

import logging

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
class CustomTokenRefreshView(TokenRefreshView):
    pass

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id=None, *args, **kwargs):
        """
        Retrieve user details.
        """
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user

        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request, user_id=None, *args, **kwargs):
        """
        Update user details.
        """
        if user_id:
            try:
                user = User.objects.get(id=user_id)
            except User.DoesNotExist:
                return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        else:
            user = request.user

        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        admins = User.objects.filter(role='admin')
        teachers = User.objects.filter(role='teacher').prefetch_related('classes_name')
        students = User.objects.filter(role='student').select_related('class_name')

        admins_serializer = UserSerializer(admins, many=True)
        teachers_serializer = UserSerializer(teachers, many=True)
        students_serializer = UserSerializer(students, many=True)

        return Response({
            'admins': admins_serializer.data,
            'teachers': teachers_serializer.data,
            'students': students_serializer.data,
        })
    
class UserCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        try:
            serializer = UserSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response({'errors': serializer.errors}, status=400)
        except IntegrityError as e:
            return Response({'error': 'An error occurred while creating the user.'}, status=500)


class UserDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id, *args, **kwargs):
        if request.user.role != 'admin':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        
        try:
            user = User.objects.get(id=user_id)
            user.delete()
            return Response({'message': 'User deleted successfully'}, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)








class ClassListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        classes = ClassName.objects.all()
        serializer = ClassNameSerializer(classes, many=True)
        return Response(serializer.data)






class TeacherDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        return Response({'message': 'Welcome, teacher!'})
    


class TeacherClassListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        classes = request.user.classes_name.all()  # Get classes assigned to the teacher
        print("Fetched classes:", classes)  # Debugging line
        serializer = ClassNameSerializer(classes, many=True)
        return Response(serializer.data)


class TeacherFileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        
        file = request.FILES.get('file')
        custom_name = request.data.get('name')
        class_ids = request.data.getlist('class_ids')  # Retrieve multiple class IDs

        if not file:
            return Response({'error': 'No file provided'}, status=400)

        if not class_ids:
            return Response({'error': 'No classes selected'}, status=400)

        uploaded_file = UploadedFile(
            user=request.user, 
            file=file,
            name=custom_name if custom_name else file.name  # Use custom name if provided
        )
        uploaded_file.save()

        # Assign the file to the selected classes
        for class_id in class_ids:
            try:
                class_instance = ClassName.objects.get(id=class_id, teachers=request.user)
                uploaded_file.classes.add(class_instance)
            except ClassName.DoesNotExist:
                return Response({'error': f'Invalid class with ID {class_id} or you do not have access to this class'}, status=400)

        uploaded_file.save()
        return Response({'message': 'File uploaded successfully'}, status=status.HTTP_201_CREATED)




class TeacherUploadedFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        files = UploadedFile.objects.filter(user=request.user).prefetch_related('classes')
        serializer = UploadedFileSerializer(files, many=True)
        return Response(serializer.data)


class TeacherFileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        if request.user.role != 'teacher':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        try:
            uploaded_file = UploadedFile.objects.get(id=file_id, user=request.user)
            file_path = uploaded_file.file.path

            file_type, _ = guess_type(file_path)
            
            response = HttpResponse(uploaded_file.file.read(), content_type=file_type or 'application/octet-stream')

            file_name = uploaded_file.name or uploaded_file.file.name
            if '.' not in file_name:
                file_name += f".{uploaded_file.file.name.split('.')[-1]}"

            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=404)




class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)
        return Response({'message': 'Welcome, student!'})
    


logger = logging.getLogger(__name__)

User = get_user_model()



class StudentClassFilesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        student_class = request.user.class_name
        if not student_class:
            return Response({'error': 'You are not assigned to any class.'}, status=400)

        files = UploadedFile.objects.filter(classes=student_class)
        serializer = UploadedFileSerializer(files, many=True)
        return Response(serializer.data)
    
class StudentFileDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, file_id, *args, **kwargs):
        if request.user.role != 'student':
            return Response({'error': 'You do not have permission to access this resource.'}, status=403)

        try:
            uploaded_file = UploadedFile.objects.get(id=file_id)
            if not uploaded_file.classes.filter(id=request.user.class_name.id).exists():
                return Response({'error': 'You do not have permission to access this file.'}, status=403)

            file_path = uploaded_file.file.path
            file_type, _ = guess_type(file_path)
            
            response = HttpResponse(uploaded_file.file.read(), content_type=file_type or 'application/octet-stream')

            file_name = uploaded_file.name or uploaded_file.file.name
            if '.' not in file_name:
                file_name += f".{uploaded_file.file.name.split('.')[-1]}"

            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            return response
        except UploadedFile.DoesNotExist:
            return Response({'error': 'File not found'}, status=404)
