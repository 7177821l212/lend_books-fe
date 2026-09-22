import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CollectorDetailScreen } from '@/features/collectors/screens/CollectorDetailScreen';
import { LiveLocationsScreen } from '@/features/collectors/screens/LiveLocationsScreen';
import { LoanDetailScreen } from '@/features/loans/screens/LoanDetailScreen';
import { TeamScreen } from '@/features/dashboard/screens/TeamScreen';

export type TeamStackParamList = {
  TeamList: undefined;
  CollectorDetail: { id: string };
  LiveLocations: undefined;
  // Reached from a collector's assigned-loans list.
  LoanDetail: { id: string };
};

const Stack = createNativeStackNavigator<TeamStackParamList>();

export function TeamNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamList" component={TeamScreen} />
      <Stack.Screen name="CollectorDetail" component={CollectorDetailScreen} />
      <Stack.Screen name="LiveLocations" component={LiveLocationsScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    </Stack.Navigator>
  );
}
