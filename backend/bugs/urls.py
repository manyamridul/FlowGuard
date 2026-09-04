from rest_framework.routers import DefaultRouter

from .views import BugViewSet


router = DefaultRouter()

router.register(
    r"bugs",
    BugViewSet,
    basename="bug",
)

urlpatterns = router.urls