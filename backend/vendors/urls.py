from django.urls import path
from . import views

app_name = "vendors"

urlpatterns = [
    path("",                   views.VendorListView.as_view(),         name="list"),
    path("<int:pk>/",          views.VendorDetailView.as_view(),       name="detail"),
    path("register/",          views.VendorRegisterView.as_view(),     name="register"),
    path("profile/",           views.VendorProfileUpdateView.as_view(), name="profile"),
    path("images/",            views.VendorImageUploadView.as_view(),  name="images"),
    path("images/<int:pk>/",   views.VendorImageUploadView.as_view(),  name="image-delete"),
    path("packages/",          views.VendorPackageView.as_view(),      name="packages"),
    path("packages/<int:pk>/", views.VendorPackageView.as_view(),      name="package-delete"),
    path("availability/",      views.VendorAvailabilityView.as_view(), name="availability"),
    path("availability/<int:pk>/", views.VendorAvailabilityView.as_view(), name="availability-delete"),
    path("earnings/",          views.VendorEarningsView.as_view(),     name="earnings"),
]