/**
 * Centralised haptics — never call expo-haptics directly in components.
 * Falls back to no-op on web/unsupported platforms, and respects the user's
 * Settings > Haptics toggle (checked live via the store's non-hook getState,
 * since this is a plain module, not a component).
 */
import * as Haptics from 'expo-haptics';

import { useAppSettings } from '@/store/appSettings';

function enabled(): boolean {
  return useAppSettings.getState().hapticsEnabled;
}

export const haptic = {
  light: () =>
    enabled()
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
      : undefined,
  medium: () =>
    enabled()
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
      : undefined,
  heavy: () =>
    enabled()
      ? Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {})
      : undefined,
  selection: () => (enabled() ? Haptics.selectionAsync().catch(() => {}) : undefined),
  success: () =>
    enabled()
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {})
      : undefined,
  warning: () =>
    enabled()
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {})
      : undefined,
  error: () =>
    enabled()
      ? Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {})
      : undefined,
};
