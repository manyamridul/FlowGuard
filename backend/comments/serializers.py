from rest_framework import serializers

from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:
        model = Comment
        fields = [
            "id",
            "project",
            "project_name",
            "task",
            "bug",
            "content",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "project_name",
            "created_by",
            "created_by_username",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        task = attrs.get("task", getattr(self.instance, "task", None))
        bug = attrs.get("bug", getattr(self.instance, "bug", None))

        if not task and not bug:
            raise serializers.ValidationError(
                "A comment must belong to either a task or a bug."
            )

        if task and bug:
            raise serializers.ValidationError(
                "A comment cannot belong to both a task and a bug."
            )

        project = attrs.get(
            "project",
            getattr(self.instance, "project", None)
        )

        if task and task.project_id != project.id:
            raise serializers.ValidationError(
                "The task does not belong to the selected project."
            )

        if bug and bug.project_id != project.id:
            raise serializers.ValidationError(
                "The bug does not belong to the selected project."
            )

        request = self.context["request"]

        if not project.members.filter(user=request.user).exists():
            raise serializers.ValidationError(
                "You do not have access to this project."
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]

        return Comment.objects.create(
            created_by=request.user,
            **validated_data
        )
    