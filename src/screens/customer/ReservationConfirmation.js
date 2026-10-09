// c06 – Reservation confirmation (minimum guest data shown – NFR6)
import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row } from '../../components/UI';
import { colors } from '../../theme';
import { fmtDate, fmtTime } from '../../utils';

const Box = ({ label, value }) => (
  <View style={{ flex: 1, backgroundColor: colors.bg, borderRadius: 12, padding: 12 }}>
    <Label>{label}</Label>
    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.ink }}>{value}</Text>
  </View>
);

export default function ReservationConfirmation({ navigation, route }) {
  const r = route.params.reservation;
  return (
    <Screen title="Reservation Confirmed">
      <Card style={{ alignItems: 'center', paddingVertical: 24 }}>
        <Text style={{ fontSize: 54 }}>✅</Text>
        <Text style={{ fontSize: 26, fontWeight: '900', textAlign: 'center', color: colors.ink }}>Harbor Bistro is ready for you.</Text>
        <Muted>Modern American · Waterfront District</Muted>
      </Card>

      <Row><Box label="Date" value={fmtDate(r.date)} /><Box label="Time" value={fmtTime(r.time)} /></Row>
      <Row><Box label="Party size" value={`${r.partySize} people`} /><Box label="Booking ID" value={r.bookingId} /></Row>

      <Card dark>
        <Label style={{ color: '#bbb' }}>Digital entry pass</Label>
        <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: 2 }}>{r.bookingId}</Text>
        <Text style={{ color: '#ccc' }}>Show this code at the host stand. Arrive within 15 minutes of your time.</Text>
      </Card>

      <Button title="View Active Reservations" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Bookings' })} />
      <Button title="Back to Home" variant="secondary" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })} />
    </Screen>
  );
}
