/**
 * Centralised API client with auto-refresh of access tokens on 401.
 *
 * Single in-flight refresh + retry queue: while one refresh is happening,
 * other 401 responses wait for it, then retry with the new access token.
 */
import axios, {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { SECURE_STORE_KEYS } from '@/config/constants';
import { tokenStorage } from '@/lib/tokenStorage';

const configuredApiUrl = (Constants.expoConfig?.extra as { apiUrl?: string | null } | undefined)
  ?.apiUrl;

function resolveBaseUrl(): string {
  if (configuredApiUrl) return configuredApiUrl;

  // In production, refuse to silently fall back — devices cannot reach localhost
  // and a misconfigured build should fail loudly so it's caught before shipping.
  if (!__DEV__) {
    throw new Error(
      'API_URL is not configured. Set the `API_URL` env var when building (e.g. ' +
        '`API_URL=https://api.example.com/api/v1`).'
    );
  }

  // Dev fallback — only safe in the iOS simulator, which shares the Mac's loopback.
  const fallback = 'http://localhost:8000/api/v1';
  if (Platform.OS === 'android') {
    // eslint-disable-next-line no-console
    console.warn(
      '[api] Falling back to localhost; on the Android emulator use `API_URL=http://10.0.2.2:8000/api/v1`. ' +
        'On a physical device set your Mac\'s LAN IP.'
    );
  }
  return fallback;
}

const BASE_URL: string = resolveBaseUrl();

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Hook the auth store sets these so api.ts has no React dependency
let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void): void {
  onUnauthorized = fn;
}

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await tokenStorage.getItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh-aware response interceptor
let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const refreshToken = await tokenStorage.getItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) return null;
      const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });
      const access = res.data?.access_token as string | undefined;
      const refresh = res.data?.refresh_token as string | undefined;
      if (!access) return null;
      await tokenStorage.setItem(SECURE_STORE_KEYS.ACCESS_TOKEN, access);
      if (refresh) await tokenStorage.setItem(SECURE_STORE_KEYS.REFRESH_TOKEN, refresh);
      return access;
    } catch {
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retried?: boolean }) | undefined;
    if (!original || error.response?.status !== 401 || original._retried) {
      return Promise.reject(error);
    }
    original._retried = true;
    const newToken = await refreshAccessToken();
    if (!newToken) {
      await tokenStorage.deleteItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
      await tokenStorage.deleteItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
      onUnauthorized?.();
      return Promise.reject(error);
    }
    original.headers = { ...(original.headers ?? {}), Authorization: `Bearer ${newToken}` };
    return apiClient.request(original);
  }
);
