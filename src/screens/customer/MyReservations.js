// c10 – My reservations (UI-03: Modify / Cancel are distinct high-contrast buttons)
import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row, Empty, Callout } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { useReservations } from '../../hooks';
import { fmtDate, fmtTime, minsUntil, fmtDur } from '../../utils';

const Item = ({ r, children, tag, tone }) => (
  <Card>
    <Row style={{ justifyContent: 'space-between' }}>
      <H>Harbor Bistro</H>
      <Chip label={tag} tone={tone} />
    </Row>
    <Muted>{fmtDate(r.date)} · {fmtTime(r.time)} · {r.partySize} guests</Muted>
    <Muted>Booking {r.bookingId}</Muted>
    {children}
  </Card>
);

export default function MyReservations({ navigation }) {
  const { user } = useAuth();
  const all = useReservations().filter((r) => r.userId === user.uid);
  const sort = (l, dir = 1) => l.sort((a, b) => dir * (a.date + a.time).localeCompare(b.date + b.time));
  const upcoming = sort(all.filter((r) => r.status === 'confirmed'));
  const completed = sort(all.filter((r) => r.status === 'seated' || r.status === 'completed'), -1);
  const cancelled = sort(all.filter((r) => r.status === 'cancelled' || r.status === 'no_show'), -1);
  const next = upcoming[0];
  const mins = next ? minsUntil(next.date, next.time) : null;

  return (
    <Screen title="My Bookings">
      {next && mins !== null && mins <= 120 && mins > -30 ? (
        <Callout icon="alarm" tone="accent" title={`Reminder: your table is ${mins > 0 ? `in ${fmtDur(mins)}` : 'now'}`} text={`${fmtTime(next.time)} · party of ${next.partySize}`} />
      ) : null}

      <Label>Upcoming</Label>
      {upcoming.length === 0 ? <Card><Empty icon="calendar-outline" text="No upcoming reservations." /></Card> : null}
      {upcoming.map((r) => (
        <Item key={r.id} r={r} tag="CONFIRMED" tone="green">
          <Row>
            <Button style={{ flex: 1, minHeight: 46 }} title="Modify" icon="create-outline" onPress={() => navigation.navigate('ModifyReservation', { id: r.id })} />
            <Button style={{ flex: 1, minHeight: 46 }} title="Cancel" variant="dangerOutline" icon="close-circle-outline" onPress={() => navigation.navigate('CancelReservation', { id: r.id })} />
          </Row>
        </Item>
      ))}

      <Label style={{ marginTop: 8 }}>Completed</Label>
      {completed.length === 0 ? <Muted>None yet.</Muted> : completed.map((r) => <Item key={r.id} r={r} tag="COMPLETED" tone="gray" />)}

      <Label style={{ marginTop: 8 }}>Cancelled</Label>
      {cancelled.length === 0 ? <Muted>None.</Muted> : cancelled.map((r) => <Item key={r.id} r={r} tag={r.status === 'no_show' ? 'NO-SHOW' : 'CANCELLED'} tone="red" />)}
    </Screen>
  );
}
