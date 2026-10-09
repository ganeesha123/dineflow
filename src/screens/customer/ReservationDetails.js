// c04 – Reservation details (party size → date → time window, FR2)
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Choice, Label, H, Muted, Row } from '../../components/UI';
import { PARTY_CHIPS, nextDays, WINDOWS } from '../../utils';

export default function ReservationDetails({ navigation }) {
  const days = nextDays(7);
  const [party, setParty] = useState(4);
  const [date, setDate] = useState(days[0].value);
  const [win, setWin] = useState('dinner');

  return (
    <Screen title="Book Reservation" onBack={() => navigation.goBack()}>
      <Card><H>Harbor Bistro</H><Muted>Modern American · Waterfront District</Muted></Card>

      <Label>Select party size</Label>
      <Row style={{ flexWrap: 'wrap' }}>
        {PARTY_CHIPS.map((p) => <Choice key={p.value} label={p.label} selected={party === p.value} onPress={() => setParty(p.value)} />)}
      </Row>

      <Label>Select date</Label>
      <Row style={{ flexWrap: 'wrap' }}>
        {days.map((d) => <Choice key={d.value} label={d.label} selected={date === d.value} onPress={() => setDate(d.value)} />)}
      </Row>

      <Label>Select time window</Label>
      <Row style={{ flexWrap: 'wrap' }}>
        {Object.keys(WINDOWS).map((k) => <Choice key={k} label={WINDOWS[k].label} selected={win === k} onPress={() => setWin(k)} />)}
      </Row>

      <Button title="Continue to Available Slots" onPress={() => navigation.navigate('AvailableSlots', { party, date, win })} />
    </Screen>
  );
}
