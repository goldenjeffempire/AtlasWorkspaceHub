from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkspaceTypeViewSet, WorkspaceViewSet, BookingViewSet

router = DefaultRouter()
router.register('workspace-types', WorkspaceTypeViewSet, basename='workspace-type')
router.register('workspaces', WorkspaceViewSet, basename='workspace')
router.register('bookings', BookingViewSet, basename='booking')

urlpatterns = [
    path('', include(router.urls)),
]