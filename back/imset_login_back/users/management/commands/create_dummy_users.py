from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Create dummy users'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        admin = User.objects.create_user(
            password='admin123', 
            role='admin',
            first_name='Admin',
            last_name='User',
            email='admin1@example.com'
        )

        teacher = User.objects.create_user(
            password='teacher123', 
            role='teacher',
            first_name='Teacher',
            last_name='User',
            email='teacher1@example.com'
        )

        student = User.objects.create_user(
            password='student123', 
            role='student',
            first_name='Student',
            last_name='User',
            email='student1@example.com'
        )

        self.stdout.write(self.style.SUCCESS('Successfully created dummy users'))
