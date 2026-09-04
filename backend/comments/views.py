from rest_framework import permissions, viewsets

from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            Comment.objects
            .select_related(
                "project",
                "task",
                "bug",
                "created_by",
            )
            .filter(
                project__members__user=user
            )
            .distinct()
        )