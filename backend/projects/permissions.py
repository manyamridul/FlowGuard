from rest_framework.permissions import BasePermission


class IsProjectMemberOrAdmin(BasePermission):
    """
    Project access rules:

    ADMIN:
        Full access.

    Project creator:
        Full access.

    Project member:
        Read access.

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

        # ADMIN has full access
        if user.role == "ADMIN":
            return True

        # Project creator has full access
        if obj.created_by_id == user.id:
            return True

        # Members can read
        if request.method in ("GET", "HEAD", "OPTIONS"):
            return obj.members.filter(
                user_id=user.id
            ).exists()

        # Members cannot modify/delete by default
        return False


class IsProjectManagerOrAdmin(BasePermission):
    """
    Used for project member management.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):

        user = request.user

        if user.role == "ADMIN":
            return True

        if obj.created_by_id == user.id:
            return True

        membership = obj.members.filter(
            user_id=user.id
        ).first()

        if membership and membership.role in [
            "OWNER",
            "MANAGER",
        ]:
            return True

        return False