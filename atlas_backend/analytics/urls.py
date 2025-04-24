from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.AnalyticsDashboardView.as_view(), name='analytics-dashboard'),
    path('occupancy-rate/', views.OccupancyRateView.as_view(), name='occupancy-rate'),
    path('peak-hours/', views.PeakHoursView.as_view(), name='peak-hours'),
    path('workspace-utilization/', views.WorkspaceUtilizationView.as_view(), name='workspace-utilization'),
    path('bookings-by-user-type/', views.BookingsByUserTypeView.as_view(), name='bookings-by-user-type'),
]
