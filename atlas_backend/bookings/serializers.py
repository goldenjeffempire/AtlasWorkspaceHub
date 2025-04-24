from rest_framework import serializers
from .models import WorkspaceType, Workspace, Booking
from accounts.serializers import UserSerializer


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
    user = UserSerializer(read_only=True)
    duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Booking
        fields = ('id', 'workspace', 'user', 'start_time', 'end_time', 
                  'purpose', 'attendees', 'status', 'duration',
                  'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def get_duration(self, obj):
        return obj.duration_hours()


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('workspace', 'start_time', 'end_time', 'purpose', 'attendees')
    
    def validate(self, data):
        """
        Check for booking conflicts and valid time range
        """
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        
        # Check for overlapping bookings
        overlapping_bookings = Booking.objects.filter(
            workspace=data['workspace'],
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time'],
            status__in=['pending', 'confirmed']
        )
        
        if self.instance:  # If updating an existing booking
            overlapping_bookings = overlapping_bookings.exclude(id=self.instance.id)
        
        if overlapping_bookings.exists():
            raise serializers.ValidationError("This time slot is already booked")
        
        return data
    
    def create(self, validated_data):
        # Set the user as the current authenticated user
        validated_data['user'] = self.context['request'].user
        validated_data['status'] = 'confirmed'  # Auto-confirm for now
        return super().create(validated_data)


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ('start_time', 'end_time', 'purpose', 'attendees', 'status')
    
    def validate(self, data):
        if 'start_time' in data and 'end_time' in data and data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        
        # Check for overlapping bookings if changing the time
        if 'start_time' in data or 'end_time' in data:
            start_time = data.get('start_time', self.instance.start_time)
            end_time = data.get('end_time', self.instance.end_time)
            
            overlapping_bookings = Booking.objects.filter(
                workspace=self.instance.workspace,
                start_time__lt=end_time,
                end_time__gt=start_time,
                status__in=['pending', 'confirmed']
            ).exclude(id=self.instance.id)
            
            if overlapping_bookings.exists():
                raise serializers.ValidationError("This time slot is already booked")
        
        return data