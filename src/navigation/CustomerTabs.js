import React, { useEffect, useRef } from 'react';
import { Vibration } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useMyQueue } from '../hooks';
import { localNotify } from '../services/notify';
import { getNotifyOn } from '../services/settings';
import Home from '../screens/customer/Home';
import MyReservations from '../screens/customer/MyReservations';
import QueueTracker from '../screens/customer/QueueTracker';
import Profile from '../screens/customer/Profile';

const Tab = createBottomTabNavigator();
const icons = {
  Home: ['home', 'home-outline'],
  Bookings: ['calendar', 'calendar-outline'],
  Queue: ['people', 'people-outline'],
  Profile: ['person', 'person-outline'],
};

export default function CustomerTabs({ navigation }) {
  const { user } = useAuth();
  const { entry } = useMyQueue(user.uid);
  const prev = useRef(null);
  const status = entry ? entry.status : null;

  // FR4 – table-ready alert: as soon as staff call this diner's ticket, alert + open c09
  useEffect(() => {
    if (status === 'called' && prev.current !== 'called') {
      if (getNotifyOn()) {
        localNotify('Your table is ready!', `Ticket ${entry.ticket} – please report to the host stand within 10 minutes.`);
        Vibration.vibrate([0, 400, 200, 400]);
      }
      navigation.navigate('TableReady');
    }
    prev.current = status;
  }, [status]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.sub,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: colors.line },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        tabBarIcon: ({ focused, color, size }) => <Ionicons name={icons[route.name][focused ? 0 : 1]} size={size} color={color} />,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Bookings" component={MyReservations} />
      <Tab.Screen name="Queue" component={QueueTracker} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
