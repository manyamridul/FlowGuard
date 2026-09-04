from django.conf import settings
from django.db import models

from projects.models import Project
from tasks.models import Task
from bugs.models import Bug


class Comment(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="comments",
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="comments",
    )

    bug = models.ForeignKey(
        Bug,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="comments",
    )

    content = models.TextField()

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="comments",
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.created_by.username}: {self.content[:50]}"