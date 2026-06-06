/**
 * ReportsScreen — overdue loans + blacklisted + analytics.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AlertTriangle, Ban, Percent, ReceiptText, TrendingUp } from 'lucide-react-native';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Avatar,
  Card,
  EmptyState,
  GradientBackground,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { useReports } from '@/features/dashboard/hooks/useDashboard';
import { colors, layout, radii, spacing } from '@/theme';

export function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { data, isLoading, isRefetching, refetch } = useReports();

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
        <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
          REPORTS
        </Text>
        <Text variant="h1" color="onDark">
          Insights
        </Text>
        <Text variant="body" color="onDark" style={{ opacity: 0.7, marginTop: 4 }}>
          Overdue · blacklist · analytics
        </Text>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {/* Analytics summary tiles */}
        <View style={styles.tileRow}>
          <AnalyticTile
            icon={<ReceiptText size={18} color={colors.brand[700]} />}
            label="Total interest"
            valueNode={
              <AmountText
                value={data?.total_interest_earned ?? 0}
                size="md"
                color={colors.brand[700]}
                short
              />
            }
          />
          <AnalyticTile
            icon={<TrendingUp size={18} color={colors.info} />}
            label="Avg loan"
            valueNode={
              <AmountText value={data?.avg_loan_size ?? 0} size="md" short />
            }
          />
          <AnalyticTile
            icon={<Percent size={18} color={colors.warning} />}
            label="Avg rate"
            valueNode={
              <Text variant="bodyStrong">
                {(data?.avg_interest_rate ?? 0).toFixed(1)}%
              </Text>
            }
          />
        </View>

        {/* Overdue loans */}
        <View style={styles.sectionHead}>
          <Text variant="title">Overdue loans</Text>
          {data ? (
            <Text variant="caption" color="tertiary">
              {data.overdue.length}
            </Text>
          ) : null}
        </View>
        {isLoading ? (
          <SkeletonLoader height={84} style={{ marginBottom: spacing[2] }} />
        ) : (data?.overdue ?? []).length === 0 ? (
          <EmptyState
            icon={<AlertTriangle size={24} color={colors.success} />}
            title="Nothing overdue"
            description="Everything on schedule — nice."
          />
        ) : (
          <View>
            {data!.overdue.map((row) => (
              <Card
                key={row.loan_id}
                padding={4}
                style={{ marginBottom: spacing[2], borderLeftWidth: 4, borderLeftColor: colors.warning }}
              >
                <View style={styles.overdueRow}>
                  <Avatar name={row.customer_name} id={row.customer_id} size="md" />
                  <View style={{ flex: 1, marginLeft: spacing[3] }}>
                    <View style={styles.overdueHead}>
                      <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                        {row.customer_name}
                      </Text>
                      <AmountText
                        value={row.overdue_amount}
                        size="md"
                        color={colors.warning}
                        short
                      />
                    </View>
                    <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                      Loan {row.loan_id.slice(0, 8).toUpperCase()} · collector {row.collector_name}
                    </Text>
                    <Text variant="caption" color="secondary" style={{ marginTop: 2 }}>
                      {row.overdue_installments} overdue installment
                      {row.overdue_installments === 1 ? '' : 's'}
                    </Text>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* Blacklisted */}
        <View style={styles.sectionHead}>
          <Text variant="title">Blacklisted</Text>
          {data ? (
            <Text variant="caption" color="tertiary">
              {data.blacklisted.length}
            </Text>
          ) : null}
        </View>
        {(data?.blacklisted ?? []).length === 0 ? (
          <EmptyState
            icon={<Ban size={24} color={colors.brand[700]} />}
            title="Nobody blacklisted"
            description="Customers will appear here when an investor blacklists them."
          />
        ) : (
          <View>
            {data!.blacklisted.map((row) => (
              <Card
                key={row.customer_id}
                padding={3}
                style={{ marginBottom: spacing[2], borderLeftWidth: 4, borderLeftColor: colors.danger }}
              >
                <View style={styles.overdueRow}>
                  <Avatar name={row.name} id={row.customer_id} size="md" ring="danger" />
                  <View style={{ flex: 1, marginLeft: spacing[3] }}>
                    <Text variant="bodyStrong">{row.name}</Text>
                    <Text variant="caption" color="tertiary">
                      📞 {row.phone}
                    </Text>
                    {row.reason ? (
                      <Text variant="caption" color={colors.danger} style={{ marginTop: 2 }}>
                        {row.reason}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

interface AnalyticTileProps {
  icon: React.ReactNode;
  label: string;
  valueNode: React.ReactNode;
}
function AnalyticTile({ icon, label, valueNode }: AnalyticTileProps) {
  return (
    <Card padding={3} style={styles.analyticTile}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.slate[50],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </View>
      <Text variant="caption" color="tertiary" style={{ marginTop: spacing[2] }}>
        {label.toUpperCase()}
      </Text>
      <View style={{ marginTop: 2 }}>{valueNode}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  tileRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  analyticTile: { flex: 1 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  overdueRow: { flexDirection: 'row', alignItems: 'center' },
  overdueHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
