from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Project, ProjectMember


User = get_user_model()


class ProjectSerializer(serializers.ModelSerializer):

    created_by_name = serializers.SerializerMethodField()

    # Used when creating/updating a project
    member_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.filter(is_active=True),
        write_only=True,
        required=False,
    )

    # Used when returning project data to React
    current_member_ids = serializers.SerializerMethodField(
        read_only=True
    )

    class Meta:
        model = Project

        fields = [
            "id",
            "name",
            "description",
            "status",
            "priority",
            "start_date",
            "due_date",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",

            # Project member input
            "member_ids",

            # Project member output
            "current_member_ids",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
            "current_member_ids",
        ]

    def get_created_by_name(self, obj):
        return obj.created_by.username

    def get_current_member_ids(self, obj):
        return list(
            obj.members.values_list(
                "user_id",
                flat=True
            )
        )

    def create(self, validated_data):

        member_ids = validated_data.pop(
            "member_ids",
            []
        )

        request = self.context["request"]

        project = Project.objects.create(
            created_by=request.user,
            **validated_data
        )

        # Creator is automatically OWNER
        ProjectMember.objects.create(
            project=project,
            user=request.user,
            role=ProjectMember.Role.OWNER,
        )

        # Add selected users
        for user in member_ids:

            if user.id == request.user.id:
                continue

            ProjectMember.objects.get_or_create(
                project=project,
                user=user,
                defaults={
                    "role": ProjectMember.Role.DEVELOPER
                }
            )

        return project

    def get_member_ids(self, obj):

        return list(
            obj.members.values_list(
                "user_id",
                flat=True
            )
        )

    def update(self, instance, validated_data):

        member_ids = validated_data.pop(
            "member_ids",
            None
        )

        # Update normal project fields
        instance = super().update(
            instance,
            validated_data
        )

        # Update members only if member_ids was supplied
        if member_ids is not None:

            # Remove existing non-owner members
            ProjectMember.objects.filter(
                project=instance
            ).exclude(
                role=ProjectMember.Role.OWNER
            ).delete()

            # Add selected users
            for user in member_ids:

                if user.id == instance.created_by_id:
                    continue

                ProjectMember.objects.get_or_create(
                    project=instance,
                    user=user,
                    defaults={
                        "role": ProjectMember.Role.DEVELOPER
                    }
                )

        return instance