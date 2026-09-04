from rest_framework import permissions, viewsets

from activity_logs.services import create_activity_log
from projects.models import ProjectMember

from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Report.objects
            .select_related(
                "project",
                "created_by",
            )
            .filter(
                project__members__user=user
            )
            .distinct()
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        project = serializer.validated_data["project"]

        is_member = ProjectMember.objects.filter(
            project=project,
            user=self.request.user,
        ).exists()

        if not is_member:
            from rest_framework.exceptions import PermissionDenied

            raise PermissionDenied(
                "You do not have access to this project."
            )

        report = serializer.save(
            created_by=self.request.user
        )

        create_activity_log(
            user=self.request.user,
            project=report.project,
            action="CREATE",
            description=f'Created report "{report.title}"',
            entity_type="REPORT",
            entity_id=report.id,
        )

    def perform_update(self, serializer):
        report = serializer.save()

        create_activity_log(
            user=self.request.user,
            project=report.project,
            action="UPDATE",
            description=f'Updated report "{report.title}"',
            entity_type="REPORT",
            entity_id=report.id,
        )

    def perform_destroy(self, instance):
        project = instance.project
        report_id = instance.id
        report_title = instance.title

        instance.delete()

        create_activity_log(
            user=self.request.user,
            project=project,
            action="DELETE",
            description=f'Deleted report "{report_title}"',
            entity_type="REPORT",
            entity_id=report_id,
        )