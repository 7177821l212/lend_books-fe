/**
 * InstallmentRow — single row in a loan schedule.
 */
import { Check, Circle, CircleDot, X } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AmountText, Badge, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { useColors, spacing } from '@/theme';
import type { Installment, InstallmentStatus } from '@/types';

interface InstallmentRowProps {
  installment: Installment;
}

const STATUS_TONE: Record<InstallmentStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  paid: 'success',
  partial: 'warning',
  pending: 'neutral',
  due_today: 'warning',
  overdue: 'danger',
  missed: 'danger',
};

function StatusIcon({ status }: { status: InstallmentStatus }) {
  const colors = useColors();
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
  const tone = STATUS_TONE[installment.status];
  const label = STATUS_LABEL[installment.status];
  return (
    <View style={[styles.row, { borderBottomColor: colors.border.subtle }]}>
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
});
