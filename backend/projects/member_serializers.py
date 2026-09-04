from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Project, ProjectMember


User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    user_id = serializers.IntegerField(
        write_only=True,
        required=True
    )

    class Meta:
        model = ProjectMember

        fields = [
            "id",
            "user_id",
            "username",
            "email",
            "role",
            "joined_at",
        ]

        read_only_fields = [
            "id",
            "username",
            "email",
            "joined_at",
        ]

    def validate_user_id(self, value):
        if not User.objects.filter(
            id=value,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "Active user not found."
            )

        return value

    def validate(self, attrs):
        project = self.context.get("project")
        user_id = attrs.get("user_id")

        if project and ProjectMember.objects.filter(
            project=project,
            user_id=user_id
        ).exists():
            raise serializers.ValidationError(
                {
                    "user_id": "This user is already a member of this project."
                }
            )

        return attrs

    def create(self, validated_data):
        user_id = validated_data.pop("user_id")

        return ProjectMember.objects.create(
            project=self.context["project"],
            user_id=user_id,
            **validated_data
        )