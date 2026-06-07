/**
 * ListItem — reusable row used in lists across the app.
 * Leading slot, title + subtitle, trailing slot (chevron by default).
 */
import { ChevronRight } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, View, type PressableProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text } from './Text';
import { useColors, spacing, haptic, spring } from '@/theme';

interface ListItemProps extends Omit<PressableProps, 'style'> {
  title: string;
  subtitle?: string;
  caption?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  hapticOnPress?: 'light' | 'selection' | 'none';
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ListItem({
  title,
  subtitle,
  caption,
  leading,
  trailing,
  showChevron = true,
  onPress,
  hapticOnPress = 'light',
  style,
  ...rest
}: ListItemProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleIn = useCallback(() => {
    scale.value = withSpring(0.99, spring.snap);
  }, [scale]);
  const handleOut = useCallback(() => {
    scale.value = withSpring(1, spring.snap);
  }, [scale]);
  const handlePress = useCallback<NonNullable<PressableProps['onPress']>>(
    (e) => {
      if (hapticOnPress !== 'none') haptic[hapticOnPress]();
      onPress?.(e);
    },
    [hapticOnPress, onPress]
  );

  const interactive = !!onPress;

  return (
    <AnimatedPressable
      onPressIn={interactive ? handleIn : undefined}
      onPressOut={interactive ? handleOut : undefined}
      onPress={interactive ? handlePress : undefined}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: spacing[3],
          paddingHorizontal: spacing[1],
        },
        interactive ? animStyle : undefined,
        style,
      ]}
      {...rest}
    >
      {leading ? <View style={{ marginRight: spacing[3] }}>{leading}</View> : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
            {title}
          </Text>
          {caption ? (
            <Text variant="caption" color="tertiary" style={{ marginLeft: spacing[2] }}>
              {caption}
            </Text>
          ) : null}
        </View>
        {subtitle ? (
          <Text variant="label" color="secondary" numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        <View style={{ marginLeft: spacing[2] }}>{trailing}</View>
      ) : interactive && showChevron ? (
        <ChevronRight size={20} color={colors.slate[300]} style={{ marginLeft: spacing[2] }} />
      ) : null}
    </AnimatedPressable>
  );
}
