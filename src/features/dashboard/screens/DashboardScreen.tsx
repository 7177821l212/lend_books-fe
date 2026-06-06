/**
 * DashboardScreen — investor home: KPI grid, 30-day trend, leaderboard, recent activity.
 */
import { AlertTriangle, Coins, IndianRupee, LogOut, RefreshCw, TrendingUp, UsersRound, Wallet } from 'lucide-react-native';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
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
import { colors, layout, radii, spacing } from '@/theme';

type KPIIconKey = 'wallet' | 'income' | 'profit' | 'warning' | 'customers' | 'coins';

const ICONS: Record<KPIIconKey, typeof Wallet> = {
  wallet: Wallet,
  income: IndianRupee,
  profit: TrendingUp,
  warning: AlertTriangle,
  customers: UsersRound,
  coins: Coins,
};

export function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { width: screenWidth } = useWindowDimensions();
  const { data, isRefetching, refetch } = useDashboard();

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
          paddingTop: insets.top + spacing[2],
          paddingHorizontal: layout.screenPaddingX,
          paddingBottom: spacing[6],
          borderBottomLeftRadius: radii['3xl'],
          borderBottomRightRadius: radii['3xl'],
        }}
      >
        <View style={styles.heroTop}>
          <View>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
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

        {k ? (
          <Card padding={4} style={styles.heroCard}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              NET OUTSTANDING
            </Text>
            <AmountText value={k.outstanding} size="3xl" color={colors.white} short />
            <View style={styles.heroFooter}>
              <View>
                <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                  TODAY
                </Text>
                <AmountText value={k.collected_today} size="md" color={colors.brand[200]} short />
              </View>
              <View>
                <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                  PROFIT
                </Text>
                <AmountText value={k.profit_realised} size="md" color={colors.white} short />
              </View>
              <View>
                <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                  OVERDUE
                </Text>
                <Text variant="bodyStrong" color="onDark">
                  {k.overdue_loans}
                </Text>
              </View>
            </View>
          </Card>
        ) : (
          <Card padding={4} style={[styles.heroCard, { gap: spacing[2] }]}>
            <SkeletonLoader width={140} height={32} />
            <SkeletonLoader width="100%" height={16} />
          </Card>
        )}
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {/* KPI grid */}
        <View style={styles.grid}>
          <KPITile
            label="Disbursed"
            sub={k ? `${k.active_loans + k.closed_loans} loans` : ''}
            value={k ? k.capital_disbursed : 0}
            iconKey="wallet"
            gradient="brand"
          />
          <KPITile
            label="Collected"
            sub="lifetime"
            value={k ? k.collected_lifetime : 0}
            iconKey="income"
            gradient="success"
          />
          <KPITile
            label="Profit"
            sub={`${k?.closed_loans ?? 0} closed`}
            value={k ? k.profit_realised : 0}
            iconKey="profit"
            gradient="sunset"
          />
          <KPITile
            label="Overdue"
            sub="needs attention"
            value={k ? k.overdue_loans : 0}
            iconKey="warning"
            gradient="danger"
            isCount
          />
        </View>

        {/* Trend */}
        <Card padding={4} style={{ marginTop: spacing[4] }}>
          <View style={styles.sectionHead}>
            <View>
              <Text variant="title">Collection trend</Text>
              <Text variant="caption" color="tertiary">
                Last 30 days
              </Text>
            </View>
            {k ? (
              <AmountText
                value={k.collected_lifetime}
                size="sm"
                color={colors.brand[700]}
                short
              />
            ) : null}
          </View>
          <View style={{ marginTop: spacing[2] }}>
            {trend.length > 0 ? (
              <Sparkline
                data={trend}
                width={screenWidth - layout.screenPaddingX * 2 - spacing[4] * 2}
                height={120}
              />
            ) : (
              <SkeletonLoader height={120} />
            )}
          </View>
        </Card>

        {/* Leaderboard */}
        <Card padding={4} style={{ marginTop: spacing[3] }}>
          <View style={styles.sectionHead}>
            <Text variant="title">Top collectors</Text>
          </View>
          {recent.length === 0 ? (
            <EmptyState
              title="No collections yet"
              description="Performance will appear once collectors start recording payments."
            />
          ) : (
            <View style={{ marginTop: spacing[2] }}>
              {recent.map((c) => {
                const peakCollected = Math.max(...recent.map((x) => x.collected), 1);
                const pct = Math.round((c.collected / peakCollected) * 100);
                return (
                  <View key={c.id} style={styles.leaderRow}>
                    <Avatar name={c.name} id={c.id} size="sm" />
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                      <View style={styles.leaderHead}>
                        <Text variant="bodyStrong">{c.name}</Text>
                        <AmountText
                          value={c.collected}
                          size="sm"
                          color={colors.text.secondary}
                          short
                          bold={false}
                        />
                      </View>
                      <View style={styles.leaderSub}>
                        <Text variant="caption" color="tertiary">
                          {c.visits} visits
                        </Text>
                        <Text variant="caption" color="tertiary">
                          {c.missed} missed
                        </Text>
                      </View>
                      <ProgressBar value={pct} height={4} style={{ marginTop: 4 }} />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </Card>

        {/* Customers count + active loans summary */}
        <View style={[styles.grid, { marginTop: spacing[3] }]}>
          <SmallStat label="Customers" value={k?.total_customers ?? 0} sub={`${k?.active_customers ?? 0} active`} />
          <SmallStat label="Active loans" value={k?.active_loans ?? 0} sub={`${k?.closed_loans ?? 0} closed`} />
        </View>
      </View>
    </Screen>
  );
}

interface KPITileProps {
  label: string;
  sub: string;
  value: number;
  iconKey: KPIIconKey;
  gradient: 'brand' | 'success' | 'sunset' | 'danger' | 'cool';
  isCount?: boolean;
}

function KPITile({ label, sub, value, iconKey, gradient, isCount = false }: KPITileProps) {
  const Icon = ICONS[iconKey];
  return (
    <GradientBackground gradient={gradient} style={styles.kpiTile}>
      <View style={styles.kpiTileTop}>
        <Icon size={18} color={colors.white} />
      </View>
      {isCount ? (
        <Text
          variant="h1"
          color="onDark"
          style={{ marginTop: spacing[3] }}
        >
          {value}
        </Text>
      ) : (
        <View style={{ marginTop: spacing[3] }}>
          <AmountText value={value} size="lg" color={colors.white} short />
        </View>
      )}
      <Text
        variant="caption"
        color="onDark"
        style={{ opacity: 0.85, marginTop: 2 }}
      >
        {label} {sub ? `· ${sub}` : ''}
      </Text>
    </GradientBackground>
  );
}

interface SmallStatProps {
  label: string;
  value: number | string;
  sub?: string;
}
function SmallStat({ label, value, sub }: SmallStatProps) {
  return (
    <Card padding={4} style={styles.smallStat}>
      <Text variant="caption" color="tertiary">
        {label.toUpperCase()}
      </Text>
      <Text variant="h2" style={{ marginTop: 2 }}>
        {value}
      </Text>
      {sub ? (
        <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
          {sub}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroCard: { marginTop: spacing[4], backgroundColor: 'rgba(255,255,255,0.10)' },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  kpiTile: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: spacing[4],
    borderRadius: radii['2xl'],
    minHeight: 96,
    justifyContent: 'space-between',
  },
  kpiTileTop: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[3] },
  leaderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  leaderSub: { flexDirection: 'row', justifyContent: 'space-between' },
  smallStat: { flexBasis: '48%', flexGrow: 1 },
});
