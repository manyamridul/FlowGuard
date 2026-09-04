from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    ProjectMemberViewSet,
    ProjectViewSet,
)


router = DefaultRouter()

router.register(
    "projects",
    ProjectViewSet,
    basename="project"
)


member_list = ProjectMemberViewSet.as_view({
    "get": "list",
    "post": "create",
})

member_detail = ProjectMemberViewSet.as_view({
    "patch": "partial_update",
    "delete": "destroy",
})


urlpatterns = [

    path(
        "",
        include(router.urls)
    ),

    path(
        "projects/<int:project_id>/members/",
        member_list,
        name="project-members",
    ),

    path(
        "projects/<int:project_id>/members/<int:pk>/",
        member_detail,
        name="project-member-detail",
    ),
]