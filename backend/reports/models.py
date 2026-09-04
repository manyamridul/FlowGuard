from django.conf import settings
from django.db import models


class Report(models.Model):
    class ReportType(models.TextChoices):
        PROJECT = "PROJECT", "Project Report"
        TASK = "TASK", "Task Report"
        BUG = "BUG", "Bug Report"
        TEAM = "TEAM", "Team Report"
        ACTIVITY = "ACTIVITY", "Activity Report"

    project = models.ForeignKey(
        "projects.Project",
        on_delete=models.CASCADE,
        related_name="reports",
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_reports",
    )

    report_type = models.CharField(
        max_length=20,
        choices=ReportType.choices,
    )

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.title