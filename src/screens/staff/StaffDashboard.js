// s02 – Staff dashboard (FR7, NFR8: persistent real-time floor-state summary)
import React from 'react';
import { View, Text, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen, Button, Card, Chip, Stat, Label, H, Muted, Row, Loading, Empty } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useRestaurant, useTables, useReservations, useQueue, useTick } from '../../hooks';
import { seedDemoData } from '../../services/db';
import { floorCounts, estWait, recommendTable, todayStr, nowMin, toMin, friendlyErr } from '../../utils';

const NavRow = ({ icon, label, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}>
    <Ionicons name={icon} size={20} color={colors.ink} />
    <Text style={{ flex: 1, fontSize: 15, fontWeight: '700', color: colors.ink }}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={colors.sub} />
  </TouchableOpacity>
);

export default function StaffDashboard({ navigation }) {
  const { role } = useAuth();
  const restaurant = useRestaurant();
  const tables = useTables();
  const reservations = useReservations();
  const queue = useQueue();
  useTick(30000);

  if (restaurant === undefined) return <Loading />;

  const seed = async () => {
    try {
      await seedDemoData();
      Alert.alert('Done', 'Harbor Bistro and 9 tables were created.');
    } catch (e) {
      Alert.alert('Seed failed', friendlyErr(e));
    }
  };

  const c = floorCounts(tables, reservations);
  const nm = nowMin();
  const remaining = reservations.filter((r) => r.status === 'confirmed' && r.date === todayStr() && toMin(r.time) >= nm - 15).length;
  const next = queue[0];
  const rec = next ? recommendTable(tables, reservations, next.partySize, todayStr(), nm) : null;

  return (
    <Screen staff title="Harbor Bistro" subtitle={`Shift Manager Dashboard · ${role === 'manager' ? 'Manager' : 'Host'}`} right={<Chip label="STAFF PORTAL" tone="ink" />}>
      {restaurant === null ? (
        <Card>
          <Empty icon="construct-outline" text="No restaurant data yet. Create the demo restaurant and tables once." />
          <Button title="Seed demo data" onPress={seed} />
        </Card>
      ) : null}

      {next ? (
        <Card dark>
          <Label style={{ color: '#bbb' }}>Next in queue</Label>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>{next.ticket}</Text>
            <Chip label={next.status === 'called' ? 'CALLED' : 'WAITING'} tone={next.status === 'called' ? 'green' : 'amber'} />
          </Row>
          <Text style={{ color: '#ccc' }}>Party of {next.partySize}{next.arrived ? ' · ARRIVED' : ''} · suggested {rec ? `table ${rec.name} (${rec.capacity} seats)` : 'none free right now'}</Text>
          <Button title={rec ? `Assign Recommended Table ${rec.name}` : 'Assign Table'} variant="accent" onPress={() => navigation.navigate('TableAssignment', { entryId: next.id })} />
        </Card>
      ) : null}

      <Label>Real-time floor state</Label>
      <Row>
        <Stat label="Available tables" value={`${c.available} / ${c.total}`} tone="green" />
        <Stat label="Occupied tables" value={`${c.occupied} / ${c.total}`} tone="red" />
      </Row>
      <Row>
        <Stat label="Reserved today" value={remaining} sub="remaining" />
        <Stat label="In virtual queue" value={queue.length} sub={queue.length ? `est. ${estWait(queue.length, tables)} min` : 'no wait'} />
      </Row>

      <Label style={{ marginTop: 6 }}>Quick shift navigation</Label>
      <Card style={{ paddingVertical: 4, gap: 0 }}>
        <NavRow icon="grid-outline" label="Open Interactive Floor Map" onPress={() => navigation.navigate('FloorMap')} />
        <NavRow icon="people-outline" label="Manage Queue Tracker" onPress={() => navigation.navigate('LiveQueue')} />
        <NavRow icon="calendar-outline" label="Shift Reservations List" onPress={() => navigation.navigate('StaffHub')} />
        {role === 'manager' ? <NavRow icon="stats-chart-outline" label="Manager Analytics" onPress={() => navigation.navigate('ManagerAnalytics')} /> : null}
      </Card>
    </Screen>
  );
}
