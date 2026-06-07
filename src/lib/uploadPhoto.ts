/**
 * Uploads a local file:// URI to the backend and returns the hosted URL.
 * If the URI is already an http(s) URL it is returned as-is (already uploaded).
 */
import { tokenStorage } from '@/lib/tokenStorage';
import { SECURE_STORE_KEYS } from '@/config/constants';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

function resolveServerRoot(): string {
  const apiUrl = (Constants.expoConfig?.extra as { apiUrl?: string | null } | undefined)?.apiUrl;
  if (apiUrl) return apiUrl.replace(/\/api\/v1\/?$/, '');
  if (!__DEV__) throw new Error('API_URL not configured');
  return 'http://localhost:8000';
}

const SERVER_ROOT = resolveServerRoot();

export async function uploadPhoto(localUri: string): Promise<string> {
  if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
    return localUri;
  }

  const token = await tokenStorage.getItem(SECURE_STORE_KEYS.ACCESS_TOKEN);

  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const type = mimeMap[ext] ?? 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri: localUri, name: filename, type } as unknown as Blob);

  const res = await fetch(`${SERVER_ROOT}/api/v1/upload/photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token ?? ''}`,
      Accept: 'application/json',
    },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Photo upload failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { url: string };
  return json.url;
}
