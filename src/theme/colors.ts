/**
 * Color tokens — CRED-style money-positive green palette.
 * NEVER hardcode colors in components. Always import from theme.
 */

export const palette = {
  // Brand — vibrant green
  brand50: '#E8F8EE',
  brand100: '#C7EFD3',
  brand200: '#95E1AC',
  brand400: '#3FB875',
  brand500: '#1FA463',
  brand600: '#00C853', //  primary
  brand700: '#00A848',
  brand800: '#007A35',
  brand900: '#00471F',

  // Neutrals
  slate0: '#FFFFFF',
  slate50: '#F8FAF9',
  slate100: '#F1F4F2',
  slate200: '#E2E7E4',
  slate300: '#CBD1CD',
  slate400: '#9BA29E',
  slate500: '#6B736F',
  slate600: '#4E5552',
  slate700: '#373D3B',
  slate800: '#22262A',
  slate900: '#0E1014',

  // Semantic INK — drawn as text/icons on a light surface or its Soft fill.
  // Darkened from the original tints: amber #F59E0B read at 2.15:1 on a white
  // card and 1.93:1 inside its own badge, i.e. below every legibility bar.
  success: '#15803D',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#B91C1C',
  dangerSoft: '#FEE2E2',
  info: '#0369A1',
  infoSoft: '#E0F2FE',

  // Semantic FILL — a solid block carrying WHITE text. Kept dark in BOTH themes
  // because white is white in both, so these never follow the ink lighter.
  successFill: '#15803D',
  dangerFill: '#B91C1C',

  // Accents
  amber: '#F59E0B',
  rose: '#F43F5E',
  violet: '#8B5CF6',
  sky: '#0EA5E9',
  teal: '#14B8A6',

  // Special
  black: '#000000',
  white: '#FFFFFF',
  transparent: 'transparent',
} as const;

export const colors = {
  white: palette.white,
  black: palette.black,
  transparent: palette.transparent,
  brand: {
    50: palette.brand50,
    100: palette.brand100,
    200: palette.brand200,
    400: palette.brand400,
    500: palette.brand500,
    600: palette.brand600,
    700: palette.brand700,
    800: palette.brand800,
    900: palette.brand900,
  },
  slate: {
    0: palette.slate0,
    50: palette.slate50,
    100: palette.slate100,
    200: palette.slate200,
    300: palette.slate300,
    400: palette.slate400,
    500: palette.slate500,
    600: palette.slate600,
    700: palette.slate700,
    800: palette.slate800,
    900: palette.slate900,
  },

  // Surface
  background: palette.slate50,
  card: palette.white,
  scrim: 'rgba(14, 16, 20, 0.5)',

  // Text
  text: {
    primary: palette.slate900,
    secondary: palette.slate500,
    tertiary: palette.slate400,
    onBrand: palette.white,
    // Ink for the VIVID brand fill (#00C853). White on that green is 2.24:1, so
    // primary buttons and active chips use this dark green instead (4.89:1).
    // Theme-invariant: the fill it sits on is the same colour in both themes.
    onBrandFill: palette.brand900,
    onDark: palette.white,
    placeholder: palette.slate400,
    disabled: palette.slate300,
  },

  // Borders / dividers
  border: {
    default: palette.slate200,
    strong: palette.slate300,
    subtle: palette.slate100,
    focus: palette.brand600,
  },

  // Semantic
  success: palette.success,
  successSoft: palette.successSoft,
  warning: palette.warning,
  warningSoft: palette.warningSoft,
  danger: palette.danger,
  dangerSoft: palette.dangerSoft,
  info: palette.info,
  infoSoft: palette.infoSoft,
  successFill: palette.successFill,
  dangerFill: palette.dangerFill,

  // Gradients (consumed via expo-linear-gradient)
  gradients: {
    brand: ['#00E676', '#00C853', '#00A848'] as const,
    hero: ['#0E1014', '#10241A', '#003E1A'] as const,
    success: ['#22C55E', '#16A34A'] as const,
    danger: ['#F43F5E', '#DC2626'] as const,
    sunset: ['#F59E0B', '#F97316'] as const,
    cool: ['#06B6D4', '#0EA5E9'] as const,
  },

  // Avatar background palette (deterministic by id)
  avatar: [
    '#1FA463',
    '#F59E0B',
    '#0EA5E9',
    '#8B5CF6',
    '#F43F5E',
    '#14B8A6',
    '#F97316',
    '#6366F1',
  ] as const,

  // Status mapping
  status: {
    active: palette.success,
    overdue: palette.warning,
    blacklisted: palette.danger,
    closed: palette.slate500,
    paid: palette.success,
    pending: palette.slate500,
    due_today: palette.info,
    partial: palette.warning,
    missed: palette.danger,
  },

  // Risk mapping
  risk: {
    low: palette.success,
    medium: palette.warning,
    high: palette.danger,
  },
} as const;

export type Colors = typeof colors;
