// c12 – Cancel reservation (FR6) with explicit confirmation
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Callout, Label, H, Muted, Loading } from '../../components/UI';
import { useReservations } from '../../hooks';
import { setReservationStatus } from '../../services/db';
import { fmtDate, fmtTime, friendlyErr } from '../../utils';

export default function CancelReservation({ navigation, route }) {
  const { id } = route.params;
  const r = useReservations().find((x) => x.id === id);
  const [busy, setBusy] = useState(false);
  if (!r) return <Loading />;

  const cancel = async () => {
    setBusy(true);
    try {
      await setReservationStatus(id, 'cancelled');
      Alert.alert('Booking cancelled', 'Your table has been released.');
      navigation.navigate('CustomerTabs', { screen: 'Bookings' });
    } catch (e) {
      Alert.alert('Could not cancel', friendlyErr(e));
      setBusy(false);
    }
  };

  return (
    <Screen title="Cancel Booking" onBack={() => navigation.goBack()}>
      <Callout icon="warning" tone="red" title="Are you sure you want to cancel?" text="This will release your table immediately. This cannot be undone." />
      <Card>
        <Label>Reservation</Label>
        <H>Harbor Bistro</H>
        <Muted>{fmtDate(r.date)} · {fmtTime(r.time)} · {r.partySize} guests</Muted>
        <Muted>Booking {r.bookingId}</Muted>
      </Card>
      <Button title="Yes, Cancel Booking" variant="danger" loading={busy} onPress={cancel} />
      <Button title="No, Keep It" variant="secondary" onPress={() => navigation.goBack()} />
    </Screen>
  );
}
