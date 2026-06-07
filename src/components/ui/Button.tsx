/**
 * Button — primary / secondary / outline / ghost / danger.
 * Sizes sm/md/lg. Loading + disabled states. Optional leading/trailing icons.
 * Haptic feedback on press + scale spring animation.
 */
import { type ComponentProps, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from './Text';
import { useColors, radii, spacing, shadows, haptic, spring } from '@/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  label: string;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  hapticFeedback?: 'light' | 'medium' | 'selection' | 'success' | 'none';
  style?: ViewStyle | ViewStyle[];
}

const HEIGHT: Record<Size, number> = { sm: 40, md: 48, lg: 56 };
const PAD_X: Record<Size, number> = { sm: spacing[3], md: spacing[5], lg: spacing[6] };
const RADII: Record<Size, number> = { sm: radii.md, md: radii.lg, lg: radii.xl };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  loading = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  hapticFeedback = 'light',
  onPress,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const colors = useColors();

  const VARIANT_BG: Record<Variant, string> = {
    primary: colors.brand[600],
    secondary: colors.slate[200],
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.danger,
  };
  const VARIANT_LABEL: Record<Variant, ComponentProps<typeof Text>['color']> = {
    primary: 'onBrand',
    secondary: 'primary',
    outline: 'primary',
    ghost: 'primary',
    danger: 'onDark',
  };
  const VARIANT_BORDER: Partial<Record<Variant, string>> = {
    outline: colors.brand[600],
  };

  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, spring.snap);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, spring.snap);
  }, [scale]);

  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (loading || disabled) return;
      if (hapticFeedback !== 'none') haptic[hapticFeedback]();
      onPress?.(e);
    },
    [loading, disabled, hapticFeedback, onPress]
  );

  const isDisabled = disabled || loading;
  const labelColor = VARIANT_LABEL[variant];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        {
          height: HEIGHT[size],
          paddingHorizontal: PAD_X[size],
          borderRadius: RADII[size],
          backgroundColor: VARIANT_BG[variant],
          borderWidth: VARIANT_BORDER[variant] ? 1.5 : 0,
          borderColor: VARIANT_BORDER[variant],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        variant === 'primary' && shadows.glowBrand,
        isDisabled && styles.disabled,
        animStyle,
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.brand[700]} />
      ) : (
        <>
          {leadingIcon}
          <Text
            variant={size === 'sm' ? 'label' : 'bodyStrong'}
            color={labelColor}
            style={{ marginHorizontal: leadingIcon || trailingIcon ? spacing[1.5] : 0 }}
          >
            {label}
          </Text>
          {trailingIcon}
        </>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
});
