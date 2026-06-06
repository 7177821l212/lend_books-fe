/**
 * LoanDetailScreen — outstanding, progress, schedule, close-early.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle2, ChevronLeft, CircleCheck, Lock, UserCog, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import {
  AmountText,
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  GradientBackground,
  IconButton,
  ProgressBar,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCollectors } from '@/features/collectors/hooks/useCollectors';
import { useT } from '@/i18n';
import { useCloseLoan, useLoan, useReassignLoan } from '@/features/loans/hooks/useLoans';
import { InstallmentRow } from '@/features/loans/components/InstallmentRow';
import { usePaymentHistory } from '@/features/payments/hooks/usePayments';
import { colors, useColors, layout, radii, spacing } from '@/theme';
import type { LoanStatus, Payment } from '@/types';
import { useState } from 'react';

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
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const isInvestor = user?.role === 'investor';
  const toast = useToast();

  const { data: loan, isLoading } = useLoan(params.id);
  const close = useCloseLoan(params.id);
  const reassign = useReassignLoan(params.id);
  const { data: collectors } = useCollectors();
  const { data: paymentsPage } = usePaymentHistory({ loan_id: params.id });
  const payments = paymentsPage?.items ?? [];
  const [showReassign, setShowReassign] = useState(false);

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
              {t('outstanding').toUpperCase()}
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
              {t('principal').toUpperCase()}
            </Text>
            <AmountText value={loan.principal} size="md" short />
          </Card>
          <Card padding={3} style={styles.stat}>
            <Text variant="caption" color="tertiary">
              {t('disbursed').toUpperCase()}
            </Text>
            <AmountText value={loan.disbursed} size="md" short />
          </Card>
          <Card padding={3} style={styles.stat}>
            <Text variant="caption" color="tertiary">
              {t('profit').toUpperCase()}
            </Text>
            <AmountText value={loan.profit} size="md" color={colors.brand[700]} short />
          </Card>
        </View>

        {/* Loan terms */}
        <Card padding={4} style={{ marginBottom: spacing[3] }}>
          <View style={styles.termsRow}>
            <Term label={t('loan')} value={MODEL_LABEL[loan.lending_model]} />
            <Term
              label={t('interest')}
              value={
                loan.interest_type === 'pct'
                  ? `${loan.interest_value}%`
                  : `₹${loan.interest_value.toFixed(0)}`
              }
            />
          </View>
          <View style={styles.termsRow}>
            <Term label={t('frequency')} value={FREQ_LABEL[loan.repayment_frequency] ?? loan.repayment_frequency} />
            <Term label={t('installments')} value={`${paidCount}/${loan.total_installments}`} />
          </View>
          <View style={styles.termsRow}>
            <Term label={t('installment')} value={`₹${loan.installment_amount.toLocaleString('en-IN')}`} />
            <Term label={t('start_date')} value={loan.start_date} />
          </View>
        </Card>

        {/* Collector */}
        <Card padding={3} style={{ marginBottom: spacing[3] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Avatar name={loan.collector_name} id={loan.collector_id} size="md" />
            <View style={{ marginLeft: spacing[3], flex: 1 }}>
              <Text variant="caption" color="tertiary">
                {t('collector').toUpperCase()}
              </Text>
              <Text variant="bodyStrong">{loan.collector_name}</Text>
            </View>
            {isInvestor && loan.status === 'active' ? (
              <Button
                label={showReassign ? t('cancel') : t('reassign')}
                variant="ghost"
                size="sm"
                leadingIcon={showReassign ? <X size={14} color={colors.slate[500]} /> : <UserCog size={14} color={colors.brand[700]} />}
                onPress={() => setShowReassign((v) => !v)}
              />
            ) : null}
          </View>
          {showReassign && collectors && collectors.length > 0 ? (
            <View style={{ marginTop: spacing[3], gap: spacing[2] }}>
              <Text variant="caption" color="secondary">
                {t('reassign').toUpperCase()} {t('collector').toUpperCase()}
              </Text>
              {collectors
                .filter((c) => c.is_active && c.id !== loan.collector_id)
                .map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={async () => {
                      try {
                        await reassign.mutateAsync(c.id);
                        setShowReassign(false);
                        toast.success(`Reassigned to ${c.name}`);
                      } catch {
                        toast.error('Could not reassign');
                      }
                    }}
                    style={styles.collectorOption}
                  >
                    <Avatar name={c.name} id={c.id} size="sm" />
                    <View style={{ flex: 1, marginLeft: spacing[2] }}>
                      <Text variant="bodyStrong">{c.name}</Text>
                      <Text variant="caption" color="tertiary">{c.email}</Text>
                    </View>
                    <CheckCircle2 size={18} color={colors.brand[400]} />
                  </Pressable>
                ))}
            </View>
          ) : null}
        </Card>

        {/* Schedule */}
        <Text variant="title" style={{ marginTop: spacing[2], marginBottom: spacing[2] }}>
          {t('schedule')}
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

        {/* Collections */}
        <Text variant="title" style={{ marginTop: spacing[4], marginBottom: spacing[2] }}>
          {t('collections')}
        </Text>
        {payments.length === 0 ? (
          <EmptyState
            title={t('no_collections_yet')}
            description={t('no_collections_desc')}
          />
        ) : (
          <Card padding={0} style={{ overflow: 'hidden' }}>
            {payments.map((p, idx) => (
              <PaymentRow key={p.id} payment={p} last={idx === payments.length - 1} />
            ))}
          </Card>
        )}

        {/* Actions */}
        {isInvestor && loan.status === 'active' ? (
          <Button
            label={t('close_loan')}
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
              {t('loan_closed')}
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

interface PaymentRowProps {
  payment: Payment;
  last: boolean;
}
function PaymentRow({ payment, last }: PaymentRowProps) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.paymentRow,
        !last && { borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
      ]}
    >
      <View
        style={[
          styles.paymentDot,
          { backgroundColor: payment.is_missed ? colors.danger : colors.success },
        ]}
      />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text variant="bodyStrong" color={payment.is_missed ? colors.danger : colors.text.primary}>
            {payment.is_missed ? 'Missed' : `₹${payment.amount.toLocaleString('en-IN')}`}
          </Text>
          {payment.mode ? (
            <Text variant="caption" color="tertiary">
              {payment.mode}
            </Text>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
          <Text variant="caption" color="tertiary">
            {new Date(payment.collected_at).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: '2-digit',
            })}
          </Text>
          {payment.missed_reason ? (
            <Text variant="caption" color="tertiary" numberOfLines={1} style={{ maxWidth: '60%' }}>
              {payment.missed_reason}
            </Text>
          ) : null}
        </View>
      </View>
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
  collectorOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[2],
    borderRadius: radii.md,
    backgroundColor: colors.slate[50],
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing[3],
    gap: spacing[2],
  },
  paymentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    flexShrink: 0,
  },
});
