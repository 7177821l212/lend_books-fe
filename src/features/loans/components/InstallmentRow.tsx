/**
 * InstallmentRow — single row in a loan schedule.
 *
 * A schedule row shows what the contract PLANNED and how much of it is already
 * covered. It never claims money was collected on this date: money that arrived
 * early shows as "advance credit", and the collection itself keeps its own real
 * date in the payment history.
 */
import { Check, Circle, CircleDot, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AmountText, Badge, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { useColors, spacing } from '@/theme';
import type { Installment, InstallmentStatus } from '@/types';

interface InstallmentRowProps {
  installment: Installment;
  /** Today in YYYY-MM-DD; rows due after this carry advance credit, not collections. */
  today?: string;
}

const STATUS_TONE: Record<InstallmentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'neutral',
  due_today: 'warning',
  overdue: 'danger',
  missed: 'danger',
};

function StatusIcon({ status, muted }: { status: InstallmentStatus; muted: boolean }) {
  const colors = useColors();
  if (muted) return <Circle size={14} color={colors.slate[300]} strokeWidth={2} />;
  switch (status) {
    case 'paid':
      return <Check size={14} color={colors.success} strokeWidth={3} />;
    case 'missed':
      return <X size={14} color={colors.danger} strokeWidth={3} />;
    case 'partial':
      return <CircleDot size={14} color={colors.warning} strokeWidth={2.5} />;
    case 'overdue':
    case 'due_today':
      return <Circle size={14} color={colors.warning} strokeWidth={2.5} />;
    default:
      return <Circle size={14} color={colors.slate[300]} strokeWidth={2} />;
  }
}

const inr = (value: number) => `₹${value.toLocaleString('en-IN')}`;

export function InstallmentRow({ installment, today }: InstallmentRowProps) {
  const t = useT();
  const colors = useColors();
  const STATUS_LABEL: Record<InstallmentStatus, string> = {
    paid: t('collected'),
    partial: t('status_partial'),
    pending: t('status_pending'),
    due_today: t('status_due_today'),
    overdue: t('status_overdue'),
    missed: t('status_missed'),
  };

  const replaced = !installment.is_active;
  const tone = replaced ? 'neutral' : STATUS_TONE[installment.status];
  const label = replaced ? t('status_replaced') : STATUS_LABEL[installment.status];

  const covered = installment.paid_amount;
  const remaining = Math.max(0, installment.due_amount - covered);
  // Money sitting on a row that isn't due yet was paid ahead, not collected today.
  const isFuture = today !== undefined && installment.due_date > today;
  const coveredLabel = isFuture ? t('advance_credit') : t('covered');
  // A missed visit's shortfall is moved to a catch-up row at the end of the
  // schedule, so it is NOT still collectible here — calling it "remaining"
  // reads as though the collector should try again on this date.
  const isMissed = installment.status === 'missed';
  const remainingLabel = isMissed ? t('carried_forward') : t('remaining');

  return (
    <View style={[styles.row, { borderBottomColor: colors.border.subtle }]}>
      <View style={styles.iconCol}>
        <StatusIcon status={installment.status} muted={replaced} />
        <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
          #{installment.sequence}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          variant="bodyStrong"
          style={replaced ? { textDecorationLine: 'line-through', opacity: 0.6 } : undefined}
        >
          {installment.due_date}
        </Text>
        <View style={styles.amountRow}>
          <AmountText
            value={installment.due_amount}
            size="sm"
            color={colors.text.secondary}
            bold={false}
          />
          <Text variant="caption" color="tertiary" style={{ marginLeft: spacing[1] }}>
            {t('planned')}
          </Text>
          {!replaced && covered > 0 ? (
            <Text variant="caption" color="tertiary" style={{ marginLeft: spacing[2] }}>
              · {inr(covered)} {coveredLabel}
            </Text>
          ) : null}
          {!replaced && remaining > 0 && (covered > 0 || isMissed) ? (
            <Text variant="caption" color="secondary" style={{ marginLeft: spacing[2] }}>
              · {inr(remaining)} {remainingLabel}
            </Text>
          ) : null}
        </View>
      </View>
      <Badge label={label} tone={tone} size="sm" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2.5],
    paddingHorizontal: spacing[4],
    borderBottomWidth: 1,
  },
  iconCol: {
    width: 36,
    alignItems: 'center',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
});
