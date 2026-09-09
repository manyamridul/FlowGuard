from django.contrib.auth import get_user_model

from rest_framework import generics, status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserSettings
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    UserSettingsSerializer,
)


User = get_user_model()


# =========================================================
# REGISTER
# =========================================================

class RegisterView(generics.CreateAPIView):
    """
    Register a new FlowGuard user.
    """

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        UserSettings.objects.get_or_create(
            user=user
        )

        return Response(
            {
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


# =========================================================
# EMAIL LOGIN
# =========================================================

class EmailLoginView(APIView):
    """
    Login using email + password.

    Returns:
        access token
        refresh token
        authenticated user information
    """

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email", "")
        password = request.data.get("password", "")

        # -----------------------------------------
        # Validate input
        # -----------------------------------------

        email = email.strip().lower()

        if not email or not password:
            return Response(
                {
                    "detail": "Email and password are required."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # -----------------------------------------
        # Find user by email
        # -----------------------------------------

        try:
            user = User.objects.get(
                email__iexact=email
            )

        except User.DoesNotExist:
            return Response(
                {
                    "detail": "Invalid email or password."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # -----------------------------------------
        # Check account status
        # -----------------------------------------

        if not user.is_active:
            return Response(
                {
                    "detail": "This account is inactive."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # -----------------------------------------
        # Verify password
        # -----------------------------------------

        if not user.check_password(password):
            return Response(
                {
                    "detail": "Invalid email or password."
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # -----------------------------------------
        # Generate JWT tokens
        # -----------------------------------------

        refresh = RefreshToken.for_user(user)

        # -----------------------------------------
        # Make sure settings exist
        # -----------------------------------------

        UserSettings.objects.get_or_create(
            user=user
        )

        # -----------------------------------------
        # Return authenticated user
        # -----------------------------------------

        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),

                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                    "department": user.department,
                    "status": user.status,
                },

                "message": "Login successful.",
            },
            status=status.HTTP_200_OK,
        )


# =========================================================
# CURRENT USER
# =========================================================

class CurrentUserView(generics.RetrieveAPIView):
    """
    Return the currently authenticated user.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# =========================================================
# USER LIST
# =========================================================

class UserListView(generics.ListAPIView):
    """
    Return users for the FlowGuard Users page.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        queryset = User.objects.all().order_by("id")

        search = self.request.query_params.get("search")
        role = self.request.query_params.get("role")

        if search:
            queryset = queryset.filter(
                first_name__icontains=search
            ) | queryset.filter(
                last_name__icontains=search
            ) | queryset.filter(
                email__icontains=search
            ) | queryset.filter(
                username__icontains=search
            )

        if role and role.upper() != "ALL":
            queryset = queryset.filter(
                role=role.upper()
            )

        return queryset


# =========================================================
# USER DETAIL
# =========================================================

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update a FlowGuard user.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


# =========================================================
# USER VIEWSET
# =========================================================

class UserViewSet(viewsets.ModelViewSet):
    """
    FlowGuard user management ViewSet.
    """

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.all().order_by("id")


# =========================================================
# USER SETTINGS
# =========================================================

class UserSettingsView(APIView):
    """
    Get and update settings for the currently
    authenticated FlowGuard user.

    GET:
        Return current user's settings.

    PATCH:
        Update selected settings.
    """

    permission_classes = [IsAuthenticated]

    def get_settings(self, user):
        settings, created = UserSettings.objects.get_or_create(
            user=user
        )

        return settings

    # -----------------------------------------------------
    # GET SETTINGS
    # -----------------------------------------------------

    def get(self, request):

        settings = self.get_settings(
            request.user
        )

        serializer = UserSettingsSerializer(
            settings
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # -----------------------------------------------------
    # UPDATE SETTINGS
    # -----------------------------------------------------

    def patch(self, request):

        settings = self.get_settings(
            request.user
        )

        serializer = UserSettingsSerializer(
            settings,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )