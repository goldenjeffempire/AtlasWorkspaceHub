from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permission check for admin users
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'admin'


class IsEmployee(permissions.BasePermission):
    """
    Permission check for employee users
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'employee'


class IsLearner(permissions.BasePermission):
    """
    Permission check for learner users
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'learner'


class IsGeneral(permissions.BasePermission):
    """
    Permission check for general users
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'general'


class IsAdminOrSelf(permissions.BasePermission):
    """
    Permission check for admins or the user themselves
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        return request.user.role == 'admin' or obj.id == request.user.id