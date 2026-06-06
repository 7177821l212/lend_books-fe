/**
 * Cross-platform shadows (iOS + Android parity).
 */
import { Platform, ViewStyle } from 'react-native';

const make = (
  offsetY: number,
  radius: number,
  opacity: number,
  elevation: number
): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#0E1014',
      shadowOffset: { width: 0, height: offsetY },
      shadowOpacity: opacity,
      shadowRadius: radius,
    },
    android: {
      elevation,
    },
    default: {},
  }) ?? {};

export const shadows = {
  none: {} as ViewStyle,
  xs: make(1, 2, 0.04, 1),
  sm: make(2, 4, 0.06, 2),
  md: make(4, 8, 0.08, 4),
  lg: make(8, 16, 0.10, 8),
  xl: make(12, 24, 0.14, 12),
  glowBrand: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#00C853',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
    },
    android: { elevation: 12 },
    default: {},
  }) ?? {},
  glowDanger: Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    android: { elevation: 10 },
    default: {},
  }) ?? {},
} as const;

export type ShadowKey = keyof typeof shadows;
