from rest_framework import permissions, viewsets

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            ActivityLog.objects
            .select_related(
                "user",
                "project",
            )
            .filter(
                project__members__user=user
            )
            .distinct()
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )