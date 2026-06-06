/**
 * HistoryScreen — collector's collection feed.
 */
import { Check, FileText, X } from 'lucide-react-native';
import { FlatList, StyleSheet, View, type ListRenderItemInfo } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Card,
  EmptyState,
  GradientBackground,
  Screen,
  Text,
} from '@/components/ui';
import { usePaymentHistory } from '@/features/payments/hooks/usePayments';
import { colors, layout, radii, spacing } from '@/theme';
import type { Payment } from '@/types';

export function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { data, isRefetching, refetch } = usePaymentHistory();

  const renderItem = ({ item }: ListRenderItemInfo<Payment>) => (
    <Card padding={4} style={{ marginBottom: spacing[2] }}>
      <View style={styles.row}>
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: item.is_missed ? colors.dangerSoft : colors.successSoft },
          ]}
        >
          {item.is_missed ? (
            <X size={18} color={colors.danger} />
          ) : (
            <Check size={18} color={colors.success} />
          )}
        </View>
        <View style={{ flex: 1, marginLeft: spacing[3], minWidth: 0 }}>
          <View style={styles.titleRow}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
              {item.is_missed ? item.missed_reason ?? 'Missed visit' : `Collected · ${item.mode ?? 'CASH'}`}
            </Text>
            {item.is_missed ? (
              <Text variant="caption" color={colors.danger}>
                missed
              </Text>
            ) : (
              <AmountText value={item.amount} size="md" color={colors.success} short />
            )}
          </View>
          <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
            Loan {item.loan_id.slice(0, 8).toUpperCase()} · {new Date(item.collected_at).toLocaleString()}
          </Text>
          {item.notes ? (
            <Text variant="caption" color="secondary" style={{ marginTop: 6 }}>
              {item.notes}
            </Text>
          ) : null}
        </View>
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
          paddingBottom: spacing[5],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
          ALL TIME
        </Text>
        <Text variant="h1" color="onDark">
          History
        </Text>
        {data ? (
          <Text variant="body" color="onDark" style={{ opacity: 0.7, marginTop: 4 }}>
            {data.total} entries
          </Text>
        ) : null}
      </GradientBackground>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon={<FileText size={24} color={colors.brand[700]} />}
            title="No entries yet"
            description="Your collections will appear here."
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[3],
    paddingBottom: layout.tabBarHeight + spacing[6],
    flexGrow: 1,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
