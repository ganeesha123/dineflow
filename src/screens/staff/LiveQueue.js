// s04 – Live queue manager (FR3/FR5/FR7)
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row, Empty } from '../../components/UI';
import { colors } from '../../theme';
import { useTables, useQueue, useTick } from '../../hooks';
import { callEntry, noShowEntry } from '../../services/db';
import { estWait, friendlyErr } from '../../utils';

export default function LiveQueue({ navigation }) {
  const tables = useTables();
  const queue = useQueue();
  const now = useTick(15000);

  const call = async (e) => {
    try { await callEntry(e.id); } catch (x) { Alert.alert('Failed', friendlyErr(x)); }
  };
  const noShow = (e) =>
    Alert.alert(`Mark ${e.ticket} as no-show?`, 'They will be removed from the queue.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'No-show', style: 'destructive', onPress: () => noShowEntry(e.id).catch((x) => Alert.alert('Failed', friendlyErr(x))) },
    ]);

  return (
    <Screen staff title="Live Queue Manager" subtitle={`${queue.length} ${queue.length === 1 ? 'party' : 'parties'} waiting · live`} right={<Chip label="STAFF PORTAL" tone="ink" />}>
      {queue.length === 0 ? <Card><Empty icon="checkmark-done-outline" text="Queue is empty." /></Card> : null}
      {queue.map((e, i) => {
        const called = e.status === 'called';
        const ago = called ? Math.floor((now - e.calledMs) / 60000) : 0;
        const overdue = called && ago >= 10;
        return (
          <Card key={e.id} style={called ? { borderColor: colors.green, borderWidth: 2 } : null}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H>{e.ticket} · Party of {e.partySize}</H>
              <Chip label={called ? (overdue ? 'OVERDUE' : 'CALLED') : 'WAITING'} tone={called ? (overdue ? 'red' : 'green') : 'amber'} />
            </Row>
            <Muted>
              {e.name}{e.arrived ? ' · ✔ ARRIVED' : ''} · {called ? `called ${ago}m ago` : `est. wait ~${estWait(i + 1, tables)} min`}
            </Muted>
            <Row>
              {called ? (
                <Button style={{ flex: 2, minHeight: 44 }} title="Seat Table" onPress={() => navigation.navigate('TableAssignment', { entryId: e.id })} />
              ) : (
                <Button style={{ flex: 2, minHeight: 44 }} title="Call Party" onPress={() => call(e)} />
              )}
              <Button style={{ flex: 1, minHeight: 44 }} title="No Show" variant="dangerOutline" onPress={() => noShow(e)} />
              <Button style={{ flex: 1, minHeight: 44 }} title="View" variant="secondary" onPress={() => navigation.navigate('CustomerCalled', { entryId: e.id })} />
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}
