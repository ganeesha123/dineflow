// Customer profile tab – guest name + sign out
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Field, Label, H, Muted } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { guestName, setGuestName, logout } = useAuth();
  const [name, setName] = useState(guestName || '');
  const [saved, setSaved] = useState(false);

  return (
    <Screen title="Profile" subtitle="Your details are only used for reservations and the queue">
      <Card>
        <Field label="Display name" value={name} onChangeText={(v) => { setName(v); setSaved(false); }} autoCapitalize="words" />
        <Button title={saved ? 'Saved ✓' : 'Save name'} variant="secondary" disabled={!name.trim()} onPress={() => { setGuestName(name.trim()); setSaved(true); }} />
      </Card>
      <Card>
        <Label>About</Label>
        <H>DineFlow</H>
        <Muted>Restaurant Table Reservation & Queue App · IT3060 HCI · Group WE_127</Muted>
        <Muted>Only the minimum data needed for bookings is stored (NFR6). No payment or ID data is collected.</Muted>
      </Card>
      <Button title="Sign out" variant="dangerOutline" onPress={logout} />
    </Screen>
  );
}
