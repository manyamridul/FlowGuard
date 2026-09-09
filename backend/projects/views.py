from django.db import models
from django.db.migrations import serializer
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Project, ProjectMember
from .serializers import ProjectSerializer
from .member_serializers import ProjectMemberSerializer
from .permissions import (
    IsProjectMemberOrAdmin,
    IsProjectManagerOrAdmin,
)


class ProjectViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectSerializer

    permission_classes = [
        IsAuthenticated,
        IsProjectMemberOrAdmin,
    ]

    def get_queryset(self):

        user = self.request.user

        # ADMIN -> SEE ALL PROJECTS
        if user.role == "ADMIN":

            return Project.objects.select_related(
                "created_by"
            ).prefetch_related(
                "members"
            ).all()

        # NORMAL USER -> ONLY THEIR PROJECTS
        # OR PROJECTS THEY ARE MEMBERS OF

        return Project.objects.select_related(
            "created_by"
        ).prefetch_related(
            "members"
        ).filter(
            models.Q(created_by=user)
            |
            models.Q(members__user=user)
        ).distinct()

    def perform_create(self, serializer):

        serializer.save()

class ProjectMemberViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectMemberSerializer

    http_method_names = [
        "get",
        "post",
        "patch",
        "delete",
        "head",
        "options",
    ]

    def get_project(self):

        return get_object_or_404(
            Project,
            id=self.kwargs["project_id"]
        )

    def get_queryset(self):

        project = self.get_project()

        return ProjectMember.objects.filter(
            project=project
        ).select_related(
            "user",
            "project"
        )

    def get_permissions(self):

        return [
            IsAuthenticated(),
            IsProjectManagerOrAdmin(),
        ]

    def get_serializer_context(self):

        context = super().get_serializer_context()

        context["project"] = self.get_project()

        return context

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def check_object_permissions(
        self,
        request,
        obj
    ):

        project = self.get_project()

        for permission in self.get_permissions():

            if not permission.has_object_permission(
                request,
                self,
                project
            ):
                self.permission_denied(
                    request
                )