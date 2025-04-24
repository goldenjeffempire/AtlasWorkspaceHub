from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsAdmin
from django.db.models import Count, Sum, F, Q, Avg
from django.db.models.functions import ExtractHour
from django.utils import timezone
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
from .models import WorkspaceMetric, UserAnalytic
from .serializers import (
    WorkspaceMetricSerializer, 
    UserAnalyticSerializer,
    WorkspaceOccupancySerializer,
    BookingTrendSerializer,
    UserActivitySerializer,
    WorkspacePopularitySerializer
)
from accounts.models import User
from bookings.models import Booking, Workspace
from accounts.permissions import IsAdmin


class WorkspaceMetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = WorkspaceMetric.objects.all()
    serializer_class = WorkspaceMetricSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


class UserAnalyticViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserAnalyticSerializer
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get_queryset(self):
        return UserAnalytic.objects.all()


class DashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Provide key metrics for dashboard display with role-based data access"""
        user = request.user
        
        # Common metrics calculation
        today = timezone.now().date()
        start_of_month = date(today.year, today.month, 1)
        end_of_month = date(today.year + 1, 1, 1) if today.month == 12 else date(today.year, today.month + 1, 1)
        
        # Calculate date ranges
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        start_of_month = date(today.year, today.month, 1)
        if today.month == 12:
            start_of_next_month = date(today.year + 1, 1, 1)
        else:
            start_of_next_month = date(today.year, today.month + 1, 1)
        
        # User's upcoming bookings
        upcoming_bookings = []
        if user.role != 'admin':
            upcoming_bookings = Booking.objects.filter(
                user=user,
                start_time__gte=timezone.now(),
                status='confirmed'
            ).order_by('start_time')[:5].values(
                'id', 'workspace__name', 'start_time', 'end_time'
            )
        
        # Return different metrics based on role
        if user.role == 'admin':
            # Analytics for admins
            
            # Total users and workspaces
            total_users = User.objects.count()
            total_workspaces = Workspace.objects.count()
            
            # Bookings today and this month
            bookings_today = Booking.objects.filter(
                start_time__date=today,
                status__in=['confirmed', 'completed']
            ).count()
            
            bookings_this_month = Booking.objects.filter(
                start_time__gte=start_of_month,
                start_time__lt=start_of_next_month,
                status__in=['confirmed', 'completed']
            ).count()
            
            # Overall occupancy rate for today
            today_metrics = WorkspaceMetric.objects.filter(date=today)
            if today_metrics.exists():
                avg_occupancy = today_metrics.aggregate(avg=Avg('occupancy_rate'))['avg']
            else:
                avg_occupancy = 0
            
            return Response({
                'total_users': total_users,
                'total_workspaces': total_workspaces,
                'bookings_today': bookings_today,
                'bookings_this_month': bookings_this_month,
                'avg_occupancy_today': avg_occupancy,
            })
        else:
            # Analytics for regular users
            
            # User's total bookings and hours this month
            user_bookings_month = Booking.objects.filter(
                user=user,
                start_time__gte=start_of_month,
                start_time__lt=start_of_next_month,
                status__in=['confirmed', 'completed']
            )
            
            bookings_this_month = user_bookings_month.count()
            
            # User's bookings today
            bookings_today = Booking.objects.filter(
                user=user,
                start_time__date=today,
                status__in=['confirmed', 'completed', 'pending']
            ).count()
            
            # Calculate hours booked this month
            hours_this_month = 0
            for booking in user_bookings_month:
                duration = booking.end_time - booking.start_time
                hours_this_month += duration.total_seconds() / 3600
            
            return Response({
                'bookings_today': bookings_today,
                'bookings_this_month': bookings_this_month,
                'hours_this_month': round(hours_this_month, 1),
                'upcoming_bookings': upcoming_bookings,
            })


class OccupancyReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get workspace occupancy data for a date range"""
        # Get date range parameters with defaults
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        today = timezone.now().date()
        
        # Default to last 7 days if not specified
        if not start_date_str:
            start_date = today - timedelta(days=6)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = today
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        # Get metrics for the date range
        metrics = WorkspaceMetric.objects.filter(
            date__gte=start_date,
            date__lte=end_date
        ).select_related('workspace')
        
        # Format the data for the response
        workspace_data = []
        for metric in metrics:
            workspace_data.append({
                'date': metric.date,
                'workspace_id': metric.workspace.id,
                'workspace_name': metric.workspace.name,
                'occupancy_rate': metric.occupancy_rate,
                'total_hours_booked': metric.total_hours_booked,
                'total_bookings': metric.total_bookings
            })
        
        serializer = WorkspaceOccupancySerializer(workspace_data, many=True)
        return Response(serializer.data)


class BookingTrendsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get booking trends over time"""
        # Get period parameter (daily, weekly, monthly) with default
        period = request.query_params.get('period', 'daily')
        
        # Get date range parameters with defaults
        months = int(request.query_params.get('months', 3))
        
        today = timezone.now().date()
        start_date = today - relativedelta(months=months)
        
        # Get all bookings in the period
        bookings = Booking.objects.filter(
            start_time__date__gte=start_date,
            status__in=['confirmed', 'completed']
        )
        
        # Aggregate the data based on period
        if period == 'daily':
            # Daily aggregation
            bookings = bookings.extra(
                select={'day': "DATE(start_time)"}
            ).values('day').annotate(
                total_bookings=Count('id')
            ).order_by('day')
            
            trend_data = [
                {
                    'date': item['day'],
                    'total_bookings': item['total_bookings']
                }
                for item in bookings
            ]
        
        elif period == 'weekly':
            # Weekly aggregation
            # This is a simplified approach - for a real app, use more 
            # sophisticated techniques for week calculation
            trend_data = []
            current = start_date
            while current <= today:
                week_end = current + timedelta(days=6)
                count = Booking.objects.filter(
                    start_time__date__gte=current,
                    start_time__date__lte=week_end,
                    status__in=['confirmed', 'completed']
                ).count()
                
                trend_data.append({
                    'date': current,
                    'total_bookings': count
                })
                
                current = week_end + timedelta(days=1)
        
        else:  # monthly
            # Monthly aggregation
            trend_data = []
            current = date(start_date.year, start_date.month, 1)
            while current <= today:
                # Calculate the end of the month
                if current.month == 12:
                    next_month = date(current.year + 1, 1, 1)
                else:
                    next_month = date(current.year, current.month + 1, 1)
                
                end_of_month = next_month - timedelta(days=1)
                
                # Count bookings for this month
                count = Booking.objects.filter(
                    start_time__date__gte=current,
                    start_time__date__lte=end_of_month,
                    status__in=['confirmed', 'completed']
                ).count()
                
                trend_data.append({
                    'date': current,
                    'total_bookings': count
                })
                
                # Move to the next month
                current = next_month
        
        serializer = BookingTrendSerializer(trend_data, many=True)
        return Response(serializer.data)


class UserActivityReportView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get report on user booking activity"""
        # Get date range parameters with defaults
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        today = timezone.now().date()
        
        # Default to last month if not specified
        if not start_date_str:
            start_date = today - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = today
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        # Get all users with their booking stats
        users = User.objects.all()
        
        user_activities = []
        for user in users:
            bookings = Booking.objects.filter(
                user=user,
                start_time__date__gte=start_date,
                start_time__date__lte=end_date,
                status__in=['confirmed', 'completed']
            )
            
            total_bookings = bookings.count()
            
            # Calculate total hours
            total_hours = 0
            for booking in bookings:
                duration = booking.end_time - booking.start_time
                total_hours += duration.total_seconds() / 3600
            
            # Only include users who have made bookings
            if total_bookings > 0:
                user_activities.append({
                    'user_id': user.id,
                    'user_name': f"{user.first_name} {user.last_name}",
                    'email': user.email,
                    'total_bookings': total_bookings,
                    'total_hours': round(total_hours, 1)
                })
        
        # Sort by total bookings (descending)
        user_activities.sort(key=lambda x: x['total_bookings'], reverse=True)
        
        serializer = UserActivitySerializer(user_activities, many=True)
        return Response(serializer.data)


class WorkspacePopularityView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get report on workspace popularity"""
        # Get date range parameters with defaults
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        today = timezone.now().date()
        
        # Default to last month if not specified
        if not start_date_str:
            start_date = today - timedelta(days=30)
        else:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        
        if not end_date_str:
            end_date = today
        else:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        
        # Get total number of bookings in the period
        total_bookings = Booking.objects.filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date,
            status__in=['confirmed', 'completed']
        ).count()
        
        # Get all workspaces
        workspaces = Workspace.objects.all()
        
        popularity_data = []
        for workspace in workspaces:
            # Count bookings for this workspace
            workspace_bookings = Booking.objects.filter(
                workspace=workspace,
                start_time__date__gte=start_date,
                start_time__date__lte=end_date,
                status__in=['confirmed', 'completed']
            ).count()
            
            # Calculate booking percentage
            booking_percentage = 0
            if total_bookings > 0:
                booking_percentage = (workspace_bookings / total_bookings) * 100
            
            # Only include workspaces that have been booked
            if workspace_bookings > 0:
                popularity_data.append({
                    'workspace_id': workspace.id,
                    'workspace_name': workspace.name,
                    'total_bookings': workspace_bookings,
                    'booking_percentage': round(booking_percentage, 1)
                })
        
        # Sort by total bookings (descending)
        popularity_data.sort(key=lambda x: x['total_bookings'], reverse=True)
        
        serializer = WorkspacePopularitySerializer(popularity_data, many=True)
        return Response(serializer.data)
class PeakHoursView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]
    
    def get(self, request):
        """Get peak hour analysis data"""
        # Get date range parameters
        start_date = request.query_params.get('start_date', 
            (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        end_date = request.query_params.get('end_date', 
            timezone.now().strftime('%Y-%m-%d'))
        
        # Convert to datetime objects
        start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Query bookings and group by hour
        bookings_by_hour = Booking.objects.filter(
            start_time__date__gte=start_date,
            start_time__date__lte=end_date,
            status__in=['confirmed', 'completed']
        ).annotate(
            hour=ExtractHour('start_time')
        ).values('hour').annotate(
            total_bookings=Count('id'),
            occupancy_rate=Avg('workspace__workspace_metrics__occupancy_rate')
        ).order_by('hour')
        
        serializer = PeakHoursSerializer(bookings_by_hour, many=True)
        return Response(serializer.data)
