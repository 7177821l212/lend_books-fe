/**
 * RescheduleSheet — investor-only control to replace the REMAINING schedule.
 *
 * Deliberately two-step: the investor picks how the rest should be repaid, sees
 * the old plan next to the new one, and only then confirms. Nothing is written
 * until they do. Paid installments and the collection ledger are never touched —
 * only rows that still expect money get replaced, and the old rows survive as
 * inactive history under a new schedule version.
 */
import { ArrowRight, CalendarClock, Check } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Card, Input, Text, useToast } from '@/components/ui';
import { useReschedule } from '@/features/loans/hooks/useLoans';
import { useT, type TranslationKey } from '@/i18n';
import { useColors, radii, spacing } from '@/theme';
import type { Loan, ReschedulePreview, RescheduleMode, SchedulePreviewRow } from '@/types';

interface RescheduleSheetProps {
  loan: Loan;
  visible: boolean;
  onClose: () => void;
}

const MODES = [
  {
    value: 'same_end_date',
    labelKey: 'mode_same_end_date',
    descKey: 'mode_same_end_date_desc',
  },
  {
    value: 'same_installment',
    labelKey: 'mode_same_installment',
    descKey: 'mode_same_installment_desc',
  },
] as const satisfies readonly {
  value: Exclude<RescheduleMode, 'manual'>;
  labelKey: TranslationKey;
  descKey: TranslationKey;
}[];

const REASON_KEYS = [
  'reason_advance_payment',
  'reason_customer_request',
  'reason_missed_payment',
] as const;

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;

