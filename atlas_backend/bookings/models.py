from django.db import models
from django.utils import timezone
from accounts.models import User

class WorkspaceType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    capacity = models.PositiveIntegerField(default=1)
    amenities = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Workspace(models.Model):
    name = models.CharField(max_length=100)
    workspace_type = models.ForeignKey(WorkspaceType, on_delete=models.CASCADE, related_name='workspaces')
    location = models.CharField(max_length=100)
    floor = models.CharField(max_length=50, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} - {self.location}"
    
    @property
    def is_available(self):
        """Check if workspace is currently available"""
        now = timezone.now()
        bookings = self.bookings.filter(
            start_time__lte=now,
            end_time__gte=now,
            status='confirmed'
        )
        return not bookings.exists()
    
    def is_available_between(self, start_time, end_time):
        """Check if workspace is available between given times"""
        bookings = self.bookings.filter(
            start_time__lt=end_time,
            end_time__gt=start_time,
            status='confirmed'
        )
        return not bookings.exists()

class Booking(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='bookings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    purpose = models.TextField(blank=True, null=True)
    attendees = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.workspace.name} - {self.start_time}"
    
    def save(self, *args, **kwargs):
        # Auto-confirm bookings if no conflicts
        if self.status == 'pending':
            if self.workspace.is_available_between(self.start_time, self.end_time):
                self.status = 'confirmed'
        
        super().save(*args, **kwargs)
