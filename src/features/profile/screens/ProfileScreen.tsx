import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, LogOut, Settings } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AmountText,
  Avatar,
  Button,
  Card,
  GradientBackground,
  IconButton,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePaymentHistory } from '@/features/payments/hooks/usePayments';
import { useT } from '@/i18n';
import { uploadPhoto } from '@/lib/uploadPhoto';
import type { MeStackParamList } from '@/app/navigation/MeNavigator';
import { useColors, layout, radii, spacing } from '@/theme';

type Nav = NativeStackNavigationProp<MeStackParamList, 'Profile'>;

export function ProfileScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const colors = useColors();
  const toast = useToast();
  const { user, logout, updateProfilePhoto } = useAuth();
  const { data: history } = usePaymentHistory();

  const collected = (history?.items ?? [])
    .filter((p) => !p.is_missed)
    .reduce((acc, p) => acc + p.amount, 0);
  const missed = (history?.items ?? []).filter((p) => p.is_missed).length;

  if (!user) return null;

  const handlePickProfilePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;
    try {
      const uploaded = await uploadPhoto(result.assets[0].uri);
      await updateProfilePhoto(uploaded.objectName);
      toast.success('Profile photo updated');
    } catch {
      toast.error('Could not update profile photo');
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
          alignItems: 'center',
        }}
      >
        <View style={styles.topRow}>
          <IconButton
            icon={<Settings size={18} color="rgba(255,255,255,0.85)" />}
            variant="glass"
            onPress={() => nav.navigate('Settings')}
            accessibilityLabel="Settings"
          />
        </View>
        <TouchableOpacity onPress={() => void handlePickProfilePhoto()} style={styles.avatarButton}>
          <Avatar
            name={user.name}
            id={user.id}
            imageUrl={user.photo_url}
            size="2xl"
          />
          <View style={styles.cameraBadge}>
            <Camera size={13} color={colors.white} />
          </View>
        </TouchableOpacity>
        <Text variant="h2" color="onDark" style={{ marginTop: spacing[3] }}>
          {user.name}
        </Text>
        <Text variant="caption" color="onDark" style={{ opacity: 0.85, marginTop: 4 }}>
          {user.email}
        </Text>
        <View style={styles.roleChip}>
          <Text variant="caption" color="onDark">
            {user.role.toUpperCase()}
          </Text>
        </View>
      </GradientBackground>

      <View style={{ padding: layout.screenPaddingX }}>
        <View style={styles.kpiRow}>
          <Card padding={4} style={styles.kpi}>
            <Text variant="caption" color="tertiary">
              {t('collected').toUpperCase()}
            </Text>
            <AmountText value={collected} size="lg" color={colors.success} short />
          </Card>
          <Card padding={4} style={styles.kpi}>
            <Text variant="caption" color="tertiary">
              {t('visits').toUpperCase()}
            </Text>
            <Text variant="h2">{history?.items.length ?? 0}</Text>
          </Card>
          <Card padding={4} style={styles.kpi}>
            <Text variant="caption" color="tertiary">
              {t('missed').toUpperCase()}
            </Text>
            <Text variant="h2" style={{ color: colors.danger }}>
              {missed}
            </Text>
          </Card>
        </View>

        <Button
          label={t('sign_out')}
          variant="danger"
          fullWidth
          size="lg"
          leadingIcon={<LogOut size={16} color={colors.white} />}
          onPress={() => void logout()}
          style={{ marginTop: spacing[6] }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
  },
  roleChip: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  avatarButton: {
    marginTop: spacing[2],
  },
  cameraBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: radii.full,
    backgroundColor: '#00C853',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  kpiRow: { flexDirection: 'row', gap: spacing[2] },
  kpi: { flex: 1, alignItems: 'center' },
});
