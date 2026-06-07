/**
 * ProgressBar — animated linear progress.
 */
import { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useColors, radii, duration as motion, easing } from '@/theme';

interface ProgressBarProps {
  value: number; // 0..100
  height?: number;
  trackColor?: string;
  fillColor?: string;
  animated?: boolean;
  style?: ViewStyle;
}

export function ProgressBar({
  value,
  height = 6,
  trackColor,
  fillColor,
  animated = true,
  style,
}: ProgressBarProps) {
  const colors = useColors();
  const resolvedTrackColor = trackColor ?? colors.slate[100];
  const resolvedFillColor = fillColor ?? colors.brand[600];
  const pct = Math.max(0, Math.min(100, value));
  const width = useSharedValue(0);

  useEffect(() => {
    width.value = animated
      ? withTiming(pct, { duration: motion.slow, easing: easing.standard })
      : pct;
  }, [pct, animated, width]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      style={[
        {
          height,
          backgroundColor: resolvedTrackColor,
          borderRadius: radii.full,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            height: '100%',
            backgroundColor: resolvedFillColor,
            borderRadius: radii.full,
          },
          animStyle,
        ]}
      />
    </View>
  );
}
