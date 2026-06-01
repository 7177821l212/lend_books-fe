import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { BRAND_COLOR } from '@/config/constants';
import { Placeholder } from '../Placeholder';

const Tab = createBottomTabNavigator();

export function CollectorNavigator() {
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
        name="Today"
        component={Placeholder}
        options={{ tabBarLabel: 'Today', tabBarIcon: () => <Text>📅</Text> }}
      />
      <Tab.Screen
        name="Customers"
        component={Placeholder}
        options={{ tabBarLabel: 'Customers', tabBarIcon: () => <Text>👥</Text> }}
      />
      <Tab.Screen
        name="History"
        component={Placeholder}
        options={{ tabBarLabel: 'History', tabBarIcon: () => <Text>🧾</Text> }}
      />
      <Tab.Screen
        name="Me"
        component={Placeholder}
        options={{ tabBarLabel: 'Me', tabBarIcon: () => <Text>👤</Text> }}
      />
    </Tab.Navigator>
  );
}
