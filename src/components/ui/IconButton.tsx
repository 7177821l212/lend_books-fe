/**
 * IconButton — round icon-only button. Haptic + scale press animation.
 */
import { useCallback } from 'react';
import { Pressable, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors, radii, haptic, spring, type Colors } from '@/theme';

type Size = 'sm' | 'md' | 'lg';
type Variant = 'solid' | 'soft' | 'ghost' | 'glass';

interface IconButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: React.ReactNode;
  variant?: Variant;
  size?: Size;
  tone?: 'brand' | 'danger' | 'neutral' | 'onDark';
  hapticFeedback?: 'light' | 'medium' | 'selection' | 'none';
  style?: ViewStyle | ViewStyle[];
}

const SIZE: Record<Size, number> = { sm: 32, md: 40, lg: 48 };

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BG = (variant: Variant, tone: NonNullable<IconButtonProps['tone']>, colors: Colors) => {
  if (variant === 'solid') {
    return tone === 'brand'
      ? colors.brand[600]
      : tone === 'danger'
      ? colors.danger
      : tone === 'onDark'
      ? colors.white
      : colors.card;
  }
  if (variant === 'soft') {
    return tone === 'brand'
      ? colors.brand[50]
      : tone === 'danger'
      ? colors.dangerSoft
      : colors.slate[100];
  }
  if (variant === 'glass') return 'rgba(255,255,255,0.15)';
  return 'transparent';
};

export function IconButton({
  icon,
  variant = 'soft',
  size = 'md',
  tone = 'neutral',
  hapticFeedback = 'light',
  onPress,
  disabled,
  style,
  ...rest
}: IconButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleIn = useCallback(() => {
    scale.value = withSpring(0.9, spring.snap);
  }, [scale]);
  const handleOut = useCallback(() => {
    scale.value = withSpring(1, spring.snap);
  }, [scale]);
  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (disabled) return;
      if (hapticFeedback !== 'none') haptic[hapticFeedback]();
      onPress?.(e);
    },
    [disabled, hapticFeedback, onPress]
  );

  return (
    <AnimatedPressable
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        {
          width: SIZE[size],
          height: SIZE[size],
          borderRadius: radii.full,
          backgroundColor: BG(variant, tone, colors),
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : 1,
        },
        animStyle,
        ...(Array.isArray(style) ? style : style ? [style] : []),
      ]}
      {...rest}
    >
      {icon}
    </AnimatedPressable>
  );
}
