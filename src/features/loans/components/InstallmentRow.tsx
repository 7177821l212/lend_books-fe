/**
 * InstallmentRow — single row in a loan schedule.
 */
import { Check, Circle, CircleDot, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AmountText, Badge, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { Installment, InstallmentStatus } from '@/types';

interface InstallmentRowProps {
  installment: Installment;
}

const STATUS_META: Record<
  InstallmentStatus,
  { tone: 'success' | 'warning' | 'danger' | 'neutral'; label: string }
> = {
  paid: { tone: 'success', label: 'Paid' },
  partial: { tone: 'warning', label: 'Partial' },
  pending: { tone: 'neutral', label: 'Pending' },
  due_today: { tone: 'warning', label: 'Due today' },
  overdue: { tone: 'danger', label: 'Overdue' },
  missed: { tone: 'danger', label: 'Missed' },
};

function StatusIcon({ status }: { status: InstallmentStatus }) {
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

export function InstallmentRow({ installment }: InstallmentRowProps) {
  const meta = STATUS_META[installment.status];
  return (
    <View style={styles.row}>
      <View style={styles.iconCol}>
        <StatusIcon status={installment.status} />
        <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
          #{installment.sequence}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyStrong">{installment.due_date}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
          <AmountText
            value={installment.due_amount}
            size="sm"
            color={colors.text.secondary}
            bold={false}
          />
          {installment.paid_amount > 0 ? (
            <Text variant="caption" color="tertiary" style={{ marginLeft: spacing[2] }}>
              · paid {installment.paid_amount.toLocaleString('en-IN')}
            </Text>
          ) : null}
        </View>
      </View>
      <Badge label={meta.label} tone={meta.tone} size="sm" />
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
    borderBottomColor: colors.border.subtle,
  },
  iconCol: {
    width: 36,
    alignItems: 'center',
  },
});
