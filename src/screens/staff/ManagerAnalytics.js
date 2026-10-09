// m01 – Manager analytics dashboard (FR10): bookings, no-shows, waits, utilisation, peak period
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Stat, Choice, Label, H, Muted, Row, Loading } from '../../components/UI';
import { colors } from '../../theme';
import { useRestaurant, useTables, useReservations, useQueueAll } from '../../hooks';
import { floorCounts, toDateStr, todayStr, fmtTime, pad } from '../../utils';

const HOURS = [17, 18, 19, 20, 21, 22];
const DAY = 86400000;

export default function ManagerAnalytics({ navigation }) {
  const restaurant = useRestaurant();
  const tables = useTables();
  const reservations = useReservations();
  const queueAll = useQueueAll();
  const [range, setRange] = useState('today');
  if (restaurant === undefined) return <Loading />;

  const t0 = new Date();
  t0.setHours(0, 0, 0, 0);
  const start = range === 'today' ? t0.getTime() : t0.getTime() - 6 * DAY;
  const startDate = toDateStr(new Date(start));
  const q = queueAll.filter((e) => e.createdMs >= start);
  const rs = reservations.filter((r) => r.date >= startDate && r.date <= todayStr());

  const queueSeated = q.filter((e) => e.status === 'seated');
  const resSeated = rs.filter((r) => r.status === 'seated' || r.status === 'completed');
  const noShows = q.filter((e) => e.status === 'no_show').length + rs.filter((r) => r.status === 'no_show').length;
  const cancelled = rs.filter((r) => r.status === 'cancelled').length;
  const waits = queueSeated.filter((e) => e.seatedMs).map((e) => (e.seatedMs - e.createdMs) / 60000);
  const avgWait = waits.length ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length) : 0;
  const served = queueSeated.length + resSeated.length;
  const c = floorCounts(tables, reservations);
  const util = c.total ? Math.round(((c.occupied + c.reserved) / c.total) * 100) : 0;

  const byHour = HOURS.map((h) => ({
    h,
    n:
      q.filter((e) => new Date(e.createdMs).getHours() === h).length +
      rs.filter((r) => r.status !== 'cancelled' && Number(r.time.split(':')[0]) === h).length,
  }));
  const max = Math.max(1, ...byHour.map((b) => b.n));
  const peak = byHour.reduce((a, b) => (b.n > a.n ? b : a), byHour[0]);
  const totalParties = byHour.reduce((s, b) => s + b.n, 0);
  const noShowRate = served + noShows ? Math.round((noShows / (served + noShows)) * 100) : 0;
  const hr = (h) => fmtTime(`${pad(h)}:00`);

  return (
    <Screen staff title="Harbor Bistro" subtitle="Manager Analytics" onBack={() => navigation.goBack()} right={<Chip label="MANAGER" tone="ink" />}>
      <Row>
        <Choice label="Today" selected={range === 'today'} onPress={() => setRange('today')} />
        <Choice label="Last 7 days" selected={range === 'week'} onPress={() => setRange('week')} />
      </Row>

      <Row>
        <Stat label="Parties served" value={served} sub={`${q.length} queued · ${rs.length} booked`} />
        <Stat label="Avg wait" value={`${avgWait}m`} sub="queue → seated" />
      </Row>
      <Row>
        <Stat label="Table utilisation" value={`${util}%`} sub="live right now" tone={util >= 75 ? 'red' : 'green'} />
        <Stat label="No-shows" value={noShows} sub={`${noShowRate}% · ${cancelled} cancelled`} tone={noShows ? 'red' : undefined} />
      </Row>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <H>Peak period tracker</H>
          <Muted>parties / hour</Muted>
        </Row>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 8, paddingTop: 8 }}>
          {byHour.map((b) => (
            <View key={b.h} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: colors.ink }}>{b.n}</Text>
              <View style={{ width: '70%', height: Math.max(4, (b.n / max) * 90), backgroundColor: b.h === peak.h && b.n ? colors.accent : colors.ink, borderRadius: 6 }} />
              <Text style={{ fontSize: 10, color: colors.sub, marginTop: 4 }}>{b.h > 12 ? b.h - 12 : b.h}PM</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Label>Operational insights</Label>
        <Text style={{ color: colors.ink }}>• {totalParties ? `Peak demand is ${hr(peak.h)} with ${peak.n} ${peak.n === 1 ? 'party' : 'parties'}.` : 'No activity recorded in this period yet.'}</Text>
        <Text style={{ color: colors.ink }}>• {avgWait > 20 ? 'Average waits are long — consider calling parties earlier or opening more tables.' : 'Average wait is within the 20-minute tolerance diners reported.'}</Text>
        <Text style={{ color: colors.ink }}>• {noShowRate >= 15 ? 'No-show rate is high — send reminders and release tables sooner.' : 'No-show rate is under control.'}</Text>
      </Card>
    </Screen>
  );
}
