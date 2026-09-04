from django.contrib import admin
from django.urls import include, path


urlpatterns = [

    path(
        "admin/",
        admin.site.urls,
    ),

    # Authentication
    path(
        "api/auth/",
        include("users.urls"),
    ),

    # Projects
    path(
        "api/",
        include("projects.urls"),
    ),

    # Workflow
    path(
        "api/",
        include("workflow.urls"),
    ),

    # Tasks
    path(
        "api/",
        include("tasks.urls"),
    ),

    # Bugs
    path(
        "api/",
        include("bugs.urls"),
    ),

    # Knowledge Base
    path(
        "api/",
        include("knowledge_base.urls"),
    ),

    # Comments
    path(
        "api/",
        include("comments.urls"),
    ),

    # Activity Logs
    path(
        "api/",
        include("activity_logs.urls"),
    ),

    # Users
    path(
        "api/users/",
        include("users.urls"),
    ),

    # Reports
    path(
        "api/reports/",
        include("reports.urls"),
    ),

    # Dashboard
    path(
        "api/dashboard/",
        include("dashboard.urls"),
    ),

    path(
        "api/ai-assistant/",
        include("ai_assistant.urls"),
    ),
]
