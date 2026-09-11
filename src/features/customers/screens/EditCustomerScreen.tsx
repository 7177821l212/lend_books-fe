import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import { Avatar, Button, Card, Input, Screen, SkeletonLoader, Text, useToast } from '@/components/ui';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { useT } from '@/i18n';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { useSignedUrl } from '@/hooks/useSignedUrl';
import { useColors, layout, radii, spacing } from '@/theme';
import type { RiskLevel } from '@/types';

type Route = RouteProp<CustomersStackParamList, 'EditCustomer'>;


export function EditCustomerScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const toast = useToast();
  const nav = useNavigation();

  const RISK_OPTIONS: { value: RiskLevel; label: string }[] = [
    { value: 'low', label: t('risk_low') },
    { value: 'medium', label: t('risk_medium') },
    { value: 'high', label: t('risk_high') },
  ];
  const { params } = useRoute<Route>();

  const { data: customer, isLoading } = useCustomer(params.id);
  const update = useUpdateCustomer(params.id);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [initialised, setInitialised] = useState(false);
  const displayPhotoUrl = useSignedUrl(photoUrl);

  if (customer && !initialised) {
    setName(customer.name);
    setPhone(customer.phone);
    setLocation(customer.location ?? '');
    setRiskLevel(customer.risk_level);
    setPhotoUrl(customer.photo_url ?? undefined);
    setInitialised(true);
  }

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast.warning('Gallery permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
    });
    if (!result.canceled) setPhotoUrl(result.assets[0].uri);
  };

  if (isLoading || !customer) {
    return <EditCustomerSkeleton insetsTop={insets.top} onBack={() => nav.goBack()} />;
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning('Name is required');
      return;
    }
    if (!phone.trim()) {
      toast.warning('Phone is required');
      return;
    }
    try {
      let photoObjectName: string | undefined = photoUrl;
      if (photoUrl && photoUrl.startsWith('file://')) {
        const uploaded = await uploadPhoto(photoUrl);
        photoObjectName = uploaded.objectName;
      }
      await update.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim() || undefined,
        risk_level: riskLevel,
        photo_url: photoObjectName,
      });
      toast.success('Customer updated');
      nav.goBack();
    } catch {
      toast.error('Failed to save changes');
    }
  };

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
        <Text variant="h2">{t('edit')} {t('customer')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 12}
        style={{ flex: 1 }}
      >
      <ScrollView
        contentContainerStyle={{ padding: layout.screenPaddingX, paddingTop: spacing[4], paddingBottom: spacing[12] }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {/* Photo picker */}
        <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
          <TouchableOpacity onPress={handlePickPhoto} style={styles.photoPicker}>
            {displayPhotoUrl ? (
              <Image source={{ uri: displayPhotoUrl }} style={styles.photoImg} />
            ) : (
              <Avatar name={name || '?'} id={params.id} size="2xl" />
            )}
            <View style={[styles.cameraBtn, { backgroundColor: colors.brand[600] }]}>
              <Camera size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text variant="caption" color="tertiary" style={{ marginTop: spacing[2] }}>
            Tap to change photo
          </Text>
        </View>

        <Input
          label={t('full_name')}
          value={name}
          onChangeText={setName}
          placeholder="Customer full name"
          autoCapitalize="words"
          containerStyle={{ marginBottom: spacing[3] }}
        />
        <Input
          label={t('phone')}
          value={phone}
          onChangeText={setPhone}
          placeholder="10-digit mobile number"
          keyboardType="phone-pad"
          containerStyle={{ marginBottom: spacing[3] }}
        />
        <Input
          label={`${t('address')} (optional)`}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Anna Nagar, Chennai"
          containerStyle={{ marginBottom: spacing[4] }}
        />

        <Text variant="label" style={{ marginBottom: spacing[2] }}>{t('risk_level')}</Text>
        <Card padding={3} style={{ marginBottom: spacing[5] }}>
          <View style={styles.riskRow}>
            {RISK_OPTIONS.map((opt) => {
              const active = riskLevel === opt.value;
              const tone =
                opt.value === 'low' ? colors.success :
                opt.value === 'medium' ? colors.warning :
                colors.danger;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.riskBtn,
                    {
                      backgroundColor: active ? tone + '22' : colors.slate[100],
                      borderColor: active ? tone : colors.border.default,
                      borderWidth: active ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => setRiskLevel(opt.value)}
                >
                  <Text
                    variant="label"
                    style={{ color: active ? tone : colors.text.secondary }}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        <Button
          label={t('save_changes')}
          variant="primary"
          fullWidth
          size="lg"
          loading={update.isPending}
          onPress={handleSave}
        />
      </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** Mirrors the loaded form's shape: header, avatar, input fields, risk row. */
function EditCustomerSkeleton({ insetsTop, onBack }: { insetsTop: number; onBack: () => void }) {
  const t = useT();
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
        <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={12}>
          <Text variant="h2" style={{ marginTop: -2 }}>‹</Text>
        </TouchableOpacity>
        <Text variant="h2">{t('edit')} {t('customer')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={{ padding: layout.screenPaddingX, marginTop: spacing[4] }}>
        <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
          <SkeletonLoader width={72} height={72} radius={36} />
        </View>

        {[0, 1, 2].map((i) => (
          <View key={i} style={{ marginBottom: spacing[3] }}>
            <SkeletonLoader width={80} height={11} style={{ marginBottom: spacing[1.5] }} delay={i} />
            <SkeletonLoader width="100%" height={48} radius={radii.lg} delay={i} />
          </View>
        ))}

        <SkeletonLoader width={90} height={13} style={{ marginBottom: spacing[2] }} />
        <Card padding={3} style={{ marginBottom: spacing[5] }}>
          <View style={styles.riskRow}>
            {[0, 1, 2].map((i) => (
              <View key={i} style={{ flex: 1 }}>
                <SkeletonLoader width="100%" height={40} radius={radii.lg} delay={i} />
              </View>
            ))}
          </View>
        </Card>
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
  photoPicker: { position: 'relative' },
  photoImg: { width: 72, height: 72, borderRadius: 36 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  riskRow: { flexDirection: 'row', gap: spacing[2] },
  riskBtn: {
    flex: 1,
    paddingVertical: spacing[2.5],
    borderRadius: radii.lg,
    alignItems: 'center',
  },
});
