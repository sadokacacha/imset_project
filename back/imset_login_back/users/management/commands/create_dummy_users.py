from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import ClassName  # Import the ClassName model

class Command(BaseCommand):
    help = 'Create dummy users'

    def handle(self, *args, **kwargs):
        User = get_user_model()

        # Create some classes
        class1 = ClassName.objects.create(name='TSIG1')
        class2 = ClassName.objects.create(name='TSIG2')
        class3 = ClassName.objects.create(name='DI1')
        class4 = ClassName.objects.create(name='TSIG3')  # Additional classes
        class5 = ClassName.objects.create(name='DI2')

        # Create an admin user
        admin = User.objects.create_user(
            password='admin123',
            role='admin',
            first_name='Admin',
            last_name='User',
            email='admin1@example.com',
            date_of_birth='1980-01-01',
            phone='1234567890',
            id_card_or_passport='ID001'
        )

        # Create teachers and assign two classes_name to each
        teacher1 = User.objects.create_user(
            password='teacher123',
            role='teacher',
            first_name='Teacher1',
            last_name='User',
            email='teacher1@example.com',
            date_of_birth='1985-05-15',
            phone='1234567891',
            id_card_or_passport='ID002'
        )
        teacher1.classes_name.set([class1, class2])

        teacher2 = User.objects.create_user(
            password='teacher123',
            role='teacher',
            first_name='Teacher2',
            last_name='User',
            email='teacher2@example.com',
            date_of_birth='1986-06-20',
            phone='1234567892',
            id_card_or_passport='ID003'
        )
        teacher2.classes_name.set([class2, class3])

        teacher3 = User.objects.create_user(
            password='teacher123',
            role='teacher',
            first_name='Teacher3',
            last_name='User',
            email='teacher3@example.com',
            date_of_birth='1987-07-25',
            phone='1234567893',
            id_card_or_passport='ID004'
        )
        teacher3.classes_name.set([class3, class4])

        # Create students and assign each to a different class_name
        student1 = User.objects.create_user(
            password='student123',
            role='student',
            first_name='Student1',
            last_name='User',
            email='student1@example.com',
            date_of_birth='2000-08-30',
            phone='1234567894',
            id_card_or_passport='ID005',
            class_name=class1
        )

        student2 = User.objects.create_user(
            password='student123',
            role='student',
            first_name='Student2',
            last_name='User',
            email='student2@example.com',
            date_of_birth='2001-09-05',
            phone='1234567895',
            id_card_or_passport='ID006',
            class_name=class2
        )

        student3 = User.objects.create_user(
            password='student123',
            role='student',
            first_name='Student3',
            last_name='User',
            email='student3@example.com',
            date_of_birth='2002-10-10',
            phone='1234567896',
            id_card_or_passport='ID007',
            class_name=class3
        )

        self.stdout.write(self.style.SUCCESS('Successfully created dummy users with classes, birthdates, and IDs'))
