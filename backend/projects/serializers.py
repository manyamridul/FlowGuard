from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):

    created_by_name = serializers.SerializerMethodField()

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
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]

    def get_created_by_name(self, obj):

        return obj.created_by.username