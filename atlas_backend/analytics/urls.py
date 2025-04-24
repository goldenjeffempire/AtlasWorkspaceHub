from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkspaceMetricViewSet,
    UserAnalyticViewSet,
    DashboardView,
    OccupancyReportView,
    BookingTrendsView,
    UserActivityReportView,
    WorkspacePopularityView
)

router = DefaultRouter()
router.register('workspace-metrics', WorkspaceMetricViewSet)
router.register('user-analytics', UserAnalyticViewSet, basename='user-analytics')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('occupancy-report/', OccupancyReportView.as_view(), name='occupancy-report'),
    path('booking-trends/', BookingTrendsView.as_view(), name='booking-trends'),
    path('user-activity/', UserActivityReportView.as_view(), name='user-activity'),
    path('workspace-popularity/', WorkspacePopularityView.as_view(), name='workspace-popularity'),
    path('', include(router.urls)),
]