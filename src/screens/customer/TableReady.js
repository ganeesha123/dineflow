// c09 – Table-ready notification screen (FR4). UI-04: bold call-out for the next physical step.
import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row, Callout } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useMyQueue, useTick } from '../../hooks';
import { updateQueue } from '../../services/db';
import { fmtClock, pad } from '../../utils';

const HOLD_MS = 10 * 60 * 1000;

export default function TableReady({ navigation }) {
  const { user } = useAuth();
  const { entry } = useMyQueue(user.uid);
  const now = useTick(1000);

  const goBack = () => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('CustomerTabs'));

  if (!entry) {
    return (
      <Screen title="Table Ready Alert" onBack={goBack}>
        <Card><Muted>No active ticket. Your table may already have been assigned — enjoy your meal!</Muted></Card>
        <Button title="Back to Home" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Home' })} />
      </Screen>
    );
  }

  const left = Math.max(0, (entry.calledMs || now) + HOLD_MS - now);
  const mm = Math.floor(left / 60000);
  const ss = Math.floor((left % 60000) / 1000);
  const called = entry.status === 'called';

  return (
    <Screen title="Table Ready Alert" onBack={goBack}>
      <Card style={{ alignItems: 'center', paddingVertical: 22 }}>
        <Text style={{ fontSize: 54 }}>{called ? '🔔' : '⏳'}</Text>
        <Text style={{ fontSize: 30, fontWeight: '900', color: colors.ink }}>{called ? 'Your table is ready.' : 'Not called yet'}</Text>
        <Muted>{called ? 'Harbor Bistro is waiting for you. Head to the host.' : 'We will alert you the moment your table is ready.'}</Muted>
      </Card>

      {called ? (
        <Callout icon="walk" tone="amber" title="Please report to the Front Host Stand within 10 minutes" text={`Held until ${fmtClock((entry.calledMs || now) + HOLD_MS)} · ${pad(mm)}:${pad(ss)} left`} />
      ) : null}

      <Row>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.line }}>
          <Label>Ticket ID</Label><Text style={{ fontSize: 22, fontWeight: '900' }}>{entry.ticket}</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.line }}>
          <Label>Party size</Label><Text style={{ fontSize: 22, fontWeight: '900' }}>{entry.partySize} People</Text>
        </View>
      </Row>

      {called ? (
        entry.arrived ? (
          <Callout icon="checkmark-circle" tone="green" title="Host notified" text="The host knows you are here and will seat you now." />
        ) : (
          <Button title="I'm Here — Notify Host" variant="accent" onPress={() => updateQueue(entry.id, { arrived: true })} />
        )
      ) : null}
      <Button title="View Queue Tracker" variant="secondary" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Queue' })} />
    </Screen>
  );
}
