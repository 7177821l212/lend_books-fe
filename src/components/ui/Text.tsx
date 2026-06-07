/**
 * Text — typed variant prop. Always use this instead of raw <Text>.
 */
import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';

import { useColors, textVariants, type TextVariantKey } from '@/theme';

type ColorKey = 'primary' | 'secondary' | 'tertiary' | 'onBrand' | 'onDark' | 'placeholder' | 'disabled';

interface TextProps extends RNTextProps {
  variant?: TextVariantKey;
  color?: ColorKey | string;
  align?: TextStyle['textAlign'];
  weight?: '400' | '500' | '600' | '700' | '800';
  numberOfLines?: number;
}

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  weight,
  style,
  children,
  ...rest
}: TextProps) {
  const colors = useColors();
  const resolvedColor =
    (colors.text as Record<string, string>)[color] ?? color;

  const composed: StyleProp<TextStyle> = [
    textVariants[variant] as TextStyle,
    { color: resolvedColor, textAlign: align },
    weight ? { fontWeight: weight } : null,
    style,
  ];

  return (
    <RNText style={composed} {...rest}>
      {children}
    </RNText>
  );
}
