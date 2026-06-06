import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, UserPlus, Users, X } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
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
import { useCreateCollector, useCollectors } from '@/features/collectors/hooks/useCollectors';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import { colors, fontFamily, layout, radii, spacing } from '@/theme';

type TeamNav = NativeStackNavigationProp<TeamStackParamList, 'TeamList'>;

export function TeamScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const nav = useNavigation<TeamNav>();
  const { data, isRefetching, refetch } = useDashboard();
  const { data: collectors, refetch: refetchCollectors } = useCollectors();
  const createCollector = useCreateCollector();

  const team = data?.collector_performance ?? [];
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
      await createCollector.mutateAsync({
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
                TEAM
              </Text>
              <Text variant="h1" color="onDark">
                {collectors?.length ?? 0} collectors
              </Text>
            </View>
            <IconButton
              icon={<Plus size={20} color={colors.white} />}
              variant="glass"
              onPress={() => setShowModal(true)}
              accessibilityLabel="Add collector"
            />
          </View>
        </GradientBackground>

        <View style={{ padding: layout.screenPaddingX }}>
          {team.length === 0 ? (
            <EmptyState
              icon={<Users size={28} color={colors.brand[700]} />}
              title="No collectors yet"
              description="Tap + to add a collector and start assigning loans."
            />
          ) : (
            team.map((c, i) => (
              <Card key={c.id} padding={4} style={{ marginBottom: spacing[2] }} onPress={() => nav.navigate('CollectorDetail', { id: c.id })}>
                <View style={styles.row}>
                  <View style={styles.rankBubble}>
                    <Text variant="caption" color="secondary">
                      #{i + 1}
                    </Text>
                  </View>
                  <Avatar name={c.name} id={c.id} size="md" />
                  <View style={{ flex: 1, marginLeft: spacing[3] }}>
                    <View style={styles.titleRow}>
                      <Text variant="bodyStrong" numberOfLines={1} style={{ flex: 1 }}>
                        {c.name}
                      </Text>
                      <AmountText
                        value={c.collected}
                        size="sm"
                        color={colors.brand[700]}
                        short
                      />
                    </View>
                    <View style={styles.subRow}>
                      <Text variant="caption" color="tertiary">
                        {c.visits} visits
                      </Text>
                      <Text variant="caption" color="tertiary">
                        {c.missed} missed
                      </Text>
                    </View>
                    <ProgressBar
                      value={Math.round((c.collected / peak) * 100)}
                      height={4}
                      style={{ marginTop: 6 }}
                    />
                  </View>
                </View>
              </Card>
            ))
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
                  <Text variant="h2">New collector</Text>
                </View>
                <IconButton
                  icon={<X size={20} color={colors.slate[500]} />}
                  variant="ghost"
                  onPress={() => { setShowModal(false); resetForm(); }}
                  accessibilityLabel="Close"
                />
              </View>

              <Input
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="e.g. Ravi Kumar"
                autoCapitalize="words"
                containerStyle={{ marginBottom: spacing[3] }}
              />
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="collector@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                containerStyle={{ marginBottom: spacing[3] }}
              />
              <Input
                label="Phone (optional)"
                value={phone}
                onChangeText={setPhone}
                placeholder="10-digit mobile number"
                keyboardType="phone-pad"
                containerStyle={{ marginBottom: spacing[3] }}
              />
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min 6 characters"
                secureTextEntry
                containerStyle={{ marginBottom: spacing[5] }}
              />

              <Button
                label="Create account"
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
