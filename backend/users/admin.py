from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display    = ["email", "phone", "full_name", "role", "city", "is_active", "is_verified", "date_joined"]
    list_filter     = ["role", "is_active", "is_verified", "city"]
    search_fields   = ["email", "phone", "full_name"]
    ordering        = ["-date_joined"]
    readonly_fields = ["date_joined", "last_login"]

    fieldsets = (
        (None, {
            "fields": ("email", "phone", "password"),
        }),
        ("Personal Info", {
            "fields": ("full_name", "city", "avatar"),
        }),
        ("Permissions", {
            "fields": ("role", "is_active", "is_staff", "is_superuser", "is_verified", "groups", "user_permissions"),
        }),
        ("Important Dates", {
            "fields": ("date_joined", "last_login"),
        }),
    )

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields":  ("email", "phone", "full_name", "role", "password1", "password2"),
        }),
    )