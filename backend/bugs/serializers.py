from rest_framework import serializers

from projects.models import Project, ProjectMember
from workflow.models import Workflow

from .models import Bug


class BugSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    workflow_name = serializers.CharField(
        source="workflow.title",
        read_only=True,
        allow_null=True
    )

    reported_by_username = serializers.CharField(
        source="reported_by.username",
        read_only=True
    )

    assigned_to_username = serializers.CharField(
        source="assigned_to.username",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Bug
        fields = [
            "id",
            "project",
            "project_name",
            "workflow",
            "workflow_name",
            "title",
            "description",
            "status",
            "severity",
            "priority",
            "reported_by",
            "reported_by_username",
            "assigned_to",
            "assigned_to_username",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "reported_by",
            "reported_by_username",
            "assigned_to_username",
            "project_name",
            "workflow_name",
            "created_at",
            "updated_at",
        ]

    def validate_project(self, project):
        request = self.context["request"]

        is_member = ProjectMember.objects.filter(
            project=project,
            user=request.user,
        ).exists()

        if not is_member:
            raise serializers.ValidationError(
                "You do not have access to this project."
            )

        return project

    def validate(self, attrs):
        project = attrs.get("project")

        if project is None and self.instance:
            project = self.instance.project

        workflow = attrs.get(
            "workflow",
            self.instance.workflow if self.instance else None
        )

        assigned_to = attrs.get(
            "assigned_to",
            self.instance.assigned_to if self.instance else None
        )

        if workflow is not None and workflow.project_id != project.id:
            raise serializers.ValidationError({
                "workflow": "This workflow does not belong to the selected project."
            })

        if assigned_to is not None:
            is_member = ProjectMember.objects.filter(
                project=project,
                user=assigned_to,
            ).exists()

            if not is_member:
                raise serializers.ValidationError({
                    "assigned_to": "This user is not a member of the selected project."
                })

        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        return Bug.objects.create(
            reported_by=request.user,
            **validated_data
        )