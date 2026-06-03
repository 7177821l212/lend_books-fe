/**
 * CustomerDetailScreen — hero, KPIs, loan history placeholder, documents.
 */
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Ban,
  FileText,
  MessageSquare,
  Phone,
  Plus,
  Upload,
} from 'lucide-react-native';
import { ActivityIndicator, Linking, StyleSheet, View } from 'react-native';
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
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import {
  useBlacklistCustomer,
  useCustomer,
  useCustomerDocuments,
} from '@/features/customers/hooks/useCustomers';
import { useCustomerLoans } from '@/features/loans/hooks/useLoans';
import { colors, layout, radii, spacing } from '@/theme';
import { LoanListItem } from '@/features/loans/components/LoanListItem';

type Nav = NativeStackNavigationProp<CustomersStackParamList, 'CustomerDetail'>;
type Route = RouteProp<CustomersStackParamList, 'CustomerDetail'>;

const RISK_TONE = { low: 'success', medium: 'warning', high: 'danger' } as const;
const DOC_PLACEHOLDERS = ['ID Proof', 'Address Proof', 'Signed Agreement'];

export function CustomerDetailScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const toast = useToast();
  const isInvestor = user?.role === 'investor';

  const { data: customer, isLoading } = useCustomer(params.id);
  const { data: documents } = useCustomerDocuments(params.id);
  const { data: loansPage } = useCustomerLoans(params.id);
  const blacklist = useBlacklistCustomer();
  const loans = loansPage?.items ?? [];
  const activeLoans = loans.filter((l) => l.status === 'active' || l.status === 'overdue');
  const closedLoans = loans.filter((l) => l.status === 'closed');

  if (isLoading || !customer) {
    return (
      <Screen background="default" edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      </Screen>
    );
  }

  const handleBlacklist = async () => {
    try {
      await blacklist.mutateAsync({ id: customer.id, reason: 'Flagged by investor' });
      toast.success('Customer blacklisted');
    } catch {
      toast.error('Could not blacklist');
    }
  };

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
            icon={<Text variant="h2" color="onDark" style={{ marginTop: -2 }}>‹</Text>}
            variant="glass"
            size="md"
            onPress={() => nav.goBack()}
            accessibilityLabel="Back"
          />
        </View>

        <View style={styles.heroRow}>
          <Avatar
            name={customer.name}
            id={customer.id}
            size="2xl"
            ring={customer.is_blacklisted ? 'danger' : 'none'}
          />
          <View style={{ flex: 1, marginLeft: spacing[4], minWidth: 0 }}>
            <Text variant="h2" color="onDark" numberOfLines={1}>
              {customer.name}
            </Text>
            <View style={styles.heroSub}>
              <Phone size={12} color="rgba(255,255,255,0.7)" />
              <Text variant="caption" color="onDark" style={{ marginLeft: 6, opacity: 0.85 }}>
                {customer.phone}
              </Text>
            </View>
            {customer.location ? (
              <Text variant="caption" color="onDark" style={{ opacity: 0.7, marginTop: 4 }}>
                {customer.location}
              </Text>
            ) : null}
          </View>
        </View>

        <Card padding={4} style={{ marginTop: spacing[5], backgroundColor: 'rgba(255,255,255,0.12)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                OUTSTANDING
              </Text>
              <AmountText
                value={customer.total_outstanding}
                size="2xl"
                color={colors.white}
                short
              />
            </View>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <IconButton
                icon={<Phone size={18} color={colors.white} />}
                variant="glass"
                tone="onDark"
                onPress={() => Linking.openURL(`tel:${customer.phone}`)}
                accessibilityLabel="Call"
              />
              <IconButton
                icon={<MessageSquare size={18} color={colors.white} />}
                variant="glass"
                tone="onDark"
                onPress={() => Linking.openURL(`sms:${customer.phone}`)}
                accessibilityLabel="SMS"
              />
            </View>
          </View>
        </Card>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        {customer.is_blacklisted ? (
          <Card padding={3} style={styles.blacklistBanner}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ban size={18} color={colors.danger} />
              <View style={{ marginLeft: spacing[2], flex: 1 }}>
                <Text variant="bodyStrong" color={colors.danger}>
                  Blacklisted
                </Text>
                {customer.blacklist_reason ? (
                  <Text variant="caption" color={colors.danger} style={{ opacity: 0.85 }}>
                    {customer.blacklist_reason}
                  </Text>
                ) : null}
              </View>
            </View>
          </Card>
        ) : null}

        <View style={styles.kpiRow}>
          <Card padding={3} style={styles.kpi}>
            <Text variant="h2">{customer.active_loan_count}</Text>
            <Text variant="overline" color="tertiary">
              Active
            </Text>
          </Card>
          <Card padding={3} style={styles.kpi}>
            <Text variant="h2">{closedLoans.length}</Text>
            <Text variant="overline" color="tertiary">
              Closed
            </Text>
          </Card>
          <Card padding={3} style={styles.kpi}>
            <Badge
              label={customer.risk_level}
              tone={RISK_TONE[customer.risk_level]}
              size="md"
              uppercase
            />
            <Text variant="overline" color="tertiary" style={{ marginTop: 6 }}>
              Risk
            </Text>
          </Card>
        </View>

        <View style={styles.sectionRow}>
          <Text variant="title">Loans</Text>
          {isInvestor && !customer.is_blacklisted ? (
            <Button
              label="New"
              variant="ghost"
              size="sm"
              leadingIcon={<Plus size={14} color={colors.brand[700]} />}
              onPress={() => nav.navigate('NewLoan', { customerId: customer.id })}
            />
          ) : null}
        </View>
        {loans.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} color={colors.brand[700]} />}
            title="No loans yet"
            description="Loan history will appear here once you create one."
          />
        ) : (
          <View>
            {[...activeLoans, ...closedLoans].map((loan) => (
              <LoanListItem
                key={loan.id}
                loan={loan}
                onPress={() => nav.navigate('LoanDetail', { id: loan.id })}
              />
            ))}
          </View>
        )}

        <View style={styles.sectionRow}>
          <Text variant="title">Documents</Text>
          {isInvestor ? (
            <Button
              label="Upload"
              variant="ghost"
              size="sm"
              leadingIcon={<Upload size={14} color={colors.brand[700]} />}
              onPress={() => toast.info('Document upload — coming soon')}
            />
          ) : null}
        </View>
        <View style={styles.docGrid}>
          {DOC_PLACEHOLDERS.map((label) => {
            const existing = documents?.find((d) => d.doc_type === label);
            return (
              <Card
                key={label}
                padding={3}
                style={styles.docTile}
                shadow="xs"
                onPress={existing ? () => Linking.openURL(existing.file_url) : undefined}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: radii.full,
                    backgroundColor: existing ? colors.brand[50] : colors.slate[100],
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <FileText size={18} color={existing ? colors.brand[700] : colors.slate[400]} />
                </View>
                <Text variant="label" style={{ marginTop: spacing[1.5] }}>
                  {label}
                </Text>
                <Text variant="caption" color="tertiary">
                  {existing ? 'View' : 'Missing'}
                </Text>
              </Card>
            );
          })}
        </View>

        {isInvestor && !customer.is_blacklisted ? (
          <Button
            label="Blacklist customer"
            variant="danger"
            fullWidth
            size="lg"
            onPress={handleBlacklist}
            loading={blacklist.isPending}
            leadingIcon={<Ban size={16} color={colors.white} />}
            style={{ marginTop: spacing[6] }}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row' },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[4],
  },
  heroSub: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  blacklistBanner: {
    backgroundColor: colors.dangerSoft,
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.2)',
    marginBottom: spacing[4],
  },
  kpiRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginBottom: spacing[5],
  },
  kpi: {
    flex: 1,
    alignItems: 'center',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  docGrid: {
    flexDirection: 'row',
    gap: spacing[2],
  },
  docTile: {
    flex: 1,
    alignItems: 'flex-start',
  },
});
