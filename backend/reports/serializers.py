from rest_framework import serializers

from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(
        source="project.name",
        read_only=True,
    )

    created_by_username = serializers.CharField(
        source="created_by.username",
        read_only=True,
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "project",
            "project_name",
            "created_by",
            "created_by_username",
            "report_type",
            "title",
            "description",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
        ]