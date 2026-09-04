from rest_framework.routers import DefaultRouter

from .views import KnowledgeArticleViewSet


router = DefaultRouter()

router.register(
    r"knowledge",
    KnowledgeArticleViewSet,
    basename="knowledge-article",
)

urlpatterns = router.urls