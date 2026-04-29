import django_filters
from .models import VendorProfile


class VendorFilter(django_filters.FilterSet):
    city        = django_filters.CharFilter(lookup_expr="icontains")
    category    = django_filters.CharFilter(lookup_expr="exact")
    min_price   = django_filters.NumberFilter(field_name="starting_price", lookup_expr="gte")
    max_price   = django_filters.NumberFilter(field_name="starting_price", lookup_expr="lte")
    min_rating  = django_filters.NumberFilter(field_name="rating",         lookup_expr="gte")
    is_verified = django_filters.BooleanFilter()
    experience  = django_filters.NumberFilter(field_name="experience_years", lookup_expr="gte")

    class Meta:
        model  = VendorProfile
        fields = [
            "city",
            "category",
            "min_price",
            "max_price",
            "min_rating",
            "is_verified",
            "experience",
        ]