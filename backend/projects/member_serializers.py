from django.contrib.auth import get_user_model

from rest_framework import serializers

from .models import Project, ProjectMember


User = get_user_model()


class ProjectMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for managing users assigned to a project.

    Expected POST data:

    {
        "user_id": 5,
        "role": "DEVELOPER"
    }

    """

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    user_id = serializers.PrimaryKeyRelatedField(
        source="user",
        queryset=User.objects.filter(is_active=True),
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

    # =====================================================
    # VALIDATION
    # =====================================================

    def validate(self, attrs):

        project = self.context.get("project")
        user = attrs.get("user")

        if not project:
            raise serializers.ValidationError(
                "Project context is required."
            )

        if not user:
            raise serializers.ValidationError(
                {
                    "user_id": "A valid user is required."
                }
            )

        # Prevent duplicate membership
        if ProjectMember.objects.filter(
            project=project,
            user=user
        ).exists():

            raise serializers.ValidationError(
                {
                    "user_id":
                    "This user is already a member of this project."
                }
            )

        return attrs

    # =====================================================
    # CREATE PROJECT MEMBER
    # =====================================================

    def create(self, validated_data):

        project = self.context.get("project")

        if not project:
            raise serializers.ValidationError(
                "Project context is required."
            )

        user = validated_data.pop("user")

        return ProjectMember.objects.create(
            project=project,
            user=user,
            **validated_data
        )