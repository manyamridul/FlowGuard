from rest_framework import permissions, viewsets

from .models import KnowledgeArticle
from .serializers import KnowledgeArticleSerializer


class KnowledgeArticleViewSet(viewsets.ModelViewSet):
    serializer_class = KnowledgeArticleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        return (
            KnowledgeArticle.objects
            .select_related(
                "project",
                "created_by",
            )
            .filter(
                project__members__user=user
            )
            .distinct()
        )