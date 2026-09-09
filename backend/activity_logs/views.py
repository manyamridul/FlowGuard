from django.db.models import Q

from rest_framework import permissions, viewsets

from .models import ActivityLog
from .serializers import ActivityLogSerializer


class ActivityLogViewSet(viewsets.ModelViewSet):

    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        # =================================================
        # ADMIN -> SEE ALL ACTIVITY LOGS
        # =================================================

        if user.role == "ADMIN":

            return (
                ActivityLog.objects
                .select_related(
                    "user",
                    "project",
                )
                .all()
                .order_by("-created_at")
            )

        # =================================================
        # NORMAL USER
        #
        # Can see activity from projects where:
        # 1. User created the project
        # 2. User is a member of the project
        # =================================================

        return (
            ActivityLog.objects
            .select_related(
                "user",
                "project",
            )
            .filter(
                Q(project__created_by=user)
                |
                Q(project__members__user=user)
            )
            .distinct()
            .order_by("-created_at")
        )

    def perform_create(self, serializer):

        serializer.save(
            user=self.request.user
        )