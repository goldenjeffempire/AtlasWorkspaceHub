from django.db import models
from accounts.models import User
from bookings.models import Workspace, Booking
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Count, Sum, F, ExpressionWrapper, fields
from django.db.models.functions import ExtractHour


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
        # Get the bookings for this workspace on this date
        start_of_day = datetime.combine(date, datetime.min.time()).replace(tzinfo=timezone.get_current_timezone())
        end_of_day = (start_of_day + timedelta(days=1)) - timedelta(seconds=1)
        
        bookings = Booking.objects.filter(
            workspace=workspace,
            start_time__gte=start_of_day,
            end_time__lte=end_of_day,
            status__in=['confirmed', 'completed']
        )
        
        total_bookings = bookings.count()
        
        # Calculate total hours booked
        total_hours = 0
        for booking in bookings:
            # Calculate the overlap of the booking with the target date
            booking_start = max(booking.start_time, start_of_day)
            booking_end = min(booking.end_time, end_of_day)
            hours = (booking_end - booking_start).total_seconds() / 3600
            total_hours += hours
        
        # Assume workspace is available for 12 hours per day (8am to 8pm)
        available_hours = 12
        occupancy_rate = (total_hours / available_hours) * 100 if available_hours > 0 else 0
        
        # Cap at 100%
        occupancy_rate = min(occupancy_rate, 100)
        
        # Create or update the metric object
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
        return f"{self.user.email} - {self.month.strftime('%Y-%m')}"
    
    @classmethod
    def calculate_for_month(cls, user, year, month):
        """Calculate analytics for a user for a specific month"""
        # First day of the month
        first_day = datetime(year, month, 1).replace(tzinfo=timezone.get_current_timezone())
        
        # Last day of the month
        if month == 12:
            last_day = datetime(year + 1, 1, 1).replace(tzinfo=timezone.get_current_timezone()) - timedelta(days=1)
        else:
            last_day = datetime(year, month + 1, 1).replace(tzinfo=timezone.get_current_timezone()) - timedelta(days=1)
        
        # Get all completed bookings for this user in this month
        bookings = Booking.objects.filter(
            user=user,
            start_time__gte=first_day,
            end_time__lte=last_day + timedelta(days=1) - timedelta(seconds=1),
            status__in=['confirmed', 'completed']
        )
        
        total_bookings = bookings.count()
        
        # Calculate total hours
        duration_expression = ExpressionWrapper(
            F('end_time') - F('start_time'),
            output_field=fields.DurationField()
        )
        bookings_with_duration = bookings.annotate(duration=duration_expression)
        total_hours = sum((b.duration.total_seconds() / 3600) for b in bookings_with_duration)
        
        # Find most booked workspace
        workspace_counts = bookings.values('workspace').annotate(
            count=Count('workspace')
        ).order_by('-count')
        
        most_booked_workspace = None
        if workspace_counts.exists():
            most_booked_workspace = Workspace.objects.get(id=workspace_counts[0]['workspace'])
        
        # Create or update the analytic object
        analytic, created = cls.objects.update_or_create(
            user=user,
            month=first_day.date(),
            defaults={
                'total_bookings': total_bookings,
                'total_hours': total_hours,
                'most_booked_workspace': most_booked_workspace
            }
        )
        
        return analytic