/**
 * LoanDetailScreen — outstanding, progress, schedule, close-early.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, CircleCheck, Lock, Receipt } from 'lucide-react-native';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import {
  AmountText,
  Avatar,
  Badge,
  Button,
  Card,
  GradientBackground,
  IconButton,
  ProgressBar,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCloseLoan, useLoan } from '@/features/loans/hooks/useLoans';
import { InstallmentRow } from '@/features/loans/components/InstallmentRow';
import { colors, layout, radii, spacing } from '@/theme';
import type { LoanStatus } from '@/types';

type Nav = NativeStackNavigationProp<CustomersStackParamList, 'LoanDetail'>;
type Route = RouteProp<CustomersStackParamList, 'LoanDetail'>;

const LOAN_STATUS_TONE: Record<LoanStatus, 'success' | 'warning' | 'neutral' | 'danger'> = {
  active: 'success',
  overdue: 'warning',
  closed: 'neutral',
  cancelled: 'danger',
};

const MODEL_LABEL = { model_a: 'Model A · Pre-deduct', model_b: 'Model B · Add-on' };
const FREQ_LABEL: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  half_yearly: '6-Monthly',
  yearly: 'Yearly',
  custom: 'Custom',
};

export function LoanDetailScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const isInvestor = user?.role === 'investor';
  const toast = useToast();

  const { data: loan, isLoading } = useLoan(params.id);
  const close = useCloseLoan(params.id);

  if (isLoading || !loan) {
    return (
      <Screen background="default" edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      </Screen>
    );
  }

  const handleClose = async () => {
    try {
      await close.mutateAsync('Customer paid in full');
      toast.success('Loan closed');
    } catch {
      toast.error('Could not close loan');
    }
  };

  const installments = loan.installments ?? [];
  const paidCount = installments.filter((i) => i.status === 'paid').length;

  return (
    <Screen padded={false} background="default" edges={[]} scroll>
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
        <View style={styles.topRow}>
          <IconButton
            icon={<ChevronLeft size={20} color={colors.white} />}
            variant="glass"
            onPress={() => nav.goBack()}
            accessibilityLabel="Back"
          />
          <View style={{ flex: 1, marginLeft: spacing[2] }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              LOAN · {loan.id.slice(0, 8).toUpperCase()}
            </Text>
            <Text variant="title" color="onDark">
              {loan.customer_name}
            </Text>
          </View>
          <Badge label={loan.status} tone={LOAN_STATUS_TONE[loan.status]} withDot />
        </View>

        <View style={styles.outstandingRow}>
          <View>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              OUTSTANDING
            </Text>
            <AmountText
              value={loan.outstanding}
              size="3xl"
              color={colors.white}
              short
            />
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              {loan.repaid_pct.toFixed(0)}% REPAID
            </Text>
            <Text variant="caption" color="onDark" style={{ opacity: 0.85 }}>
              {loan.repaid.toLocaleString('en-IN')} / {loan.repayable.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
        <ProgressBar
          value={loan.repaid_pct}
          height={6}
          trackColor="rgba(255,255,255,0.15)"
          fillColor={colors.brand[200]}
          style={{ marginTop: spacing[2] }}
        />
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {/* Quick stats */}
        <View style={styles.statsRow}>
          <Card padding={3} style={styles.stat}>
            <Text variant="caption" color="tertiary">
              PRINCIPAL
            </Text>
            <AmountText value={loan.principal} size="md" short />
          </Card>
          <Card padding={3} style={styles.stat}>
            <Text variant="caption" color="tertiary">
              DISBURSED
            </Text>
            <AmountText value={loan.disbursed} size="md" short />
          </Card>
          <Card padding={3} style={styles.stat}>
            <Text variant="caption" color="tertiary">
              PROFIT
            </Text>
            <AmountText value={loan.profit} size="md" color={colors.brand[700]} short />
          </Card>
        </View>

        {/* Loan terms */}
        <Card padding={4} style={{ marginBottom: spacing[3] }}>
          <View style={styles.termsRow}>
            <Term label="Model" value={MODEL_LABEL[loan.lending_model]} />
            <Term
              label="Interest"
              value={
                loan.interest_type === 'pct'
                  ? `${loan.interest_value}%`
                  : `₹${loan.interest_value.toFixed(0)}`
              }
            />
          </View>
          <View style={styles.termsRow}>
            <Term label="Frequency" value={FREQ_LABEL[loan.repayment_frequency] ?? loan.repayment_frequency} />
            <Term label="Installments" value={`${paidCount}/${loan.total_installments}`} />
          </View>
          <View style={styles.termsRow}>
            <Term label="Per installment" value={`₹${loan.installment_amount.toLocaleString('en-IN')}`} />
            <Term label="Started" value={loan.start_date} />
          </View>
        </Card>

        {/* Collector */}
        <Card padding={3} style={{ marginBottom: spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={loan.collector_name} id={loan.collector_id} size="md" />
            <View style={{ marginLeft: spacing[3], flex: 1 }}>
              <Text variant="caption" color="tertiary">
                COLLECTOR
              </Text>
              <Text variant="bodyStrong">{loan.collector_name}</Text>
            </View>
            {isInvestor && loan.status === 'active' ? (
              <Button
                label="Reassign"
                variant="ghost"
                size="sm"
                onPress={() => toast.info('Reassign — coming soon')}
              />
            ) : null}
          </View>
        </Card>

        {/* Schedule */}
        <Text variant="title" style={{ marginTop: spacing[2], marginBottom: spacing[2] }}>
          Schedule
        </Text>
        <Card padding={0} style={{ paddingTop: spacing[1] }}>
          {installments.length === 0 ? (
            <Text variant="caption" color="tertiary" style={{ padding: spacing[4] }}>
              No installments
            </Text>
          ) : (
            <ScrollView style={{ maxHeight: 360 }}>
              {installments.map((i) => (
                <InstallmentRow key={i.id} installment={i} />
              ))}
            </ScrollView>
          )}
        </Card>

        {/* Collections (placeholder for Sprint 4) */}
        <View style={styles.sectionHead}>
          <Text variant="title">Collections</Text>
          <Text variant="caption" color="tertiary">
            Sprint 4
          </Text>
        </View>
        <Card padding={4} style={{ alignItems: 'center' }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: radii.full,
              backgroundColor: colors.brand[50],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Receipt size={20} color={colors.brand[700]} />
          </View>
          <Text variant="caption" color="secondary" style={{ marginTop: spacing[2] }}>
            Collection history will appear here when payments are recorded.
          </Text>
        </Card>

        {/* Actions */}
        {isInvestor && loan.status === 'active' ? (
          <Button
            label="Close loan"
            variant="secondary"
            fullWidth
            size="lg"
            leadingIcon={<Lock size={16} color={colors.white} />}
            onPress={handleClose}
            loading={close.isPending}
            style={{ marginTop: spacing[6] }}
          />
        ) : null}
        {loan.status === 'closed' ? (
          <View style={styles.closedBanner}>
            <CircleCheck size={18} color={colors.success} />
            <Text variant="bodyStrong" color={colors.success} style={{ marginLeft: spacing[2] }}>
              Loan closed
            </Text>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

interface TermProps {
  label: string;
  value: string;
}
function Term({ label, value }: TermProps) {
  return (
    <View style={styles.term}>
      <Text variant="caption" color="tertiary">
        {label}
      </Text>
      <Text variant="bodyStrong" style={{ marginTop: 2 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  outstandingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing[5],
  },
  statsRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] },
  stat: { flex: 1 },
  termsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing[3],
  },
  term: { flex: 1 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.successSoft,
    padding: spacing[3],
    borderRadius: radii.lg,
    marginTop: spacing[6],
  },
});
