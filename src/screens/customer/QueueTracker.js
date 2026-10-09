// c08 – Live queue tracker (FR3, FR5, NFR2 live updates, NFR5 position + estimate)
import React, { useState } from 'react';
import { View, Text, Alert, Switch } from 'react-native';
import { Screen, Button, Card, Chip, Progress, Label, H, Muted, Row, Callout, Empty, Loading } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTables, useMyQueue } from '../../hooks';
import { updateQueue } from '../../services/db';
import { getNotifyOn, setNotifyOn } from '../../services/settings';
import { estWait, ordinal, fmtClock } from '../../utils';

export default function QueueTracker({ navigation }) {
  const { user } = useAuth();
  const tables = useTables();
  const { entry, position, total } = useMyQueue(user.uid);
  const [alerts, setAlerts] = useState(getNotifyOn());

  if (!entry) {
    return (
      <Screen title="Live Queue Tracker" subtitle="Harbor Bistro · Waterfront District">
        <Card>
          <Empty icon="people-outline" text="You are not in a queue right now. Join the virtual line and we will alert you when your table is ready." />
          <Button title="Join Virtual Queue" variant="accent" onPress={() => navigation.navigate('JoinQueue')} />
        </Card>
      </Screen>
    );
  }

  const called = entry.status === 'called';
  const wait = called ? 0 : estWait(position, tables);

  const leave = () =>
    Alert.alert('Leave the queue?', 'You will lose your place in line.', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Leave queue', style: 'destructive', onPress: () => updateQueue(entry.id, { status: 'left' }) },
    ]);

  return (
    <Screen title="Live Queue Tracker" subtitle="Harbor Bistro · Waterfront District">
      <Row style={{ justifyContent: 'space-between' }}>
        <Chip label="● LIVE – UPDATES AUTOMATICALLY" tone="green" />
      </Row>

      {called ? (
        <Callout icon="notifications" tone="green" title="Your table is ready!" text="Please report to the Front Host Stand within 10 minutes." />
      ) : null}

      <Card dark style={{ gap: 4, paddingVertical: 18 }}>
        <Label style={{ color: '#bbb' }}>Your virtual ticket</Label>
        <Text style={{ color: '#fff', fontSize: 56, fontWeight: '900', letterSpacing: 2 }}>{entry.ticket}</Text>
        <Text style={{ color: '#ccc' }}>Party of {entry.partySize} · joined at {fmtClock(entry.createdMs)}</Text>
        <Chip label={called ? 'CALLED' : 'WAITING'} tone={called ? 'green' : 'amber'} />
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Estimated remaining wait</Label>
          <Text style={{ fontSize: 18, fontWeight: '900', color: colors.ink }}>{called ? 'Now' : `~${wait} mins`}</Text>
        </Row>
        <Progress value={total ? 1 - (position - 1) / total : 1} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Muted>Position in line</Muted>
          <Text style={{ fontWeight: '800', color: colors.ink }}>{ordinal(position)} of {total}</Text>
        </Row>
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <H>Notification settings</H>
            <Muted>Alert me when my table is ready (SMS fallback planned)</Muted>
          </View>
          <Switch value={alerts} onValueChange={(v) => { setAlerts(v); setNotifyOn(v); }} trackColor={{ true: colors.accent }} />
        </Row>
      </Card>

      {called ? <Button title="View table-ready details" variant="accent" onPress={() => navigation.navigate('TableReady')} /> : null}
      <Button title="Leave Virtual Queue" variant="dangerOutline" onPress={leave} />
    </Screen>
  );
}