function PlanColumn({ title, rows, total, end }: {
  title: string;
  rows: SchedulePreviewRow[];
  total: number;
  end: string | null;
}) {
  const t = useT();
  const colors = useColors();
  return (
    <View style={{ flex: 1 }}>
      <Text variant="caption" color="tertiary">
        {title.toUpperCase()}
      </Text>
      <Text variant="bodyStrong" style={{ marginTop: 2 }}>
        {rows.length} {t('visits')}
      </Text>
      <Text variant="caption" color="secondary">
        {inr(total)}
      </Text>
      {end ? (
        <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
          {t('ends')} {end}
        </Text>
      ) : null}
      <View style={[styles.miniList, { borderColor: colors.border.subtle }]}>
        {rows.slice(0, 4).map((row, index) => (
          <Text key={`${row.due_date}-${index}`} variant="caption" color="secondary">
            {row.due_date} · {inr(row.due_amount)}
          </Text>
        ))}
        {rows.length > 4 ? (
          <Text variant="caption" color="tertiary">
            +{rows.length - 4}…
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function RescheduleSheet({ loan, visible, onClose }: RescheduleSheetProps) {
  const t = useT();
  const colors = useColors();
  const toast = useToast();
  const { preview, commit } = useReschedule(loan.id);

  const [mode, setMode] = useState<Exclude<RescheduleMode, 'manual'>>('same_end_date');
  const [reason, setReason] = useState<string>('');
  const [amount, setAmount] = useState<string>(String(loan.installment_amount));
  const [plan, setPlan] = useState<ReschedulePreview | null>(null);

  const installmentAmount = Number.parseInt(amount, 10);
  const amountInvalid =
    mode === 'same_installment' && (!Number.isFinite(installmentAmount) || installmentAmount <= 0);
  const canPreview = reason.trim().length >= 3 && !amountInvalid;

  const payload = {
    reason: reason.trim(),
    mode,
    ...(mode === 'same_installment' ? { installment_amount: installmentAmount } : {}),
  };

  const reset = () => {
    setPlan(null);
    setReason('');
    setMode('same_end_date');
    setAmount(String(loan.installment_amount));
  };

  const close = () => {
    reset();
    onClose();
  };

  const onPreview = async () => {
    try {
      setPlan(await preview.mutateAsync(payload));
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      toast.error(detail ?? t('reschedule_failed'));
    }
  };

  const onConfirm = async () => {
    try {
      await commit.mutateAsync(payload);
      toast.success(t('reschedule_done'));
      close();
    } catch (error) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data
        ?.detail;
      toast.error(detail ?? t('reschedule_failed'));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <View style={[styles.backdrop, { backgroundColor: colors.scrim }]}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={[styles.handle, { backgroundColor: colors.border.strong }]} />
          <ScrollView contentContainerStyle={{ padding: spacing[4], gap: spacing[3] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
              <CalendarClock size={18} color={colors.brand[700]} />
              <Text variant="title">{t('reschedule_schedule')}</Text>
            </View>
            <Text variant="caption" color="secondary">
              {t('reschedule_note')}
            </Text>

            <Text variant="caption" color="tertiary">
              {t('reschedule_mode').toUpperCase()}
            </Text>
            {MODES.map((option) => {
              const selected = mode === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setMode(option.value);
                    setPlan(null);
                  }}
                  style={[
                    styles.option,
                    {
                      borderColor: selected ? colors.brand[600] : colors.border.default,
                      backgroundColor: selected ? colors.brand[50] : colors.card,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      variant="bodyStrong"
                      color={selected ? colors.brand[900] : 'primary'}
                    >
                      {t(option.labelKey)}
                    </Text>
                    <Text variant="caption" color="secondary">
                      {t(option.descKey)}
                    </Text>
                  </View>
                  {selected ? <Check size={16} color={colors.brand[900]} /> : null}
                </Pressable>
              );
            })}

            {mode === 'same_installment' ? (
              <Input
                label={t('installment')}
                keyboardType="number-pad"
                value={amount}
                onChangeText={(next) => {
                  setAmount(next.replace(/[^0-9]/g, ''));
                  setPlan(null);
                }}
                error={amountInvalid ? t('enter_valid_amount') : undefined}
              />
            ) : null}

            <Text variant="caption" color="tertiary">
              {t('reschedule_reason').toUpperCase()}
            </Text>
            <View style={styles.reasonRow}>
              {REASON_KEYS.map((key) => {
                const label = t(key);
                const selected = reason === label;
                return (
                  <Pressable
                    key={key}
                    onPress={() => {
                      setReason(label);
                      setPlan(null);
                    }}
                    style={[
                      styles.chip,
                      {
                        borderColor: selected ? colors.brand[600] : colors.border.default,
                        backgroundColor: selected ? colors.brand[50] : colors.card,
                      },
                    ]}
                  >
                    <Text
                      variant="caption"
                      color={selected ? colors.brand[900] : 'secondary'}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Input
              value={reason}
              onChangeText={(next) => {
                setReason(next);
                setPlan(null);
              }}
              placeholder={t('reschedule_reason')}
            />

            {plan ? (
              <Card padding={3}>
                <Text variant="caption" color="tertiary">
                  {t('reschedule_preview_title').toUpperCase()}
                </Text>
                <Text variant="bodyStrong" style={{ marginTop: 2 }}>
                  {t('remaining_balance')}: {inr(plan.remaining_balance)}
                </Text>
                <View style={styles.compareRow}>
                  <PlanColumn
                    title={t('schedule')}
                    rows={plan.current}
                    total={plan.current_total}
                    end={plan.current_end_date}
                  />
                  <ArrowRight size={16} color={colors.text.tertiary} />
                  <PlanColumn
                    title={t('reschedule')}
                    rows={plan.proposed}
                    total={plan.proposed_total}
                    end={plan.proposed_end_date}
                  />
                </View>
              </Card>
            ) : null}

            {plan ? (
              <Button
                label={t('reschedule_confirm')}
                fullWidth
                loading={commit.isPending}
                onPress={onConfirm}
              />
            ) : (
              <Button
                label={t('reschedule_preview')}
                fullWidth
                disabled={!canPreview}
                loading={preview.isPending}
                onPress={onPreview}
              />
            )}
            <Button label={t('cancel')} variant="ghost" fullWidth onPress={close} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '90%',
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: spacing[2],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: spacing[3],
  },
  reasonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  chip: {
    borderWidth: 1,
    borderRadius: radii.md,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  miniList: { marginTop: spacing[2], borderTopWidth: 1, paddingTop: spacing[2], gap: 2 },
});
