from rest_framework import serializers
from .models import WorkspaceMetric, UserAnalytic
from accounts.serializers import UserSerializer
from bookings.serializers import WorkspaceListSerializer


class WorkspaceMetricSerializer(serializers.ModelSerializer):
    workspace = WorkspaceListSerializer(read_only=True)
    
    class Meta:
        model = WorkspaceMetric
        fields = ('id', 'workspace', 'date', 'total_bookings', 'total_hours_booked', 'occupancy_rate')
        read_only_fields = ('id', 'date', 'total_bookings', 'total_hours_booked', 'occupancy_rate')


class UserAnalyticSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    most_booked_workspace = WorkspaceListSerializer(read_only=True)
    month_display = serializers.SerializerMethodField()
    
    class Meta:
        model = UserAnalytic
        fields = ('id', 'user', 'month', 'month_display', 'total_bookings', 'total_hours', 'most_booked_workspace')
        read_only_fields = ('id', 'month', 'total_bookings', 'total_hours')
    
    def get_month_display(self, obj):
        return obj.month.strftime('%B %Y')


class WorkspaceOccupancySerializer(serializers.Serializer):
    date = serializers.DateField()
    workspace_id = serializers.IntegerField()
    workspace_name = serializers.CharField()
    occupancy_rate = serializers.FloatField()
    total_hours_booked = serializers.FloatField()
    total_bookings = serializers.IntegerField()

class PeakHoursSerializer(serializers.Serializer):
    hour = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    occupancy_rate = serializers.FloatField(allow_null=True)


class BookingTrendSerializer(serializers.Serializer):
    date = serializers.DateField()
    total_bookings = serializers.IntegerField()


class UserActivitySerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    email = serializers.EmailField()
    total_bookings = serializers.IntegerField()
    total_hours = serializers.FloatField()


class WorkspacePopularitySerializer(serializers.Serializer):
    workspace_id = serializers.IntegerField()
    workspace_name = serializers.CharField()
    total_bookings = serializers.IntegerField()
    booking_percentage = serializers.FloatField()

class PeakHoursSerializer(serializers.Serializer):
    hour = serializers.IntegerField()
    total_bookings = serializers.IntegerField()
    occupancy_rate = serializers.FloatField()