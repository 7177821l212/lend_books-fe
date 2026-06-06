/**
 * MyDayScreen — collector's pickup list for today + overdue.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronRight, MapPin, PartyPopper, Phone } from 'lucide-react-native';
import { FlatList, Linking, Pressable, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CollectorStackParamList } from '@/app/navigation/TodayNavigator';
import {
  AmountText,
  Avatar,
  Badge,
  Card,
  EmptyState,
  GradientBackground,
  IconButton,
  ProgressBar,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { useMyDay } from '@/features/payments/hooks/usePayments';
import { colors, layout, radii, spacing } from '@/theme';
import type { PickupItem } from '@/features/payments/api/paymentApi';

type Nav = NativeStackNavigationProp<CollectorStackParamList, 'MyDay'>;

export function MyDayScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { data, isLoading, isRefetching, refetch } = useMyDay();

  const pct = data && data.target_total > 0
    ? Math.min(100, Math.round((data.collected_today / data.target_total) * 100))
    : 0;

  const renderItem = ({ item }: ListRenderItemInfo<PickupItem>) => (
    <Card
      padding={4}
      onPress={() => nav.navigate('Collect', { loanId: item.loan_id, scheduleId: item.schedule_id })}
      style={[styles.pickup, item.is_overdue && styles.pickupUrgent]}
    >
      <View style={styles.row}>
        <Avatar name={item.customer_name} id={item.customer_id} size="lg" />
        <View style={{ flex: 1, marginLeft: spacing[3], minWidth: 0 }}>
          <View style={styles.titleRow}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
              {item.customer_name}
            </Text>
            <AmountText
              value={item.due_amount}
              size="md"
              color={item.is_overdue ? colors.warning : colors.brand[600]}
              short
            />
          </View>
          <View style={styles.subRow}>
            <Phone size={11} color={colors.slate[400]} />
            <Text variant="caption" color="secondary" style={{ marginLeft: 4 }} numberOfLines={1}>
              {item.customer_phone}
            </Text>
          </View>
          {item.customer_location ? (
            <View style={styles.subRow}>
              <MapPin size={11} color={colors.slate[400]} />
              <Text variant="caption" color="tertiary" style={{ marginLeft: 4 }} numberOfLines={1}>
                {item.customer_location}
              </Text>
            </View>
          ) : null}
          <View style={styles.badges}>
            {item.is_overdue ? (
              <Badge label="Overdue" tone="danger" withDot size="sm" />
            ) : (
              <Badge label="Due today" tone="warning" withDot size="sm" />
            )}
            <Text variant="caption" color="tertiary" style={{ marginLeft: spacing[2] }}>
              #{item.sequence} · {item.due_date}
            </Text>
          </View>
        </View>
        <ChevronRight size={18} color={colors.slate[300]} />
      </View>
      <View style={styles.actionRow}>
        <Pressable
          onPress={() => Linking.openURL(`tel:${item.customer_phone}`)}
          style={styles.miniAction}
          hitSlop={6}
        >
          <Phone size={14} color={colors.brand[700]} />
          <Text variant="caption" color={colors.brand[700]} style={{ marginLeft: 4 }}>
            Call
          </Text>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <Screen padded={false} background="default" edges={[]} scroll={false}>
      <GradientBackground
        gradient="hero"
        style={{
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[6],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.heroRow}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              TODAY
            </Text>
            <Text variant="h1" color="onDark">
              My day
            </Text>
          </View>
          <IconButton
            icon={<Text variant="bodyStrong" color="onBrand">↻</Text>}
            variant="glass"
            onPress={() => void refetch()}
            accessibilityLabel="Refresh"
          />
        </View>

        {data ? (
          <Card padding={4} style={styles.kpiCard}>
            <View style={styles.kpiTop}>
              <View>
                <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                  TARGET
                </Text>
                <AmountText value={data.target_total} size="2xl" color={colors.white} short />
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                  COLLECTED
                </Text>
                <AmountText value={data.collected_today} size="xl" color={colors.brand[200]} short />
              </View>
            </View>
            <ProgressBar
              value={pct}
              height={6}
              trackColor="rgba(255,255,255,0.15)"
              fillColor={colors.brand[200]}
              style={{ marginTop: spacing[3] }}
            />
            <View style={styles.kpiFooter}>
              <Text variant="caption" color="onDark" style={{ opacity: 0.85 }}>
                {pct}% done
              </Text>
              <Text variant="caption" color="onDark" style={{ opacity: 0.85 }}>
                {data.pickup_count} pickups · {data.overdue_count} overdue
              </Text>
            </View>
          </Card>
        ) : null}
      </GradientBackground>

      {isLoading ? (
        <View style={{ padding: layout.screenPaddingX }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeleton}>
              <SkeletonLoader width={48} height={48} radius={24} />
              <View style={{ flex: 1, marginLeft: spacing[3] }}>
                <SkeletonLoader width="60%" height={14} />
                <SkeletonLoader width="40%" height={11} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={data?.pickups ?? []}
          keyExtractor={(p) => p.schedule_id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon={<PartyPopper size={28} color={colors.brand[700]} />}
              title="You're all caught up"
              description="No pickups due right now. Great work."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  kpiCard: { marginTop: spacing[4], backgroundColor: 'rgba(255,255,255,0.10)' },
  kpiTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  kpiFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing[2] },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[3],
    paddingBottom: layout.tabBarHeight + spacing[6],
    flexGrow: 1,
  },
  pickup: { marginBottom: spacing[2.5] },
  pickupUrgent: { borderLeftWidth: 4, borderLeftColor: colors.warning },
  row: { flexDirection: 'row', alignItems: 'center' },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  subRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  badges: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[2] },
  actionRow: {
    flexDirection: 'row',
    marginTop: spacing[3],
    paddingTop: spacing[2.5],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  miniAction: { flexDirection: 'row', alignItems: 'center' },
  skeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: radii['2xl'],
    marginBottom: spacing[2.5],
  },
});
