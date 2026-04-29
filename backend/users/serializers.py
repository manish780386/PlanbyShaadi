from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserRegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, label="Confirm Password")

    class Meta:
        model  = User
        fields = [
            "id", "full_name", "email", "phone",
            "password", "password2", "role", "city",
        ]
        extra_kwargs = {"role": {"default": "USER"}}

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        if not attrs.get("email") and not attrs.get("phone"):
            raise serializers.ValidationError("Provide email or phone number.")
        if attrs.get("role") == "ADMIN":
            raise serializers.ValidationError({"role": "Cannot self-register as admin."})
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserLoginSerializer(serializers.Serializer):
    """Login with email+password OR phone+password."""
    email    = serializers.EmailField(required=False)
    phone    = serializers.CharField(max_length=15, required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email    = attrs.get("email")
        phone    = attrs.get("phone")
        password = attrs.get("password")

        if not email and not phone:
            raise serializers.ValidationError("Provide email or phone.")

        user = None
        if email:
            user = User.objects.filter(email=email).first()
        elif phone:
            user = User.objects.filter(phone=phone).first()

        if not user or not user.check_password(password):
            raise serializers.ValidationError("Invalid credentials.")
        if not user.is_active:
            raise serializers.ValidationError("Account is deactivated.")

        attrs["user"] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = [
            "id", "full_name", "email", "phone",
            "role", "city", "avatar", "is_verified", "date_joined",
        ]
        read_only_fields = ["id", "role", "is_verified", "date_joined"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_old_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["full_name"] = user.full_name
        token["role"]      = user.role
        token["email"]     = user.email or ""
        token["phone"]     = user.phone or ""
        return token