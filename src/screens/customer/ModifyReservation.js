// c11 – Modify reservation (FR6)
import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Choice, RadioCard, Label, H, Muted, Row, Loading } from '../../components/UI';
import { useTables, useReservations } from '../../hooks';
import { modifyReservation } from '../../services/db';
import { PARTY_CHIPS, nextDays, WINDOWS, genSlots, findTables, fmtDate, fmtTime, todayStr, toMin, nowMin, friendlyErr } from '../../utils';

export default function ModifyReservation({ navigation, route }) {
  const { id } = route.params;
  const tables = useTables();
  const reservations = useReservations();
  const cur = reservations.find((r) => r.id === id);
  const days = nextDays(7);
  const [party, setParty] = useState(null);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [win, setWin] = useState('dinner');
  const [busy, setBusy] = useState(false);

  if (!cur) return <Loading />;
  const p = party ?? cur.partySize;
  const d = date ?? cur.date;
  const t = time ?? cur.time;

  const slots = genSlots(win).map((s) => {
    const free = findTables({ tables, reservations, date: d, time: s, party: p, excludeId: id }).length;
    const past = d === todayStr() && toMin(s) <= nowMin();
    return { time: s, free, full: free === 0 || past };
  });

  const save = async () => {
    setBusy(true);
    try {
      await modifyReservation(id, { party: p, date: d, time: t });
      Alert.alert('Reservation updated', `${fmtDate(d)} at ${fmtTime(t)} · party of ${p}`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Could not update', friendlyErr(e));
      setBusy(false);
    }
  };

  return (
    <Screen title="Modify Booking" subtitle={`Currently ${fmtDate(cur.date)} · ${fmtTime(cur.time)} · ${cur.partySize} guests`} onBack={() => navigation.goBack()}>
      <Card><H>Harbor Bistro</H><Muted>Booking {cur.bookingId}</Muted></Card>

      <Label>Party size</Label>
      <Row style={{ flexWrap: 'wrap' }}>
        {PARTY_CHIPS.map((c) => <Choice key={c.value} label={c.label} selected={p === c.value} onPress={() => setParty(c.value)} />)}
      </Row>

      <Label>Date</Label>
      <Row style={{ flexWrap: 'wrap' }}>
        {days.map((x) => <Choice key={x.value} label={x.label} selected={d === x.value} onPress={() => setDate(x.value)} />)}
      </Row>

      <Label>Time</Label>
      <Row style={{ flexWrap: 'wrap' }}>
        {Object.keys(WINDOWS).map((k) => <Choice key={k} label={WINDOWS[k].label} selected={win === k} onPress={() => setWin(k)} />)}
      </Row>
      {slots.map((s) => (
        <RadioCard
          key={s.time}
          title={fmtTime(s.time)}
          subtitle={s.full ? 'Not available' : `${s.free} table${s.free > 1 ? 's' : ''} free`}
          tag={s.full ? 'FULL' : s.free <= 2 ? 'LIMITED' : 'AVAILABLE'}
          tagTone={s.full ? 'red' : s.free <= 2 ? 'amber' : 'green'}
          selected={t === s.time && !s.full}
          disabled={s.full}
          onPress={() => setTime(s.time)}
        />
      ))}

      <Button title="Confirm Changes" loading={busy} onPress={save} />
    </Screen>
  );
}
