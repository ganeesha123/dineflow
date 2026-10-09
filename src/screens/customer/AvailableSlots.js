// c05 – Available slots (live capacity per slot) → creates the reservation
import React, { useState } from 'react';
import { Text, Alert } from 'react-native';
import { Screen, Button, Card, RadioCard, H, Muted, Label, Loading, Callout } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { useTables, useReservations } from '../../hooks';
import { createReservation } from '../../services/db';
import { genSlots, findTables, fmtTime, fmtDate, todayStr, toMin, nowMin, friendlyErr } from '../../utils';

export default function AvailableSlots({ navigation, route }) {
  const { party, date, win } = route.params;
  const { user, guestName } = useAuth();
  const tables = useTables();
  const reservations = useReservations();
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState(false);

  const slots = genSlots(win).map((time) => {
    const free = findTables({ tables, reservations, date, time, party }).length;
    const past = date === todayStr() && toMin(time) <= nowMin();
    const full = free === 0 || past;
    return { time, free, full, past, tag: past ? 'PASSED' : free === 0 ? 'FULL' : free <= 2 ? 'LIMITED' : 'AVAILABLE', tone: full ? 'red' : free <= 2 ? 'amber' : 'green' };
  });

  const confirm = async () => {
    setBusy(true);
    try {
      const res = await createReservation({ uid: user.uid, name: guestName || 'Guest', party, date, time: sel });
      navigation.replace('ReservationConfirmation', { reservation: res });
    } catch (e) {
      Alert.alert('Could not reserve', friendlyErr(e));
      setSel(null);
      setBusy(false);
    }
  };

  const allFull = slots.every((s) => s.full);

  return (
    <Screen title="Select Slot" subtitle={`Party of ${party} · ${fmtDate(date)}`} onBack={() => navigation.goBack()}>
      {tables.length === 0 ? <Loading /> : null}
      <Label>Available slots</Label>
      {slots.map((s) => (
        <RadioCard
          key={s.time}
          title={fmtTime(s.time)}
          subtitle={s.full ? 'Not available' : `${s.free} table${s.free > 1 ? 's' : ''} fit your party`}
          tag={s.tag}
          tagTone={s.tone}
          selected={sel === s.time}
          disabled={s.full}
          onPress={() => setSel(s.time)}
        />
      ))}
      {allFull ? (
        <Callout icon="people" tone="amber" title="Fully booked for this window" text="Join the virtual queue instead — you will be notified when a table is ready." />
      ) : null}
      {allFull ? <Button title="Join Virtual Queue" variant="accent" onPress={() => navigation.navigate('JoinQueue')} /> : null}
      <Button title="Confirm Reservation Details" disabled={!sel} loading={busy} onPress={confirm} />
    </Screen>
  );
}
