/**
 * TeamScreen — investor's collectors leaderboard.
 */
import { Plus, Users } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Avatar,
  Card,
  EmptyState,
  GradientBackground,
  IconButton,
  ProgressBar,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { colors, layout, radii, spacing } from '@/theme';

export function TeamScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { data, isRefetching, refetch } = useDashboard();

  const team = data?.collector_performance ?? [];
  const peak = team.length ? Math.max(...team.map((c) => c.collected), 1) : 1;

  return (
    <Screen
      padded={false}
      background="default"
      edges={[]}
      scroll
      refreshing={isRefetching}
      onRefresh={refetch}
    >
      <GradientBackground
        gradient="hero"
        style={{
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[5],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              TEAM
            </Text>
            <Text variant="h1" color="onDark">
              {team.length} collectors
            </Text>
          </View>
          <IconButton
            icon={<Plus size={20} color={colors.white} />}
            variant="glass"
            onPress={() => toast.info('Add collector — coming soon')}
            accessibilityLabel="Add"
          />
        </View>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {team.length === 0 ? (
          <EmptyState
            icon={<Users size={28} color={colors.brand[700]} />}
            title="No collectors yet"
            description="Add a collector to start assigning loans."
          />
        ) : (
          team.map((c, i) => (
            <Card key={c.id} padding={4} style={{ marginBottom: spacing[2] }}>
              <View style={styles.row}>
                <View style={styles.rankBubble}>
                  <Text variant="caption" color="secondary">
                    #{i + 1}
                  </Text>
                </View>
                <Avatar name={c.name} id={c.id} size="md" />
                <View style={{ flex: 1, marginLeft: spacing[3] }}>
                  <View style={styles.titleRow}>
                    <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                      {c.name}
                    </Text>
                    <AmountText
                      value={c.collected}
                      size="sm"
                      color={colors.brand[700]}
                      short
                    />
                  </View>
                  <View style={styles.subRow}>
                    <Text variant="caption" color="tertiary">
                      {c.visits} visits
                    </Text>
                    <Text variant="caption" color="tertiary">
                      {c.missed} missed
                    </Text>
                  </View>
                  <ProgressBar
                    value={Math.round((c.collected / peak) * 100)}
                    height={4}
                    style={{ marginTop: 6 }}
                  />
                </View>
              </View>
            </Card>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rankBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  subRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
