import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { TeamStackParamList } from '@/app/navigation/TeamNavigator';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useCollector, useUpdateCollector } from '../hooks/useCollectors';
import { useColors, layout, radii, spacing } from '@/theme';

type Route = RouteProp<TeamStackParamList, 'CollectorDetail'>;

export function CollectorDetailScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const toast = useToast();
  const nav = useNavigation();
  const { params } = useRoute<Route>();
  const { user } = useAuth();
  const isInvestor = user?.role === 'investor';

  const { data: collector, isLoading } = useCollector(params.id);
  const updateCollector = useUpdateCollector();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const startEdit = () => {
    setName(collector?.name ?? '');
    setPhone(collector?.phone ?? '');
    setPhotoUrl(collector?.photo_url ?? undefined);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      toast.warning('Gallery permission needed');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled) {
      setPhotoUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning('Name is required');
      return;
    }
    try {
      await updateCollector.mutateAsync({
        id: params.id,
        payload: {
          name: name.trim(),
          phone: phone.trim() || undefined,
          photo_url: photoUrl,
        },
      });
      toast.success('Collector updated');
      setEditing(false);
    } catch {
      toast.error('Failed to save changes');
    }
  };

  if (isLoading || !collector) {
    return (
      <Screen background="default" edges={[]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      </Screen>
    );
  }

  const displayPhoto = editing ? photoUrl : collector.photo_url;

  return (
    <Screen padded={false} background="default" edges={[]}>
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
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn} hitSlop={12}>
          <Text variant="h2" style={{ marginTop: -2 }}>‹</Text>
        </TouchableOpacity>
        <Text variant="h2">Collector</Text>
        {isInvestor && !editing ? (
          <TouchableOpacity onPress={startEdit} hitSlop={8}>
            <Text variant="label" style={{ color: colors.brand[600] }}>Edit</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <View style={{ padding: layout.screenPaddingX }}>
        <View style={styles.profileSection}>
          <View>
            {displayPhoto ? (
              <Image
                source={{ uri: displayPhoto }}
                style={[styles.photo, { borderColor: colors.border.default }]}
              />
            ) : (
              <Avatar name={collector.name} id={collector.id} size="2xl" />
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
            <Text variant="h2" numberOfLines={1}>{collector.name}</Text>
            <Text variant="body" color="secondary" style={{ marginTop: 2 }}>
              {collector.email}
            </Text>
            <View style={{ marginTop: spacing[2] }}>
              <Badge
                label={collector.is_active ? 'Active' : 'Inactive'}
                tone={collector.is_active ? 'success' : 'neutral'}
              />
            </View>
          </View>
        </View>

        {editing ? (
          <Card padding={4} style={{ marginTop: spacing[4] }}>
            <Input
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ravi Kumar"
              autoCapitalize="words"
              containerStyle={{ marginBottom: spacing[3] }}
            />
            <Input
              label="Phone (optional)"
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit mobile"
              keyboardType="phone-pad"
              containerStyle={{ marginBottom: spacing[4] }}
            />
            <View style={{ flexDirection: 'row', gap: spacing[2] }}>
              <Button
                label="Cancel"
                variant="secondary"
                style={{ flex: 1 }}
                onPress={cancelEdit}
              />
              <Button
                label="Save"
                variant="primary"
                style={{ flex: 1 }}
                loading={updateCollector.isPending}
                onPress={handleSave}
              />
            </View>
          </Card>
        ) : (
          <Card padding={4} style={{ marginTop: spacing[4] }}>
            <View style={styles.infoRow}>
              <User size={16} color={colors.text.tertiary} />
              <View style={{ marginLeft: spacing[3] }}>
                <Text variant="caption" color="tertiary">Name</Text>
                <Text variant="body">{collector.name}</Text>
              </View>
            </View>
            {collector.phone ? (
              <TouchableOpacity
                style={[styles.infoRow, { marginTop: spacing[3] }]}
                onPress={() => Linking.openURL(`tel:${collector.phone!}`)}
              >
                <Phone size={16} color={colors.brand[600]} />
                <View style={{ marginLeft: spacing[3] }}>
                  <Text variant="caption" color="tertiary">Phone</Text>
                  <Text variant="body" style={{ color: colors.brand[600] }}>
                    {collector.phone}
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View style={[styles.infoRow, { marginTop: spacing[3] }]}>
                <Phone size={16} color={colors.text.tertiary} />
                <View style={{ marginLeft: spacing[3] }}>
                  <Text variant="caption" color="tertiary">Phone</Text>
                  <Text variant="caption" color="tertiary">Not added</Text>
                </View>
              </View>
            )}
          </Card>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing[3],
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing[5],
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
});
