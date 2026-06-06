/**
 * CollectScreen — paid/missed toggle, quick-amount chips, mode picker.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Banknote,
  Building2,
  Check,
  ChevronLeft,
  Smartphone,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CollectorStackParamList } from '@/app/navigation/TodayNavigator';
import {
  Avatar,
  Button,
  Card,
  GradientBackground,
  IconButton,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useLoan } from '@/features/loans/hooks/useLoans';
import { useCollect, useMarkMissed } from '@/features/payments/hooks/usePayments';
import { useT } from '@/i18n';
import { colors, useColors, fontFamily, layout, radii, spacing } from '@/theme';
import type { PaymentMode } from '@/types';

type Nav = NativeStackNavigationProp<CollectorStackParamList, 'Collect'>;
type Route = RouteProp<CollectorStackParamList, 'Collect'>;

const MODE_ICONS: Record<PaymentMode, typeof Banknote> = {
  CASH: Banknote, UPI: Smartphone, BANK: Building2,
};

const MISSED_REASONS = [
  'Customer unavailable',
  'Customer refused',
  'Shop closed',
  'Promised later',
  'Wrong address',
  'Medical issue',
  'Other',
] as const;

type MissedReason = typeof MISSED_REASONS[number];

export function CollectScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const dynColors = useColors();

  const REASON_LABEL: Record<MissedReason, string> = {
    'Customer unavailable': t('customer_unavailable'),
    'Customer refused': t('customer_refused'),
    'Shop closed': t('shop_closed'),
    'Promised later': t('promised_later'),
    'Wrong address': t('wrong_address'),
    'Medical issue': t('medical_issue'),
    'Other': t('other'),
  };
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const toast = useToast();
  const { data: loan } = useLoan(params.loanId);
  const collect = useCollect();
  const markMissed = useMarkMissed();

  const targetInstallment = useMemo(() => {
    if (!loan) return undefined;
    if (params.scheduleId)
      return loan.installments?.find((i) => i.id === params.scheduleId);
    return loan.installments?.find(
      (i) =>
        i.status === 'pending' ||
        i.status === 'partial' ||
        i.status === 'overdue' ||
        i.status === 'due_today'
    );
  }, [loan, params.scheduleId]);

  const targetRemaining = targetInstallment
    ? targetInstallment.due_amount - targetInstallment.paid_amount
    : loan?.installment_amount ?? 0;

  const [mode, setMode] = useState<'PAID' | 'MISSED'>('PAID');
  const [amount, setAmount] = useState<string>(targetRemaining ? String(targetRemaining) : '');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [reason, setReason] = useState<string>(MISSED_REASONS[0]);

  const submit = async () => {
    if (!loan || !targetInstallment) return;
    try {
      if (mode === 'PAID') {
        const amt = parseInt(amount, 10);
        if (!Number.isFinite(amt) || amt <= 0) {
          toast.warning('Enter a valid amount');
          return;
        }
        await collect.mutateAsync({
          loan_id: loan.id,
          amount: amt,
          mode: paymentMode,
          schedule_id: targetInstallment.id,
          notes: notes.trim() || undefined,
        });
        toast.success(`Collected ₹${amt.toLocaleString('en-IN')}`);
      } else {
        await markMissed.mutateAsync({
          loan_id: loan.id,
          schedule_id: targetInstallment.id,
          reason,
          notes: notes.trim() || undefined,
        });
        toast.info('Marked missed');
      }
      nav.goBack();
    } catch (e) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not save entry';
      toast.error(typeof detail === 'string' ? detail : 'Failed');
    }
  };

  if (!loan || !targetInstallment) {
    return (
      <Screen background="default" edges={['top']}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="body" color="secondary">
            Loading…
          </Text>
        </View>
      </Screen>
    );
  }

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
        <View style={styles.topRow}>
          <IconButton
            icon={<ChevronLeft size={20} color={colors.white} />}
            variant="glass"
            onPress={() => nav.goBack()}
            accessibilityLabel="Back"
          />
          <View style={{ flex: 1, marginLeft: spacing[2] }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              {t('collect').toUpperCase()}
            </Text>
            <Text variant="title" color="onDark" numberOfLines={1}>
              {loan.customer_name}
            </Text>
          </View>
        </View>

        <View style={styles.heroRow}>
          <Avatar
            name={loan.customer_name}
            id={loan.customer_id}
            size="lg"
            ring="none"
          />
          <View style={{ flex: 1, marginLeft: spacing[3] }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              {t('installment').toUpperCase()} #{targetInstallment.sequence}
            </Text>
            <Text variant="h2" color="onDark">
              ₹{targetRemaining.toLocaleString('en-IN')}
            </Text>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              Due {targetInstallment.due_date}
            </Text>
          </View>
        </View>
      </GradientBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setMode('PAID')}
              style={[styles.toggle, mode === 'PAID' && styles.togglePaid]}
            >
              <Check size={16} color={mode === 'PAID' ? colors.white : colors.success} />
              <Text
                variant="bodyStrong"
                color={mode === 'PAID' ? 'onBrand' : colors.success}
                style={{ marginLeft: 6 }}
              >
                {t('collected')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('MISSED')}
              style={[styles.toggle, mode === 'MISSED' && styles.toggleMissed]}
            >
              <X size={16} color={mode === 'MISSED' ? colors.white : colors.danger} />
              <Text
                variant="bodyStrong"
                color={mode === 'MISSED' ? 'onBrand' : colors.danger}
                style={{ marginLeft: 6 }}
              >
                {t('missed')}
              </Text>
            </Pressable>
          </View>

          {mode === 'PAID' ? (
            <>
              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('amount').toUpperCase()}
                </Text>
                <View style={styles.amountWrap}>
                  <Text style={styles.amountSymbol}>₹</Text>
                  <TextInput
                    style={[styles.amountInput, { color: dynColors.text.primary }]}
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="numeric"
                    selectionColor={dynColors.brand[600]}
                  />
                </View>
                <View style={styles.chipRow}>
                  {[
                    { label: 'Full', value: targetRemaining },
                    { label: '½', value: Math.round(targetRemaining / 2) },
                    { label: 'All loan', value: loan.outstanding },
                  ].map((c) => (
                    <Pressable
                      key={c.label}
                      onPress={() => setAmount(String(c.value))}
                      style={styles.chip}
                    >
                      <Text variant="label" color="secondary">
                        {c.label}
                      </Text>
                      <Text variant="caption" color="tertiary">
                        ₹{c.value.toLocaleString('en-IN')}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('payment_mode').toUpperCase()}
                </Text>
                <View style={styles.modeRow}>
                  {([
                    { key: 'CASH' as PaymentMode, label: t('cash') },
                    { key: 'UPI' as PaymentMode, label: t('upi') },
                    { key: 'BANK' as PaymentMode, label: t('bank') },
                  ] as const).map((m) => {
                    const Icon = MODE_ICONS[m.key];
                    const selected = paymentMode === m.key;
                    return (
                      <Pressable
                        key={m.key}
                        onPress={() => setPaymentMode(m.key)}
                        style={[styles.modeCard, selected && styles.modeCardSelected]}
                      >
                        <Icon
                          size={20}
                          color={selected ? colors.brand[600] : colors.slate[400]}
                        />
                        <Text
                          variant="label"
                          color={selected ? 'primary' : 'secondary'}
                          style={{ marginTop: 6 }}
                        >
                          {m.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('notes').toUpperCase()} (OPTIONAL)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Anything to add?"
                  placeholderTextColor={colors.text.placeholder}
                  style={styles.notesInput}
                  multiline
                />
              </Card>
            </>
          ) : (
            <>
              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('why_missed').toUpperCase()}
                </Text>
                <View style={{ gap: spacing[2] }}>
                  {MISSED_REASONS.map((r) => {
                    const selected = reason === r;
                    return (
                      <Pressable
                        key={r}
                        onPress={() => setReason(r)}
                        style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                      >
                        <View
                          style={[
                            styles.radio,
                            selected && { borderColor: colors.brand[600] },
                          ]}
                        >
                          {selected ? <View style={styles.radioDot} /> : null}
                        </View>
                        <Text variant="body" style={{ marginLeft: spacing[2] }}>
                          {REASON_LABEL[r]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Card>

              <Card padding={4} style={styles.section}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
                  {t('notes').toUpperCase()}
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add detail…"
                  placeholderTextColor={colors.text.placeholder}
                  style={styles.notesInput}
                  multiline
                />
              </Card>
            </>
          )}

          <Button
            label={mode === 'PAID' ? t('save_collection') : t('mark_as_missed')}
            fullWidth
            size="lg"
            variant={mode === 'PAID' ? 'primary' : 'danger'}
            loading={collect.isPending || markMissed.isPending}
            onPress={submit}
            hapticFeedback={mode === 'PAID' ? 'success' : 'medium'}
            style={{ marginTop: spacing[5] }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  body: { padding: layout.screenPaddingX, paddingBottom: spacing[16] },
  toggleRow: { flexDirection: 'row', gap: spacing[2], marginBottom: spacing[3] },
  toggle: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePaid: { backgroundColor: colors.success, borderColor: colors.success },
  toggleMissed: { backgroundColor: colors.danger, borderColor: colors.danger },
  section: { marginBottom: spacing[3] },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: spacing[1],
  },
  amountSymbol: {
    fontFamily: fontFamily.semibold,
    fontSize: 28,
    color: colors.text.secondary,
    marginRight: 4,
  },
  amountInput: {
    flex: 1,
    fontFamily: fontFamily.bold,
    fontSize: 36,
    color: colors.text.primary,
    padding: 0,
  },
  chipRow: { flexDirection: 'row', gap: spacing[2], marginTop: spacing[3] },
  chip: {
    flex: 1,
    backgroundColor: colors.slate[50],
    borderRadius: radii.md,
    padding: spacing[2],
    alignItems: 'center',
  },
  modeRow: { flexDirection: 'row', gap: spacing[2] },
  modeCard: {
    flex: 1,
    padding: spacing[3],
    borderRadius: radii.lg,
    backgroundColor: colors.slate[50],
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  modeCardSelected: {
    backgroundColor: colors.brand[50],
    borderColor: colors.brand[600],
  },
  notesInput: {
    minHeight: 64,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text.primary,
    textAlignVertical: 'top',
    backgroundColor: colors.slate[50],
    borderRadius: radii.md,
    padding: spacing[3],
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[3],
    borderRadius: radii.lg,
    backgroundColor: colors.slate[50],
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  reasonRowSelected: { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.slate[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand[600],
  },
});
