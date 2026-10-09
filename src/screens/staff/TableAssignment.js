// s06 – Table assignment (FR7): best-fit recommendation, alternatives, conflict check → s07 (FR8)
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row, Loading, Empty } from '../../components/UI';
import { colors } from '../../theme';
import { useTables, useReservations, useQueue, useQueueAll } from '../../hooks';
import { recommendTable, tableStatus, conflictFor, efficiency, todayStr, nowMin } from '../../utils';

export default function TableAssignment({ navigation, route }) {
  const { entryId, tableId } = route.params || {};
  const all = useQueueAll();
  const queue = useQueue();
  const tables = useTables();
  const reservations = useReservations();

  const entry = entryId ? all.find((x) => x.id === entryId) : queue[0];
  if (entryId && !entry) return <Loading />;

  const date = todayStr();
  const nm = nowMin();
  const st = (t) => tableStatus(t, reservations, date, nm);
  const clash = (t) => conflictFor(t, reservations, date, nm);
  const back = () => navigation.goBack();

  if (!entry) {
    return (
      <Screen staff title="Table Assignment" subtitle="Seating Coordinator" onBack={back}>
        <Card><Empty icon="people-outline" text="No party is waiting for a table." /></Card>
      </Screen>
    );
  }

  const party = entry.partySize;
  const pre = tableId ? tables.find((t) => t.id === tableId) : null;
  const preOk = pre && pre.capacity >= party && st(pre) === 'available' && !clash(pre);
  const rec = preOk ? pre : recommendTable(tables, reservations, party, date, nm);
  const rank = { available: 0, reserved: 1, occupied: 2 };
  const alts = tables
    .filter((t) => t.capacity >= party && (!rec || t.id !== rec.id))
    .sort((a, b) => rank[st(a)] - rank[st(b)] || a.capacity - b.capacity);

  const choose = (t) => {
    if (st(t) === 'occupied' || clash(t)) navigation.navigate('DoubleBookingWarning', { entryId: entry.id, tableId: t.id });
    else navigation.navigate('MarkSeated', { entryId: entry.id, tableId: t.id });
  };

  return (
    <Screen staff title="Harbor Bistro" subtitle="Seating Coordinator · Seat Assignment" onBack={back} right={<Chip label="STAFF PORTAL" tone="ink" />}>
      {/* UI-01: the primary action sits at the top of the panel, above the fold */}
      <Card dark>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label style={{ color: '#bbb' }}>Recommended match</Label>
          {rec ? <Chip label="READY" tone="green" /> : <Chip label="NONE FREE" tone="red" />}
        </Row>
        {rec ? (
          <>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>Table {rec.name}</Text>
            <Text style={{ color: '#ccc' }}>Capacity: {rec.capacity} guests ({efficiency(party, rec.capacity)}% efficiency match) · {rec.area}</Text>
            <Button title={`Assign Table ${rec.name}`} variant="accent" onPress={() => choose(rec)} />
          </>
        ) : (
          <Text style={{ color: '#ccc' }}>No suitable table is free right now. Pick an alternative below (you will be warned about conflicts).</Text>
        )}
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Queue assignment</Label>
          <Chip label={entry.ticket} tone="ink" />
        </Row>
        <H>Party size: {party} {party === 1 ? 'guest' : 'guests'}</H>
        <Muted>{entry.name} · {entry.status === 'called' ? 'called' : entry.status}{entry.arrived ? ' · arrived' : ''}</Muted>
      </Card>

      <Label>Choose alternative table</Label>
      {alts.length === 0 ? <Muted>No other table can fit this party.</Muted> : null}
      {alts.map((t) => {
        const s = st(t);
        const c = clash(t);
        return (
          <TouchableOpacity key={t.id} onPress={() => choose(t)}>
            <Card>
              <Row style={{ justifyContent: 'space-between' }}>
                <H>Table {t.name} · {t.capacity} seats</H>
                <Chip label={s === 'available' && c ? 'CLASH' : s.toUpperCase()} tone={s === 'available' && !c ? 'green' : s === 'occupied' ? 'red' : 'amber'} />
              </Row>
              <Muted>{t.area}</Muted>
            </Card>
          </TouchableOpacity>
        );
      })}
    </Screen>
  );
}
