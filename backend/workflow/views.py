from django.db import models
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

from projects.models import Project
from .models import Workflow
from .serializers import WorkflowSerializer


class WorkflowViewSet(viewsets.ModelViewSet):

    serializer_class = WorkflowSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return Workflow.objects.filter(
            project__in=self._user_projects(user)
        ).select_related(
            "project",
            "assignee",
        )

    @staticmethod
    def _user_projects(user):

        # ADMIN has access to all projects
        if getattr(user, "role", None) == "ADMIN":
            return Project.objects.all()

        # Normal users only see projects they created
        # or projects where they are members
        return Project.objects.filter(
            models.Q(created_by=user) |
            models.Q(members__user=user)
        ).distinct()

    def perform_create(self, serializer):

        project = serializer.validated_data["project"]

        if not self._has_project_access(project):
            raise PermissionDenied(
                "You do not have access to this project."
            )

        serializer.save()

    def perform_update(self, serializer):

        project = self.get_object().project

        if not self._has_project_access(project):
            raise PermissionDenied(
                "You do not have access to this project."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if not self._has_project_access(instance.project):
            raise PermissionDenied(
                "You do not have access to this project."
            )

        instance.delete()

    def _has_project_access(self, project):

        user = self.request.user

        # ADMIN has access to every project
        if getattr(user, "role", None) == "ADMIN":
            return True

        # Project creator has access
        if project.created_by_id == user.id:
            return True

        # Project members have access
        return project.members.filter(
            user_id=user.id
        ).exists()