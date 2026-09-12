/**
 * Typography tokens — Inter via @expo-google-fonts/inter.
 * Use FONT.weight / FONT.size constants, never inline.
 */
import { Platform, TextStyle } from 'react-native';

export const fontFamily = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
} as const;

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 40,
} as const;

export const lineHeight = {
  xs: 14,
  sm: 16,
  base: 20,
  md: 22,
  lg: 24,
  xl: 26,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
  '5xl': 40,
  '6xl': 48,
} as const;

export const letterSpacing = {
  tightest: 0,
  tight: 0,
  normal: 0,
  wide: 0,
  wider: 0,
  widest: 0,
} as const;

type TextVariant = TextStyle;

export const textVariants = {
  display: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['5xl'],
    lineHeight: lineHeight['5xl'],
    letterSpacing: letterSpacing.tightest,
  },
  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize['3xl'],
    lineHeight: lineHeight['3xl'],
    letterSpacing: letterSpacing.tight,
  },
  h2: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize['2xl'],
    lineHeight: lineHeight['2xl'],
  },
  h3: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xl,
    lineHeight: lineHeight.xl,
  },
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.lg,
    lineHeight: lineHeight.lg,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  bodyStrong: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.base,
    lineHeight: lineHeight.base,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
  caption: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.wide,
  },
  overline: {
    fontFamily: fontFamily.semibold,
    fontSize: fontSize.xs,
    lineHeight: lineHeight.xs,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase',
  },
  mono: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
  },
} as const satisfies Record<string, TextVariant>;

export type TextVariantKey = keyof typeof textVariants;
