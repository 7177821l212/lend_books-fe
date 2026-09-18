/**
 * CustomersNavigator — stack inside the Customers bottom-tab.
 * List → Detail → NewCustomer / NewLoan / LoanDetail → Collect.
 */
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CustomerDetailScreen } from '@/features/customers/screens/CustomerDetailScreen';
import { CustomerListScreen } from '@/features/customers/screens/CustomerListScreen';
import { EditCustomerScreen } from '@/features/customers/screens/EditCustomerScreen';
import { NewCustomerScreen } from '@/features/customers/screens/NewCustomerScreen';
import { LoanDetailScreen } from '@/features/loans/screens/LoanDetailScreen';
import { NewLoanScreen } from '@/features/loans/screens/NewLoanScreen';
import { CollectScreen } from '@/features/payments/screens/CollectScreen';

export type CustomersStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { id: string };
  EditCustomer: { id: string };
  NewCustomer: undefined;
  NewLoan: { customerId: string };
  LoanDetail: { id: string };
  // `scheduleId` is optional on purpose: a customer can pay before anything is
  // due, and then there is no pickup row to start from.
  Collect: { loanId: string; scheduleId?: string };
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
      <Stack.Screen
        name="EditCustomer"
        component={EditCustomerScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="NewLoan" component={NewLoanScreen} />
      <Stack.Screen name="LoanDetail" component={LoanDetailScreen} />
      {/* Reachable from a loan so an early payment can be taken on a day the
          collector's worklist is empty. */}
      <Stack.Screen name="Collect" component={CollectScreen} />
    </Stack.Navigator>
  );
}
