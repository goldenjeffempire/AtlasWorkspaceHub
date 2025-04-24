from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Q
from datetime import timedelta

from .models import WorkspaceType, Workspace, Booking
from .serializers import (
    WorkspaceTypeSerializer,
    WorkspaceListSerializer,
    WorkspaceDetailSerializer,
    WorkspaceCreateUpdateSerializer,
    BookingListSerializer,
    BookingDetailSerializer,
    BookingCreateSerializer,
    BookingUpdateSerializer
)
from accounts.permissions import IsAdmin, IsEmployee, IsLearner, IsGeneral


class WorkspaceTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing workspace types
    """
    queryset = WorkspaceType.objects.all()
    serializer_class = WorkspaceTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        """
        Only admins can create, update, or delete workspace types
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()


class WorkspaceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing workspaces
    """
    queryset = Workspace.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkspaceListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WorkspaceCreateUpdateSerializer
        return WorkspaceDetailSerializer
    
    def get_permissions(self):
        """
        Only admins can create, update, or delete workspaces
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        Get available workspaces for a specific time range
        """
        start_time = request.query_params.get('start_time')
        end_time = request.query_params.get('end_time')
        
        if not start_time or not end_time:
            return Response(
                {"error": "Both start_time and end_time parameters are required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find workspaces that don't have bookings in the given time range
        busy_workspaces = Booking.objects.filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time),
            status__in=['pending', 'confirmed']
        ).values_list('workspace_id', flat=True)
        
        available_workspaces = Workspace.objects.filter(
            is_active=True
        ).exclude(
            id__in=busy_workspaces
        )
        
        serializer = WorkspaceListSerializer(available_workspaces, many=True)
        return Response(serializer.data)


class BookingViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing bookings
    """
    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        elif self.action == 'create':
            return BookingCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return BookingUpdateSerializer
        return BookingDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Check if this is a schema generation request
        if getattr(self, 'swagger_fake_view', False):
            return Booking.objects.none()
            
        if not user.is_authenticated:
            return Booking.objects.none()
            
        if user.role == 'admin':
            queryset = Booking.objects.all()
        else:
            queryset = Booking.objects.filter(user=user)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by date range
        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        if from_date:
            queryset = queryset.filter(start_time__gte=from_date)
        if to_date:
            queryset = queryset.filter(end_time__lte=to_date)
        
        # Filter by workspace
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        
        return queryset
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, status='confirmed')
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {"error": "Cannot cancel a booking that is already completed or cancelled"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        
        return Response(BookingDetailSerializer(booking).data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        now = timezone.now()
        queryset = self.get_queryset().filter(
            start_time__gte=now,
            status='confirmed'
        ).order_by('start_time')[:5]
        
        serializer = BookingListSerializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        today = timezone.now().date()
        tomorrow = today + timedelta(days=1)
        
        queryset = self.get_queryset().filter(
            start_time__gte=today,
            start_time__lt=tomorrow,
            status__in=['confirmed', 'pending']
        ).order_by('start_time')
        
        serializer = BookingListSerializer(queryset, many=True)
        return Response(serializer.data)