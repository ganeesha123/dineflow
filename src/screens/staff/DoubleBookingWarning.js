// s07 – Double-booking warning (FR8). Blocking warning with safe alternatives and an audited override (staff may override for legitimate exceptions).
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen, Button, Card, Chip, Field, Label, H, Muted, Row, Loading, Callout } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTables, useReservations, useQueueAll } from '../../hooks';
import { tableStatus, conflictFor, todayStr, nowMin, fmtTime, minsUntil, fmtDur } from '../../utils';

export default function DoubleBookingWarning({ navigation, route }) {
  const { entryId, tableId } = route.params;
  const { user } = useAuth();
  const all = useQueueAll();
  const tables = useTables();
  const reservations = useReservations();
  const [reason, setReason] = useState('');

  const entry = all.find((x) => x.id === entryId);
  const table = tables.find((t) => t.id === tableId);
  if (!entry || !table) return <Loading />;

  const date = todayStr();
  const nm = nowMin();
  const occupied = tableStatus(table, reservations, date, nm) === 'occupied';
  const cf = conflictFor(table, reservations, date, nm);
  const safe = tables
    .filter((t) => t.id !== table.id && t.capacity >= entry.partySize && tableStatus(t, reservations, date, nm) === 'available' && !conflictFor(t, reservations, date, nm))
    .sort((a, b) => a.capacity - b.capacity)
    .slice(0, 3);

  const override = () =>
    navigation.navigate('MarkSeated', {
      entryId,
      tableId,
      override: { by: user.email || user.uid, reason: reason.trim(), at: Date.now(), type: occupied ? 'occupied' : 'reserved-soon' },
    });

  return (
    <Screen staff title="Harbor Bistro" subtitle="Conflict Warning Alert" onBack={() => navigation.goBack()} right={<Chip label="STAFF PORTAL" tone="ink" />}>
      <Callout
        icon="warning"
        tone="red"
        title="Potential Booking Conflict"
        text={
          occupied
            ? `Table ${table.name} is currently occupied by another party.`
            : `You are seating ${entry.ticket} (party of ${entry.partySize}) at a table reserved shortly for another party.`
        }
      />

      <Label>Conflicting table</Label>
      <Card style={{ borderColor: colors.red, borderWidth: 2 }}>
        <H>Table {table.name} ({table.capacity} seats)</H>
        <Muted>{table.area}</Muted>
      </Card>

      {cf ? (
        <>
          <Label>Existing reservation</Label>
          <Card>
            <H>{cf.name} (party of {cf.partySize})</H>
            <Muted>Time: {fmtTime(cf.time)} (in {fmtDur(Math.max(0, minsUntil(cf.date, cf.time)))}) · {cf.bookingId}</Muted>
            <Muted>Status: Confirmed · Pre-assigned</Muted>
          </Card>
        </>
      ) : null}

      <Label>Safe alternatives</Label>
      {safe.length === 0 ? <Muted>No conflict-free table is free right now.</Muted> : null}
      {safe.map((t) => (
        <TouchableOpacity key={t.id} onPress={() => navigation.navigate('MarkSeated', { entryId, tableId: t.id })}>
          <Card>
            <Row style={{ justifyContent: 'space-between' }}>
              <H>Table {t.name} ({t.capacity} seats)</H>
              <Chip label="SAFE" tone="green" />
            </Row>
            <Muted>{t.area} · no overlapping booking</Muted>
          </Card>
        </TouchableOpacity>
      ))}

      <Button title="Choose Another Table" onPress={() => navigation.goBack()} />

      <Card>
        <Label>Override (audited)</Label>
        <Field label="Reason for overriding (required)" value={reason} onChangeText={setReason} placeholder="e.g. Reserved guests running 30 min late" autoCapitalize="sentences" />
        <Button title="Override & Assign Anyway" variant="dangerOutline" disabled={!reason.trim()} onPress={override} />
        <Muted>Your name and reason are saved with the ticket for accountability.</Muted>
      </Card>
    </Screen>
  );
}
