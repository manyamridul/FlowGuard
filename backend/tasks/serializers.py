from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source="project.name",
        read_only=True,
    )

    workflow_title = serializers.CharField(
        source="workflow.title",
        read_only=True,
    )

    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
        allow_null=True,
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = Task

        fields = [
            "id",
            "project",
            "project_name",
            "workflow",
            "workflow_title",
            "title",
            "description",
            "status",
            "priority",
            "assigned_to",
            "assigned_to_username",
            "due_date",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_name",
            "workflow_title",
            "assigned_to_username",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):

        project = attrs.get(
            "project",
            getattr(self.instance, "project", None),
        )

        workflow = attrs.get(
            "workflow",
            getattr(self.instance, "workflow", None),
        )

        if project and workflow:
            if workflow.project_id != project.id:
                raise serializers.ValidationError({
                    "workflow": (
                        "This workflow does not belong "
                        "to the selected project."
                    )
                })

        return attrs