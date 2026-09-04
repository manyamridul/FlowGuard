from rest_framework import permissions, viewsets

from .models import Bug
from .serializers import BugSerializer


class BugViewSet(viewsets.ModelViewSet):
    serializer_class = BugSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Bug.objects
            .select_related(
                "project",
                "workflow",
                "reported_by",
                "assigned_to",
            )
            .filter(
                project__members__user=user
            )
            .distinct()
        )