from django.db.models import Q
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.models import Project
from tasks.models import Task
from bugs.models import Bug


class DashboardSummaryView(APIView):
    """
    Return summary statistics for the authenticated user's projects.
    Includes projects created by the user OR projects where the user is a member.
    """

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):

        user = request.user

        # ADMIN can see everything
        if user.role == "ADMIN":
            projects = Project.objects.all()
        else:
            # Normal users see projects they created
            # or projects where they are members
            projects = Project.objects.filter(
                Q(created_by=user) |
                Q(members__user=user)
            ).distinct()

        # Tasks belonging to visible projects
        tasks = Task.objects.filter(
            project__in=projects
        )

        # Bugs belonging to visible projects
        bugs = Bug.objects.filter(
            project__in=projects
        )

        data = {
            "projects": {
                "total": projects.count(),
                "active": projects.filter(
                    status=Project.Status.ACTIVE
                ).count(),
                "completed": projects.filter(
                    status=Project.Status.COMPLETED
                ).count(),
                "on_hold": projects.filter(
                    status=Project.Status.ON_HOLD
                ).count(),
            },

            "tasks": {
                "total": tasks.count(),
                "todo": tasks.filter(
                    status=Task.Status.TODO
                ).count(),
                "in_progress": tasks.filter(
                    status=Task.Status.IN_PROGRESS
                ).count(),
                "review": tasks.filter(
                    status=Task.Status.REVIEW
                ).count(),
                "done": tasks.filter(
                    status=Task.Status.DONE
                ).count(),
                "blocked": tasks.filter(
                    status=Task.Status.BLOCKED
                ).count(),
            },

            "bugs": {
                "total": bugs.count(),
                "open": bugs.filter(
                    status=Bug.Status.OPEN
                ).count(),
                "in_progress": bugs.filter(
                    status=Bug.Status.IN_PROGRESS
                ).count(),
                "resolved": bugs.filter(
                    status=Bug.Status.RESOLVED
                ).count(),
                "closed": bugs.filter(
                    status=Bug.Status.CLOSED
                ).count(),
                "reopened": bugs.filter(
                    status=Bug.Status.REOPENED
                ).count(),
            },
        }

        return Response(data)