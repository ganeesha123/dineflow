// s05 – Customer called (active call, hold timer, no-show)
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row, Loading, Callout } from '../../components/UI';
import { colors } from '../../theme';
import { useTables, useReservations, useQueue, useQueueAll, useTick } from '../../hooks';
import { callEntry, updateQueue, noShowEntry } from '../../services/db';
import { estWait, recommendTable, todayStr, nowMin, friendlyErr } from '../../utils';

export default function CustomerCalled({ navigation, route }) {
  const { entryId } = route.params;
  const all = useQueueAll();
  const queue = useQueue();
  const tables = useTables();
  const reservations = useReservations();
  const now = useTick(1000);
  const e = all.find((x) => x.id === entryId);
  if (!e) return <Loading />;

  const called = e.status === 'called';
  const idx = queue.findIndex((x) => x.id === e.id);
  const ago = called ? Math.floor((now - e.calledMs) / 60000) : 0;
  const rec = recommendTable(tables, reservations, e.partySize, todayStr(), nowMin());

  const callCustomer = async () => {
    try {
      if (called) await updateQueue(e.id, { calledMs: Date.now() });
      else await callEntry(e.id);
      Alert.alert('Customer notified', `${e.ticket} was alerted in the app. The 10-minute hold started.`);
    } catch (x) {
      Alert.alert('Failed', friendlyErr(x));
    }
  };
  const noShow = () =>
    Alert.alert(`Mark ${e.ticket} as no-show?`, '', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'No-show', style: 'destructive', onPress: async () => { try { await noShowEntry(e.id); navigation.goBack(); } catch (x) { Alert.alert('Failed', friendlyErr(x)); } } },
    ]);

  const active = e.status === 'waiting' || called;

  return (
    <Screen staff title="Harbor Bistro" subtitle="Customer Relations · Active Call" onBack={() => navigation.goBack()} right={<Chip label="STAFF PORTAL" tone="ink" />}>
      <Card dark style={{ alignItems: 'center', paddingVertical: 20, gap: 4 }}>
        <Chip label={called ? 'CALLED' : e.status.replace('_', '-').toUpperCase()} tone={called ? 'green' : e.status === 'waiting' ? 'amber' : 'gray'} />
        <Label style={{ color: '#bbb' }}>Active queue ticket</Label>
        <Text style={{ color: '#fff', fontSize: 52, fontWeight: '900', letterSpacing: 2 }}>{e.ticket}</Text>
        <Text style={{ color: '#ccc' }}>Party of {e.partySize} · {e.name}</Text>
      </Card>

      {e.arrived ? <Callout icon="checkmark-circle" tone="green" title="Customer says they have arrived" text="They are at the host stand." /> : null}

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Muted>{called ? 'Time since called' : 'Predicted wait'}</Muted>
          <Text style={{ fontWeight: '800', color: called && ago >= 10 ? colors.red : colors.ink }}>
            {called ? `${ago} Mins${ago >= 10 ? ' (Overdue)' : ''}` : idx >= 0 ? `~${estWait(idx + 1, tables)} min` : '—'}
          </Text>
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Muted>Suggested table</Muted>
          <Text style={{ fontWeight: '800', color: colors.ink }}>{rec ? `${rec.name} (${rec.capacity} seats)` : 'None free'}</Text>
        </Row>
      </Card>

      {active ? (
        <>
          <Button title={called ? 'Re-call Customer' : 'Call Customer'} icon="call" onPress={callCustomer} />
          <Button title="Assign Table" variant="accent" onPress={() => navigation.navigate('TableAssignment', { entryId: e.id })} />
          <Button title="Mark No Show" variant="dangerOutline" onPress={noShow} />
        </>
      ) : (
        <Muted style={{ textAlign: 'center' }}>This ticket is closed.</Muted>
      )}
      <Muted>Calling alerts the diner inside the DineFlow app and starts a 10-minute hold.</Muted>
    </Screen>
  );
}
