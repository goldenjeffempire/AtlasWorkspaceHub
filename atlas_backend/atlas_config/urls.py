from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework.routers import DefaultRouter

# API Schema setup
schema_view = get_schema_view(
    openapi.Info(
        title="ATLAS Workspace API",
        default_version='v1',
        description="API for ATLAS Workspace Booking Application",
        contact=openapi.Contact(email="contact@atlas-workspace.com"),
        license=openapi.License(name="MIT License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# API Root View
router = DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/bookings/', include('bookings.urls')),
    path('api/analytics/', include('analytics.urls')),
    
    # API documentation
    path('api/docs/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('api/redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # API Root
    path('api/', include(router.urls)),
    
    # Redirect root to API
    path('', RedirectView.as_view(url='/api/docs/', permanent=False)),
]
