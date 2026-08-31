import { apiClient } from './axios';
import {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  ProfileFormData,
} from './validations/auth';
import { UserRole } from '@/types/auth';

export interface BackendAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface BackendUserProfileResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  department?: string;
}

export const authService = {
  async login(data: LoginFormData): Promise<BackendAuthResponse> {
    // Accepts email or username
    const payload = data.email.includes('@')
      ? { email: data.email, password: data.password }
      : { username: data.email, password: data.password };

    const response = await apiClient.post<BackendAuthResponse>('/api/v1/auth/login', payload);
    return response.data;
  },

  async register(data: RegisterFormData): Promise<BackendAuthResponse> {
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    };

    const response = await apiClient.post<BackendAuthResponse>('/api/v1/auth/register', payload);
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<BackendAuthResponse> {
    const response = await apiClient.post<BackendAuthResponse>('/api/v1/auth/refresh-token', {
      refreshToken,
    });
    return response.data;
  },

  async requestPasswordReset(data: ForgotPasswordFormData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/password-reset', {
      email: data.email,
    });
    return response.data;
  },

  async confirmPasswordReset(data: ResetPasswordFormData): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/api/v1/auth/password-reset/confirm', {
      token: data.token,
      newPassword: data.password,
    });
    return response.data;
  },

  async getCurrentUser(): Promise<BackendUserProfileResponse> {
    const response = await apiClient.get<BackendUserProfileResponse>('/api/v1/auth/me');
    return response.data;
  },

  async updateProfile(data: ProfileFormData): Promise<BackendUserProfileResponse> {
    const response = await apiClient.put<BackendUserProfileResponse>('/api/v1/users/profile', data);
    return response.data;
  },
};
