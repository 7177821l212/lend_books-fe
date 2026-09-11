/**
 * AuthContext — single source of truth for auth state.
 * Wraps the app once; consume via useAuth().
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { SECURE_STORE_KEYS } from '@/config/constants';
import { setUnauthorizedHandler } from '@/lib/api';
import { startLocationReporting, stopLocationReporting } from '@/lib/locationTracking';
import { tokenStorage } from '@/lib/tokenStorage';
import type { User } from '@/types';
import { authApi, type LoginPayload } from '../api/authApi';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  updateProfilePhoto: (photoUrl: string) => Promise<void>;
}

type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    stopLocationReporting();
    await tokenStorage.deleteItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
    await tokenStorage.deleteItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void logout();
    });
  }, [logout]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await tokenStorage.getItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
        if (!token) {
          if (!cancelled) setIsLoading(false);
          return;
        }
        const me = await authApi.me();
        if (!cancelled) setUser(me);
      } catch {
        await tokenStorage.deleteItem(SECURE_STORE_KEYS.ACCESS_TOKEN);
        await tokenStorage.deleteItem(SECURE_STORE_KEYS.REFRESH_TOKEN);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Live location: only while a collector is signed in and the app is open.
  useEffect(() => {
    if (user?.role === 'collector') {
      void startLocationReporting();
    } else {
      stopLocationReporting();
    }
    return () => stopLocationReporting();
  }, [user?.role]);

  const login = useCallback(async (payload: LoginPayload) => {
    // Login must not depend on a previous device session. A stale SecureStore
    // entry used to block the request before it left Android.
    await Promise.allSettled([
      tokenStorage.deleteItem(SECURE_STORE_KEYS.ACCESS_TOKEN),
      tokenStorage.deleteItem(SECURE_STORE_KEYS.REFRESH_TOKEN),
    ]);
    const tokens = await authApi.login(payload);
    try {
      await tokenStorage.setItem(SECURE_STORE_KEYS.ACCESS_TOKEN, tokens.access_token);
      await tokenStorage.setItem(SECURE_STORE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
      const me = await authApi.me();
      setUser(me);
    } catch (error) {
      // Never leave a partially-written or stale session behind after login.
      await Promise.allSettled([
        tokenStorage.deleteItem(SECURE_STORE_KEYS.ACCESS_TOKEN),
        tokenStorage.deleteItem(SECURE_STORE_KEYS.REFRESH_TOKEN),
      ]);
      throw error;
    }
  }, []);

  const updateProfilePhoto = useCallback(async (photoUrl: string) => {
    const updatedUser = await authApi.updateMyProfilePhoto(photoUrl);
    setUser(updatedUser);
  }, []);

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      updateProfilePhoto,
    }),
    [user, isLoading, login, logout, updateProfilePhoto]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
