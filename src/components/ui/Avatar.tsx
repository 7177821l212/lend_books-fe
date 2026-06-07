/**
 * Avatar — shows photo if provided, falls back to deterministic-color initials.
 */
import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

import { Text } from './Text';
import { colors, radii } from '@/theme';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  name: string;
  id?: string;
  size?: Size;
  imageUrl?: string | null;
  ring?: 'success' | 'warning' | 'danger' | 'none';
  badge?: React.ReactNode;
  bgColor?: string;
  style?: ViewStyle;
}

const SIZE: Record<Size, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
  '2xl': 72,
};
const FONT: Record<Size, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  '2xl': 24,
};

const RING: Record<NonNullable<AvatarProps['ring']>, string> = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.danger,
  none: 'transparent',
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((x) => x[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function colorFromId(id: string): string {
  const code = (id.charCodeAt(0) || 0) % colors.avatar.length;
  return colors.avatar[code];
}

export function Avatar({
  name,
  id,
  size = 'md',
  imageUrl,
  ring = 'none',
  badge,
  bgColor,
  style,
}: AvatarProps) {
  const dim = SIZE[size];
  const bg = bgColor ?? (id ? colorFromId(id) : colors.brand[600]);

  return (
    <View
      style={[
        {
          width: dim,
          height: dim,
          borderRadius: radii.full,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: ring !== 'none' ? 2 : 0,
          borderColor: RING[ring],
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: dim, height: dim, borderRadius: radii.full }}
          resizeMode="cover"
        />
      ) : (
        <Text style={{ color: colors.white, fontSize: FONT[size], fontWeight: '700' }}>
          {initials(name)}
        </Text>
      )}
      {badge ? <View style={styles.badge}>{badge}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
});
