/**
 * TodayNavigator — collector's "Today" tab stack.
 * MyDay → Collect → LoanDetail.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoanDetailScreen } from '@/features/loans/screens/LoanDetailScreen';
import { CollectScreen } from '@/features/payments/screens/CollectScreen';
import { MyDayScreen } from '@/features/payments/screens/MyDayScreen';

export type CollectorStackParamList = {
  MyDay: undefined;
  Collect: { loanId: string; scheduleId?: string };
  LoanDetail: { id: string };
};

const Stack = createNativeStackNavigator<CollectorStackParamList>();

export function TodayNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyDay" component={MyDayScreen} />
      <Stack.Screen name="Collect" component={CollectScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    </Stack.Navigator>
  );
}
