from django.urls import path

from .views import (
    CustomTokenObtainPairView, 
    UserDetailView, 
    AdminDashboardView, 
    UserDeleteView, 
    TeacherDashboardView, 
    UserCreateView, 
    TeacherFileUploadView, 
    TeacherFileDownloadView, 
    ClassListView, 
    TeacherClassListView, 
    TeacherUploadedFilesView, 

    UserDetailView,
    TeacherDeleteFileGroupView,
)

urlpatterns = [
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/user/', UserDetailView.as_view(), name='user_detail'),


    path('api/profile/', UserDetailView.as_view(), name='user-detail'),


    path('api/admin/dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('api/admin/create-user/', UserCreateView.as_view(), name='create_user'),
    path('api/admin/edit-user/<int:user_id>/', UserDetailView.as_view(), name='edit-user'),
    path('api/admin/delete-user/<int:user_id>/', UserDeleteView.as_view(), name='delete_user'),

    path('api/classes/', ClassListView.as_view(), name='class_list'),

    path('api/teacher/dashboard/', TeacherDashboardView.as_view(), name='teacher_dashboard'),
    path('api/teacher/upload-file-group/', TeacherFileUploadView.as_view(), name='upload-file-group'),
    path('api/teacher/uploaded-file-groups/', TeacherUploadedFilesView.as_view(), name='uploaded-file-groups'),
    path('api/teacher/delete-file-group/<str:group_id>/', TeacherDeleteFileGroupView.as_view(), name='delete-file-group'),
    path('api/teacher/classes/', TeacherClassListView.as_view(), name='teacher_classes'),
    path('api/teacher/download-file/<int:file_id>/', TeacherFileDownloadView.as_view(), name='teacher_file_download'),

 
    path('api/users/<int:user_id>/', UserDetailView.as_view(), name='user-detail'),  # For specific user
    path('api/users/me/', UserDetailView.as_view(), name='user-detail-self'),  # For current logged-in user

]
