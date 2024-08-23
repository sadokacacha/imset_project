from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, ClassName, UploadedFile

class UserAdmin(BaseUserAdmin):
    fieldsets = (
        (None, {'fields': ('email', 'password')}),  
        ('Personal info', {'fields': ('first_name', 'last_name', 'date_of_birth', 'id_card_or_passport', 'phone', 'picture')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),  
        ('Important dates', {'fields': ('last_login', 'date_joined')}),  
        ('Role', {'fields': ('role', 'classes_name', 'class_name')}),  # Display classes for teacher/student
    )

    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'get_classes')  # Include classes
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('email',)

    def get_classes(self, obj):
        if obj.role == 'teacher':
            return ", ".join([class_obj.name for class_obj in obj.classes_name.all()])
        elif obj.role == 'student' and obj.class_name:
            return obj.class_name.name
        return '-'
    get_classes.short_description = 'Classes'

admin.site.register(User, UserAdmin)

@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = ('file', 'user', 'uploaded_at')
