from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from datetime import timedelta
from .models import Workspace, WorkspaceType, Booking
from .serializers import WorkspaceSerializer, WorkspaceTypeSerializer, BookingSerializer
from accounts.permissions import IsAdmin

class WorkspaceTypeViewSet(viewsets.ModelViewSet):
    queryset = WorkspaceType.objects.all()
    serializer_class = WorkspaceTypeSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]

class WorkspaceViewSet(viewsets.ModelViewSet):
    queryset = Workspace.objects.all()
    serializer_class = WorkspaceSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdmin()]
        return [permissions.IsAuthenticated()]
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Return all available workspaces"""
        now = timezone.now()
        
        # Optional query parameters
        start_time = request.query_params.get('start_time', now)
        end_time = request.query_params.get('end_time', now + timedelta(hours=1))
        location = request.query_params.get('location')
        workspace_type = request.query_params.get('type')
        
        # Filter workspaces
        workspaces = Workspace.objects.filter(is_active=True)
        
        if location:
            workspaces = workspaces.filter(location__icontains=location)
        
        if workspace_type:
            workspaces = workspaces.filter(workspace_type__id=workspace_type)
        
        # Check availability during the requested time period
        available_workspaces = []
        for workspace in workspaces:
            if workspace.is_available_between(start_time, end_time):
                available_workspaces.append(workspace)
        
        serializer = self.get_serializer(available_workspaces, many=True)
        return Response(serializer.data)

class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Admin can see all bookings
        if user.role == 'admin':
            return Booking.objects.all()
        
        # Other users can only see their own bookings
        return Booking.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def mine(self, request):
        """Return user's bookings"""
        bookings = Booking.objects.filter(user=request.user)
        # Optional filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            bookings = bookings.filter(status=status_filter)
        
        # Optional filter by date range
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if start_date and end_date:
            bookings = bookings.filter(start_time__date__range=[start_date, end_date])
        
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """Cancel a booking"""
        booking = self.get_object()
        
        # Only allow cancellation of pending or confirmed bookings
        if booking.status not in ['pending', 'confirmed']:
            return Response(
                {"detail": "Cannot cancel a booking that is not pending or confirmed"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        booking.status = 'cancelled'
        booking.save()
        serializer = self.get_serializer(booking)
        return Response(serializer.data)
