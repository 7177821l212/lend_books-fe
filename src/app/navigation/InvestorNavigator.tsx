import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { BRAND_COLOR } from '@/config/constants';

// Screens — imported when implemented
// import { DashboardScreen } from '@/features/investor/dashboard/screens/DashboardScreen';
// import { CustomerListScreen } from '@/features/investor/customers/screens/CustomerListScreen';
// import { TeamScreen } from '@/features/investor/team/screens/TeamScreen';
// import { ReportsScreen } from '@/features/investor/reports/screens/ReportsScreen';

import { Placeholder } from '../Placeholder';

const Tab = createBottomTabNavigator();

export function InvestorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: BRAND_COLOR,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { paddingBottom: 4 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={Placeholder}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => <Text>🏠</Text> }}
      />
      <Tab.Screen
        name="Customers"
        component={Placeholder}
        options={{ tabBarLabel: 'Customers', tabBarIcon: () => <Text>👥</Text> }}
      />
      <Tab.Screen
        name="Team"
        component={Placeholder}
        options={{ tabBarLabel: 'Team', tabBarIcon: () => <Text>🧑‍💼</Text> }}
      />
      <Tab.Screen
        name="Reports"
        component={Placeholder}
        options={{ tabBarLabel: 'Reports', tabBarIcon: () => <Text>📊</Text> }}
      />
    </Tab.Navigator>
  );
}
