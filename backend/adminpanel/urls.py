from django.urls import path
from . import views

app_name = "adminpanel"

urlpatterns = [
    # Dashboard analytics
    path("dashboard/",                              views.AdminDashboardView.as_view(),        name="dashboard"),

    # Users
    path("users/",                                  views.AdminUserListView.as_view(),         name="user-list"),
    path("users/<int:pk>/",                         views.AdminUserDetailView.as_view(),       name="user-detail"),

    # Vendors
    path("vendors/",                                views.AdminVendorListView.as_view(),       name="vendor-list"),
    path("vendors/<int:pk>/verify/",                views.AdminVendorVerifyView.as_view(),     name="vendor-verify"),
    path("vendors/<int:pk>/deactivate/",            views.AdminVendorDeactivateView.as_view(), name="vendor-deactivate"),
    path("vendors/<int:pk>/delete/",                views.AdminVendorDeleteView.as_view(),     name="vendor-delete"),

    # Bookings
    path("bookings/",                               views.AdminBookingListView.as_view(),      name="booking-list"),

    # AI Chat Sessions
    path("ai-sessions/",                            views.AdminAISessionListView.as_view(),    name="ai-session-list"),
    path("ai-sessions/<str:session_key>/",          views.AdminAISessionDetailView.as_view(),  name="ai-session-detail"),
]