/**
 * KPICard — colored gradient tile for dashboard KPIs.
 */
import { View, type ViewStyle } from 'react-native';

import { GradientBackground } from './GradientBackground';
import { Text } from './Text';
import { colors, radii, spacing, shadows } from '@/theme';

type GradientKey = keyof typeof colors.gradients;

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  gradient?: GradientKey;
  style?: ViewStyle;
}

export function KPICard({
  label,
  value,
  sub,
  icon,
  gradient = 'brand',
  style,
}: KPICardProps) {
  return (
    <GradientBackground
      gradient={gradient}
      style={{
        flex: 1,
        padding: spacing[4],
        borderRadius: radii['2xl'],
        minHeight: 96,
        justifyContent: 'space-between',
        ...shadows.sm,
        ...style,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {icon ? <View>{icon}</View> : <View />}
      </View>
      <View style={{ marginTop: spacing[3] }}>
        <Text variant="h2" color="onDark">
          {String(value)}
        </Text>
        <Text variant="caption" color="onDark" style={{ opacity: 0.85, marginTop: 2 }}>
          {label}
          {sub ? ` · ${sub}` : ''}
        </Text>
      </View>
    </GradientBackground>
  );
}
