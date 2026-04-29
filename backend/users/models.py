from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):

    def _create_user(self, password, **fields):
        if not fields.get("email") and not fields.get("phone"):
            raise ValueError("User must have an email or phone number.")
        if fields.get("email"):
            fields["email"] = self.normalize_email(fields["email"])
        user = self.model(**fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, password=None, **fields):
        fields.setdefault("is_staff", False)
        fields.setdefault("is_superuser", False)
        return self._create_user(password, **fields)

    def create_superuser(self, email, password=None, **fields):
        fields.update({
            "is_staff":     True,
            "is_superuser": True,
            "role":         "ADMIN",
            "email":        email,
        })
        return self._create_user(password, **fields)


class User(AbstractBaseUser, PermissionsMixin):

    class Role(models.TextChoices):
        USER   = "USER",   "User"
        VENDOR = "VENDOR", "Vendor"
        ADMIN  = "ADMIN",  "Admin"

    email       = models.EmailField(unique=True, null=True, blank=True)
    phone       = models.CharField(max_length=15, unique=True, null=True, blank=True)
    full_name   = models.CharField(max_length=150)
    role        = models.CharField(max_length=10, choices=Role.choices, default=Role.USER)
    city        = models.CharField(max_length=100, blank=True)
    avatar      = models.ImageField(upload_to="avatars/", null=True, blank=True)
    is_active   = models.BooleanField(default=True)
    is_staff    = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    updated_at  = models.DateTimeField(auto_now=True)

    USERNAME_FIELD  = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    class Meta:
        db_table = "users"
        ordering = ["-date_joined"]
        indexes  = [
            models.Index(fields=["email"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["role"]),
        ]

    def __str__(self):
        return self.email or self.phone or self.full_name

    @property
    def is_user(self):
        return self.role == self.Role.USER

    @property
    def is_vendor(self):
        return self.role == self.Role.VENDOR

    @property
    def is_admin(self):
        return self.role == self.Role.ADMIN