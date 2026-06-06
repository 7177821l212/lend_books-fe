/**
 * Collector bottom-tab navigator.
 */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarDays, Receipt, User, Users } from 'lucide-react-native';

import { HistoryScreen } from '@/features/payments/screens/HistoryScreen';
import { useT } from '@/i18n';
import { CustomersNavigator } from './CustomersNavigator';
import { MeNavigator } from './MeNavigator';
import { TodayNavigator } from './TodayNavigator';
import { useColors, fontFamily } from '@/theme';

const Tab = createBottomTabNavigator();
const ICON_SIZE = 22;

export function CollectorNavigator() {
  const t = useT();
  const colors = useColors();

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
        name="Today"
        component={TodayNavigator}
        options={{
          tabBarLabel: t('nav_today'),
          tabBarIcon: ({ color }) => <CalendarDays size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomersNavigator}
        options={{
          tabBarLabel: t('nav_customers'),
          tabBarIcon: ({ color }) => <Users size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: t('nav_history'),
          tabBarIcon: ({ color }) => <Receipt size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
      <Tab.Screen
        name="Me"
        component={MeNavigator}
        options={{
          tabBarLabel: t('nav_me'),
          tabBarIcon: ({ color }) => <User size={ICON_SIZE} color={color} strokeWidth={2.1} />,
        }}
      />
    </Tab.Navigator>
  );
}
