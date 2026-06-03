/**
 * Centralised theme — single source of truth for all visual design.
 *
 * USAGE:
 *   import { theme } from '@/theme';
 *   <View style={{ backgroundColor: theme.colors.brand[600], padding: theme.spacing[4] }} />
 *
 * DO NOT inline colors, sizes, font names. Always token-driven.
 */
export { colors, palette, type Colors } from './colors';
export {
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  textVariants,
  type TextVariantKey,
} from './typography';
export { spacing, layout, type SpacingKey } from './spacing';
export { radii, type RadiusKey } from './radii';
export { shadows, type ShadowKey } from './shadows';
export { duration, easing, spring } from './motion';
export { haptic } from './haptics';

// Convenience aggregate
import { colors } from './colors';
import { spacing, layout } from './spacing';
import { radii } from './radii';
import { shadows } from './shadows';
import { textVariants, fontFamily, fontSize, lineHeight } from './typography';
import { duration, easing, spring } from './motion';

export const theme = {
  colors,
  spacing,
  layout,
  radii,
  shadows,
  textVariants,
  fontFamily,
  fontSize,
  lineHeight,
  duration,
  easing,
  spring,
} as const;

export type Theme = typeof theme;
