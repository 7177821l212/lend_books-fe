import { palette, colors as lightColors } from './colors';

export const darkColors = {
  ...lightColors,
  background: '#111418',
  card: '#1C2128',
  scrim: 'rgba(0,0,0,0.75)',
  text: {
    primary: '#E6EDF3',
    secondary: '#8B949E',
    tertiary: '#6E7681',
    onBrand: palette.white,
    // Same dark green as light mode: it sits on the vivid brand fill, which is
    // the same colour in both themes.
    onBrandFill: lightColors.text.onBrandFill,
    onDark: palette.white,
    placeholder: '#6E7681',
    disabled: '#484F58',
  },
  border: {
    default: '#30363D',
    strong: '#484F58',
    subtle: '#21262D',
    focus: palette.brand600,
  },
  // The brand ramp is used in PAIRS: 50/100 are selected-state backgrounds and
  // 800/900 are the foregrounds that sit on them. Inheriting the light values
  // here left a near-white tint (#E8F8EE) behind near-white dark-mode text —
  // 1.07:1, i.e. invisible — and made every selected chip glare. Dark mode
  // swaps the pair's roles: the tint goes dark, the on-tint ink goes light.
  // 200/400/600/700 are unchanged: they are accents on normal surfaces, and 200
  // in particular is a light foreground on the dark hero gradients.
  brand: {
    ...lightColors.brand,
    50: '#173A28',
    100: '#1E4A33',
    800: '#95E1AC',
    900: '#7BE0A3',
  },
  // Semantic ink goes the other way in dark mode: the light palette's inks are
  // deliberately dark (to read on white), which leaves them almost invisible on
  // a #1C2128 card. The Soft fills behind them darken to match — otherwise a
  // light ink would land on a near-white chip.
  success: '#4ADE80',
  successSoft: '#0E2A19',
  warning: '#FBBF24',
  warningSoft: '#33260A',
  danger: '#F87171',
  dangerSoft: '#3A1517',
  info: '#38BDF8',
  infoSoft: '#0C2A3A',
  // Fills are NOT lightened: they carry white text in both themes.
  successFill: lightColors.successFill,
  dangerFill: lightColors.dangerFill,
  slate: {
    ...lightColors.slate,
    0: '#1C2128',
    50: '#161B22',
    100: '#21262D',
    200: '#30363D',
    300: '#484F58',
    400: '#6E7681',
    500: '#8B949E',
    600: '#B1BAC4',
    700: '#C9D1D9',
    800: '#E6EDF3',
    900: '#F0F6FC',
  },
} as const;

export type DarkColors = typeof darkColors;
