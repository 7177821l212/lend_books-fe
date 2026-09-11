import { useState } from 'react';

import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string): Promise<void> {
    setIsLoading(true);
    setError(null);
    try {
      await login({ email, password });
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
            'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, error };
}
