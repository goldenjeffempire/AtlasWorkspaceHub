from django.db import models
from accounts.models import User


class WorkspaceType(models.Model):
    """
    Represents a type of workspace (e.g., meeting room, desk, collaboration space)
    """
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    capacity = models.PositiveIntegerField(default=1)
    amenities = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name


class Workspace(models.Model):
    """
    Represents a specific workspace that can be booked
    """
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    floor = models.CharField(max_length=50, null=True, blank=True)
    workspace_type = models.ForeignKey(WorkspaceType, on_delete=models.CASCADE, related_name='workspaces')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.location})"


class Booking(models.Model):
    """
    Represents a booking of a workspace by a user
    """
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='bookings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    purpose = models.TextField(null=True, blank=True)
    attendees = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.workspace.name} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"
    
    def duration_hours(self):
        """Calculate the booking duration in hours"""
        delta = self.end_time - self.start_time
        return delta.total_seconds() / 3600