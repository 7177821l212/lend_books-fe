import { AlertTriangle, IndianRupee, LogOut, RefreshCw, TrendingUp, Wallet } from 'lucide-react-native';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { fontFamily } from '@/theme';
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
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { Sparkline } from '@/components/charts/Sparkline';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useT } from '@/i18n';
import { useColors, layout, radii, spacing } from '@/theme';
import { useNavigation } from '@react-navigation/native';

export function DashboardScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { user, logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const { data, isLoading, isRefetching, refetch } = useDashboard();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nav = useNavigation<any>();

  const k = data?.kpis;
  const trend = data?.trend_30d.map((p) => p.amount) ?? [];
  const recent = data?.collector_performance ?? [];

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
                label={t('overdue')}
                count={k.overdue_loans}
                warn={k.overdue_loans > 0}
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
            <KPITile
              icon={<AlertTriangle size={18} color={colors.danger} />}
              iconBg="rgba(220,38,38,0.12)"
              label={t('overdue')}
              sub={t('needs_attention')}
              value={k ? k.overdue_loans : null}
              valueColor={k && k.overdue_loans > 0 ? colors.danger : colors.text.secondary}
              isCount
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

        {/* Trend chart */}
        <Card padding={4} style={{ marginTop: spacing[3] }}>
          <View style={styles.sectionHead}>
            <View>
              <Text variant="title">{t('collection_trend')}</Text>
              <Text variant="caption" color="tertiary">{t('last_30_days')}</Text>
            </View>
            {k ? (
              <AmountText value={k.collected_lifetime} size="sm" color={colors.brand[700]} short />
            ) : null}
          </View>
          <View style={{ marginTop: spacing[2] }}>
            {trend.length > 0 ? (
              <Sparkline
                data={trend}
                width={screenWidth - layout.screenPaddingX * 2 - spacing[4] * 2}
                height={110}
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
                          {c.missed} {t('missed').toLowerCase()}
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

interface KPITileProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  sub: string;
  value: number | null;
  valueColor: string;
  isCount?: boolean;
}
function KPITile({ icon, iconBg, label, sub, value, valueColor, isCount = false }: KPITileProps) {
  return (
    <Card padding={3} style={styles.kpiTile}>
      <View style={[styles.kpiIcon, { backgroundColor: iconBg }]}>{icon}</View>
      {value !== null ? (
        isCount ? (
          <Text variant="h2" style={{ color: valueColor, marginTop: spacing[2] }}>{value}</Text>
        ) : (
          <AmountText value={value} size="lg" color={valueColor} short style={{ marginTop: spacing[2] }} />
        )
      ) : (
        <SkeletonLoader width={72} height={24} style={{ marginTop: spacing[2] }} />
      )}
      <Text variant="label" color="tertiary" style={{ marginTop: spacing[1] }} numberOfLines={2}>{label}</Text>
      <Text variant="caption" color="tertiary" numberOfLines={1} style={{ opacity: 0.7, marginTop: 1 }}>{sub}</Text>
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
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[2] },
  statCard: { flex: 1 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing[3] },
  leaderRank: { width: 24, textAlign: 'center', marginRight: spacing[1] },
  leaderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  leaderSub: { flexDirection: 'row', justifyContent: 'space-between' },
});
