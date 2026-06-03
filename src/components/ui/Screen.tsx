/**
 * Screen — base wrapper for every screen.
 * Handles safe area, background, optional scroll, and consistent padding.
 */
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  type ScrollViewProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors, layout } from '@/theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  padded?: boolean;
  background?: 'default' | 'card' | 'dark' | 'transparent';
  statusBar?: 'dark' | 'light';
  refreshing?: boolean;
  onRefresh?: () => void;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

const BG = {
  default: colors.background,
  card: colors.card,
  dark: colors.slate[900],
  transparent: 'transparent',
} as const;

export function Screen({
  children,
  scroll = false,
  edges = ['top'],
  padded = true,
  background = 'default',
  statusBar = 'dark',
  refreshing,
  onRefresh,
  contentContainerStyle,
  style,
  ...rest
}: ScreenProps) {
  const bg = BG[background];
  const padStyle = padded ? { paddingHorizontal: layout.screenPaddingX } : null;

  const inner = scroll ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[
        padded && { paddingHorizontal: layout.screenPaddingX },
        { paddingBottom: layout.tabBarHeight + 24 },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing ?? false}
            onRefresh={onRefresh}
            tintColor={colors.brand[600]}
            colors={[colors.brand[600]]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: bg }, style]} {...rest}>
      <StatusBar barStyle={statusBar === 'dark' ? 'dark-content' : 'light-content'} />
      {inner}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
