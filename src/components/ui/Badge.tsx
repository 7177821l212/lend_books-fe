/**
 * Badge — status pill. Use `tone` for semantic colour, optional dot indicator.
 */
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { useColors, radii, spacing } from '@/theme';

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  label: string;
  tone?: Tone;
  size?: 'sm' | 'md';
  withDot?: boolean;
  uppercase?: boolean;
  style?: ViewStyle;
}

export function Badge({
  label,
  tone = 'neutral',
  size = 'sm',
  withDot = false,
  uppercase = true,
  style,
}: BadgeProps) {
  const colors = useColors();

  const TONE_BG: Record<Tone, string> = {
    success: colors.successSoft,
    warning: colors.warningSoft,
    danger: colors.dangerSoft,
    info: colors.infoSoft,
    neutral: colors.slate[100],
    brand: colors.brand[50],
  };

  const TONE_FG: Record<Tone, string> = {
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    info: colors.info,
    neutral: colors.slate[600],
    brand: colors.brand[700],
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: TONE_BG[tone],
          paddingHorizontal: size === 'sm' ? spacing[2] : spacing[2.5],
          paddingVertical: size === 'sm' ? 2 : 4,
        },
        style,
      ]}
    >
      {withDot && <View style={[styles.dot, { backgroundColor: TONE_FG[tone] }]} />}
      <Text
        variant="caption"
        color={TONE_FG[tone]}
        style={{ fontSize: size === 'sm' ? 10 : 11 }}
      >
        {uppercase ? label.toUpperCase() : label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
});
