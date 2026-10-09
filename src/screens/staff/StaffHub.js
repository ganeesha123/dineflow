// Staff Hub tab – shift reservations list (seat / no-show), account, manager shortcut
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row, Empty } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useReservations } from '../../hooks';
import { setReservationStatus, setTableStatus } from '../../services/db';
import { todayStr, fmtDate, fmtTime, friendlyErr } from '../../utils';

export default function StaffHub({ navigation }) {
  const { user, role, logout } = useAuth();
  const list = useReservations()
    .filter((r) => r.status === 'confirmed' && r.date >= todayStr())
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const seat = async (r) => {
    try {
      await setReservationStatus(r.id, 'seated');
      if (r.tableId) await setTableStatus(r.tableId, 'occupied');
    } catch (e) { Alert.alert('Failed', friendlyErr(e)); }
  };
  const noShow = (r) =>
    Alert.alert(`Mark ${r.name} as no-show?`, 'The table is released.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'No-show', style: 'destructive', onPress: () => setReservationStatus(r.id, 'no_show').catch((e) => Alert.alert('Failed', friendlyErr(e))) },
    ]);

  return (
    <Screen staff title="Staff Hub" subtitle="Shift reservations & account" right={<Chip label="STAFF PORTAL" tone="ink" />}>
      <Label>Shift reservations ({list.length})</Label>
      {list.length === 0 ? <Card><Empty icon="calendar-outline" text="No upcoming reservations." /></Card> : null}
      {list.map((r) => (
        <Card key={r.id}>
          <Row style={{ justifyContent: 'space-between' }}>
            <H>{r.name} · party of {r.partySize}</H>
            <Chip label={r.tableName ? `TABLE ${r.tableName}` : 'NO TABLE'} tone="gray" />
          </Row>
          <Muted>{fmtDate(r.date)} · {fmtTime(r.time)} · {r.bookingId}</Muted>
          <Row>
            <Button style={{ flex: 1, minHeight: 44 }} title="Seat" onPress={() => seat(r)} />
            <Button style={{ flex: 1, minHeight: 44 }} title="No-show" variant="dangerOutline" onPress={() => noShow(r)} />
          </Row>
        </Card>
      ))}

      <Label style={{ marginTop: 8 }}>Account</Label>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: colors.ink, fontWeight: '700' }}>{user.email}</Text>
          <Chip label={role === 'manager' ? 'MANAGER' : 'HOST'} tone="ink" />
        </Row>
        {role === 'manager' ? <Button title="Manager Analytics" variant="secondary" icon="stats-chart-outline" onPress={() => navigation.navigate('ManagerAnalytics')} /> : null}
        <Button title="Log out" variant="dangerOutline" onPress={logout} />
      </Card>
    </Screen>
  );
}
