from rest_framework import serializers

from projects.models import Project, ProjectMember

from .models import KnowledgeArticle


class KnowledgeArticleSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="project.name",
        read_only=True
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True
    )

    class Meta:
        model = KnowledgeArticle
        fields = [
            "id",
            "project",
            "project_name",
            "title",
            "content",
            "category",
            "status",
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

    def create(self, validated_data):
        request = self.context["request"]

        return KnowledgeArticle.objects.create(
            created_by=request.user,
            **validated_data
        )