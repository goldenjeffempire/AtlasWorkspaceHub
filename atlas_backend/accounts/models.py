from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, PermissionsMixin

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('employee', 'Employee'),
        ('learner', 'Learner'),
        ('general', 'General'),
    )
    
    username = None
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='general')
    date_joined = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    
    # Profile fields
    phone = models.CharField(max_length=15, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    profile_image = models.URLField(blank=True, null=True)
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    push_notifications = models.BooleanField(default=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

class Role(models.Model):
    """Custom Role model for more dynamic role management"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # Permissions
    can_book_workspace = models.BooleanField(default=True)
    can_view_analytics = models.BooleanField(default=False)
    can_manage_users = models.BooleanField(default=False)
    can_manage_workspaces = models.BooleanField(default=False)
    can_manage_roles = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
