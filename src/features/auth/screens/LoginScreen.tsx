/**
 * LoginScreen — designed with the centralised theme + reusable components.
 */
import { Lock, Mail, Wallet } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { Button, GradientBackground, Input, Screen, Text } from '@/components/ui';
import { useT } from '@/i18n';
import { useColors, radii, spacing } from '@/theme';
import { useLogin } from '../hooks/useLogin';

export function LoginScreen() {
  const t = useT();
  const colors = useColors();
  const { submit, isLoading, error } = useLogin();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardOpen(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <Screen padded={false} background="dark" statusBar="light" edges={[]}>
      <GradientBackground
        gradient="hero"
        style={{ ...styles.hero, ...(keyboardOpen ? styles.heroCompact : {}) }}
      >
        <View style={[styles.brandBubble, { backgroundColor: colors.white }]}>
          <Wallet size={28} color={colors.brand[600]} />
        </View>
        <Text variant={keyboardOpen ? 'h2' : 'display'} color="onDark" style={{ marginTop: keyboardOpen ? spacing[2] : spacing[5] }}>
          LendBook
        </Text>
        {!keyboardOpen ? (
          <Text variant="body" color="onDark" style={{ opacity: 0.7, marginTop: spacing[1] }}>
            Money lending, simplified.
          </Text>
        ) : null}
      </GradientBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        enabled={Platform.OS === 'ios'}
        style={[styles.sheet, keyboardOpen && styles.sheetExpanded, { backgroundColor: colors.card }]}
      >
        <ScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        <Text variant="h2">{t('welcome_back')}</Text>
        <Text variant="body" color="secondary" style={{ marginTop: 2, marginBottom: spacing[5] }}>
          {t('sign_in_to_continue')}
        </Text>

        <Input
          label={t('email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@lendbook.app"
          leadingIcon={<Mail size={18} color={colors.slate[400]} />}
          containerStyle={{ marginBottom: spacing[3] }}
        />
        <Input
          label={t('password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          leadingIcon={<Lock size={18} color={colors.slate[400]} />}
          containerStyle={{ marginBottom: spacing[4] }}
        />

        {error ? (
          <Text variant="caption" color={colors.danger} style={{ marginBottom: spacing[2] }}>
            {error}
          </Text>
        ) : null}

        <Button
          label={t('sign_in')}
          fullWidth
          size="lg"
          loading={isLoading}
          disabled={!email || !password}
          onPress={() => submit(email.trim(), password)}
        />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    flex: 0.4,
    paddingHorizontal: spacing[6],
    paddingTop: spacing[16],
    paddingBottom: spacing[6],
  },
  heroCompact: {
    flex: 0,
    minHeight: 108,
    paddingTop: spacing[4],
    paddingBottom: spacing[3],
  },
  brandBubble: {
    width: 56,
    height: 56,
    borderRadius: radii['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 0.6,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
  },
  sheetExpanded: {
    flex: 1,
  },
  sheetContent: {
    flexGrow: 1,
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
});
