from rest_framework import status
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated , IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import CustomTokenObtainPairSerializer , UserSerializer
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