/**
 * AmountText — renders INR amounts with consistent sizing.
 * Use `short` to compress large numbers (1.2L, 3.4Cr).
 */
import { View, type StyleProp, type TextStyle } from 'react-native';

import { Text } from './Text';
import { useColors, fontFamily } from '@/theme';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';

interface AmountTextProps {
  value: number;
  size?: Size;
  short?: boolean;
  symbol?: boolean;
  color?: string;
  bold?: boolean;
  style?: StyleProp<TextStyle>;
}

const SIZE_PX: Record<Size, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 36,
};

export function formatINR(amount: number, short = false): string {
  const v = amount ?? 0;
  if (short && Math.abs(v) >= 100000) {
    if (Math.abs(v) >= 10000000) return `${(v / 10000000).toFixed(1)}Cr`;
    return `${(v / 100000).toFixed(1)}L`;
  }
  return v.toLocaleString('en-IN');
}

export function AmountText({
  value,
  size = 'md',
  short = false,
  symbol = true,
  color,
  bold = true,
  style,
}: AmountTextProps) {
  const colors = useColors();
  const formatted = formatINR(value, short);
  const px = SIZE_PX[size];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', flexShrink: 1 }}>
      {symbol ? (
        <Text
          style={[
            {
              fontFamily: bold ? fontFamily.bold : fontFamily.regular,
              fontSize: px,
              lineHeight: Math.round(px * 1.15),
              includeFontPadding: false,
              fontVariant: ['tabular-nums'],
              color: color ?? colors.text.primary,
              marginRight: 1,
            },
            style,
          ]}
        >
          ₹
        </Text>
      ) : null}
      <Text
        style={[
          {
            fontFamily: bold ? fontFamily.bold : fontFamily.regular,
            fontSize: px,
            lineHeight: Math.round(px * 1.15),
            includeFontPadding: false,
            fontVariant: ['tabular-nums'],
            color: color ?? colors.text.primary,
            letterSpacing: 0,
          },
          style,
        ]}
      >
        {formatted}
      </Text>
    </View>
  );
}
