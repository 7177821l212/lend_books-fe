/**
 * FAB — floating action button. Anchors bottom-right (or custom).
 */
import { useCallback } from 'react';
import {
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

import { GradientBackground } from './GradientBackground';
import { colors, layout, shadows, haptic, spring } from '@/theme';

interface FABProps extends Omit<PressableProps, 'children' | 'style'> {
  icon: React.ReactNode;
  size?: 'md' | 'lg';
  bottom?: number;
  right?: number;
  hapticFeedback?: 'medium' | 'light' | 'success' | 'none';
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FAB({
  icon,
  size = 'md',
  bottom = layout.tabBarHeight + 16,
  right = 20,
  hapticFeedback = 'medium',
  onPress,
  style,
  ...rest
}: FABProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleIn = useCallback(() => {
    scale.value = withSpring(0.9, spring.snap);
  }, [scale]);
  const handleOut = useCallback(() => {
    scale.value = withSpring(1, spring.gentle);
  }, [scale]);
  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (hapticFeedback !== 'none') haptic[hapticFeedback]();
      onPress?.(e);
    },
    [hapticFeedback, onPress]
  );

  const dim = size === 'md' ? layout.fabSize : layout.fabSizeLarge;

  return (
    <AnimatedPressable
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={handlePress}
      style={[
        styles.container,
        { width: dim, height: dim, borderRadius: dim / 2, bottom, right },
        shadows.glowBrand,
        animStyle,
        style,
      ]}
      accessibilityRole="button"
      {...rest}
    >
      <GradientBackground
        gradient="brand"
        style={{
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </GradientBackground>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: colors.brand[600],
    overflow: 'hidden',
  },
});
