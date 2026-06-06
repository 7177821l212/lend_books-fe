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
