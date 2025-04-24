import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getCookie } from 'cookies-next';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

// Request interceptor to add JWT token from cookies
api.interceptors.request.use((config) => {
  // JWT is handled by httpOnly cookies automatically
  config.credentials = 'include';
  
  return config;
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Client-side navigation (in browser)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Type for API responses
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// API wrapper functions with better typing
export const apiService = {
  // GET request
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.get(url, config);
    return response.data;
  },
  
  // POST request
  post: async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.post(url, data, config);
    return response.data;
  },
  
  // PUT request
  put: async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.put(url, data, config);
    return response.data;
  },
  
  // PATCH request
  patch: async <T, D = any>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.patch(url, data, config);
    return response.data;
  },
  
  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response: AxiosResponse<T> = await api.delete(url, config);
    return response.data;
  },
};

// API endpoints
export const endpoints = {
  // Auth endpoints
  auth: {
    login: '/accounts/login/',
    register: '/accounts/register/',
    logout: '/accounts/logout/',
    profile: '/accounts/profile/',
  },
  
  // User endpoints
  users: {
    list: '/accounts/users/',
    detail: (id: number) => `/accounts/users/${id}/`,
    updateRole: (id: number) => `/accounts/users/${id}/role/`,
  },
  
  // Role endpoints
  roles: {
    list: '/accounts/roles/',
    detail: (id: number) => `/accounts/roles/${id}/`,
  },
  
  // Workspace endpoints
  workspaces: {
    list: '/bookings/workspaces/',
    detail: (id: number) => `/bookings/workspaces/${id}/`,
    types: '/bookings/workspace-types/',
    available: '/bookings/workspaces/available/',
  },
  
  // Booking endpoints
  bookings: {
    list: '/bookings/bookings/',
    detail: (id: number) => `/bookings/bookings/${id}/`,
    mine: '/bookings/bookings/mine/',
    cancel: (id: number) => `/bookings/bookings/${id}/cancel/`,
  },
  
  // Analytics endpoints
  analytics: {
    dashboard: '/analytics/dashboard/',
    occupancyRate: '/analytics/occupancy-rate/',
    peakHours: '/analytics/peak-hours/',
    workspaceUtilization: '/analytics/workspace-utilization/',
    bookingsByUserType: '/analytics/bookings-by-user-type/',
  },
};

export default api;
