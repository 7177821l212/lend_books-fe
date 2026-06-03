/**
 * CustomersNavigator — stack inside the Customers bottom-tab.
 * List → Detail → NewCustomer / NewLoan / LoanDetail.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CustomerDetailScreen } from '@/features/customers/screens/CustomerDetailScreen';
import { CustomerListScreen } from '@/features/customers/screens/CustomerListScreen';
import { NewCustomerScreen } from '@/features/customers/screens/NewCustomerScreen';
import { LoanDetailScreen } from '@/features/loans/screens/LoanDetailScreen';
import { NewLoanScreen } from '@/features/loans/screens/NewLoanScreen';

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { id: string };
  NewCustomer: undefined;
  NewLoan: { customerId: string };
  LoanDetail: { id: string };
};

const Stack = createNativeStackNavigator<CustomersStackParamList>();

export function CustomersNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CustomerList" component={CustomerListScreen} />
      <Stack.Screen name="CustomerDetail" component={CustomerDetailScreen} />
      <Stack.Screen
        name="NewCustomer"
        component={NewCustomerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="NewLoan" component={NewLoanScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
    </Stack.Navigator>
  );
}
