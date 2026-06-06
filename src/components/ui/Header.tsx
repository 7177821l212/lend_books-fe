/**
 * Header — hero-style gradient app bar. Used at the top of most screens.
 * Includes safe-area inset, back button slot, title/subtitle, action slots.
 */
import { ChevronLeft } from 'lucide-react-native';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GradientBackground } from './GradientBackground';
import { IconButton } from './IconButton';
import { Text } from './Text';
import { colors, radii, spacing, layout } from '@/theme';

interface HeaderProps extends ViewProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  hero?: React.ReactNode;
  variant?: 'gradient' | 'solid' | 'transparent';
  compact?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  onBack,
  rightAction,
  hero,
  variant = 'gradient',
  compact = false,
  children,
  style,
  ...rest
}: HeaderProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View
      style={[
        {
          paddingTop: insets.top + spacing[2],
          paddingBottom: compact ? spacing[4] : spacing[7],
          paddingHorizontal: layout.screenPaddingX,
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        },
        style,
      ]}
      {...rest}
    >
      <View style={styles.topRow}>
        {showBack ? (
          <IconButton
            icon={<ChevronLeft size={22} color={colors.white} />}
            variant="glass"
            size="md"
            onPress={onBack}
            accessibilityLabel="Back"
          />
        ) : (
          <View style={styles.spacer} />
        )}
        {rightAction ? <View>{rightAction}</View> : <View style={styles.spacer} />}
      </View>

      {title || subtitle ? (
        <View style={{ marginTop: spacing[3] }}>
          {subtitle ? (
            <Text variant="caption" color="onDark" style={{ opacity: 0.75 }}>
              {subtitle.toUpperCase()}
            </Text>
          ) : null}
          {title ? (
            <Text variant="h1" color="onDark" style={{ marginTop: 2 }}>
              {title}
            </Text>
          ) : null}
        </View>
      ) : null}

      {hero}
      {children}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <GradientBackground
        gradient="hero"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {content}
      </GradientBackground>
    );
  }

  if (variant === 'solid') {
    return <View style={{ backgroundColor: colors.slate[900] }}>{content}</View>;
  }

  return content;
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  spacer: { width: 40, height: 40 },
});
