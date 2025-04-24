from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Count, Sum, Avg, F
from django.utils import timezone
from datetime import datetime, timedelta
from .models import WorkspaceMetric, UserAnalytic
from .serializers import (
    WorkspaceMetricSerializer,
    UserAnalyticSerializer,
    OccupancyRateSerializer,
    PeakHoursSerializer,
    UserTypeBookingSerializer,
    WorkspaceUtilizationSerializer,
    AnalyticsDashboardSerializer
)
from bookings.models import Booking, Workspace
from accounts.permissions import IsAdmin

class AnalyticsDashboardView(APIView):
    """Main view for analytics dashboard"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Process date range filters from query params
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        try:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        dashboard_data = AnalyticsDashboardSerializer.get_dashboard_data(start_date, end_date)
        serializer = AnalyticsDashboardSerializer(dashboard_data)
        
        return Response(serializer.data)

class OccupancyRateView(APIView):
    """View for workspace occupancy rate trends"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Get date range from query params (default to last 30 days)
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get daily occupancy rates
        metrics = WorkspaceMetric.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('date').annotate(
            average_occupancy=Avg('occupancy_rate')
        ).order_by('date')
        
        serializer = OccupancyRateSerializer(metrics, many=True)
        return Response(serializer.data)

class PeakHoursView(APIView):
    """View for peak booking hours"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Get date range from query params (default to last 30 days)
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get bookings distribution by hour
        bookings = Booking.objects.filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date,
            status='confirmed'
        )
        
        peak_hours = bookings.annotate(
            hour=F('start_time__hour')
        ).values('hour').annotate(
            bookings_count=Count('id')
        ).order_by('hour')
        
        serializer = PeakHoursSerializer(peak_hours, many=True)
        return Response(serializer.data)

class WorkspaceUtilizationView(APIView):
    """View for workspace utilization metrics"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Get date range from query params (default to last 30 days)
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get workspace utilization metrics
        utilization = WorkspaceMetric.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).values('workspace__name').annotate(
            workspace_name=F('workspace__name'),
            total_hours=Sum('total_hours_booked'),
            occupancy_rate=Avg('occupancy_rate')
        ).order_by('-occupancy_rate')
        
        serializer = WorkspaceUtilizationSerializer(utilization, many=True)
        return Response(serializer.data)

class BookingsByUserTypeView(APIView):
    """View for bookings distribution by user role"""
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get(self, request):
        # Get date range from query params (default to last 30 days)
        days = int(request.query_params.get('days', 30))
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days)
        
        # Get bookings distribution by user role
        role_distribution = Booking.objects.filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date,
            status='confirmed'
        ).values('user__role').annotate(
            role=F('user__role'),
            booking_count=Count('id')
        ).values('role', 'booking_count').order_by('role')
        
        serializer = UserTypeBookingSerializer(role_distribution, many=True)
        return Response(serializer.data)
