/**
 * Investor bottom-tab navigator.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BarChart3, Home, LayoutGrid, Users } from 'lucide-react-native';

import { DashboardScreen } from '@/features/dashboard/screens/DashboardScreen';
import { TeamScreen } from '@/features/dashboard/screens/TeamScreen';
import { ReportsScreen } from '@/features/reports/screens/ReportsScreen';
import { CustomersNavigator } from './CustomersNavigator';
import { colors, fontFamily } from '@/theme';

const Tab = createBottomTabNavigator();
const ICON_SIZE = 22;

export function InvestorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.slate[400],
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          paddingTop: 6,
          paddingBottom: 8,
          height: 64,
          elevation: 8,
          shadowColor: colors.slate[900],
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.medium, fontSize: 10 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Home size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersNavigator}
        options={{
          tabBarLabel: 'Customers',
          tabBarIcon: ({ color }) => <Users size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
      <Tab.Screen
        name="Team"
        component={TeamScreen}
        options={{
          tabBarLabel: 'Team',
          tabBarIcon: ({ color }) => <LayoutGrid size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Reports',
          tabBarIcon: ({ color }) => <BarChart3 size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
    </Tab.Navigator>
  );
}
