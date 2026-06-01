import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function useLogin() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(email: string, password: string) {
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Login failed. Check your credentials.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return { submit, isLoading, error };
}
