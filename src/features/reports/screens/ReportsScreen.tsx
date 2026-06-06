import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, Ban, Percent, ReceiptText, TrendingUp } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { useT } from '@/i18n';
import { useColors, layout, radii, spacing } from '@/theme';

type ActiveFilter = 'all' | 'overdue' | 'blacklisted';

export function ReportsScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();
  const { data, isLoading, isRefetching, refetch } = useReports();
  const [filter, setFilter] = useState<ActiveFilter>('all');

  const FILTER_OPTIONS: { value: ActiveFilter; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'overdue', label: t('status_overdue') },
    { value: 'blacklisted', label: t('blacklisted') },
  ];

  const showOverdue = filter === 'all' || filter === 'overdue';
  const showBlacklisted = filter === 'all' || filter === 'blacklisted';

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
          paddingTop: insets.top + spacing[4],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[5],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
          {t('reports').toUpperCase()}
        </Text>
        <Text variant="h1" color="onDark">
          {t('insights')}
        </Text>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {/* Analytics summary tiles */}
        <View style={styles.tileRow}>
          <AnalyticTile
            icon={<ReceiptText size={18} color={colors.brand[700]} />}
            label={t('total_interest')}
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
            label={t('avg_loan')}
            valueNode={
              <AmountText value={data?.avg_loan_size ?? 0} size="md" short />
            }
          />
          <AnalyticTile
            icon={<Percent size={18} color={colors.warning} />}
            label={t('avg_rate')}
            valueNode={
              <Text variant="bodyStrong">
                {(data?.avg_interest_rate ?? 0).toFixed(1)}%
              </Text>
            }
          />
        </View>

        {/* Filters */}
        <View style={styles.filterRow}>
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.brand[600] : colors.slate[100],
                    borderColor: active ? colors.brand[600] : colors.border.default,
                  },
                ]}
                onPress={() => setFilter(opt.value)}
              >
                <Text
                  variant="label"
                  style={{ color: active ? '#fff' : colors.text.secondary }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Overdue loans */}
        {showOverdue ? (
          <>
            <View style={styles.sectionHead}>
              <Text variant="title">{t('overdue_loans')}</Text>
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
                title={t('nothing_overdue')}
                description={t('nothing_overdue_desc')}
              />
            ) : (
              <View>
                {data!.overdue.map((row) => (
                  <Card
                    key={row.loan_id}
                    padding={4}
                    style={{ marginBottom: spacing[2], borderLeftWidth: 4, borderLeftColor: colors.warning }}
                    onPress={() => nav.navigate('Customers', { screen: 'LoanDetail', params: { id: row.loan_id } })}
                  >
                    <View style={styles.overdueRow}>
                      <TouchableOpacity
                        onPress={() => nav.navigate('Customers', { screen: 'CustomerDetail', params: { id: row.customer_id } })}
                      >
                        <Avatar name={row.customer_name} id={row.customer_id} size="md" />
                      </TouchableOpacity>
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
                          Loan {row.loan_id.slice(0, 8).toUpperCase()} · {row.collector_name}
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
          </>
        ) : null}

        {/* Blacklisted */}
        {showBlacklisted ? (
          <>
            <View style={styles.sectionHead}>
              <Text variant="title">{t('blacklisted')}</Text>
              {data ? (
                <Text variant="caption" color="tertiary">
                  {data.blacklisted.length}
                </Text>
              ) : null}
            </View>
            {(data?.blacklisted ?? []).length === 0 ? (
              <EmptyState
                icon={<Ban size={24} color={colors.brand[700]} />}
                title={t('nobody_blacklisted')}
                description={t('nobody_blacklisted_desc')}
              />
            ) : (
              <View>
                {data!.blacklisted.map((row) => (
                  <Card
                    key={row.customer_id}
                    padding={3}
                    style={{ marginBottom: spacing[2], borderLeftWidth: 4, borderLeftColor: colors.danger }}
                    onPress={() => nav.navigate('Customers', { screen: 'CustomerDetail', params: { id: row.customer_id } })}
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
          </>
        ) : null}
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
  const colors = useColors();
  return (
    <Card padding={3} style={styles.analyticTile}>
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: colors.slate[100],
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
    marginBottom: spacing[3],
  },
  analyticTile: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radii.full,
    borderWidth: 1,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[3],
    marginBottom: spacing[2],
  },
  overdueRow: { flexDirection: 'row', alignItems: 'center' },
  overdueHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
