from rest_framework import serializers
from .models import WorkspaceType, Workspace, Booking
from django.utils import timezone
from datetime import timedelta


class WorkspaceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceType
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class WorkspaceListSerializer(serializers.ModelSerializer):
    workspace_type = WorkspaceTypeSerializer(read_only=True)
    
    class Meta:
        model = Workspace
        fields = ('id', 'name', 'location', 'floor', 'workspace_type', 'is_active')


class WorkspaceDetailSerializer(serializers.ModelSerializer):
    workspace_type = WorkspaceTypeSerializer(read_only=True)
    
    class Meta:
        model = Workspace
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class WorkspaceCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ('name', 'location', 'floor', 'workspace_type', 'is_active')


class BookingListSerializer(serializers.ModelSerializer):
    workspace = WorkspaceListSerializer(read_only=True)
    
    class Meta:
        model = Booking
        fields = ('id', 'workspace', 'start_time', 'end_time', 'status')
        read_only_fields = ('id',)


class BookingDetailSerializer(serializers.ModelSerializer):
    workspace = WorkspaceDetailSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ('id', 'workspace', 'user', 'start_time', 'end_time', 
                  'purpose', 'attendees', 'status', 'duration',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'name': f"{obj.user.first_name} {obj.user.last_name}"
        }
    
    def get_duration(self, obj):
        duration = obj.end_time - obj.start_time
        hours = duration.total_seconds() / 3600
        return round(hours, 1)


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('workspace', 'start_time', 'end_time', 'purpose', 'attendees')
    
    def validate(self, data):
        """
        Check for booking conflicts and valid time range
        """
        # Check if the booking is in the future
        if data['start_time'] <= timezone.now():
            raise serializers.ValidationError(
                {"start_time": "Booking must be made for a future time"}
            )
        
        # Check if end time is after start time
        if data['end_time'] <= data['start_time']:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time"}
            )
        
        # Check if booking is not too long (e.g. max 8 hours)
        duration = data['end_time'] - data['start_time']
        max_duration = timedelta(hours=8)
        if duration > max_duration:
            raise serializers.ValidationError(
                {"end_time": "Booking duration cannot exceed 8 hours"}
            )
        
        # Check if the selected workspace is active
        workspace = data['workspace']
        if not workspace.is_active:
            raise serializers.ValidationError(
                {"workspace": "Selected workspace is not active"}
            )
        
        # Check if workspace is already booked for the requested time
        conflicts = Booking.objects.filter(
            workspace=workspace,
            status__in=['pending', 'confirmed'],
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time']
        )
        
        if self.instance:  # If updating an existing booking
            conflicts = conflicts.exclude(id=self.instance.id)
        
        if conflicts.exists():
            raise serializers.ValidationError(
                {"workspace": "The selected workspace is already booked for this time"}
            )
        
        return data
    
    def create(self, validated_data):
        # Set the user from the request context
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('start_time', 'end_time', 'purpose', 'attendees', 'status')
    
    def validate(self, data):
        """
        Check if the booking update would create conflicts
        """
        instance = self.instance
        
        # If status is being changed to cancelled or completed, no need to check conflicts
        if 'status' in data and data['status'] in ['cancelled', 'completed']:
            return data
        
        # Get the updated start and end times
        start_time = data.get('start_time', instance.start_time)
        end_time = data.get('end_time', instance.end_time)
        
        # Check if end time is after start time
        if end_time <= start_time:
            raise serializers.ValidationError(
                {"end_time": "End time must be after start time"}
            )
        
        # Check if booking is not too long (e.g. max 8 hours)
        duration = end_time - start_time
        max_duration = timedelta(hours=8)
        if duration > max_duration:
            raise serializers.ValidationError(
                {"end_time": "Booking duration cannot exceed 8 hours"}
            )
        
        # Check if workspace is already booked for the requested time
        conflicts = Booking.objects.filter(
            workspace=instance.workspace,
            status__in=['pending', 'confirmed'],
            start_time__lt=end_time,
            end_time__gt=start_time
        ).exclude(id=instance.id)
        
        if conflicts.exists():
            raise serializers.ValidationError(
                {"error": "The booking time conflicts with another booking"}
            )
        
        return data