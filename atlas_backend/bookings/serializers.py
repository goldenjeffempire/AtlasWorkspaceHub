from rest_framework import serializers
from .models import Workspace, WorkspaceType, Booking
from accounts.serializers import UserSerializer

class WorkspaceTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkspaceType
        fields = '__all__'

class WorkspaceSerializer(serializers.ModelSerializer):
    workspace_type = WorkspaceTypeSerializer(read_only=True)
    workspace_type_id = serializers.PrimaryKeyRelatedField(
        queryset=WorkspaceType.objects.all(),
        source='workspace_type',
        write_only=True
    )
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Workspace
        fields = ('id', 'name', 'workspace_type', 'workspace_type_id', 'location', 
                  'floor', 'is_active', 'is_available', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class BookingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    workspace = WorkspaceSerializer(read_only=True)
    workspace_id = serializers.PrimaryKeyRelatedField(
        queryset=Workspace.objects.all(),
        source='workspace',
        write_only=True
    )
    
    class Meta:
        model = Booking
        fields = ('id', 'user', 'workspace', 'workspace_id', 'start_time', 'end_time', 
                  'purpose', 'attendees', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
    
    def validate(self, data):
        # Check if start time is before end time
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        
        # Check if the booking time has already passed
        if data['start_time'] < self.context['request'].timezone.now():
            raise serializers.ValidationError("Cannot book a workspace in the past")
        
        # Check for availability (only when creating a booking)
        if self.instance is None:  # Creating new booking
            workspace = data['workspace']
            if not workspace.is_available_between(data['start_time'], data['end_time']):
                raise serializers.ValidationError("Workspace is not available for the selected time")
        
        return data
    
    def create(self, validated_data):
        # Assign current user to the booking
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
