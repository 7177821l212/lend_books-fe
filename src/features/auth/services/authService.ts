import { apiClient } from '@/lib/api';
import type { User } from '@/types';

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<{ access_token: string; refresh_token: string }>('/auth/login', {
      email,
      password,
    }),

  refresh: (refresh_token: string) =>
    apiClient.post<{ access_token: string; refresh_token: string }>('/auth/refresh', {
      refresh_token,
    }),

  me: () => apiClient.get<User>('/auth/me'),
};
