/**
 * NewCustomerScreen — form for investor to add a customer.
 * Uses react-hook-form + zod for validation.
 */
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ChevronLeft, MapPin, Phone, User } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import {
  Avatar,
  Button,
  Card,
  GradientBackground,
  IconButton,
  Input,
  Screen,
  Text,
  useToast,
} from '@/components/ui';
import { useCreateCustomer } from '@/features/customers/hooks/useCustomers';
import { useT } from '@/i18n';
import { uploadPhoto } from '@/lib/uploadPhoto';
import { useColors, layout, radii, spacing } from '@/theme';
import type { RiskLevel } from '@/types';

type Nav = NativeStackNavigationProp<CustomersStackParamList, 'NewCustomer'>;

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().regex(/^\d{10,15}$/, 'Enter a valid phone number (10–15 digits)'),
  location: z.string().max(255).optional(),
  risk_level: z.enum(['low', 'medium', 'high']),
});

type FormValues = z.infer<typeof schema>;


export function NewCustomerScreen() {
  const t = useT();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const nav = useNavigation<Nav>();
  const toast = useToast();
  const create = useCreateCustomer();
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);

  const handlePickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { toast.warning('Gallery permission needed'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], quality: 0.8, allowsEditing: true, aspect: [1, 1],
    });
    if (!result.canceled) setPhotoUrl(result.assets[0].uri);
  };

  const RISKS: Array<{ key: RiskLevel; label: string; tone: 'success' | 'warning' | 'danger' }> = [
    { key: 'low', label: t('risk_low'), tone: 'success' },
    { key: 'medium', label: t('risk_medium'), tone: 'warning' },
    { key: 'high', label: t('risk_high'), tone: 'danger' },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', location: '', risk_level: 'medium' },
  });

  const submit = async (values: FormValues) => {
    try {
      let photoObjectName: string | undefined;
      if (photoUrl) {
        const uploaded = await uploadPhoto(photoUrl);
        photoObjectName = uploaded.objectName;
      }
      const customer = await create.mutateAsync({
        name: values.name.trim(),
        phone: values.phone.trim(),
        location: values.location?.trim() || undefined,
        risk_level: values.risk_level,
        photo_url: photoObjectName,
      });
      toast.success('Customer added');
      nav.replace('CustomerDetail', { id: customer.id });
    } catch (e) {
      const detail =
        (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not save customer';
      toast.error(detail);
    }
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
        <View style={styles.topRow}>
          <IconButton
            icon={<ChevronLeft size={20} color={colors.white} />}
            variant="glass"
            size="md"
            onPress={() => nav.goBack()}
            accessibilityLabel="Back"
          />
          <Text variant="title" color="onDark" style={{ marginLeft: spacing[2] }}>
            {t('new_customer')}
          </Text>
        </View>
      </GradientBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 12}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {/* Photo picker */}
          <View style={{ alignItems: 'center', marginBottom: spacing[4] }}>
            <TouchableOpacity onPress={handlePickPhoto} style={styles.photoPicker}>
              {photoUrl ? (
                <Image source={{ uri: photoUrl }} style={styles.photoImg} />
              ) : (
                <Avatar name="?" size="2xl" />
              )}
              <View style={[styles.cameraBtn, { backgroundColor: colors.brand[600] }]}>
                <Camera size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text variant="caption" color="tertiary" style={{ marginTop: spacing[2] }}>
              Tap to add photo
            </Text>
          </View>

          <Card padding={5}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('full_name')}
                  placeholder="e.g. Murugan Textiles"
                  value={value}
                  onChangeText={onChange}
                  leadingIcon={<User size={18} color={colors.slate[400]} />}
                  error={errors.name?.message}
                  containerStyle={{ marginBottom: spacing[4] }}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={t('phone')}
                  placeholder="10-digit mobile"
                  keyboardType="phone-pad"
                  value={value}
                  onChangeText={onChange}
                  leadingIcon={<Phone size={18} color={colors.slate[400]} />}
                  error={errors.phone?.message}
                  containerStyle={{ marginBottom: spacing[4] }}
                />
              )}
            />
            <Controller
              control={control}
              name="location"
              render={({ field: { onChange, value } }) => (
                <Input
                  label={`${t('address')} (optional)`}
                  placeholder="City, area"
                  value={value ?? ''}
                  onChangeText={onChange}
                  leadingIcon={<MapPin size={18} color={colors.slate[400]} />}
                  containerStyle={{ marginBottom: spacing[4] }}
                />
              )}
            />

            <Text variant="caption" color="secondary" style={{ marginBottom: spacing[2] }}>
              {t('risk_level').toUpperCase()}
            </Text>
            <Controller
              control={control}
              name="risk_level"
              render={({ field: { onChange, value } }) => (
                <View style={styles.riskRow}>
                  {RISKS.map((r) => {
                    const selected = value === r.key;
                    return (
                      <Pressable
                        key={r.key}
                        onPress={() => onChange(r.key)}
                        style={[
                          styles.riskChip,
                          selected && styles.riskChipSelected,
                          selected && r.tone === 'success' && {
                            borderColor: colors.success,
                            backgroundColor: colors.successSoft,
                          },
                          selected && r.tone === 'warning' && {
                            borderColor: colors.warning,
                            backgroundColor: colors.warningSoft,
                          },
                          selected && r.tone === 'danger' && {
                            borderColor: colors.danger,
                            backgroundColor: colors.dangerSoft,
                          },
                        ]}
                      >
                        <Text
                          variant="label"
                          color={selected ? 'primary' : 'secondary'}
                          align="center"
                        >
                          {r.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            />
          </Card>

          <Button
            label={t('create_customer')}
            fullWidth
            size="lg"
            loading={create.isPending}
            onPress={handleSubmit(submit)}
            style={{ marginTop: spacing[5] }}
            hapticFeedback="medium"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center' },
  body: { padding: layout.screenPaddingX, paddingBottom: spacing[12] },
  photoPicker: { position: 'relative' },
  photoImg: { width: 72, height: 72, borderRadius: 36 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  riskRow: { flexDirection: 'row', gap: spacing[2] },
  riskChip: {
    flex: 1,
    paddingVertical: spacing[3],
    borderRadius: radii.lg,
    borderWidth: 1.5,
  },
  riskChipSelected: {},
});
