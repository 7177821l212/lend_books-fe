import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Input, Screen, Text, useToast } from '@/components/ui';
import { authApi } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useAppSettings } from '@/store/appSettings';
import { useColors, layout, radii, spacing } from '@/theme';
import { useT } from '@/i18n';

type ThemeOption = 'light' | 'dark' | 'system';
type LangOption = 'en' | 'ta';

export function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const toast = useToast();
  const t = useT();
  const nav = useNavigation();
  const { logout } = useAuth();
  const { theme, language, hapticsEnabled, setTheme, setLanguage, setHapticsEnabled } =
    useAppSettings();

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) {
      toast.warning('All password fields are required');
      return;
    }
    if (newPw !== confirmPw) {
      toast.error(t('passwords_no_match'));
      return;
    }
    if (newPw.length < 6) {
      toast.warning('New password must be at least 6 characters');
      return;
    }
    setChangingPw(true);
    try {
      await authApi.changePassword({ current_password: currentPw, new_password: newPw });
      toast.success(t('password_changed'));
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch {
      toast.error('Failed to change password. Check your current password.');
    } finally {
      setChangingPw(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void logout() },
    ]);
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
        <Text variant="h2">{t('settings')}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: layout.screenPaddingX,
          paddingBottom: spacing[12],
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <Text variant="overline" color="tertiary" style={{ marginBottom: spacing[2] }}>
          {t('appearance')}
        </Text>
        <Card padding={4} style={{ marginBottom: spacing[4] }}>
          <Text variant="label" style={{ marginBottom: spacing[3] }}>
            {t('theme')}
          </Text>
          <View style={styles.segmented}>
            {(['light', 'dark', 'system'] as ThemeOption[]).map((opt) => {
              const label =
                opt === 'light' ? t('theme_light') : opt === 'dark' ? t('theme_dark') : t('theme_system');
              const active = theme === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.segmentBtn,
                    {
                      backgroundColor: active ? colors.brand[600] : colors.slate[100],
                      borderColor: active ? colors.brand[600] : colors.border.default,
                    },
                  ]}
                  onPress={() => setTheme(opt)}
                >
                  <Text
                    variant="label"
                    style={{ color: active ? '#fff' : colors.text.secondary }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={[styles.row, { marginTop: spacing[4] }]}>
            <View style={{ flex: 1 }}>
              <Text variant="label">{t('language')}</Text>
            </View>
            <View style={styles.langRow}>
              {(['en', 'ta'] as LangOption[]).map((lang) => {
                const label = lang === 'en' ? t('lang_english') : t('lang_tamil');
                const active = language === lang;
                return (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.langBtn,
                      {
                        backgroundColor: active ? colors.brand[600] : colors.slate[100],
                        borderColor: active ? colors.brand[600] : colors.border.default,
                      },
                    ]}
                    onPress={() => setLanguage(lang)}
                  >
                    <Text
                      variant="caption"
                      style={{ color: active ? '#fff' : colors.text.secondary }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.row, { marginTop: spacing[4] }]}>
            <View style={{ flex: 1 }}>
              <Text variant="label">{t('haptics')}</Text>
              <Text variant="caption" color="tertiary">
                {t('haptics_desc')}
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ true: colors.brand[600], false: colors.slate[300] }}
              thumbColor="#fff"
            />
          </View>
        </Card>

        {/* Change Password */}
        <Text variant="overline" color="tertiary" style={{ marginBottom: spacing[2] }}>
          {t('account')}
        </Text>
        <Card padding={4} style={{ marginBottom: spacing[4] }}>
          <Text variant="label" style={{ marginBottom: spacing[3] }}>
            {t('change_password')}
          </Text>
          <Input
            label={t('current_password')}
            value={currentPw}
            onChangeText={setCurrentPw}
            secureTextEntry
            placeholder="••••••••"
            containerStyle={{ marginBottom: spacing[3] }}
          />
          <Input
            label={t('new_password')}
            value={newPw}
            onChangeText={setNewPw}
            secureTextEntry
            placeholder="••••••••"
            containerStyle={{ marginBottom: spacing[3] }}
          />
          <Input
            label={t('confirm_password')}
            value={confirmPw}
            onChangeText={setConfirmPw}
            secureTextEntry
            placeholder="••••••••"
            containerStyle={{ marginBottom: spacing[4] }}
          />
          <Button
            label={changingPw ? t('loading') : t('change_password')}
            variant="primary"
            fullWidth
            disabled={changingPw}
            onPress={handleChangePassword}
          />
        </Card>

        <Button
          label={t('sign_out')}
          variant="danger"
          fullWidth
          size="lg"
          onPress={handleSignOut}
        />
      </ScrollView>
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
  row: { flexDirection: 'row', alignItems: 'center' },
  segmented: { flexDirection: 'row', gap: spacing[2] },
  segmentBtn: {
    flex: 1,
    paddingVertical: spacing[2],
    borderRadius: radii.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  langRow: { flexDirection: 'row', gap: spacing[2] },
  langBtn: {
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1.5],
    borderRadius: radii.lg,
    borderWidth: 1,
  },
});
