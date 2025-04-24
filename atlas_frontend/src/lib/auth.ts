import { jwtDecode } from 'jwt-decode';
import { getCookie } from 'cookies-next';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'employee' | 'learner' | 'general';
  phone?: string;
  department?: string;
  profile_image?: string;
  email_notifications: boolean;
  push_notifications: boolean;
}

export interface TokenPayload {
  user_id: number;
  exp: number;
  role: string;
}

// Get user from JWT in cookie
export const getUserFromCookie = (): User | null => {
  try {
    const token = getCookie('jwt');
    
    if (!token) {
      return null;
    }
    
    const decoded = jwtDecode<TokenPayload>(token.toString());
    
    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime) {
      return null;
    }
    
    // In a real app, you'd have more user info in the token or fetch from API
    // This is a placeholder until we fetch the actual user details
    return {
      id: decoded.user_id,
      email: '',
      first_name: '',
      last_name: '',
      role: decoded.role as User['role'],
      email_notifications: true,
      push_notifications: true
    };
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getUserFromCookie();
};

// Get role of current user
export const getUserRole = (): string | null => {
  const user = getUserFromCookie();
  return user ? user.role : null;
};

// Check if user has specified role
export const hasRole = (roles: string | string[]): boolean => {
  const userRole = getUserRole();
  
  if (!userRole) {
    return false;
  }
  
  if (Array.isArray(roles)) {
    return roles.includes(userRole);
  }
  
  return userRole === roles;
};

// Get dashboard redirect path based on user role
export const getDashboardPath = (role?: string): string => {
  const userRole = role || getUserRole();
  
  switch (userRole) {
    case 'admin':
      return '/dashboard/admin';
    case 'employee':
      return '/dashboard/employee';
    case 'learner':
      return '/dashboard/learner';
    case 'general':
      return '/dashboard/general';
    default:
      return '/login';
  }
};
