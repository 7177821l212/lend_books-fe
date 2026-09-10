/**
 * GradientBackground — thin wrapper around expo-linear-gradient
 * that consumes theme.colors.gradients keys.
 */
import { LinearGradient } from 'expo-linear-gradient';
import { type ViewProps, type ViewStyle } from 'react-native';

import { colors as lightColors, useColors } from '@/theme';

type GradientKey = keyof typeof lightColors.gradients;

interface GradientBackgroundProps extends ViewProps {
  gradient?: GradientKey;
  colorsOverride?: readonly string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
  style?: ViewStyle;
}

export function GradientBackground({
  gradient = 'brand',
  colorsOverride,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
  style,
  ...rest
}: GradientBackgroundProps) {
  const colors = useColors();
  const stops = colorsOverride ?? colors.gradients[gradient];
  return (
    <LinearGradient
      colors={stops as unknown as [string, string, ...string[]]}
      start={start}
      end={end}
      style={style}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}
