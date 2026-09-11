/**
 * Auth API endpoints — typed wrappers over apiClient.
 */
import { apiClient, getApiBaseUrl } from '@/lib/api';
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

async function readLoginResponse(response: Response): Promise<TokenResponse> {
  const body = await response.text().catch(() => '');
  let data: TokenResponse | { detail?: string } | undefined;
  try {
    data = JSON.parse(body) as TokenResponse | { detail?: string };
  } catch {
    // Use the status fallback below when a proxy returns a non-JSON response.
  }

  if (!response.ok) {
    const detail = data && 'detail' in data ? data.detail : undefined;
    throw new Error(detail || `Login failed (${response.status})`);
  }
  if (!data || !('access_token' in data) || !('refresh_token' in data)) {
    throw new Error('Login response was invalid. Please try again.');
  }
  return data;
}

export const authApi = {
  async login(payload: LoginPayload): Promise<TokenResponse> {
    let response: Response;
    try {
      // Native fetch is the same Android transport used by the working photo
      // and document uploads, avoiding intermittent Axios connection failures.
      response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('Cannot reach LendBook. Check your internet connection and try again.');
    }
    return readLoginResponse(response);
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
