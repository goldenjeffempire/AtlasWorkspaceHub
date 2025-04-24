from rest_framework import serializers
from .models import WorkspaceMetric, UserAnalytic
from bookings.models import Workspace, Booking
from accounts.models import User
from django.db.models import Count, Sum, F, ExpressionWrapper, FloatField
from django.db.models.functions import Extract
from django.utils import timezone
from datetime import timedelta, datetime

class WorkspaceMetricSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    
    class Meta:
        model = WorkspaceMetric
        fields = ('id', 'workspace', 'workspace_name', 'date', 'total_bookings', 
                  'total_hours_booked', 'occupancy_rate')
        read_only_fields = fields

class UserAnalyticSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    most_booked_workspace_name = serializers.CharField(source='most_booked_workspace.name', read_only=True)
    
    class Meta:
        model = UserAnalytic
        fields = ('id', 'user', 'user_name', 'month', 'total_bookings', 
                  'total_hours', 'most_booked_workspace', 'most_booked_workspace_name')
        read_only_fields = fields

class OccupancyRateSerializer(serializers.Serializer):
    date = serializers.DateField()
    average_occupancy = serializers.FloatField()

class PeakHoursSerializer(serializers.Serializer):
    hour = serializers.IntegerField()
    bookings_count = serializers.IntegerField()

class UserTypeBookingSerializer(serializers.Serializer):
    role = serializers.CharField()
    booking_count = serializers.IntegerField()

class WorkspaceUtilizationSerializer(serializers.Serializer):
    workspace_name = serializers.CharField()
    total_hours = serializers.FloatField()
    occupancy_rate = serializers.FloatField()

class AnalyticsDashboardSerializer(serializers.Serializer):
    """Serializer for aggregating all analytics data for the dashboard"""
    total_bookings = serializers.IntegerField()
    total_active_workspaces = serializers.IntegerField()
    average_occupancy_rate = serializers.FloatField()
    occupancy_trend = OccupancyRateSerializer(many=True)
    peak_hours = PeakHoursSerializer(many=True)
    bookings_by_user_type = UserTypeBookingSerializer(many=True)
    workspace_utilization = WorkspaceUtilizationSerializer(many=True)
    
    @classmethod
    def get_dashboard_data(cls, start_date=None, end_date=None):
        """Get all analytics data for the dashboard"""
        # Default to the last 30 days if no date range is provided
        if not start_date:
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=30)
        elif not end_date:
            end_date = timezone.now().date()
        
        # Total bookings in the period
        total_bookings = Booking.objects.filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date,
            status='confirmed'
        ).count()
        
        # Total active workspaces
        total_active_workspaces = Workspace.objects.filter(is_active=True).count()
        
        # Average occupancy rate
        metrics = WorkspaceMetric.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        )
        
        avg_occupancy = metrics.aggregate(avg=models.Avg('occupancy_rate'))['avg'] or 0
        
        # Occupancy trend (daily average occupancy)
        occupancy_trend = metrics.values('date').annotate(
            average_occupancy=models.Avg('occupancy_rate')
        ).order_by('date')
        
        # Peak booking hours
        bookings = Booking.objects.filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date,
            status='confirmed'
        )
        
        peak_hours = bookings.annotate(
            hour=Extract('start_time', 'hour')
        ).values('hour').annotate(
            bookings_count=Count('id')
        ).order_by('-bookings_count')[:5]
        
        # Bookings by user type (role)
        bookings_by_user_type = bookings.values(
            'user__role'
        ).annotate(
            role=F('user__role'),
            booking_count=Count('id')
        ).values('role', 'booking_count')
        
        # Workspace utilization
        workspace_utilization = metrics.values(
            'workspace__name'
        ).annotate(
            workspace_name=F('workspace__name'),
            total_hours=Sum('total_hours_booked'),
            occupancy_rate=models.Avg('occupancy_rate')
        ).order_by('-occupancy_rate')
        
        return {
            'total_bookings': total_bookings,
            'total_active_workspaces': total_active_workspaces,
            'average_occupancy_rate': avg_occupancy,
            'occupancy_trend': occupancy_trend,
            'peak_hours': peak_hours,
            'bookings_by_user_type': bookings_by_user_type,
            'workspace_utilization': workspace_utilization
        }
