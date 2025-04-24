from rest_framework import viewsets, generics, status, filters
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
from accounts.permissions import IsAdmin


class WorkspaceTypeViewSet(viewsets.ModelViewSet):
    queryset = WorkspaceType.objects.all()
    serializer_class = WorkspaceTypeSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return super().get_permissions()


class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.filter(is_active=True)
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'location', 'floor']
    ordering_fields = ['name', 'location', 'workspace_type__name']
    ordering = ['name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdmin()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return WorkspaceListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return WorkspaceCreateUpdateSerializer
        return WorkspaceDetailSerializer
    
    def get_queryset(self):
        """Filter workspaces based on availability query param"""
        queryset = super().get_queryset()
        available_from = self.request.query_params.get('available_from')
        available_to = self.request.query_params.get('available_to')
        
        if available_from and available_to:
            # Find workspaces that don't have bookings in the specified time range
            booked_workspace_ids = Booking.objects.filter(
                start_time__lt=available_to,
                end_time__gt=available_from,
                status__in=['pending', 'confirmed']
            ).values_list('workspace_id', flat=True).distinct()
            
            queryset = queryset.exclude(id__in=booked_workspace_ids)
        
        return queryset


class BookingViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['start_time', 'end_time', 'status', 'created_at']
    ordering = ['-start_time']
    
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