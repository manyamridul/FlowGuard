from django.conf import settings
from django.db import models


class ActivityLog(models.Model):

    ACTION_CHOICES = [
        ("CREATE", "Create"),
        ("UPDATE", "Update"),
        ("DELETE", "Delete"),
        ("STATUS_CHANGE", "Status Change"),
        ("LOGIN", "Login"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="activity_logs",
    )

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="activity_logs",
    )

    action = models.CharField(
        max_length=30,
        choices=ACTION_CHOICES,
    )

    description = models.TextField()

    entity_type = models.CharField(
        max_length=50,
    )

    entity_id = models.PositiveBigIntegerField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.action} - {self.entity_type}"