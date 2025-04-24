from rest_framework import serializers
from .models import User, Role

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'date_joined', 
                  'phone', 'department', 'profile_image', 'email_notifications', 
                  'push_notifications')
        read_only_fields = ('id', 'date_joined')

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone', 'department', 
                  'profile_image', 'email_notifications', 'push_notifications')
        read_only_fields = ('id', 'email')

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirmation = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ('email', 'password', 'password_confirmation', 'first_name', 'last_name', 'role')
    
    def validate(self, data):
        if data['password'] != data['password_confirmation']:
            raise serializers.ValidationError({"password": "Password fields don't match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirmation')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role']
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')

class UserRoleUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'role')
        read_only_fields = ('id',)
