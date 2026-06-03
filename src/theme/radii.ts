/**
 * Border radius tokens. CRED-style rounded corners (xl/2xl on cards).
 */
export const radii = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  full: 9999,
} as const;

export type RadiusKey = keyof typeof radii;
