/**
 * Auth API endpoints — typed wrappers over apiClient.
 */
import { apiClient, publicApiClient } from '@/lib/api';
import type { User } from '@/types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

export const authApi = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    const { data } = await publicApiClient.post<TokenResponse>('/auth/login', payload);
    return data;
  },
  async refresh(refreshToken: string): Promise<TokenResponse> {
    const { data } = await apiClient.post<TokenResponse>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data;
  },
  async me(): Promise<User> {
    const { data } = await apiClient.get<User>('/auth/me');
    return data;
  },

  async changePassword(payload: { current_password: string; new_password: string }): Promise<void> {
    await apiClient.post('/auth/change-password', payload);
  },
};
