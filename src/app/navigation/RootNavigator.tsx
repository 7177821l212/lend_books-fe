import { ActivityIndicator, View } from 'react-native';

import { useAuth } from '@/features/auth/context/AuthContext';
import { InvestorNavigator } from './InvestorNavigator';
import { CollectorNavigator } from './CollectorNavigator';
import { LoginScreen } from '@/features/auth/screens/LoginScreen';

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7B2FBE" />
      </View>
    );
  }

  if (!user) return <LoginScreen />;
  if (user.role === 'investor') return <InvestorNavigator />;
  return <CollectorNavigator />;
}
