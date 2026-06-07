import { useNavigation } from '@react-navigation/native';
import { AlertTriangle, Ban, Check, ChevronDown, Percent, ReceiptText, Shield, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Avatar,
  Badge,
  Card,
  EmptyState,
  GradientBackground,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { useCollectors } from '@/features/collectors/hooks/useCollectors';
import { useDashboard, useReports } from '@/features/dashboard/hooks/useDashboard';
import { useT } from '@/i18n';
import { useColors, layout, radii, spacing } from '@/theme';

type ActiveFilter = 'all' | 'overdue' | 'blacklisted';
type SortKey = 'amount' | 'installments';
type Period = 'week' | 'month' | 'year';

export function ReportsScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();
  const [filter, setFilter] = useState<ActiveFilter>('all');
  const [sort, setSort] = useState<SortKey>('amount');
  const [period, setPeriod] = useState<Period | undefined>(undefined);
  const [apiCollectorId, setApiCollectorId] = useState<string | undefined>(undefined);
  const [showCollectorModal, setShowCollectorModal] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useReports({
    collector_id: apiCollectorId,
    period,
  });
  const { data: dashboard } = useDashboard();
  const { data: collectorsList } = useCollectors();

  const FILTER_OPTIONS: { value: ActiveFilter; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'overdue', label: t('status_overdue') },
    { value: 'blacklisted', label: t('blacklisted') },
  ];

  const PERIOD_OPTIONS: { value: Period | undefined; label: string }[] = [
    { value: undefined, label: t('all') },
    { value: 'week', label: t('this_week') },
    { value: 'month', label: t('this_month') },
    { value: 'year', label: t('this_year') },
  ];

  const collectorOptions = useMemo(() => {
    const opts = [{ id: undefined as string | undefined, name: t('all') }];
    (collectorsList ?? []).forEach((c) => opts.push({ id: c.id, name: c.name }));
    return opts;
  }, [collectorsList, t]);

  const filteredOverdue = useMemo(() => {
    let rows = data?.overdue ?? [];
    if (sort === 'amount') rows = [...rows].sort((a, b) => b.overdue_amount - a.overdue_amount);
    else rows = [...rows].sort((a, b) => b.overdue_installments - a.overdue_installments);
    return rows;
  }, [data?.overdue, sort]);

  const showOverdue = filter === 'all' || filter === 'overdue';
  const showBlacklisted = filter === 'all' || filter === 'blacklisted';

  const kpis = dashboard?.kpis;
  const recoveryRate = kpis && kpis.capital_disbursed > 0
    ? Math.min(100, (kpis.collected_lifetime / kpis.capital_disbursed) * 100)
    : 0;

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

        {/* Recovery rate tile */}
        <Card padding={4} style={{ marginBottom: spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              <Shield size={18} color={recoveryRate >= 80 ? colors.success : recoveryRate >= 50 ? colors.warning : colors.danger} />
              <Text variant="bodyStrong">{t('recovery_rate')}</Text>
            </View>
            <Text variant="h2" style={{ color: recoveryRate >= 80 ? colors.success : recoveryRate >= 50 ? colors.warning : colors.danger }}>
              {recoveryRate.toFixed(1)}%
            </Text>
          </View>
          <View style={{ marginTop: spacing[2], height: 6, borderRadius: 3, backgroundColor: colors.slate[100], overflow: 'hidden' }}>
            <View style={{ height: 6, width: `${recoveryRate}%`, borderRadius: 3, backgroundColor: recoveryRate >= 80 ? colors.success : recoveryRate >= 50 ? colors.warning : colors.danger }} />
          </View>
          <Text variant="caption" color="tertiary" style={{ marginTop: spacing[1] }}>
            {kpis ? `₹${kpis.collected_lifetime.toLocaleString('en-IN')} ${t('collected')} / ₹${kpis.capital_disbursed.toLocaleString('en-IN')} ${t('disbursed')}` : '—'}
          </Text>
        </Card>

        {/* Section filter chips */}
        <View style={[styles.segmented, { backgroundColor: colors.slate[100] }]}>
          {FILTER_OPTIONS.map((opt) => {
            const active = filter === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[styles.segmentBtn, active && { backgroundColor: colors.brand[600] }]}
                onPress={() => setFilter(opt.value)}
              >
                <Text variant="label" style={{ color: active ? '#fff' : colors.text.secondary }}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Period segmented control */}
        <Text variant="caption" color="tertiary" style={{ marginBottom: spacing[1.5] }}>{t('period').toUpperCase()}</Text>
        <View style={[styles.segmented, { backgroundColor: colors.slate[100], marginBottom: spacing[3] }]}>
          {PERIOD_OPTIONS.map((opt) => {
            const active = period === opt.value;
            return (
              <TouchableOpacity
                key={String(opt.value)}
                style={[styles.segmentBtn, active && { backgroundColor: colors.brand[600] }]}
                onPress={() => setPeriod(opt.value)}
              >
                <Text variant="label" style={{ color: active ? '#fff' : colors.text.secondary }}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Collector dropdown */}
        <Text variant="caption" color="tertiary" style={{ marginBottom: spacing[1.5] }}>{t('collector_filter').toUpperCase()}</Text>
        <TouchableOpacity
          style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border.default }]}
          onPress={() => setShowCollectorModal(true)}
        >
          <Text variant="body" style={{ flex: 1, color: apiCollectorId ? colors.text.primary : colors.text.secondary }}>
            {apiCollectorId ? collectorOptions.find((c) => c.id === apiCollectorId)?.name ?? t('all') : t('all')}
          </Text>
          <ChevronDown size={16} color={colors.text.tertiary} />
        </TouchableOpacity>

        {/* Collector picker modal */}
        <Modal visible={showCollectorModal} transparent animationType="slide" onRequestClose={() => setShowCollectorModal(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setShowCollectorModal(false)}>
            <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
              <Text variant="h3" style={{ marginBottom: spacing[3] }}>{t('collector_filter')}</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {collectorOptions.map((c) => {
                  const selected = apiCollectorId === c.id;
                  return (
                    <TouchableOpacity
                      key={String(c.id)}
                      style={[styles.modalOption, { borderBottomColor: colors.border.subtle }]}
                      onPress={() => { setApiCollectorId(c.id); setShowCollectorModal(false); }}
                    >
                      <Text variant="body" style={{ flex: 1, color: selected ? colors.brand[600] : colors.text.primary }}>
                        {c.name}
                      </Text>
                      {selected ? <Check size={16} color={colors.brand[600]} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Overdue loans */}
        {showOverdue ? (
          <>
            <View style={styles.sectionHead}>
              <Text variant="title">{t('overdue_loans')}</Text>
              <View style={{ flexDirection: 'row', gap: spacing[2], alignItems: 'center' }}>
                {data ? (
                  <Badge label={String(filteredOverdue.length)} tone={filteredOverdue.length > 0 ? 'warning' : 'success'} />
                ) : null}
              </View>
            </View>

            {/* Sort sub-filters */}
            {(data?.overdue ?? []).length > 0 ? (
              <View style={{ flexDirection: 'row', gap: spacing[2], marginBottom: spacing[2] }}>
                <TouchableOpacity
                  style={[styles.subChip, { backgroundColor: sort === 'amount' ? colors.brand[50] : colors.slate[100], borderColor: sort === 'amount' ? colors.brand[400] : colors.border.default }]}
                  onPress={() => setSort('amount')}
                >
                  <Text variant="label" style={{ color: sort === 'amount' ? colors.brand[700] : colors.text.secondary }}>{t('sort_amount')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.subChip, { backgroundColor: sort === 'installments' ? colors.brand[50] : colors.slate[100], borderColor: sort === 'installments' ? colors.brand[400] : colors.border.default }]}
                  onPress={() => setSort('installments')}
                >
                  <Text variant="label" style={{ color: sort === 'installments' ? colors.brand[700] : colors.text.secondary }}>{t('sort_installments')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {isLoading ? (
              <SkeletonLoader height={84} style={{ marginBottom: spacing[2] }} />
            ) : filteredOverdue.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle size={24} color={colors.success} />}
                title={t('nothing_overdue')}
                description={t('nothing_overdue_desc')}
              />
            ) : (
              <View>
                {filteredOverdue.map((row) => (
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
                          {row.collector_name} · {row.overdue_installments} {t('installments').toLowerCase()}
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
                <Badge label={String(data.blacklisted.length)} tone={data.blacklisted.length > 0 ? 'danger' : 'neutral'} />
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
    paddingBottom: spacing[1],
  },
  filterChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radii.full,
    borderWidth: 1,
  },
  subChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  segmented: {
    flexDirection: 'row',
    borderRadius: radii.xl,
    padding: 3,
    marginBottom: spacing[3],
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[3],
    marginBottom: spacing[3],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
    maxHeight: '70%' as unknown as number,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
    borderBottomWidth: 1,
  },
});
