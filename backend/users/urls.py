from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    EmailLoginView,
    CurrentUserView,
    UserListView,
    UserDetailView,
    UserSettingsView,
)


urlpatterns = [

    # =====================================================
    # REGISTER
    # =====================================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    # =====================================================
    # EMAIL + PASSWORD LOGIN
    # =====================================================

    path(
        "login/",
        EmailLoginView.as_view(),
        name="login",
    ),

    # =====================================================
    # REFRESH JWT
    # =====================================================

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    # =====================================================
    # CURRENT AUTHENTICATED USER
    # =====================================================

    path(
        "me/",
        CurrentUserView.as_view(),
        name="current_user",
    ),

    # =====================================================
    # USER SETTINGS
    # =====================================================

    path(
        "settings/",
        UserSettingsView.as_view(),
        name="user-settings",
    ),

    # =====================================================
    # USERS
    # =====================================================

    path(
        "",
        UserListView.as_view(),
        name="user-list",
    ),

    # =====================================================
    # USER DETAIL
    # =====================================================

    path(
        "<int:pk>/",
        UserDetailView.as_view(),
        name="user-detail",
    ),
]