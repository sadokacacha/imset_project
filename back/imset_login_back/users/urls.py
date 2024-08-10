from django.urls import path
from .views import CustomTokenObtainPairView, UserDetailView, AdminDashboardView, TeacherDashboardView, UserCreateView, TeacherFileUploadView , TeacherFileDownloadView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/', UserDetailView.as_view(), name='user_detail'),
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('api/admin/create-user/', UserCreateView.as_view(), name='create_user'),
    path('api/teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('api/teacher/upload-file/', TeacherFileUploadView.as_view(), name='teacher_file_upload'),
    path('api/teacher/download-file/<int:file_id>/', TeacherFileDownloadView.as_view(), name='teacher_file_download'),
]
