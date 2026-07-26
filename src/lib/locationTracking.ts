/**
 * Foreground-only live location reporting for collectors.
 *
 * Pings the backend with the device's current position on an interval while
 * the app is open and active. No background location, no persistent
 * notification — JS timers naturally pause when the app backgrounds, which
 * is exactly the "only while using the app" behavior we want. Any failure
 * (permission denied, GPS unavailable, network error) is swallowed — this is
 * a supplementary feature and must never interrupt the collector's actual work.
 */
import * as Location from 'expo-location';

import { collectorApi } from '@/features/collectors/api/collectorApi';

const REPORT_INTERVAL_MS = 90_000;

let intervalId: ReturnType<typeof setInterval> | null = null;

async function pingOnce(): Promise<void> {
  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    await collectorApi.reportLocation({
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: pos.coords.accuracy ?? undefined,
      recorded_at: new Date(pos.timestamp).toISOString(),
    });
  } catch {
    // Silent — permission not granted, GPS off, or a transient network blip.
    // Location sharing is supplementary; never surface this to the collector.
  }
}

/** Starts periodic location reporting. Safe to call multiple times — no-ops if already running. */
export async function startLocationReporting(): Promise<void> {
  if (intervalId) return;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return;

  void pingOnce();
  intervalId = setInterval(() => void pingOnce(), REPORT_INTERVAL_MS);
}

export function stopLocationReporting(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
