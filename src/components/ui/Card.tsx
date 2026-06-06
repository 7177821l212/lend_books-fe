/**
 * Card — base surface. Supports tappable variant with press animation.
 */
import { useCallback } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useColors, radii, shadows, spacing, haptic, spring, type ShadowKey, type RadiusKey } from '@/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  radius?: RadiusKey;
  shadow?: ShadowKey;
  background?: string;
  bordered?: boolean;
  onPress?: PressableProps['onPress'];
  hapticOnPress?: 'light' | 'medium' | 'selection' | 'none';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  padding = 4,
  radius = '2xl',
  shadow = 'sm',
  background,
  bordered = false,
  onPress,
  hapticOnPress = 'light',
  style,
  ...rest
}: CardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleIn = useCallback(() => {
    scale.value = withSpring(0.98, spring.snap);
  }, [scale]);
  const handleOut = useCallback(() => {
    scale.value = withSpring(1, spring.snap);
  }, [scale]);
  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (hapticOnPress !== 'none') haptic[hapticOnPress]();
      onPress?.(e);
    },
    [onPress, hapticOnPress]
  );

  const base: ViewStyle = {
    backgroundColor: background ?? colors.card,
    borderRadius: radii[radius],
    padding: spacing[padding],
    borderWidth: bordered ? 1 : 0,
    borderColor: colors.border.default,
    ...shadows[shadow],
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handleIn}
        onPressOut={handleOut}
        onPress={handlePress}
        style={[base, animStyle, style]}
        {...(rest as PressableProps)}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}
