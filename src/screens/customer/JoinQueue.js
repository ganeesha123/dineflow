// c07 – Join virtual queue (FR3, FR5)
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Chip, Choice, Hero, Stat, Label, H, Muted, Row } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTables, useQueue } from '../../hooks';
import { joinQueue } from '../../services/db';
import { ensureNotifyPermission } from '../../services/notify';
import { estWait, friendlyErr } from '../../utils';

export default function JoinQueue({ navigation }) {
  const { user, guestName } = useAuth();
  const tables = useTables();
  const queue = useQueue();
  const [party, setParty] = useState(2);
  const [busy, setBusy] = useState(false);
  const mine = queue.find((e) => e.userId === user.uid);

  const join = async () => {
    setBusy(true);
    try {
      await ensureNotifyPermission();
      await joinQueue({ uid: user.uid, name: guestName || 'Guest', party });
      navigation.navigate('CustomerTabs', { screen: 'Queue' });
    } catch (e) {
      Alert.alert('Could not join queue', friendlyErr(e));
    }
    setBusy(false);
  };

  return (
    <Screen title="Join Virtual Queue" onBack={() => navigation.goBack()}>
      <Hero title="Harbor Bistro" subtitle="Skip the physical line. Wait from anywhere." chip="VIRTUAL LINE" height={120} />

      {mine ? (
        <Card>
          <H>You are already in the queue</H>
          <Muted>Your ticket is {mine.ticket}.</Muted>
          <Button title="Open Queue Tracker" onPress={() => navigation.navigate('CustomerTabs', { screen: 'Queue' })} />
        </Card>
      ) : (
        <>
          <Label>Specify your party size</Label>
          <Row style={{ flexWrap: 'wrap' }}>
            {[1, 2, 3, 4, 5, 6].map((n) => <Choice key={n} label={n === 6 ? '6+' : String(n)} selected={party === n} onPress={() => setParty(n)} />)}
          </Row>

          <Label>Current line status</Label>
          <Row>
            <Stat label="Waiting parties" value={queue.length} sub={`${queue.length} ahead of you`} />
            <Stat label="Est. wait time" value={`${estWait(queue.length + 1, tables)}m`} sub="Updates live" />
          </Row>

          <Card>
            <Label>Queue rules</Label>
            <Text style={{ color: colors.ink }}>• You'll get an alert when your table is ready.</Text>
            <Text style={{ color: colors.ink }}>• Report to the host stand within 10 minutes of being called.</Text>
            <Text style={{ color: colors.ink }}>• Only your name and party size are shared with staff.</Text>
          </Card>

          <Button title={`Join Queue as Party of ${party}`} loading={busy} onPress={join} />
        </>
      )}
    </Screen>
  );
}
