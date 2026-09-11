import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

/** Returns true if the string is a GCS object path (not a full URL). */
export function isGcsObject(url: string | null | undefined): boolean {
  if (!url) return false;
  return !/^[a-z][a-z0-9+.-]*:\/\//i.test(url);
}

/**
 * Fetches and caches a signed URL for a private GCS object.
 * Caches for 55 minutes (URLs are valid for 1 hour).
 * Pass null/undefined to disable — returns undefined.
 */
export function useSignedUrl(objectName: string | null | undefined): string | undefined {
  const enabled = isGcsObject(objectName);

  const { data } = useQuery({
    queryKey: ['signed-url', objectName],
    queryFn: async () => {
      const res = await apiClient.get<{ signed_url: string }>('/upload/signed-url', {
        params: { object_name: objectName },
      });
      return res.data.signed_url;
    },
    enabled,
    staleTime: 55 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });

  return enabled ? data : (objectName ?? undefined);
}
