/**
 * CustomerListScreen — search, filter chips, paginated list.
 */
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search, UsersRound, X } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type ListRenderItemInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Badge,
  EmptyState,
  GradientBackground,
  IconButton,
  Screen,
  SkeletonLoader,
  Text,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCustomers } from '@/features/customers/hooks/useCustomers';
import { CustomerListItem } from '@/features/customers/components/CustomerListItem';
import { colors, layout, radii, spacing } from '@/theme';
import type { Customer } from '@/types';
import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';

type Filter = 'all' | 'active' | 'overdue' | 'blacklisted';
type Nav = NativeStackNavigationProp<CustomersStackParamList, 'CustomerList'>;

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'blacklisted', label: 'Blacklisted' },
];

export function CustomerListScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { user } = useAuth();
  const isInvestor = user?.role === 'investor';

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState<string>('');

  const queryStatus = filter === 'all' ? undefined : filter;
  const { data, isLoading, isFetching, isRefetching, refetch } = useCustomers({
    status: queryStatus,
    search: search.trim() || undefined,
    page: 1,
    page_size: 50,
  });

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Customer>) => (
      <CustomerListItem
        customer={item}
        onPress={() => nav.navigate('CustomerDetail', { id: item.id })}
      />
    ),
    [nav]
  );

  const listEmpty = () => {
    if (isLoading) {
      return (
        <View style={{ marginTop: spacing[3] }}>
          {[0, 1, 2, 3].map((i) => (
            <View key={i} style={styles.skeleton}>
              <SkeletonLoader width={48} height={48} radius={24} />
              <View style={{ flex: 1, marginLeft: spacing[3] }}>
                <SkeletonLoader width="60%" height={14} />
                <SkeletonLoader width="40%" height={11} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      );
    }
    return (
      <EmptyState
        icon={<UsersRound size={28} color={colors.brand[700]} />}
        title={search ? 'No matching customers' : 'No customers yet'}
        description={
          search
            ? 'Try a different name or phone.'
            : isInvestor
            ? 'Tap the + button to add your first customer.'
            : 'You don’t have any customers assigned right now.'
        }
        actionLabel={isInvestor && !search ? '+ Add customer' : undefined}
        onAction={isInvestor && !search ? () => nav.navigate('NewCustomer') : undefined}
      />
    );
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
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
              {isInvestor ? 'INVESTOR' : 'COLLECTOR'}
            </Text>
            <Text variant="h1" color="onDark">
              {isInvestor ? 'Customers' : 'My Customers'}
            </Text>
          </View>
          {isInvestor ? (
            <IconButton
              icon={<Plus size={20} color={colors.white} />}
              variant="glass"
              size="md"
              tone="onDark"
              onPress={() => nav.navigate('NewCustomer')}
              accessibilityLabel="Add customer"
            />
          ) : null}
        </View>

        <View style={styles.searchWrap}>
          <Search size={18} color={colors.slate[400]} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or phone..."
            placeholderTextColor={colors.slate[400]}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <X size={16} color={colors.slate[400]} />
            </Pressable>
          ) : null}
        </View>
      </GradientBackground>

      <View style={styles.chipRow}>
        {FILTERS.map(({ key, label }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.chip,
                active && { backgroundColor: colors.brand[600] },
              ]}
            >
              <Text
                variant="label"
                color={active ? 'onBrand' : 'secondary'}
                style={{ fontSize: 12 }}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
        {data?.total != null ? (
          <View style={{ marginLeft: 'auto' }}>
            <Badge label={`${data.total}`} tone="neutral" size="sm" />
          </View>
        ) : null}
      </View>

      <FlatList
        data={data?.items ?? []}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={listEmpty}
        refreshing={isRefetching}
        onRefresh={refetch}
        showsVerticalScrollIndicator={false}
      />
      {isFetching && data ? (
        <View style={styles.fetchBadge}>
          <Text variant="caption" color="onDark">
            Refreshing…
          </Text>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radii.xl,
    paddingHorizontal: spacing[4],
    marginTop: spacing[4],
    height: 46,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    marginLeft: spacing[2],
    paddingVertical: 0,
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radii.full,
    backgroundColor: colors.white,
    marginRight: spacing[2],
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: spacing[2],
    paddingBottom: layout.tabBarHeight + spacing[6],
    flexGrow: 1,
  },
  skeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    backgroundColor: colors.card,
    borderRadius: radii['2xl'],
    marginBottom: spacing[2],
  },
  fetchBadge: {
    position: 'absolute',
    bottom: layout.tabBarHeight + spacing[4],
    alignSelf: 'center',
    backgroundColor: 'rgba(14,16,20,0.85)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radii.full,
  },
});
