from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model for FlowGuard.
    """

    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        MANAGER = "MANAGER", "Manager"
        DEVELOPER = "DEVELOPER", "Developer"
        TESTER = "TESTER", "Tester"
        VIEWER = "VIEWER", "Viewer"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        AWAY = "AWAY", "Away"
        OFFLINE = "OFFLINE", "Offline"

    email = models.EmailField(
        unique=True,
        max_length=254,
    )

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.VIEWER,
    )

    department = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.ACTIVE,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.username} ({self.role})"


class UserSettings(models.Model):
    """
    Stores personal FlowGuard settings for each user.
    """

    class Appearance(models.TextChoices):
        LIGHT = "LIGHT", "Light"
        DARK = "DARK", "Dark"
        SYSTEM = "SYSTEM", "System"

    # =====================================================
    # USER
    # =====================================================

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="settings",
    )

    # =====================================================
    # GENERAL SETTINGS
    # =====================================================

    workspace_name = models.CharField(
        max_length=150,
        default="Flow Guard",
    )

    language = models.CharField(
        max_length=50,
        default="English",
    )

    timezone = models.CharField(
        max_length=100,
        default="UTC+5:30 (IST)",
    )

    date_format = models.CharField(
        max_length=30,
        default="MM/DD/YYYY",
    )

    week_start = models.CharField(
        max_length=20,
        default="Monday",
    )

    # =====================================================
    # NOTIFICATION SETTINGS
    # =====================================================

    email_notifications = models.BooleanField(
        default=True,
    )

    push_notifications = models.BooleanField(
        default=True,
    )

    task_assigned = models.BooleanField(
        default=True,
    )

    task_completed = models.BooleanField(
        default=False,
    )

    bug_reported = models.BooleanField(
        default=True,
    )

    project_updates = models.BooleanField(
        default=True,
    )

    weekly_digest = models.BooleanField(
        default=False,
    )

    mention_alerts = models.BooleanField(
        default=True,
    )

    # =====================================================
    # APPEARANCE / THEME SETTINGS
    # =====================================================

    appearance = models.CharField(
        max_length=20,
        choices=Appearance.choices,
        default=Appearance.LIGHT,
    )

    accent_color = models.CharField(
        max_length=30,
        default="blue",
    )

    compact_mode = models.BooleanField(
        default=False,
    )

    sidebar_collapsed = models.BooleanField(
        default=False,
    )

    # =====================================================
    # SECURITY SETTINGS
    # =====================================================

    two_factor_enabled = models.BooleanField(
        default=False,
    )

    # =====================================================
    # TIMESTAMPS
    # =====================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        verbose_name = "User Setting"
        verbose_name_plural = "User Settings"

    def __str__(self):
        return f"Settings - {self.user.username}"