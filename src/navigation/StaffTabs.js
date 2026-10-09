import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import StaffDashboard from '../screens/staff/StaffDashboard';
import FloorMap from '../screens/staff/FloorMap';
import LiveQueue from '../screens/staff/LiveQueue';
import StaffHub from '../screens/staff/StaffHub';

const Tab = createBottomTabNavigator();
const icons = {
  Dashboard: ['speedometer', 'speedometer-outline'],
  FloorMap: ['grid', 'grid-outline'],
  LiveQueue: ['people', 'people-outline'],
  StaffHub: ['briefcase', 'briefcase-outline'],
};
const labels = { Dashboard: 'Dashboard', FloorMap: 'Floor Map', LiveQueue: 'Live Queue', StaffHub: 'Staff Hub' };

// dark, high-contrast tab bar for the staff theme (NFR7)
export default function StaffTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#9AA0A6',
        tabBarStyle: { backgroundColor: colors.ink, borderTopColor: colors.ink },
        tabBarLabel: labels[route.name],
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={icons[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={StaffDashboard} />
      <Tab.Screen name="FloorMap" component={FloorMap} />
      <Tab.Screen name="LiveQueue" component={LiveQueue} />
      <Tab.Screen name="StaffHub" component={StaffHub} />
    </Tab.Navigator>
  );
}
