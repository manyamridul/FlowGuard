from rest_framework import serializers
from .models import Workflow


class WorkflowSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = Workflow

        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "description",
            "status",
            "priority",
            "assignee",
            "assignee_name",
            "tags",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_name",
            "assignee_name",
            "created_at",
            "updated_at",
        ]

    def get_assignee_name(self, obj):
        if not obj.assignee:
            return "Unassigned"

        full_name = (
            f"{obj.assignee.first_name} "
            f"{obj.assignee.last_name}"
        ).strip()

        return full_name or obj.assignee.username

    def validate_title(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Workflow title cannot be empty."
            )

        return value