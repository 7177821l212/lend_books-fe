/**
 * CustomerListItem — tappable card showing avatar, name, phone, badges, outstanding.
 */
import { Ban, Phone } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { AmountText, Avatar, Badge, Card, Text } from '@/components/ui';
import { colors, spacing } from '@/theme';
import type { Customer } from '@/types';

interface CustomerListItemProps {
  customer: Customer;
  onPress?: () => void;
}

const RISK_TONE: Record<Customer['risk_level'], 'success' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
};

export function CustomerListItem({ customer, onPress }: CustomerListItemProps) {
  const out = customer.total_outstanding;
  return (
    <Card padding={4} onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Avatar
          name={customer.name}
          id={customer.id}
          size="lg"
          imageUrl={customer.photo_url}
          ring={customer.is_blacklisted ? 'danger' : 'none'}
        />
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
              {customer.name}
            </Text>
            {out > 0 ? (
              <AmountText value={out} size="sm" color={colors.warning} short />
            ) : (
              <Text variant="caption" color="tertiary">
                no dues
              </Text>
            )}
          </View>
          <View style={styles.subRow}>
            <Phone size={11} color={colors.slate[400]} />
            <Text variant="caption" color="secondary" style={{ marginLeft: 4 }} numberOfLines={1}>
              {customer.phone}
            </Text>
            <Text variant="caption" color="tertiary" style={{ marginLeft: spacing[2] }}>
              · {customer.active_loan_count} active
            </Text>
          </View>
          <View style={styles.badgesRow}>
            {customer.is_blacklisted ? (
              <Badge
                label="Blacklisted"
                tone="danger"
                withDot
                style={{ marginRight: spacing[1.5] }}
              />
            ) : null}
            <Badge label={`${customer.risk_level} risk`} tone={RISK_TONE[customer.risk_level]} />
          </View>
        </View>
      </View>
      {customer.is_blacklisted ? (
        <View style={styles.banner}>
          <Ban size={12} color={colors.danger} />
          <Text variant="caption" color={colors.danger} style={{ marginLeft: 6 }} numberOfLines={1}>
            {customer.blacklist_reason ?? 'Customer is blacklisted'}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: spacing[2.5] },
  row: { flexDirection: 'row', alignItems: 'center' },
  body: { flex: 1, marginLeft: spacing[3], minWidth: 0 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    marginTop: spacing[2],
    alignItems: 'center',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[3],
    paddingTop: spacing[2.5],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
});
