
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path("django-admin/", admin.site.urls),

    # API Docs
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/",   SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("api/redoc/",  SpectacularRedocView.as_view(url_name="schema"),   name="redoc"),

    # App APIs
    path("api/v1/auth/",     include("users.urls",      namespace="users")),
    path("api/v1/vendors/",  include("vendors.urls",    namespace="vendors")),
    path("api/v1/events/",   include("events.urls",     namespace="events")),
    path("api/v1/bookings/", include("bookings.urls",   namespace="bookings")),
    path("api/v1/chat/",     include("chat.urls",       namespace="chat")),
    path("api/v1/admin/",    include("adminpanel.urls", namespace="adminpanel")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,  document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)