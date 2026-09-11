import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Banknote, Camera, Phone, Trash2, TrendingUp, User, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TeamStackParamList } from '@/app/navigation/TeamNavigator';
import {
  AmountText,
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Screen,
  SkeletonLoader,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useDashboard } from '@/features/dashboard/hooks/useDashboard';
import {
  useActivateCollector,
  useCollector,
  useDeactivateCollector,
  useDeleteCollector,
  useUpdateCollector,
} from '../hooks/useCollectors';
import { useT } from '@/i18n';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { useColors, layout, radii, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<TeamStackParamList, 'CollectorDetail'>;
type Route = RouteProp<TeamStackParamList, 'CollectorDetail'>;

export function CollectorDetailScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const toast = useToast();
  const nav = useNavigation<Nav>();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const isInvestor = user?.role === 'investor';

  const { data: collector, isLoading } = useCollector(params.id);
  const updateCollector = useUpdateCollector();
  const activateCollector = useActivateCollector();
  const deactivateCollector = useDeactivateCollector();
  const deleteCollector = useDeleteCollector();
  const { data: dashboard } = useDashboard();
  const perf = dashboard?.collector_performance.find((c) => c.id === params.id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // When reached via a cross-tab deep link (e.g. Dashboard's leaderboard), this
  // screen may be the only entry in the Team stack — goBack() would then have
  // nothing to pop and fall through to the previously-focused tab instead of
  // showing the collector list. Fall back to navigating to TeamList explicitly.
  const goBackOrToList = () => {
    if (nav.canGoBack()) {
      nav.goBack();
    } else {
      nav.navigate('TeamList');
    }
  };

  const startEdit = () => {
    setName(collector?.name ?? '');
    setPhone(collector?.phone ?? '');
    setPhotoUrl(collector?.photo_url ?? undefined);
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast.warning('Gallery permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
    });
    if (!result.canceled) setPhotoUrl(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!name.trim()) { toast.warning('Name is required'); return; }
    try {
      let photoObjectName: string | undefined = photoUrl;
      if (photoUrl && photoUrl.startsWith('file://')) {
        const uploaded = await uploadPhoto(photoUrl);
        photoObjectName = uploaded.objectName;
      }
      await updateCollector.mutateAsync({ id: params.id, payload: { name: name.trim(), phone: phone.trim() || undefined, photo_url: photoObjectName } });
      toast.success('Collector updated');
      setEditing(false);
    } catch { toast.error('Failed to save changes'); }
  };

  const handleToggleActive = async () => {
    if (!collector) return;
    try {
      if (collector.is_active) {
        await deactivateCollector.mutateAsync(params.id);
        toast.info('Collector deactivated — they can no longer log in');
      } else {
        await activateCollector.mutateAsync(params.id);
        toast.success('Collector activated');
      }
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed';
      toast.error(typeof detail === 'string' ? detail : 'Failed');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCollector.mutateAsync(params.id);
      toast.success('Collector deleted');
      goBackOrToList();
    } catch (e) {
      const detail = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed';
      toast.error(typeof detail === 'string' ? detail : 'Failed');
    }
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      Alert.alert(
        t('delete_collector'),
        `${t('delete_collector_warn')}\n\n${t('cannot_undo')}`,
        [
          { text: t('cancel'), style: 'cancel' },
          { text: t('delete'), style: 'destructive', onPress: () => void handleDelete() },
        ]
      );
    } else {
      setShowDeleteModal(true);
    }
  };

  // Must be called before any early return (Rules of Hooks)
  const resolvedCollectorPhoto = useSignedUrl(collector?.photo_url);
  const resolvedEditingPhoto = useSignedUrl(photoUrl);

  if (isLoading || !collector) {
    return <CollectorDetailSkeleton insetsTop={insets.top} />;
  }

  const isInactive = !collector.is_active;
  const displayPhoto = editing ? resolvedEditingPhoto : resolvedCollectorPhoto;

  return (
    <Screen padded={false} background="default" edges={[]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing[2],
            paddingHorizontal: layout.screenPaddingX,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.subtle,
          },
        ]}
      >
        <TouchableOpacity onPress={goBackOrToList} style={styles.backBtn} hitSlop={12}>
          <Text variant="h2" style={{ marginTop: -2 }}>‹</Text>
        </TouchableOpacity>
        <Text variant="h2">{t('collector')}</Text>
        {isInvestor && !editing ? (
          <TouchableOpacity onPress={startEdit} hitSlop={8}>
            <Text variant="label" style={{ color: colors.brand[600] }}>{t('edit')}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: layout.screenPaddingX, paddingBottom: spacing[12] }}>
        {/* Profile section — greyed out when inactive */}
        <View style={[styles.profileSection, isInactive && styles.inactiveOverlay]}>
          <View>
            {displayPhoto ? (
              <Image
                source={{ uri: displayPhoto }}
                style={[
                  styles.photo,
                  { borderColor: colors.border.default },
                  isInactive && { opacity: 0.4 },
                ]}
              />
            ) : (
              <Avatar
                name={collector.name}
                id={collector.id}
                size="2xl"
                style={isInactive ? { opacity: 0.4 } : undefined}
              />
            )}
            {editing ? (
              <TouchableOpacity
                style={[styles.cameraBtn, { backgroundColor: colors.brand[600] }]}
                onPress={handlePickPhoto}
              >
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={{ flex: 1, marginLeft: spacing[4] }}>
            <Text variant="h2" numberOfLines={1} style={isInactive ? { color: colors.text.tertiary } : {}}>
              {collector.name}
            </Text>
            <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
              {collector.email}
            </Text>
            <View style={{ marginTop: spacing[2] }}>
              <Badge
                label={collector.is_active ? t('active') : t('inactive')}
                tone={collector.is_active ? 'success' : 'neutral'}
              />
            </View>
            {isInactive ? (
              <Text variant="caption" color="tertiary" style={{ marginTop: spacing[1] }}>
                Cannot log in
              </Text>
            ) : null}
          </View>
        </View>

        {/* Performance stats */}
        {perf ? (
          <View style={[styles.statsRow, { marginTop: spacing[4] }]}>
            <StatChip
              icon={<Banknote size={16} color={colors.brand[600]} />}
              label={t('collected')}
              valueNode={<AmountText value={perf.collected} size="sm" color={colors.brand[700]} short />}
            />
            <StatChip
              icon={<TrendingUp size={16} color={colors.success} />}
              label={t('visits')}
              valueNode={<Text variant="bodyStrong">{perf.visits}</Text>}
            />
            <StatChip
              icon={<X size={16} color={colors.danger} />}
              label={t('missed')}
              valueNode={<Text variant="bodyStrong" style={{ color: perf.missed > 0 ? colors.danger : colors.text.primary }}>{perf.missed}</Text>}
            />
          </View>
        ) : null}

        {/* Edit form */}
        {editing ? (
          <Card padding={4} style={{ marginTop: spacing[4] }}>
            <Input
              label={t('full_name')}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ravi Kumar"
              autoCapitalize="words"
              containerStyle={{ marginBottom: spacing[3] }}
            />
            <Input
              label={t('collector_phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              containerStyle={{ marginBottom: spacing[4] }}
            />
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <Button label={t('cancel')} variant="secondary" style={{ flex: 1 }} onPress={cancelEdit} />
              <Button label={t('save')} variant="primary" style={{ flex: 1 }} loading={updateCollector.isPending} onPress={handleSave} />
            </View>
          </Card>
        ) : (
          <Card padding={4} style={{ marginTop: spacing[4] }}>
            <View style={styles.infoRow}>
              <User size={16} color={colors.text.tertiary} />
              <View style={{ marginLeft: spacing[3] }}>
                <Text variant="caption" color="tertiary">{t('name')}</Text>
                <Text variant="body">{collector.name}</Text>
              </View>
            </View>
            <View style={[styles.infoRow, { marginTop: spacing[3] }]}>
              <User size={16} color={colors.text.tertiary} />
              <View style={{ marginLeft: spacing[3] }}>
                <Text variant="caption" color="tertiary">{t('email')}</Text>
                <Text variant="body">{collector.email}</Text>
              </View>
            </View>
            {collector.phone ? (
              <TouchableOpacity
                style={[styles.infoRow, { marginTop: spacing[3] }]}
                onPress={() => Linking.openURL(`tel:${collector.phone!}`)}
              >
                <Phone size={16} color={colors.brand[600]} />
                <View style={{ marginLeft: spacing[3] }}>
                  <Text variant="caption" color="tertiary">{t('phone')}</Text>
                  <Text variant="body" style={{ color: colors.brand[600] }}>{collector.phone}</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={[styles.infoRow, { marginTop: spacing[3] }]}>
                <Phone size={16} color={colors.text.tertiary} />
                <View style={{ marginLeft: spacing[3] }}>
                  <Text variant="caption" color="tertiary">{t('phone')}</Text>
                  <Text variant="caption" color="tertiary">{t('not_added')}</Text>
                </View>
              </View>
            )}
          </Card>
        )}

        {/* Investor actions */}
        {isInvestor && !editing ? (
          <View style={{ marginTop: spacing[4], gap: spacing[2] }}>
            <Button
              label={collector.is_active ? t('deactivate') : t('activate')}
              variant={collector.is_active ? 'secondary' : 'primary'}
              fullWidth
              size="lg"
              loading={deactivateCollector.isPending || activateCollector.isPending}
              onPress={() => void handleToggleActive()}
            />
            <Button
              label={t('delete_collector')}
              variant="danger"
              fullWidth
              size="lg"
              leadingIcon={<Trash2 size={16} color="#fff" />}
              loading={deleteCollector.isPending}
              onPress={confirmDelete}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* Delete confirmation modal (web fallback) */}
      <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowDeleteModal(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.card }]} onPress={() => {}}>
            <Text variant="h2" style={{ marginBottom: spacing[2] }}>{t('delete_collector')}</Text>
            <Text variant="body" color="secondary" style={{ marginBottom: spacing[4] }}>
              {t('delete_collector_warn')}{'\n\n'}{t('cannot_undo')}
            </Text>
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <Button label={t('cancel')} variant="secondary" style={{ flex: 1 }} onPress={() => setShowDeleteModal(false)} />
              <Button label={t('delete')} variant="danger" style={{ flex: 1 }} loading={deleteCollector.isPending} onPress={() => void handleDelete()} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

interface StatChipProps { icon: React.ReactNode; label: string; valueNode: React.ReactNode }
function StatChip({ icon, label, valueNode }: StatChipProps) {
  return (
    <Card padding={3} style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        {icon}
        <Text variant="caption" color="tertiary">{label.toUpperCase()}</Text>
      </View>
      {valueNode}
    </Card>
  );
}

/** Mirrors the loaded screen's shape: header, avatar + name, stat chips, info card. */
function CollectorDetailSkeleton({ insetsTop }: { insetsTop: number }) {
  const colors = useColors();
  return (
    <Screen padded={false} background="default" edges={[]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insetsTop + spacing[2],
            paddingHorizontal: layout.screenPaddingX,
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.border.subtle,
          },
        ]}
      >
        <View style={styles.backBtn}>
          <Text variant="h2" style={{ marginTop: -2 }}>‹</Text>
        </View>
        <SkeletonLoader width={90} height={18} />
        <View style={{ width: 36 }} />
      </View>

      <View style={{ padding: layout.screenPaddingX }}>
        <View style={styles.profileSection}>
          <SkeletonLoader width={72} height={72} radius={36} />
          <View style={{ flex: 1, marginLeft: spacing[4] }}>
            <SkeletonLoader width="70%" height={20} delay={0} />
            <SkeletonLoader width="50%" height={14} style={{ marginTop: spacing[2] }} delay={1} />
            <SkeletonLoader width={64} height={22} radius={radii.full} style={{ marginTop: spacing[2] }} delay={2} />
          </View>
        </View>

        <View style={[styles.statsRow, { marginTop: spacing[4] }]}>
          {[0, 1, 2].map((i) => (
            <Card key={i} padding={3} style={{ flex: 1 }}>
              <SkeletonLoader width="60%" height={11} delay={i} />
              <SkeletonLoader width="45%" height={18} style={{ marginTop: spacing[2] }} delay={i} />
            </Card>
          ))}
        </View>

        <Card padding={4} style={{ marginTop: spacing[4], gap: spacing[4] }}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.infoRow}>
              <SkeletonLoader width={16} height={16} radius={radii.sm} delay={i} />
              <View style={{ marginLeft: spacing[3], flex: 1 }}>
                <SkeletonLoader width="30%" height={11} delay={i} />
                <SkeletonLoader width="55%" height={15} style={{ marginTop: spacing[1] }} delay={i} />
              </View>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: spacing[3] },
  backBtn: { width: 36, alignItems: 'flex-start' },
  profileSection: { flexDirection: 'row', alignItems: 'center', marginTop: spacing[5] },
  inactiveOverlay: { opacity: 0.7 },
  statsRow: { flexDirection: 'row', gap: spacing[2] },
  photo: { width: 72, height: 72, borderRadius: 36, borderWidth: 2 },
  cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: radii['3xl'], borderTopRightRadius: radii['3xl'], padding: spacing[6], paddingBottom: spacing[10] },
});
