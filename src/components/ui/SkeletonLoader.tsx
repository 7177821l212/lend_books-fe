/**
 * SkeletonLoader — content-shaped loading placeholder with a diagonal
 * shimmer sweep (the Stripe/Linear pattern), not a flat opacity pulse.
 *
 * A soft highlight band travels left→right across the shape on a loop,
 * clipped to its rounded-rect bounds. Width is measured via onLayout so
 * percentage widths ("100%", "60%"...) sweep correctly.
 */
import { useCallback, useEffect, useState } from 'react';
import { View, type ViewStyle, type DimensionValue, type LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useColors, useIsDark, radii } from '@/theme';

interface SkeletonLoaderProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
  /** Stagger the sweep start — pass an index (0, 1, 2…) so stacked lines don't pulse in lockstep. */
  delay?: number;
}

const SWEEP_DURATION = 1400;
const BAND_WIDTH_RATIO = 0.55;

export function SkeletonLoader({
  width = '100%',
  height = 16,
  radius = radii.md,
  style,
  delay = 0,
}: SkeletonLoaderProps) {
  const colors = useColors();
  const isDark = useIsDark();
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const progress = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const w = e.nativeEvent.layout.width;
      if (w > 0 && w !== measuredWidth) setMeasuredWidth(w);
    },
    [measuredWidth]
  );

  useEffect(() => {
    progress.value = withDelay(
      delay * 90,
      withRepeat(
        withTiming(1, { duration: SWEEP_DURATION, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      )
    );
  }, [progress, delay]);

  const bandWidth = Math.max(measuredWidth * BAND_WIDTH_RATIO, 40);
  const animStyle = useAnimatedStyle(() => {
    const travel = measuredWidth + bandWidth;
    return {
      transform: [{ translateX: -bandWidth + progress.value * travel }],
    };
  });

  // Soft white overlay reads as "lighter than base" on both light and dark
  // slate tones — no need to hand-pick per-theme highlight colors.
  const sweepAlpha = isDark ? 0.06 : 0.5;

  return (
    <View
      onLayout={onLayout}
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: colors.slate[200],
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {measuredWidth > 0 ? (
        <Animated.View
          style={[{ position: 'absolute', top: 0, bottom: 0, width: bandWidth }, animStyle]}
        >
          <LinearGradient
            colors={['transparent', `rgba(255,255,255,${sweepAlpha})`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ flex: 1 }}
          />
        </Animated.View>
      ) : null}
    </View>
  );
}
