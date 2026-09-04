from django.contrib.auth import get_user_model

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import UserSettings


User = get_user_model()


# =========================================================
# REGISTER
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8,
    )

    password_confirm = serializers.CharField(
        write_only=True,
    )

    class Meta:
        model = User

        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
        ]

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {
                    "password_confirm": "Passwords do not match."
                }
            )

        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User(**validated_data)

        user.set_password(password)

        user.save()

        return user


# =========================================================
# USER SERIALIZER
# =========================================================

class UserSerializer(serializers.ModelSerializer):

    name = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "username",
            "name",
            "email",
            "first_name",
            "last_name",
            "role",
            "department",
            "status",
            "is_active",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "is_active",
            "created_at",
        ]

    def get_name(self, obj):
        full_name = f"{obj.first_name} {obj.last_name}".strip()

        return full_name or obj.username


# =========================================================
# EMAIL LOGIN
# =========================================================

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):

    username_field = "email"

    email = serializers.EmailField(
        write_only=True
    )

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs.get("email", "").lower().strip()

        password = attrs.get("password", "")

        try:
            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.check_password(password):
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        # Generate JWT using the actual Django username.
        attrs["username"] = user.username

        data = super().validate(attrs)

        # Return user information to frontend.
        data["user"] = UserSerializer(user).data

        return data


# =========================================================
# USER SETTINGS
# =========================================================

class UserSettingsSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserSettings

        fields = [
            "id",

            # General
            "workspace_name",
            "language",
            "timezone",
            "date_format",
            "week_start",

            # Notifications
            "email_notifications",
            "push_notifications",
            "task_assigned",
            "task_completed",
            "bug_reported",
            "project_updates",
            "weekly_digest",
            "mention_alerts",

            # Appearance
            "appearance",
            "accent_color",
            "compact_mode",
            "sidebar_collapsed",

            # Security
            "two_factor_enabled",

            # Timestamps
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_workspace_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Workspace name cannot be empty."
            )

        return value

    def validate_language(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Language cannot be empty."
            )

        return value

    def validate_timezone(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Timezone cannot be empty."
            )

        return value

    def validate_date_format(self, value):
        value = value.strip()

        allowed_formats = [
            "MM/DD/YYYY",
            "DD/MM/YYYY",
            "YYYY-MM-DD",
        ]

        if value not in allowed_formats:
            raise serializers.ValidationError(
                "Invalid date format."
            )

        return value

    def validate_week_start(self, value):
        value = value.strip()

        allowed_days = [
            "Monday",
            "Sunday",
        ]

        if value not in allowed_days:
            raise serializers.ValidationError(
                "Week start must be Monday or Sunday."
            )

        return value