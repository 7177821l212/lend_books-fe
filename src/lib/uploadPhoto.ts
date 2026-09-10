/**
 * Uploads a local file:// URI to the backend.
 * Returns { objectName, signedUrl }:
 *   - objectName  → save this to the DB as photo_url (e.g. "photos/abc.jpg")
 *   - signedUrl   → use this for immediate display (valid 1 hour)
 *
 * If the URI is already an http(s) URL it is treated as an existing object name
 * and returned unchanged (backwards-compat for already-stored full URLs).
 */
import Constants from 'expo-constants';

import { SECURE_STORE_KEYS } from '@/config/constants';
import { tokenStorage } from '@/lib/tokenStorage';

function resolveServerRoot(): string {
  const apiUrl = (Constants.expoConfig?.extra as { apiUrl?: string | null } | undefined)?.apiUrl;
  if (apiUrl) return apiUrl.replace(/\/api\/v1\/?$/, '');
  if (!__DEV__) throw new Error('API_URL not configured');
  return 'http://localhost:8000';
}

const SERVER_ROOT = resolveServerRoot();

export interface UploadResult {
  objectName: string;
  signedUrl: string;
}

export async function uploadPhoto(localUri: string): Promise<UploadResult> {
  const token = await tokenStorage.getItem(SECURE_STORE_KEYS.ACCESS_TOKEN);

  const filename = localUri.split('/').pop() ?? 'photo.jpg';
  const ext = filename.split('.').pop()?.toLowerCase() ?? 'jpg';
  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp',
  };
  const type = mimeMap[ext] ?? 'image/jpeg';

  const formData = new FormData();
  formData.append('file', { uri: localUri, name: filename, type } as unknown as Blob);

  const res = await fetch(`${SERVER_ROOT}/api/v1/upload/photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}`, Accept: 'application/json' },
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Photo upload failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { object_name: string; signed_url: string };
  return { objectName: json.object_name, signedUrl: json.signed_url };
}
