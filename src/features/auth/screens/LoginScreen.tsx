import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { BRAND_COLOR } from '@/config/constants';
import { useLogin } from '../hooks/useLogin';

const DEMO_ACCOUNTS = [
  { role: 'Investor', email: 'owner@invest.local', password: 'owner123' },
  { role: 'Collector', email: 'ravi@invest.local', password: 'ravi123' },
];

export function LoginScreen() {
  const { submit, isLoading, error } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.logo}>💼</Text>
        <Text style={styles.appName}>LendBook</Text>
        <Text style={styles.tagline}>Money lending, simplified.</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.form}
      >
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="you@invest.local"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Button
          label="Sign in →"
          loading={isLoading}
          onPress={() => submit(email, password)}
          disabled={isLoading || !email || !password}
          style={styles.cta}
        />

        <Text style={styles.demoLabel}>Quick demo</Text>
        <View style={styles.demoRow}>
          {DEMO_ACCOUNTS.map((acc) => (
            <TouchableOpacity
              key={acc.role}
              style={styles.demoChip}
              onPress={() => { setEmail(acc.email); setPassword(acc.password); }}
            >
              <Text style={styles.demoRole}>{acc.role}</Text>
              <Text style={styles.demoEmail}>{acc.email}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BRAND_COLOR },
  header: { flex: 0.35, justifyContent: 'center', alignItems: 'flex-start', paddingHorizontal: 24 },
  logo: { fontSize: 32 },
  appName: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: 4 },
  tagline: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 },
  form: {
    flex: 0.65,
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6B7280', marginTop: 4, marginBottom: 24 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  error: { color: '#EF4444', fontSize: 13, marginBottom: 8 },
  cta: { marginTop: 8, width: '100%' },
  demoLabel: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 20, marginBottom: 10 },
  demoRow: { flexDirection: 'row', gap: 12 },
  demoChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
  },
  demoRole: { fontSize: 13, fontWeight: '600', color: '#374151' },
  demoEmail: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
});
