import * as Updates from 'expo-updates';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/context/AuthContext';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { useColors } from '@/theme';

import { CollectorNavigator } from './CollectorNavigator';
import { InvestorNavigator } from './InvestorNavigator';

export function RootNavigator() {
  const { user, isLoading } = useAuth();
  const colors = useColors();

  useEffect(() => {
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;
    void (async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (!update.isAvailable || cancelled) return;
        await Updates.fetchUpdateAsync();
        if (!cancelled) await Updates.reloadAsync();
      } catch {
        // A temporary network failure must never block the app from opening.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.brand[600]} />
      </View>
    );
  }

  if (!user) return <LoginScreen />;
  return user.role === 'investor' ? <InvestorNavigator /> : <CollectorNavigator />;
}
