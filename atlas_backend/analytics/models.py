from django.db import models
from django.utils import timezone
from datetime import timedelta
from bookings.models import Workspace, Booking
from accounts.models import User

class WorkspaceMetric(models.Model):
    """
    Store aggregated metrics about workspace utilization
    Used for faster reporting and analytics
    """
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='metrics')
    date = models.DateField()
    total_bookings = models.IntegerField(default=0)
    total_hours_booked = models.FloatField(default=0.0)
    occupancy_rate = models.FloatField(default=0.0)  # Percentage of available hours booked
    
    class Meta:
        unique_together = ('workspace', 'date')
    
    def __str__(self):
        return f"{self.workspace.name} - {self.date}"
    
    @classmethod
    def calculate_for_date(cls, workspace, date):
        """Calculate metrics for a given workspace and date"""
        start_of_day = timezone.make_aware(timezone.datetime.combine(date, timezone.datetime.min.time()))
        end_of_day = start_of_day + timedelta(days=1)
        
        # Get all confirmed bookings for the workspace on this date
        bookings = Booking.objects.filter(
            workspace=workspace,
            status='confirmed',
            start_time__gte=start_of_day,
            end_time__lt=end_of_day
        )
        
        # Calculate metrics
        total_bookings = bookings.count()
        
        total_hours = 0
        for booking in bookings:
            # Calculate duration in hours
            duration = (booking.end_time - booking.start_time).total_seconds() / 3600
            total_hours += duration
        
        # Assuming 12 working hours per day (8am to 8pm)
        working_hours = 12
        occupancy_rate = (total_hours / working_hours) * 100 if working_hours > 0 else 0
        
        # Cap at 100%
        occupancy_rate = min(occupancy_rate, 100)
        
        # Create or update metric
        metric, created = cls.objects.update_or_create(
            workspace=workspace,
            date=date,
            defaults={
                'total_bookings': total_bookings,
                'total_hours_booked': total_hours,
                'occupancy_rate': occupancy_rate
            }
        )
        
        return metric

class UserAnalytic(models.Model):
    """
    Store aggregated metrics about user booking patterns
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    month = models.DateField()  # First day of the month
    total_bookings = models.IntegerField(default=0)
    total_hours = models.FloatField(default=0.0)
    most_booked_workspace = models.ForeignKey(
        Workspace, 
        on_delete=models.SET_NULL, 
        related_name='user_favorites',
        null=True, 
        blank=True
    )
    
    class Meta:
        unique_together = ('user', 'month')
    
    def __str__(self):
        return f"{self.user.email} - {self.month}"
