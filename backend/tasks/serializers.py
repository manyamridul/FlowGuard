from rest_framework import serializers

from projects.models import ProjectMember

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

        # -------------------------------------------------
        # GET PROJECT
        # -------------------------------------------------

        project = attrs.get(
            "project",
            getattr(self.instance, "project", None),
        )

        if not project:
            raise serializers.ValidationError({
                "project": "Project is required."
            })

        # -------------------------------------------------
        # GET WORKFLOW
        # -------------------------------------------------

        workflow = attrs.get(
            "workflow",
            getattr(self.instance, "workflow", None),
        )

        if not workflow:
            raise serializers.ValidationError({
                "workflow": "Workflow is required."
            })

        # -------------------------------------------------
        # WORKFLOW MUST BELONG TO PROJECT
        # -------------------------------------------------

        if workflow.project_id != project.id:

            raise serializers.ValidationError({
                "workflow": (
                    "This workflow does not belong "
                    "to the selected project."
                )
            })

        # -------------------------------------------------
        # ASSIGNEE MUST BELONG TO PROJECT
        # -------------------------------------------------

        assigned_to = attrs.get(
            "assigned_to",
            getattr(self.instance, "assigned_to", None),
        )

        if assigned_to:

            is_member = ProjectMember.objects.filter(
                project=project,
                user=assigned_to,
            ).exists()

            is_creator = (
                project.created_by_id == assigned_to.id
            )

            if not is_member and not is_creator:

                raise serializers.ValidationError({
                    "assigned_to": (
                        "This user is not a member "
                        "of the selected project."
                    )
                })

        return attrs