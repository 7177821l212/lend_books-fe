/**
 * NewLoanScreen — investor creates a loan with a live calculator preview.
 * Supports Model A/B, PCT/FIXED interest, daily/weekly/monthly/half/yearly frequency.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronLeft, Calculator, Calendar, CheckCircle2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import {
  AmountText,
  Avatar,
  Button,
  Card,
  GradientBackground,
  IconButton,
  Input,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useCollectors } from '@/features/collectors/hooks/useCollectors';
import { useCustomer } from '@/features/customers/hooks/useCustomers';
import { previewLoan } from '@/features/loans/utils/loanCalc';
import { useCreateLoan } from '@/features/loans/hooks/useLoans';
import { useColors, layout, radii, spacing } from '@/theme';
import type { InterestType, LendingModel, RepaymentFrequency } from '@/types';

type Nav = NativeStackNavigationProp<CustomersStackParamList, 'NewLoan'>;
type Route = RouteProp<CustomersStackParamList, 'NewLoan'>;

const FREQUENCY_OPTIONS: Array<{ key: RepaymentFrequency; label: string }> = [
  { key: 'daily', label: 'Daily' },
  { key: 'weekly', label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
  { key: 'half_yearly', label: '6 Months' },
  { key: 'yearly', label: 'Yearly' },
  { key: 'custom', label: 'Custom' },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NewLoanScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const toast = useToast();

  const { data: customer } = useCustomer(params.customerId);
  const { data: collectors } = useCollectors();
  const create = useCreateLoan();

  const [principal, setPrincipal] = useState<string>('10000');
  const [interestValue, setInterestValue] = useState<string>('10');
  const [interestType, setInterestType] = useState<InterestType>('pct');
  const [lendingModel, setLendingModel] = useState<LendingModel>('model_a');
  const [frequency, setFrequency] = useState<RepaymentFrequency>('daily');
  const [customInterval, setCustomInterval] = useState<string>('7');
  const [installments, setInstallments] = useState<string>('10');
  const [startDate] = useState<string>(todayISO());
  const [collectorId, setCollectorId] = useState<string | undefined>(undefined);

  const preview = useMemo(
    () =>
      previewLoan({
        principal: parseInt(principal, 10) || 0,
        interestType,
        interestValue: parseFloat(interestValue) || 0,
        lendingModel,
        installments: parseInt(installments, 10) || 0,
      }),
    [principal, interestType, interestValue, lendingModel, installments]
  );

  const submit = async () => {
    if (!customer || !collectorId || !preview.valid) {
      toast.warning('Fix the highlighted fields');
      return;
    }
    try {
      const loan = await create.mutateAsync({
        customer_id: customer.id,
        collector_id: collectorId,
        principal: parseInt(principal, 10),
        interest_type: interestType,
        interest_value: parseFloat(interestValue),
        lending_model: lendingModel,
        repayment_frequency: frequency,
        frequency_meta:
          frequency === 'custom'
            ? { interval_days: parseInt(customInterval, 10) || 7 }
            : null,
        total_installments: parseInt(installments, 10),
        start_date: startDate,
      });
      toast.success('Loan created');
      nav.replace('LoanDetail', { id: loan.id });
    } catch (e) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not create loan';
      toast.error(typeof detail === 'string' ? detail : 'Validation failed');
    }
  };

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
          <View style={{ marginLeft: spacing[2], flex: 1 }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              NEW LOAN
            </Text>
            <Text variant="title" color="onDark">
              {customer?.name ?? '...'}
            </Text>
          </View>
        </View>

        {/* Live preview */}
        <Card padding={4} style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <Calculator size={16} color={colors.white} />
            <Text variant="caption" color="onDark" style={{ marginLeft: 6, opacity: 0.7 }}>
              LIVE PREVIEW
            </Text>
          </View>
          <View style={styles.previewGrid}>
            <View style={styles.previewCell}>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                CUSTOMER GETS
              </Text>
              <AmountText
                value={preview.disbursed}
                size="xl"
                color={colors.brand[200]}
                short
              />
            </View>
            <View style={styles.previewCell}>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                CUSTOMER REPAYS
              </Text>
              <AmountText value={preview.repayable} size="xl" color={colors.white} short />
            </View>
            <View style={styles.previewCell}>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                PROFIT
              </Text>
              <AmountText value={preview.profit} size="lg" color={colors.brand[200]} short />
            </View>
            <View style={styles.previewCell}>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                INSTALLMENT
              </Text>
              <AmountText
                value={preview.installmentMax}
                size="lg"
                color={colors.white}
                short
              />
              {preview.highRows > 0 && preview.installmentMax !== preview.installmentBase ? (
                <Text
                  variant="caption"
                  color="onDark"
                  style={{ opacity: 0.7, marginTop: 2 }}
                >
                  first {preview.highRows} × ₹{preview.installmentMax.toLocaleString('en-IN')}, then ₹{preview.installmentBase.toLocaleString('en-IN')}
                </Text>
              ) : null}
            </View>
          </View>
          {!preview.valid && preview.error ? (
            <Text variant="caption" color={colors.danger} style={{ marginTop: spacing[2] }}>
              ⚠ {preview.error}
            </Text>
          ) : null}
        </Card>
      </GradientBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {/* Principal */}
          <Section title="Loan amount">
            <Input
              label="Principal (₹)"
              keyboardType="numeric"
              value={principal}
              onChangeText={setPrincipal}
            />
          </Section>

          {/* Lending model */}
          <Section title="Lending model">
            <View style={styles.toggleRow}>
              <ToggleCard
                label="Model A"
                sub="Interest up-front · customer receives Principal − Interest"
                selected={lendingModel === 'model_a'}
                onPress={() => setLendingModel('model_a')}
              />
              <ToggleCard
                label="Model B"
                sub="Interest added on top · customer repays Principal + Interest"
                selected={lendingModel === 'model_b'}
                onPress={() => setLendingModel('model_b')}
              />
            </View>
          </Section>

          {/* Interest */}
          <Section title="Interest">
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <View style={{ flex: 1 }}>
                <Text variant="caption" color="secondary" style={{ marginBottom: spacing[1.5] }}>
                  TYPE
                </Text>
                <View style={styles.smallToggleRow}>
                  <Pressable
                    onPress={() => setInterestType('pct')}
                    style={[
                      styles.smallToggle,
                      {
                        backgroundColor: colors.slate[50],
                        borderColor: colors.border.default,
                      },
                      interestType === 'pct' && {
                        backgroundColor: colors.brand[600],
                        borderColor: colors.brand[600],
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      color={interestType === 'pct' ? 'onBrand' : 'secondary'}
                      align="center"
                    >
                      %
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setInterestType('fixed')}
                    style={[
                      styles.smallToggle,
                      {
                        backgroundColor: colors.slate[50],
                        borderColor: colors.border.default,
                      },
                      interestType === 'fixed' && {
                        backgroundColor: colors.brand[600],
                        borderColor: colors.brand[600],
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      color={interestType === 'fixed' ? 'onBrand' : 'secondary'}
                      align="center"
                    >
                      ₹
                    </Text>
                  </Pressable>
                </View>
              </View>
              <View style={{ flex: 2 }}>
                <Input
                  label={interestType === 'pct' ? 'Percentage' : 'Fixed amount'}
                  keyboardType="numeric"
                  value={interestValue}
                  onChangeText={setInterestValue}
                />
              </View>
            </View>
          </Section>

          {/* Schedule */}
          <Section title="Repayment schedule">
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
              FREQUENCY
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.freqRow}
            >
              {FREQUENCY_OPTIONS.map((opt) => {
                const active = frequency === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => setFrequency(opt.key)}
                    style={[
                      styles.freqChip,
                      {
                        backgroundColor: colors.slate[100],
                        borderColor: colors.border.default,
                      },
                      active && {
                        backgroundColor: colors.brand[600],
                        borderColor: colors.brand[600],
                      },
                    ]}
                  >
                    <Text
                      variant="label"
                      color={active ? 'onBrand' : 'secondary'}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {frequency === 'custom' ? (
              <Input
                label="Days between installments"
                keyboardType="numeric"
                value={customInterval}
                onChangeText={setCustomInterval}
                containerStyle={{ marginTop: spacing[3] }}
              />
            ) : null}
            <Input
              label="Number of installments"
              keyboardType="numeric"
              value={installments}
              onChangeText={setInstallments}
              containerStyle={{ marginTop: spacing[3] }}
            />
            <View style={[styles.dateChip, { backgroundColor: colors.slate[50] }]}>
              <Calendar size={14} color={colors.slate[500]} />
              <Text variant="label" color="secondary" style={{ marginLeft: 6 }}>
                Starts today · {startDate}
              </Text>
            </View>
          </Section>

          {/* Collector picker — only active collectors are selectable, since the
              backend rejects inactive ones during loan creation. */}
          <Section title="Assign collector">
            {collectors && collectors.length > 0 ? (
              <View style={{ gap: spacing[2] }}>
                {collectors
                  .filter((c) => c.is_active)
                  .map((c) => {
                    const selected = collectorId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setCollectorId(c.id)}
                        style={[
                          styles.collectorRow,
                          { backgroundColor: colors.slate[50] },
                          selected && {
                            backgroundColor: colors.brand[50],
                            borderColor: colors.brand[600],
                          },
                        ]}
                      >
                        <Avatar name={c.name} id={c.id} size="sm" />
                        <View style={{ flex: 1, marginLeft: spacing[3] }}>
                          <Text variant="bodyStrong">{c.name}</Text>
                          <Text variant="caption" color="tertiary">
                            {c.email}
                          </Text>
                        </View>
                        {selected ? (
                          <CheckCircle2 size={20} color={colors.brand[600]} />
                        ) : null}
                      </Pressable>
                    );
                  })}
              </View>
            ) : (
              <Text variant="caption" color="tertiary">
                Loading collectors…
              </Text>
            )}
          </Section>

          <Button
            label={preview.valid ? 'Create loan' : 'Fix errors above'}
            fullWidth
            size="lg"
            disabled={!preview.valid || !collectorId}
            loading={create.isPending}
            onPress={submit}
            hapticFeedback="medium"
            style={{ marginTop: spacing[5] }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
  return (
    <Card padding={4} style={{ marginBottom: spacing[3] }}>
      <Text variant="title" style={{ marginBottom: spacing[3] }}>
        {title}
      </Text>
      {children}
    </Card>
  );
}

interface ToggleCardProps {
  label: string;
  sub: string;
  selected: boolean;
  onPress: () => void;
}

function ToggleCard({ label, sub, selected, onPress }: ToggleCardProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toggleCard,
        { borderColor: colors.border.default, backgroundColor: colors.slate[50] },
        selected && { borderColor: colors.brand[600], backgroundColor: colors.brand[50] },
      ]}
    >
      <View style={styles.toggleHeader}>
        <Text variant="bodyStrong" color={selected ? colors.brand[700] : 'primary'}>
          {label}
        </Text>
        {selected ? <CheckCircle2 size={16} color={colors.brand[600]} /> : null}
      </View>
      <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>
        {sub}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  previewCard: {
    marginTop: spacing[4],
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  previewHeader: { flexDirection: 'row', alignItems: 'center' },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing[3],
  },
  previewCell: {
    width: '50%',
    paddingVertical: spacing[2],
  },
  body: {
    padding: layout.screenPaddingX,
    paddingBottom: spacing[16],
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  toggleCard: {
    flex: 1,
    padding: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  smallToggleRow: { flexDirection: 'row', gap: 4 },
  smallToggle: {
    flex: 1,
    height: 48,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  freqRow: { gap: spacing[2] },
  freqChip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radii.full,
    borderWidth: 1,
    marginRight: spacing[2],
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    marginTop: spacing[3],
    alignSelf: 'flex-start',
  },
  collectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
});
