from django.db.models import Q

from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from activity_logs.services import create_activity_log
from projects.models import Project, ProjectMember

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):

    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Task.objects
            .select_related(
                "project",
                "workflow",
                "assigned_to",
                "created_by",
            )
        )

        # ADMIN can see ALL tasks
        if user.role == "ADMIN":
            return queryset.all()

        # Normal users can see tasks only
        # from projects they created or joined
        return queryset.filter(
            Q(project__created_by=user) |
            Q(project__members__user=user)
        ).distinct()

    def _has_project_access(self, project):

        user = self.request.user

        # ADMIN -> full access to every project
        if user.role == "ADMIN":
            return True

        # Project creator -> full access
        if project.created_by_id == user.id:
            return True

        # Project member -> access
        return ProjectMember.objects.filter(
            project=project,
            user=user,
        ).exists()

    def create(self, request, *args, **kwargs):

        project_id = request.data.get("project")

        if not project_id:
            return Response(
                {
                    "project": "This field is required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            project = Project.objects.get(
                id=project_id
            )
        except Project.DoesNotExist:
            return Response(
                {
                    "project": "Project does not exist."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not self._has_project_access(project):
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        assigned_to = serializer.validated_data.get(
            "assigned_to"
        )

        if assigned_to:

            assigned_is_member = (
                ProjectMember.objects.filter(
                    project=project,
                    user=assigned_to,
                ).exists()
            )

            if not assigned_is_member:

                return Response(
                    {
                        "assigned_to": (
                            "This user is not a member "
                            "of the selected project."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        task = serializer.save(
            created_by=request.user
        )

        create_activity_log(
            user=request.user,
            project=task.project,
            action="CREATE",
            description=(
                f'Created task "{task.title}"'
            ),
            entity_type="TASK",
            entity_id=task.id,
        )

        return Response(
            self.get_serializer(task).data,
            status=status.HTTP_201_CREATED,
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        task = self.get_object()

        serializer = self.get_serializer(
            task,
            data=request.data,
            partial=kwargs.get(
                "partial",
                False,
            ),
        )

        serializer.is_valid(
            raise_exception=True
        )

        project = serializer.validated_data.get(
            "project",
            task.project,
        )

        if not self._has_project_access(
            project
        ):
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        assigned_to = serializer.validated_data.get(
            "assigned_to",
            task.assigned_to,
        )

        if assigned_to:

            assigned_is_member = (
                ProjectMember.objects.filter(
                    project=project,
                    user=assigned_to,
                ).exists()
            )

            if not assigned_is_member:

                return Response(
                    {
                        "assigned_to": (
                            "This user is not a member "
                            "of the selected project."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        task = serializer.save()

        create_activity_log(
            user=request.user,
            project=task.project,
            action="UPDATE",
            description=(
                f'Updated task "{task.title}"'
            ),
            entity_type="TASK",
            entity_id=task.id,
        )

        return Response(
            self.get_serializer(task).data,
            status=status.HTTP_200_OK,
        )

    def destroy(
        self,
        request,
        *args,
        **kwargs
    ):

        task = self.get_object()

        project = task.project

        task_id = task.id
        task_title = task.title

        if not self._has_project_access(
            project
        ):
            return Response(
                {
                    "detail": (
                        "You do not have access "
                        "to this project."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        task.delete()

        create_activity_log(
            user=request.user,
            project=project,
            action="DELETE",
            description=(
                f'Deleted task "{task_title}"'
            ),
            entity_type="TASK",
            entity_id=task_id,
        )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )