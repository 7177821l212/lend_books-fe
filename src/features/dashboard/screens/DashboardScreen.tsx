import { IndianRupee, LogOut, RefreshCw, TrendingUp, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { fontFamily } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Avatar,
  Card,
  DatePickerField,
  EmptyState,
  GradientBackground,
  IconButton,
  ProgressBar,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { CollectionBarChart } from '@/components/charts/CollectionBarChart';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useT } from '@/i18n';
import { useColors, layout, radii, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';

type RangePreset = 'today' | '7d' | '30d' | 'custom';

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

export function DashboardScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const today = toISODate(new Date());
  const [rangePreset, setRangePreset] = useState<RangePreset>('7d');
  const [startDate, setStartDate] = useState(daysAgo(6));
  const [endDate, setEndDate] = useState(today);
  const { data, isLoading, isRefetching, refetch } = useDashboard({
    start_date: startDate,
    end_date: endDate,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();

  const k = data?.kpis;
  const rangeTrend = data?.trend_30d ?? [];
  const rangeSummary = data?.collection_summary;
  const rangeCollections = rangeSummary?.total_collected ?? 0;
  const hasRangeCollections = rangeCollections > 0;
  const recent = data?.collector_performance ?? [];

  const applyPreset = (preset: RangePreset) => {
    setRangePreset(preset);
    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
    } else if (preset === '7d') {
      setStartDate(daysAgo(6));
      setEndDate(today);
    } else if (preset === '30d') {
      setStartDate(daysAgo(29));
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
          paddingBottom: spacing[8],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        {/* Top bar */}
        <View style={styles.heroTop}>
          <View>
            <Text variant="caption" color="onDark" style={{ opacity: 0.6, letterSpacing: 1 }}>
              {user?.role.toUpperCase()}
            </Text>
            <Text variant="h1" color="onDark">
              {user?.name.split(' ')[0]} 👋
            </Text>
          </View>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            <IconButton
              icon={<RefreshCw size={18} color={colors.white} />}
              variant="glass"
              onPress={() => void refetch()}
              accessibilityLabel="Refresh"
            />
            <IconButton
              icon={<LogOut size={18} color={colors.white} />}
              variant="glass"
              onPress={() => void logout()}
              accessibilityLabel="Sign out"
            />
          </View>
        </View>

        {/* Hero outstanding card */}
        {k ? (
          <View style={styles.heroCard}>
            <Text
              variant="caption"
              color="onDark"
              style={{ opacity: 0.6, letterSpacing: 1 }}
            >
              {t('net_outstanding').toUpperCase()}
            </Text>
            <Text style={styles.heroAmount}>
              {`₹${k.outstanding >= 100000
                ? k.outstanding >= 10000000
                  ? `${(k.outstanding / 10000000).toFixed(1)}Cr`
                  : `${(k.outstanding / 100000).toFixed(1)}L`
                : k.outstanding.toLocaleString('en-IN')}`}
            </Text>
            <View style={styles.heroStats}>
              <HeroStat label={t('today')} amount={k.collected_today} accent />
              <View style={styles.heroDivider} />
              <HeroStat label={t('profit')} amount={k.profit_realised} />
              <View style={styles.heroDivider} />
              <HeroStat
                label="Period"
                amount={rangeCollections}
                accent={rangeCollections > 0}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.heroCard, { gap: spacing[3] }]}>
            <SkeletonLoader width={120} height={11} style={{ alignSelf: 'center' }} />
            <SkeletonLoader width="60%" height={48} style={{ alignSelf: 'center' }} />
            <SkeletonLoader width="100%" height={14} />
          </View>
        )}
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX, paddingBottom: spacing[8] }}>
        {/* KPI grid — 2×2 */}
        <View style={styles.kpiGrid}>
          <View style={styles.kpiRow}>
            <KPITile
              icon={<Wallet size={18} color={colors.brand[600]} />}
              iconBg="rgba(0,200,83,0.12)"
              label={t('capital_disbursed')}
              sub={k ? `${k.active_loans + k.closed_loans} ${t('loans')}` : '--'}
              value={k ? k.capital_disbursed : null}
              valueColor={colors.brand[700]}
            />
            <KPITile
              icon={<IndianRupee size={18} color={colors.success} />}
              iconBg="rgba(22,163,74,0.12)"
              label={t('total_collected')}
              sub={t('lifetime')}
              value={k ? k.collected_lifetime : null}
              valueColor={colors.success}
            />
          </View>
          <View style={styles.kpiRow}>
            <KPITile
              icon={<TrendingUp size={18} color="#f97316" />}
              iconBg="rgba(249,115,22,0.12)"
              label={t('profit')}
              sub={k ? `${k.closed_loans} ${t('closed_loans').toLowerCase()}` : '--'}
              value={k ? k.profit_realised : null}
              valueColor="#f97316"
            />
          </View>
        </View>

        {/* Quick stats row */}
        <View style={styles.statsRow}>
          <Card padding={3} style={styles.statCard}>
            <Text variant="caption" color="tertiary">{t('customers').toUpperCase()}</Text>
            <Text variant="h2" style={{ marginTop: 2 }}>{k?.total_customers ?? '—'}</Text>
            <Text variant="caption" color="tertiary">{k?.active_customers ?? 0} {t('active').toLowerCase()}</Text>
          </Card>
          <Card padding={3} style={styles.statCard}>
            <Text variant="caption" color="tertiary">{t('active_loans').toUpperCase()}</Text>
            <Text variant="h2" style={{ marginTop: 2 }}>{k?.active_loans ?? '—'}</Text>
            <Text variant="caption" color="tertiary">{k?.closed_loans ?? 0} {t('closed_loans').toLowerCase()}</Text>
          </Card>
        </View>

        <Card padding={4} style={{ marginTop: spacing[3] }}>
          <View style={styles.sectionHead}>
            <View>
              <Text variant="title">Collection period</Text>
              <Text variant="caption" color="tertiary">Choose dates to inspect day-wise collections</Text>
            </View>
          </View>
          <View style={styles.rangeChips}>
            {[
              { key: 'today', label: 'Today' },
              { key: '7d', label: '7 days' },
              { key: '30d', label: '30 days' },
              { key: 'custom', label: 'Custom' },
            ].map((opt) => {
              const active = rangePreset === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[styles.rangeChip, { borderColor: active ? colors.brand[500] : colors.border.default, backgroundColor: active ? colors.brand[50] : colors.card }]}
                  onPress={() => applyPreset(opt.key as RangePreset)}
                >
                  <Text variant="label" style={{ color: active ? colors.brand[700] : colors.text.secondary }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {rangePreset === 'custom' ? (
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <DatePickerField label="From" value={startDate} maxDate={endDate} onChange={setStartDate} />
              </View>
              <View style={styles.dateField}>
                <DatePickerField label="To" value={endDate} minDate={startDate} maxDate={today} onChange={setEndDate} />
              </View>
            </View>
          ) : null}
          {rangeSummary ? (
            <View style={styles.rangeTotals}>
              <RangeMetric label="Total" value={rangeSummary.total_collected} />
              <RangeMetric label="Cash" value={rangeSummary.cash_collected} />
              <RangeMetric label="UPI" value={rangeSummary.upi_collected} />
            </View>
          ) : null}
        </Card>

        {/* Collection chart */}
        <Card padding={4} style={{ marginTop: spacing[3] }}>
          <View style={styles.sectionHead}>
            <View>
              <Text variant="title">{t('collection_trend')}</Text>
              <Text variant="caption" color="tertiary">{startDate} to {endDate}</Text>
            </View>
            {data ? (
              <View style={{ alignItems: 'flex-end' }}>
                <AmountText value={rangeCollections} size="sm" color={colors.brand[700]} short />
                <Text variant="caption" color="tertiary">period total</Text>
              </View>
            ) : null}
          </View>
          <View style={{ marginTop: spacing[2] }}>
            {hasRangeCollections ? (
              <CollectionBarChart
                data={rangeTrend}
                width={screenWidth - layout.screenPaddingX * 2 - spacing[4] * 2}
              />
            ) : isLoading ? (
              <SkeletonLoader height={110} />
            ) : (
              <View style={{ height: 80, alignItems: 'center', justifyContent: 'center' }}>
                <Text variant="caption" color="tertiary">{t('no_trend_data')}</Text>
              </View>
            )}
          </View>
        </Card>

        {/* Leaderboard */}
        <Card padding={4} style={{ marginTop: spacing[3] }}>
          <View style={styles.sectionHead}>
            <Text variant="title">{t('top_collectors')}</Text>
          </View>
          {recent.length === 0 ? (
            <EmptyState
              title={t('no_collections_yet')}
              description={t('no_collections_desc')}
            />
          ) : (
            <View style={{ marginTop: spacing[2] }}>
              {recent.map((c, idx) => {
                const peakCollected = Math.max(...recent.map((x) => x.collected), 1);
                const pct = Math.round((c.collected / peakCollected) * 100);
                return (
                  <Pressable
                    key={c.id}
                    style={[styles.leaderRow, idx > 0 && { borderTopWidth: 1, borderTopColor: colors.border.subtle }]}
                    onPress={() => nav.navigate('Team', { screen: 'CollectorDetail', params: { id: c.id } })}
                  >
                    <Text variant="caption" color="tertiary" style={styles.leaderRank}>#{idx + 1}</Text>
                    <Avatar name={c.name} id={c.id} size="sm" />
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                      <View style={styles.leaderHead}>
                        <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>{c.name}</Text>
                        <AmountText value={c.collected} size="sm" color={colors.brand[700]} short bold={false} />
                      </View>
                      <View style={styles.leaderSub}>
                        <Text variant="caption" color="tertiary">{c.visits} {t('visits')}</Text>
                        <Text variant="caption" color={c.missed > 0 ? colors.danger : colors.text.tertiary}>
                          {c.collection_days} days · avg ₹{c.average_per_day.toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <ProgressBar value={pct} height={3} style={{ marginTop: 4 }} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </Card>
      </View>
    </Screen>
  );
}

interface HeroStatProps {
  label: string;
  amount?: number;
  count?: number;
  accent?: boolean;
  warn?: boolean;
}
function HeroStat({ label, amount, count, accent, warn }: HeroStatProps) {
  const colors = useColors();
  const valueColor = warn && (count ?? 0) > 0 ? colors.danger : accent ? colors.brand[200] : colors.white;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', flex: 1 }}>
      <Text variant="caption" color="onDark" style={{ opacity: 0.6, marginBottom: 4, letterSpacing: 0.5 }}>
        {label.toUpperCase()}
      </Text>
      {amount !== undefined ? (
        <AmountText value={amount} size="sm" color={valueColor} />
      ) : (
        <Text variant="bodyStrong" style={{ color: valueColor }}>{count ?? 0}</Text>
      )}
    </View>
  );
}

function RangeMetric({ label, value }: { label: string; value: number }) {
  const colors = useColors();
  return (
    <View style={styles.rangeMetric}>
      <Text variant="caption" color="tertiary">{label.toUpperCase()}</Text>
      <AmountText value={value} size="sm" color={colors.text.primary} short />
    </View>
  );
}

interface KPITileProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  value: number | null;
  valueColor: string;
  isCount?: boolean;
  onPress?: () => void;
}
function KPITile({ icon, iconBg, label, sub, value, valueColor, isCount = false, onPress }: KPITileProps) {
  return (
    <Card padding={3} style={styles.kpiTile} onPress={onPress}>
      <View style={styles.kpiHeader}>
        <Text variant="overline" color="tertiary" style={styles.kpiLabel} numberOfLines={2}>
          {label}
        </Text>
        <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>{icon}</View>
      </View>
      {value !== null ? (
        isCount ? (
          <Text variant="h2" style={[styles.kpiValue, { color: valueColor }]}>{value}</Text>
        ) : (
          <AmountText value={value} size="lg" color={valueColor} short style={styles.kpiAmount} />
        )
      ) : (
        <SkeletonLoader width={72} height={24} style={styles.kpiValue} />
      )}
      <Text variant="caption" color="tertiary" numberOfLines={1} style={styles.kpiSub}>{sub}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCard: {
    marginTop: spacing[5],
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: radii['2xl'],
    padding: spacing[4],
  },
  heroAmount: {
    fontFamily: fontFamily.bold,
    fontSize: 44,
    lineHeight: 52,
    color: '#ffffff',
    letterSpacing: -1,
    marginTop: spacing[1],
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  heroDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: spacing[2],
  },
  kpiGrid: {
    gap: spacing[2],
    marginTop: spacing[4],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  kpiTile: { flex: 1 },
  kpiHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 36 },
  kpiLabel: { flex: 1, paddingRight: spacing[2] },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: { marginTop: spacing[3] },
  kpiAmount: { marginTop: spacing[3] },
  kpiSub: { marginTop: spacing[2], opacity: 0.75 },
  statsRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  statCard: { flex: 1 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3] },
  leaderRank: { width: 24, textAlign: 'center', marginRight: spacing[1] },
  leaderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  leaderSub: { flexDirection: 'row', justifyContent: 'space-between' },
  rangeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  rangeChip: {
    borderWidth: 1,
    borderRadius: radii.full,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  dateField: { flex: 1 },
  rangeTotals: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[3],
  },
  rangeMetric: { flex: 1 },
});
