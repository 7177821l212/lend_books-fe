import { useNavigation } from '@react-navigation/native';
import { Ban, CalendarDays, Check, ChevronDown, Percent, ReceiptText, Shield, TrendingUp } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Avatar,
  Badge,
  Card,
  DatePickerField,
  EmptyState,
  GradientBackground,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { CollectionBarChart } from '@/components/charts/CollectionBarChart';
import { useCollectors } from '@/features/collectors/hooks/useCollectors';
import { useDashboard, useReports } from '@/features/dashboard/hooks/useDashboard';
import { useT } from '@/i18n';
import { useColors, layout, radii, spacing } from '@/theme';

type ActiveFilter = 'all' | 'blacklisted';
type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return toISODate(d);
}

export function ReportsScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { width: screenWidth } = useWindowDimensions();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();
  const [filter, setFilter] = useState<ActiveFilter>('all');
  const today = toISODate(new Date());
  const [period, setPeriod] = useState<Period>('month');
  const [startDate, setStartDate] = useState(daysAgo(29));
  const [endDate, setEndDate] = useState(today);
  const [apiCollectorId, setApiCollectorId] = useState<string | undefined>(undefined);
  const [showCollectorModal, setShowCollectorModal] = useState(false);

  const { data, isLoading, isRefetching, refetch } = useReports({
    collector_id: apiCollectorId,
    period: period === 'custom' || period === 'today' ? undefined : period,
    start_date: startDate,
    end_date: endDate,
  });
  const { data: dashboard } = useDashboard({ start_date: startDate, end_date: endDate });
  const { data: collectorsList } = useCollectors();

  const FILTER_OPTIONS: { value: ActiveFilter; label: string }[] = [
    { value: 'all', label: t('all') },
    { value: 'blacklisted', label: t('blacklisted') },
  ];

  const PERIOD_OPTIONS: { value: Period; label: string }[] = [
    { value: 'today', label: t('today') },
    { value: 'week', label: t('this_week') },
    { value: 'month', label: t('this_month') },
    { value: 'year', label: t('this_year') },
    { value: 'custom', label: 'Custom' },
  ];

  const collectorOptions = useMemo(() => {
    const opts = [{ id: undefined as string | undefined, name: t('all') }];
    (collectorsList ?? []).forEach((c) => opts.push({ id: c.id, name: c.name }));
    return opts;
  }, [collectorsList, t]);


  const showBlacklisted = filter === 'all' || filter === 'blacklisted';

  const kpis = dashboard?.kpis;
  const collectionSummary = data?.collection_summary;
  const collectionTrend = data?.collection_trend ?? [];
  const collectors = data?.collector_performance ?? [];
  const selectedCollectorName = apiCollectorId
    ? collectorOptions.find((c) => c.id === apiCollectorId)?.name ?? 'Selected collector'
    : 'All collectors';
  const hasCollectionTrend = collectionTrend.some((point) => point.amount > 0);
  const recoveryRate = kpis && kpis.capital_disbursed > 0
    ? Math.min(100, (kpis.collected_lifetime / kpis.capital_disbursed) * 100)
    : 0;

  const applyPeriod = (next: Period) => {
    setPeriod(next);
    if (next === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (next === 'week') {
      setStartDate(daysAgo(6));
      setEndDate(today);
    } else if (next === 'month') {
      setStartDate(daysAgo(29));
      setEndDate(today);
    } else if (next === 'year') {
      setStartDate(daysAgo(364));
      setEndDate(today);
    }
  };

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

        <Card padding={4} style={{ marginBottom: spacing[3] }}>
          <View style={styles.collectionHead}>
            <View style={{ flex: 1 }}>
              <Text variant="title">Collection summary</Text>
              <Text variant="caption" color="tertiary">{startDate} to {endDate}</Text>
            </View>
            <CalendarDays size={20} color={colors.brand[700]} />
          </View>
          <View style={styles.collectionTotalRow}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="tertiary">TOTAL COLLECTED</Text>
              <AmountText value={collectionSummary?.total_collected ?? 0} size="lg" color={colors.brand[700]} short />
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text variant="caption" color="tertiary">PAYMENTS</Text>
              <Text variant="h2">{collectionSummary?.total_payments ?? 0}</Text>
            </View>
          </View>
          <View style={styles.modeRow}>
            <ModePill label="Cash" value={collectionSummary?.cash_collected ?? 0} />
            <ModePill label="UPI" value={collectionSummary?.upi_collected ?? 0} />
            <ModePill label="Bank" value={collectionSummary?.bank_collected ?? 0} />
          </View>
        </Card>

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
                onPress={() => applyPeriod(opt.value)}
              >
                <Text variant="label" style={{ color: active ? '#fff' : colors.text.secondary }}>{opt.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {period === 'custom' ? (
          <View style={styles.dateRow}>
            <View style={styles.dateField}>
              <DatePickerField label="From" value={startDate} maxDate={endDate} onChange={setStartDate} />
            </View>
            <View style={styles.dateField}>
              <DatePickerField label="To" value={endDate} minDate={startDate} maxDate={today} onChange={setEndDate} />
            </View>
          </View>
        ) : null}

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
                      <Text variant="body" style={{ flex: 1, color: selected ? colors.brand[800] : colors.text.primary }}>
                        {c.name}
                      </Text>
                      {selected ? <Check size={16} color={colors.brand[800]} /> : null}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>

        <Card padding={4} style={{ marginBottom: spacing[3] }}>
          <View style={styles.sectionHead}>
            <View style={{ flex: 1 }}>
              <Text variant="title">{t('collection_trend')}</Text>
              <Text variant="caption" color="tertiary">
                {selectedCollectorName} · {startDate} to {endDate}
              </Text>
            </View>
            <AmountText
              value={collectionSummary?.total_collected ?? 0}
              size="sm"
              color={colors.brand[700]}
              short
            />
          </View>
          {hasCollectionTrend ? (
            <CollectionBarChart
              data={collectionTrend}
              width={screenWidth - layout.screenPaddingX * 2 - spacing[4] * 2}
            />
          ) : isLoading ? (
            <SkeletonLoader height={110} />
          ) : (
            <EmptyState title={t('no_trend_data')} description={t('no_collections_desc')} />
          )}
        </Card>

        <Card padding={4} style={{ marginBottom: spacing[3] }}>
          <View style={styles.sectionHead}>
            <View style={{ flex: 1 }}>
              <Text variant="title">Collector collections</Text>
              <Text variant="caption" color="tertiary">
                Tap a collector to see their day-wise trend
              </Text>
            </View>
            {apiCollectorId ? (
              <TouchableOpacity
                style={[styles.resetCollector, { borderColor: colors.border.default }]}
                onPress={() => setApiCollectorId(undefined)}
              >
                <Text variant="label" style={{ color: colors.brand[700] }}>All</Text>
              </TouchableOpacity>
            ) : (
              <Badge label={String(collectors.length)} tone={collectors.length > 0 ? 'success' : 'neutral'} />
            )}
          </View>
          {collectors.length === 0 ? (
            <EmptyState title={t('no_collections_yet')} description={t('no_collections_desc')} />
          ) : (
            collectors.map((collector, index) => (
              <TouchableOpacity
                key={collector.id}
                style={[
                  styles.collectorRow,
                  index > 0 && { borderTopColor: colors.border.subtle, borderTopWidth: 1 },
                  apiCollectorId === collector.id && { backgroundColor: colors.brand[50] },
                ]}
                onPress={() => setApiCollectorId(collector.id)}
              >
                <Avatar name={collector.name} id={collector.id} size="sm" />
                <View style={{ flex: 1, marginLeft: spacing[3] }}>
                  <View style={styles.collectorLine}>
                    <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>{collector.name}</Text>
                    <AmountText value={collector.collected} size="sm" color={colors.brand[700]} short />
                  </View>
                  <Text variant="caption" color="tertiary">
                    {collector.visits} payments · {collector.collection_days} days · avg ₹{collector.average_per_day.toLocaleString('en-IN')}/day
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </Card>

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
                    <View style={styles.personRow}>
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

function ModePill({ label, value }: { label: string; value: number }) {
  const colors = useColors();
  return (
    <View style={[styles.modePill, { backgroundColor: colors.slate[50], borderColor: colors.border.subtle }]}>
      <Text variant="caption" color="tertiary">{label.toUpperCase()}</Text>
      <AmountText value={value} size="sm" color={colors.text.primary} short />
    </View>
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
  // Referenced by the "All" button that clears the collector filter; it was
  // used without ever being defined, so the button rendered unstyled.
  resetCollector: {
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
  personRow: { flexDirection: 'row', alignItems: 'center' },
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
  collectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collectionTotalRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: spacing[3],
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  modePill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing[2],
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[3],
  },
  dateField: { flex: 1 },
  collectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[3],
  },
  collectorLine: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});
