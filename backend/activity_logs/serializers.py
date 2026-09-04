from rest_framework import serializers

from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True,
    )

    project_name = serializers.CharField(
        source="project.name",
        read_only=True,
    )

    class Meta:
        model = ActivityLog

        fields = [
            "id",
            "user",
            "username",
            "project",
            "project_name",
            "action",
            "description",
            "entity_type",
            "entity_id",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "user",
            "username",
            "project_name",
            "created_at",
        ]