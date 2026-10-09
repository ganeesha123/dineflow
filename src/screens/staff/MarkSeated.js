// s08 – Mark seated (end of the queue session). Confirm → seated → floor summary + next task.
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Chip, Stat, Label, H, Muted, Row, Loading, Callout } from '../../components/UI';
import { colors } from '../../theme';
import { useTables, useReservations, useQueueAll } from '../../hooks';
import { seatEntry } from '../../services/db';
import { floorCounts, friendlyErr } from '../../utils';

export default function MarkSeated({ navigation, route }) {
  const { entryId, tableId, override } = route.params;
  const all = useQueueAll();
  const tables = useTables();
  const reservations = useReservations();
  const [busy, setBusy] = useState(false);

  const entry = all.find((x) => x.id === entryId);
  const table = tables.find((t) => t.id === tableId);
  if (!entry || !table) return <Loading />;

  const seated = entry.status === 'seated';
  const c = floorCounts(tables, reservations);

  const seat = async () => {
    setBusy(true);
    try {
      await seatEntry({ entryId, tableId, override });
    } catch (e) {
      Alert.alert('Could not seat party', friendlyErr(e));
    }
    setBusy(false);
  };

  return (
    <Screen staff title="Harbor Bistro" subtitle="Seating confirmation" right={<Chip label="STAFF PORTAL" tone="ink" />}>
      {seated ? (
        <Card dark style={{ alignItems: 'center', paddingVertical: 22, gap: 4 }}>
          <Text style={{ fontSize: 48 }}>✅</Text>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{entry.ticket} is seated</Text>
          <Row>
            <Chip label={`TABLE ${table.name}`} tone="gray" />
            <Chip label="OCCUPIED" tone="red" />
          </Row>
        </Card>
      ) : (
        <Card dark style={{ gap: 4 }}>
          <Label style={{ color: '#bbb' }}>Ready to seat</Label>
          <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>{entry.ticket} → Table {table.name}</Text>
          <Text style={{ color: '#ccc' }}>Party of {entry.partySize} · {entry.name} · {table.capacity} seats · {table.area}</Text>
          {override ? <Chip label="OVERRIDE LOGGED" tone="red" /> : null}
        </Card>
      )}

      {!seated ? (
        <>
          <Button title="Mark Seated" variant="accent" loading={busy} onPress={seat} />
          <Button title="Go Back" variant="secondary" onPress={() => navigation.goBack()} />
        </>
      ) : (
        <Callout icon="restaurant" tone="amber" title={`Next staff task: notify server for ${table.name}`} text="Greet the party, hand over menus and start the order." />
      )}

      <Label>Floor summary</Label>
      <Row>
        <Stat label="Available" value={c.available} tone="green" />
        <Stat label="Occupied" value={c.occupied} tone="red" />
        <Stat label="Reserved" value={c.reserved} tone="amber" />
      </Row>

      {seated ? (
        <>
          <Button title="Back to Live Queue" onPress={() => navigation.navigate('StaffTabs', { screen: 'LiveQueue' })} />
          <Button title="Open Floor Map" variant="secondary" onPress={() => navigation.navigate('StaffTabs', { screen: 'FloorMap' })} />
        </>
      ) : null}
    </Screen>
  );
}
