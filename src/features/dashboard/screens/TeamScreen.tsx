import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Search, UserPlus, Users, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TeamStackParamList } from '@/app/navigation/TeamNavigator';

import {
  AmountText,
  Avatar,
  Button,
  Card,
  EmptyState,
  GradientBackground,
  IconButton,
  Input,
  ProgressBar,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useCollectors, useCreateCollector } from '@/features/collectors/hooks/useCollectors';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { useT } from '@/i18n';
import { colors, fontFamily, layout, radii, spacing } from '@/theme';

type TeamNav = NativeStackNavigationProp<TeamStackParamList, 'TeamList'>;

export function TeamScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const nav = useNavigation<TeamNav>();
  const { data, isRefetching, refetch } = useDashboard();
  const { data: collectors, refetch: refetchCollectors } = useCollectors();
  const createCollector = useCreateCollector();

  const team = data?.collector_performance ?? [];
  const allCollectors = collectors ?? [];
  const [search, setSearch] = useState('');
  const filteredCollectors = search.trim()
    ? allCollectors.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCollectors;
  const peak = team.length ? Math.max(...team.map((c) => c.collected), 1) : 1;

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
  };

  const handleCreate = async () => {
    if (!name.trim() || !email.trim() || password.length < 6) {
      toast.warning('Name, email, and password (min 6 chars) are required');
      return;
    }
    try {
      const newCollector = await createCollector.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
      });
      toast.success(`${name.trim()} added as collector`);
      setShowModal(false);
      resetForm();
      void refetch();
      void refetchCollectors();
      nav.navigate('CollectorDetail', { id: newCollector.id });
    } catch (e) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not create collector';
      toast.error(typeof detail === 'string' ? detail : 'Failed');
    }
  };

  return (
    <>
      <Screen
        padded={false}
        background="default"
        edges={[]}
        scroll
        refreshing={isRefetching}
        onRefresh={refetch}
      >
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
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text variant="caption" color="onDark" style={{ opacity: 0.7 }}>
                {t('team').toUpperCase()}
              </Text>
              <Text variant="h1" color="onDark">
                {collectors?.length ?? 0} {t('collectors')}
              </Text>
            </View>
            <IconButton
              icon={<Plus size={20} color={colors.white} />}
              variant="glass"
              onPress={() => setShowModal(true)}
              accessibilityLabel="Add collector"
            />
          </View>
          {/* Search bar */}
          <View style={styles.searchWrap}>
            <Search size={16} color={colors.slate[400]} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search collectors…"
              placeholderTextColor={colors.slate[400]}
              style={[styles.searchInput, { color: colors.text.primary }]}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 ? (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <X size={14} color={colors.slate[400]} />
              </Pressable>
            ) : null}
          </View>
        </GradientBackground>

        <View style={{ padding: layout.screenPaddingX }}>
          {allCollectors.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.brand[700]} />}
              title={t('no_collectors_yet')}
              description={t('no_collectors_desc')}
            />
          ) : filteredCollectors.length === 0 ? (
            <EmptyState
              icon={<Search size={24} color={colors.brand[700]} />}
              title="No results"
              description={`No collectors matching "${search}"`}
            />
          ) : (
            filteredCollectors.map((c, i) => {
              const perf = team.find((t) => t.id === c.id);
              const isInactive = !c.is_active;
              return (
                <Card
                  key={c.id}
                  padding={4}
                  style={[{ marginBottom: spacing[2] }, isInactive && { opacity: 0.5 }]}
                  onPress={() => nav.navigate('CollectorDetail', { id: c.id })}
                >
                  <View style={styles.row}>
                    <View style={styles.rankBubble}>
                      <Text variant="caption" color="secondary">#{i + 1}</Text>
                    </View>
                    <Avatar name={c.name} id={c.id} size="md" imageUrl={c.photo_url} />
                    <View style={{ flex: 1, marginLeft: spacing[3] }}>
                      <View style={styles.titleRow}>
                        <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1, color: isInactive ? colors.text.tertiary : undefined }}>
                          {c.name}
                        </Text>
                        {isInactive ? (
                          <Text variant="caption" color="tertiary">{t('inactive')}</Text>
                        ) : (
                          <AmountText value={perf?.collected ?? 0} size="sm" color={colors.brand[700]} short />
                        )}
                      </View>
                      <View style={styles.subRow}>
                        <Text variant="caption" color="tertiary">{perf?.visits ?? 0} {t('visits')}</Text>
                        <Text variant="caption" color="tertiary">{perf?.missed ?? 0} {t('missed').toLowerCase()}</Text>
                      </View>
                      {!isInactive && perf ? (
                        <ProgressBar value={Math.round((perf.collected / peak) * 100)} height={4} style={{ marginTop: 6 }} />
                      ) : null}
                    </View>
                  </View>
                </Card>
              );
            })
          )}
        </View>
      </Screen>

      {/* Add Collector Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => { setShowModal(false); resetForm(); }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <Pressable
            style={styles.overlay}
            onPress={() => { setShowModal(false); resetForm(); }}
          >
            <Pressable style={styles.sheet} onPress={() => {}}>
              <View style={styles.sheetHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing[2] }}>
                  <UserPlus size={20} color={colors.brand[700]} />
                  <Text variant="h2">{t('new_collector')}</Text>
                </View>
                <IconButton
                  icon={<X size={20} color={colors.slate[500]} />}
                  variant="ghost"
                  onPress={() => { setShowModal(false); resetForm(); }}
                  accessibilityLabel="Close"
                />
              </View>

              <Input
                label={t('collector_name')}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Ravi Kumar"
                autoCapitalize="words"
                containerStyle={{ marginBottom: spacing[3] }}
              />
              <Input
                label={t('collector_email')}
                value={email}
                onChangeText={setEmail}
                placeholder="collector@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={{ marginBottom: spacing[3] }}
              />
              <Input
                label={t('collector_phone')}
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                containerStyle={{ marginBottom: spacing[3] }}
              />
              <Input
                label={t('collector_password')}
                value={password}
                onChangeText={setPassword}
                placeholder="Min 6 characters"
                secureTextEntry
                containerStyle={{ marginBottom: spacing[5] }}
              />

              <Button
                label={t('create_account')}
                fullWidth
                size="lg"
                loading={createCollector.isPending}
                disabled={!name.trim() || !email.trim() || password.length < 6}
                onPress={handleCreate}
                hapticFeedback="medium"
              />
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.xl,
    paddingHorizontal: spacing[3],
    marginTop: spacing[3],
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: spacing[2],
    paddingVertical: 0,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  rankBubble: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.brand[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[2],
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  subRow: { flexDirection: 'row', justifyContent: 'space-between' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
});
