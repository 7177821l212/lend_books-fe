import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/context/AuthContext';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';
import { colors } from '@/theme';

import { CollectorNavigator } from './CollectorNavigator';
import { InvestorNavigator } from './InvestorNavigator';

export function RootNavigator() {
  const { user, isLoading } = useAuth();

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
