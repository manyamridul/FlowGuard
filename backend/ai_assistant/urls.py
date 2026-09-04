from django.urls import path

from .views import AISprintAssistantView


urlpatterns = [
    path(
        "",
        AISprintAssistantView.as_view(),
        name="ai-assistant",
    ),
]