from rest_framework.permissions import BasePermission


class IsProjectMemberOrAdmin(BasePermission):
    """
    Project access rules:

    ADMIN:
        Full access to every project.

    Project creator:
        Full access.

    Project member:
        Full access to the project.

    Everyone else:
        No access.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):

        user = request.user

        # -------------------------------------------------
        # ADMIN -> FULL ACCESS
        # -------------------------------------------------

        if user.role == "ADMIN":
            return True

        # -------------------------------------------------
        # PROJECT CREATOR -> FULL ACCESS
        # -------------------------------------------------

        if obj.created_by_id == user.id:
            return True

        # -------------------------------------------------
        # PROJECT MEMBER -> FULL ACCESS
        # -------------------------------------------------

        if obj.members.filter(
            user_id=user.id
        ).exists():
            return True

        # -------------------------------------------------
        # NOT A MEMBER -> NO ACCESS
        # -------------------------------------------------

        return False


class IsProjectManagerOrAdmin(BasePermission):
    """
    Used for project member management.

    ADMIN:
        Full access to all projects.

    Project creator:
        Full access.

    Any project member:
        Full access to this project's member management.

    Non-members:
        No access.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):

        user = request.user

        # -------------------------------------------------
        # ADMIN -> FULL ACCESS
        # -------------------------------------------------

        if user.role == "ADMIN":
            return True

        # -------------------------------------------------
        # PROJECT CREATOR -> FULL ACCESS
        # -------------------------------------------------

        if obj.created_by_id == user.id:
            return True

        # -------------------------------------------------
        # ANY PROJECT MEMBER -> FULL ACCESS
        # -------------------------------------------------

        if obj.members.filter(
            user_id=user.id
        ).exists():
            return True

        # -------------------------------------------------
        # NOT A MEMBER -> NO ACCESS
        # -------------------------------------------------

        return False