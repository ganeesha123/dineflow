// c03 – Restaurant details (FR1: real-time availability)
import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Hero, Stat, Label, H, Muted, Loading, Row } from '../../components/UI';
import { colors } from '../../theme';
import { useRestaurant, useTables, useReservations, useQueue } from '../../hooks';
import { floorCounts, fmtTime } from '../../utils';

export default function RestaurantDetails({ navigation }) {
  const r = useRestaurant();
  const tables = useTables();
  const reservations = useReservations();
  const queue = useQueue();
  if (r === undefined) return <Loading />;
  const c = floorCounts(tables, reservations);

  return (
    <Screen title="Restaurant Details" onBack={() => navigation.goBack()}>
      {r === null ? (
        <Muted>Restaurant data is not available yet.</Muted>
      ) : (
        <>
          <Hero title={r.name} subtitle={`${r.cuisine} · ${r.area}`} chip="TRENDING" height={170} />
          <Row style={{ flexWrap: 'wrap' }}>
            {(r.tags || []).map((t) => <Chip key={t} label={t.toUpperCase()} tone="gray" />)}
          </Row>
          <Text style={{ color: colors.sub }}>{r.address} · {r.phone}</Text>
          <Text style={{ fontWeight: '700', color: colors.ink }}>★ {r.rating} · {r.reviews} reviews</Text>

          <Row>
            <Stat label="Open tables" value={c.available} sub={`${c.available} Available`} tone={c.available ? 'green' : 'red'} />
            <Stat label="Active in queue" value={queue.length} sub={`${queue.length} parties`} />
          </Row>

          <Card>
            <Label>Hours of operation</Label>
            <Row style={{ justifyContent: 'space-between' }}><Text style={{ fontWeight: '700' }}>Mon – Sun</Text><Text>{fmtTime(r.open)} – {fmtTime(r.close)}</Text></Row>
            <Row style={{ justifyContent: 'space-between' }}><Muted>Last seating</Muted><Muted>{fmtTime(r.lastSeating)}</Muted></Row>
          </Card>

          <Button title="Book reservation" onPress={() => navigation.navigate('ReservationDetails')} />
          <Button title="Get virtual ticket" variant="accent" onPress={() => navigation.navigate('JoinQueue')} />
        </>
      )}
    </Screen>
  );
}
