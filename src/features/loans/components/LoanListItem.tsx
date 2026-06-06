/**
 * LoanListItem — single loan card shown in lists.
 */
import { StyleSheet, View } from 'react-native';

import { AmountText, Badge, Card, ProgressBar, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { Loan } from '@/types';

interface LoanListItemProps {
  loan: Loan;
  onPress?: () => void;
}

const STATUS_TONE = {
  active: 'success',
  overdue: 'warning',
  closed: 'neutral',
  cancelled: 'danger',
} as const;

const MODEL_LABEL = { model_a: 'Pre-deduct', model_b: 'Add-on' } as const;

export function LoanListItem({ loan, onPress }: LoanListItemProps) {
  return (
    <Card padding={4} onPress={onPress} style={{ marginBottom: spacing[2] }}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.idRow}>
            <Text variant="bodyStrong">{loan.id.slice(0, 8).toUpperCase()}</Text>
            <Badge label={MODEL_LABEL[loan.lending_model]} tone="brand" size="sm" />
          </View>
          <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
            {loan.repayment_frequency} · {loan.total_installments} installments
          </Text>
        </View>
        <Badge label={loan.status} tone={STATUS_TONE[loan.status]} size="sm" withDot />
      </View>

      <View style={styles.amountRow}>
        <View>
          <Text variant="caption" color="tertiary">
            OUTSTANDING
          </Text>
          <AmountText
            value={loan.outstanding}
            size="lg"
            color={loan.outstanding > 0 ? colors.warning : colors.success}
            short
          />
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text variant="caption" color="tertiary">
            {loan.repaid_pct.toFixed(0)}% PAID
          </Text>
          <Text variant="label" color="secondary" style={{ marginTop: 2 }}>
            {loan.paid_count}/{loan.total_installments} done
          </Text>
        </View>
      </View>

      <ProgressBar
        value={loan.repaid_pct}
        height={4}
        style={{ marginTop: spacing[3] }}
        fillColor={loan.overdue_count > 0 ? colors.warning : colors.brand[600]}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: spacing[3],
  },
});
