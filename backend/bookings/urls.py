from django.urls import path
from . import views

app_name = "bookings"

urlpatterns = [
    path("",                             views.BookingCreateView.as_view(),      name="create"),
    path("my/",                          views.UserBookingListView.as_view(),     name="my-bookings"),
    path("<int:pk>/",                    views.BookingDetailView.as_view(),       name="detail"),
    path("<int:pk>/accept/",             views.BookingAcceptView.as_view(),       name="accept"),
    path("<int:pk>/decline/",            views.BookingDeclineView.as_view(),      name="decline"),
    path("<int:pk>/complete/",           views.BookingCompleteView.as_view(),     name="complete"),
    path("<int:pk>/pay/",                views.CreatePaymentOrderView.as_view(),  name="pay"),
    path("<int:pk>/verify-payment/",     views.VerifyPaymentView.as_view(),       name="verify-payment"),
    path("<int:pk>/review/",             views.SubmitReviewView.as_view(),        name="review"),
    path("vendor/leads/",                views.VendorLeadsView.as_view(),         name="vendor-leads"),
]