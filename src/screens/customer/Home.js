// c02 – Home (live status of the selected restaurant) + c13 reminder banner (FR9, planned screen)
import React from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Loading, Row, Callout, Empty } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant, useTables, useReservations, useQueue, useTick } from '../../hooks';
import { floorCounts, estWait, todayStr, fmtDate, fmtTime, minsUntil, fmtDur, ordinal } from '../../utils';

export default function Home({ navigation }) {
  const { user, guestName } = useAuth();
  const restaurant = useRestaurant();
  const tables = useTables();
  const reservations = useReservations();
  const queue = useQueue();
  useTick(30000);

  if (restaurant === undefined) return <Loading />;

  const counts = floorCounts(tables, reservations);
  const status = counts.available === 0 ? 'Full' : counts.available <= 2 ? 'Limited space' : `${counts.available} tables free`;
  const wait = counts.available > 0 && queue.length === 0 ? 'No wait' : `${estWait(queue.length + 1, tables)} min`;

  const myRes = reservations
    .filter((r) => r.userId === user.uid && r.status === 'confirmed' && r.date >= todayStr())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))[0];
  const myIdx = queue.findIndex((e) => e.userId === user.uid);
  const myQ = myIdx >= 0 ? queue[myIdx] : null;
  const mins = myRes ? minsUntil(myRes.date, myRes.time) : null;

  return (
    <Screen title="DineFlow Home" subtitle={`Hi ${guestName || 'there'} — discover tables & skip the wait`}>
      {mins !== null && mins <= 120 && mins > -30 ? (
        <Callout
          icon="alarm"
          tone="accent"
          title={`Reminder: your table is ${mins > 0 ? `in ${fmtDur(mins)}` : 'now'}`}
          text={`${restaurant ? restaurant.name : 'Restaurant'} · ${fmtTime(myRes.time)} · party of ${myRes.partySize}`}
        />
      ) : null}

      {restaurant === null ? (
        <Card>
          <Empty icon="construct-outline" text="Restaurant data hasn't been set up yet. A staff member must log in once and press “Seed demo data” on the Dashboard." />
        </Card>
      ) : (
        <Card dark onPress={() => navigation.navigate('RestaurantDetails')} style={{ gap: 10 }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Chip label="TRENDING TONIGHT" tone="accent" />
            <Text style={{ color: '#fff', fontWeight: '800' }}>★ {restaurant.rating}</Text>
          </Row>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>{restaurant.name}</Text>
          <Text style={{ color: '#ccc' }}>{restaurant.cuisine} · {restaurant.area}</Text>
          <Row>
            <View style={{ flex: 1, backgroundColor: '#2c2c2c', borderRadius: 12, padding: 10 }}>
              <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '700' }}>TABLE STATUS</Text>
              <Text style={{ color: counts.available === 0 ? '#ff8a80' : '#7be0a3', fontSize: 17, fontWeight: '800' }}>{status}</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: '#2c2c2c', borderRadius: 12, padding: 10 }}>
              <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '700' }}>EST. WAIT</Text>
              <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{wait}</Text>
            </View>
          </Row>
          <Button title="Reserve a Table" variant="accent" onPress={() => navigation.navigate('ReservationDetails')} />
          <Button title="Join Virtual Queue" variant="secondary" onPress={() => navigation.navigate('JoinQueue')} />
        </Card>
      )}

      <Label style={{ marginTop: 8 }}>Active status tracker</Label>
      {!myRes && !myQ ? <Card><Empty icon="time-outline" text="No active reservations or queue tickets found." /></Card> : null}
      {myQ ? (
        <Card onPress={() => navigation.navigate('Queue')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <H>Queue ticket {myQ.ticket}</H>
            <Chip label={myQ.status === 'called' ? 'CALLED' : 'WAITING'} tone={myQ.status === 'called' ? 'green' : 'amber'} />
          </Row>
          <Muted>{ordinal(myIdx + 1)} of {queue.length} · est. wait ~{estWait(myIdx + 1, tables)} min</Muted>
        </Card>
      ) : null}
      {myRes ? (
        <Card onPress={() => navigation.navigate('Bookings')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <H>Reservation {myRes.bookingId}</H>
            <Chip label="CONFIRMED" tone="green" />
          </Row>
          <Muted>{fmtDate(myRes.date)} · {fmtTime(myRes.time)} · party of {myRes.partySize}</Muted>
        </Card>
      ) : null}
    </Screen>
  );
}
