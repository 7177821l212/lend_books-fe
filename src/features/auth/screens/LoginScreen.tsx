/**
 * LoginScreen — designed with the centralised theme + reusable components.
 */
import { Lock, Mail, Wallet } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Button, GradientBackground, Input, Screen, Text } from '@/components/ui';
import { colors, radii, spacing } from '@/theme';
import { useLogin } from '../hooks/useLogin';

const DEMO_ACCOUNTS = [
  { role: 'Investor', tone: 'brand', email: 'owner@lendbook.app', password: 'owner123' },
  { role: 'Collector', tone: 'success', email: 'ravi@lendbook.app', password: 'ravi123' },
] as const;

export function LoginScreen() {
  const { submit, isLoading, error } = useLogin();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  return (
    <Screen padded={false} background="dark" statusBar="light" edges={[]}>
      <GradientBackground gradient="hero" style={styles.hero}>
        <View style={styles.brandBubble}>
          <Wallet size={28} color={colors.brand[600]} />
        </View>
        <Text variant="display" color="onDark" style={{ marginTop: spacing[5] }}>
          LendBook
        </Text>
        <Text variant="body" color="onDark" style={{ opacity: 0.7, marginTop: spacing[1] }}>
          Money lending, simplified.
        </Text>
      </GradientBackground>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheet}
      >
        <Text variant="h2">Welcome back</Text>
        <Text variant="body" color="secondary" style={{ marginTop: 2, marginBottom: spacing[5] }}>
          Sign in to continue
        </Text>

        <Input
          label="Email"
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
          label="Password"
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
          label="Sign in"
          fullWidth
          size="lg"
          loading={isLoading}
          disabled={!email || !password}
          onPress={() => submit(email.trim(), password)}
        />

        <View style={styles.demo}>
          <Text variant="caption" color="tertiary" align="center" style={{ marginBottom: spacing[2] }}>
            QUICK DEMO
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing[2] }}>
            {DEMO_ACCOUNTS.map((acc) => (
              <Text
                key={acc.role}
                onPress={() => {
                  setEmail(acc.email);
                  setPassword(acc.password);
                }}
                style={[
                  styles.demoChip,
                  { backgroundColor: acc.tone === 'brand' ? colors.brand[50] : colors.successSoft },
                ]}
              >
                <Text
                  variant="label"
                  color={acc.tone === 'brand' ? colors.brand[700] : colors.success}
                >
                  {acc.role}
                </Text>
                {'\n'}
                <Text variant="caption" color="tertiary">
                  {acc.email}
                </Text>
              </Text>
            ))}
          </View>
        </View>
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
  brandBubble: {
    width: 56,
    height: 56,
    borderRadius: radii['2xl'],
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 0.6,
    backgroundColor: colors.card,
    borderTopLeftRadius: radii['3xl'],
    borderTopRightRadius: radii['3xl'],
    padding: spacing[6],
    paddingBottom: spacing[10],
  },
  demo: {
    marginTop: spacing[6],
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border.subtle,
  },
  demoChip: {
    flex: 1,
    padding: spacing[3],
    borderRadius: radii.lg,
    textAlign: 'left',
  },
});
