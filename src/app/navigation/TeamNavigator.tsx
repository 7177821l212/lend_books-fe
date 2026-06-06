import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CollectorDetailScreen } from '@/features/collectors/screens/CollectorDetailScreen';
import { TeamScreen } from '@/features/dashboard/screens/TeamScreen';

export type TeamStackParamList = {
  TeamList: undefined;
  CollectorDetail: { id: string };
};

const Stack = createNativeStackNavigator<TeamStackParamList>();

export function TeamNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamList" component={TeamScreen} />
      <Stack.Screen name="CollectorDetail" component={CollectorDetailScreen} />
    </Stack.Navigator>
  );
}
