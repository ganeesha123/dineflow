import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { Loading } from '../components/UI';
import { colors } from '../theme';
import CustomerTabs from './CustomerTabs';
import StaffTabs from './StaffTabs';

import Splash from '../screens/customer/Splash';
import CustomerRegister from '../screens/customer/CustomerRegister';
import CustomerLogin from '../screens/customer/CustomerLogin';
import RestaurantDetails from '../screens/customer/RestaurantDetails';
import ReservationDetails from '../screens/customer/ReservationDetails';
import AvailableSlots from '../screens/customer/AvailableSlots';
import ReservationConfirmation from '../screens/customer/ReservationConfirmation';
import JoinQueue from '../screens/customer/JoinQueue';
import TableReady from '../screens/customer/TableReady';
import ModifyReservation from '../screens/customer/ModifyReservation';
import CancelReservation from '../screens/customer/CancelReservation';

import StaffLogin from '../screens/staff/StaffLogin';
import TableAssignment from '../screens/staff/TableAssignment';
import DoubleBookingWarning from '../screens/staff/DoubleBookingWarning';
import MarkSeated from '../screens/staff/MarkSeated';
import CustomerCalled from '../screens/staff/CustomerCalled';
import ManagerAnalytics from '../screens/staff/ManagerAnalytics';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, role, ready } = useAuth();
  if (!ready) return <View style={{ flex: 1, backgroundColor: colors.bg }}><Loading /></View>;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="CustomerRegister" component={CustomerRegister} />
          <Stack.Screen name="CustomerLogin" component={CustomerLogin} />
          <Stack.Screen name="StaffLogin" component={StaffLogin} />
        </>
      ) : role ? (
        <>
          <Stack.Screen name="StaffTabs" component={StaffTabs} />
          <Stack.Screen name="CustomerCalled" component={CustomerCalled} />
          <Stack.Screen name="TableAssignment" component={TableAssignment} />
          <Stack.Screen name="DoubleBookingWarning" component={DoubleBookingWarning} />
          <Stack.Screen name="MarkSeated" component={MarkSeated} />
          {role === 'manager' ? <Stack.Screen name="ManagerAnalytics" component={ManagerAnalytics} /> : null}
        </>
      ) : (
        <>
          <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
          <Stack.Screen name="RestaurantDetails" component={RestaurantDetails} />
          <Stack.Screen name="ReservationDetails" component={ReservationDetails} />
          <Stack.Screen name="AvailableSlots" component={AvailableSlots} />
          <Stack.Screen name="ReservationConfirmation" component={ReservationConfirmation} options={{ gestureEnabled: false }} />
          <Stack.Screen name="JoinQueue" component={JoinQueue} />
          <Stack.Screen name="TableReady" component={TableReady} />
          <Stack.Screen name="ModifyReservation" component={ModifyReservation} />
          <Stack.Screen name="CancelReservation" component={CancelReservation} />
        </>
      )}
    </Stack.Navigator>
  );
}
