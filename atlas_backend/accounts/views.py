from rest_framework import status, generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Role
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    LoginSerializer, 
    UserProfileSerializer,
    RoleSerializer,
    UserRoleUpdateSerializer
)
from .permissions import IsAdmin, IsAdminOrSelf

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
        
        response = Response(response_data, status=status.HTTP_201_CREATED)
        response.set_cookie(
            key='jwt',
            value=str(refresh.access_token),
            httponly=True,
            samesite='Lax'
        )
        
        return response

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password']
        )
        
        if user is None:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
        
        response = Response(response_data)
        response.set_cookie(
            key='jwt',
            value=str(refresh.access_token),
            httponly=True,
            samesite='Lax'
        )
        
        return response

class LogoutView(APIView):
    def post(self, request):
        response = Response(status=status.HTTP_200_OK)
        response.delete_cookie('jwt')
        return response

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrSelf]
    
    def get_object(self):
        return self.request.user
    
    def get(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response(serializer.data)
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

class UserRoleUpdateView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRoleUpdateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
