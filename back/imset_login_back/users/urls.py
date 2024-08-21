from django.urls import path
from .views import CustomTokenObtainPairView, UserDetailView, AdminDashboardView , UserDeleteView , TeacherDashboardView, UserCreateView, TeacherFileUploadView , TeacherFileDownloadView , ClassListView,TeacherClassListView  , TeacherUploadedFilesView,StudentClassFilesView,StudentFileDownloadView

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/', UserDetailView.as_view(), name='user_detail'),
    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('api/admin/create-user/', UserCreateView.as_view(), name='create_user'),
    path('api/admin/delete-user/<int:user_id>/', UserDeleteView.as_view(), name='delete_user'),
    path('api/classes/', ClassListView.as_view(), name='class_list'),
    path('api/teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('api/teacher/upload-file/', TeacherFileUploadView.as_view(), name='teacher_file_upload'),
    path('api/teacher/uploaded-files/', TeacherUploadedFilesView.as_view(), name='teacher_uploaded_files'),  

    path('api/teacher/classes/', TeacherClassListView.as_view(), name='teacher_classes'),
    path('api/teacher/download-file/<int:file_id>/', TeacherFileDownloadView.as_view(), name='teacher_file_download'),


    path('api/student/class-files/', StudentClassFilesView.as_view(), name='student-class-files'),
    path('api/student/download-file/<int:file_id>/', StudentFileDownloadView.as_view(), name='student-download-file'),




]
