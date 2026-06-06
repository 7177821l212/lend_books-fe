import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CustomersStackParamList } from '@/app/navigation/CustomersNavigator';
import { Button, Card, Input, Screen, Text, useToast } from '@/components/ui';
import { useCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { useT } from '@/i18n';
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
  const [initialised, setInitialised] = useState(false);

  if (customer && !initialised) {
    setName(customer.name);
    setPhone(customer.phone);
    setLocation(customer.location ?? '');
    setRiskLevel(customer.risk_level);
    setInitialised(true);
  }

  if (isLoading || !customer) {
    return (
      <Screen background="default" edges={[]}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.brand[600]} />
        </View>
      </Screen>
    );
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
      await update.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        location: location.trim() || undefined,
        risk_level: riskLevel,
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

      <View style={{ padding: layout.screenPaddingX, marginTop: spacing[4] }}>
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
  riskRow: { flexDirection: 'row', gap: spacing[2] },
  riskBtn: {
    flex: 1,
    paddingVertical: spacing[2.5],
    borderRadius: radii.lg,
    alignItems: 'center',
  },
});
