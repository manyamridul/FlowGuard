from django.conf import settings
from django.db import models

from projects.models import Project


class KnowledgeArticle(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        PUBLISHED = "PUBLISHED", "Published"
        ARCHIVED = "ARCHIVED", "Archived"

    class Category(models.TextChoices):
        GENERAL = "GENERAL", "General"
        DEVELOPMENT = "DEVELOPMENT", "Development"
        TESTING = "TESTING", "Testing"
        DEPLOYMENT = "DEPLOYMENT", "Deployment"
        DOCUMENTATION = "DOCUMENTATION", "Documentation"
        TROUBLESHOOTING = "TROUBLESHOOTING", "Troubleshooting"

    title = models.CharField(
        max_length=200
    )

    content = models.TextField()

    category = models.CharField(
        max_length=30,
        choices=Category.choices,
        default=Category.GENERAL
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="knowledge_articles"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="created_knowledge_articles"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title