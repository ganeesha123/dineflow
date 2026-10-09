// s03 – Live floor / table map (FR7). Colour-coded status chips (NFR4).
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Screen, Button, Card, Chip, Label, H, Muted, Row } from '../../components/UI';
import { colors } from '../../theme';
import { useTables, useReservations, useQueue, useTick } from '../../hooks';
import { setTableStatus } from '../../services/db';
import { tableStatus, todayStr, nowMin, toMin, fmtTime, friendlyErr } from '../../utils';

const TONE = {
  available: { bg: colors.greenSoft, fg: colors.green, label: 'AVAIL' },
  occupied: { bg: colors.redSoft, fg: colors.red, label: 'OCCUP' },
  reserved: { bg: colors.amberSoft, fg: colors.amber, label: 'RESV' },
};

export default function FloorMap({ navigation }) {
  const tables = useTables();
  const reservations = useReservations();
  const queue = useQueue();
  const [sel, setSel] = useState(null);
  const [show, setShow] = useState({ available: true, occupied: true, reserved: true });
  useTick(30000);

  const date = todayStr();
  const nm = nowMin();
  const withStatus = tables.map((t) => ({ ...t, st: tableStatus(t, reservations, date, nm) }));
  const areas = [...new Set(tables.map((t) => t.area))];
  const selected = withStatus.find((t) => t.id === sel);
  const resv = selected
    ? reservations
        .filter((r) => r.status === 'confirmed' && r.date === date && r.tableId === selected.id && toMin(r.time) - nm > -15)
        .sort((a, b) => a.time.localeCompare(b.time))[0]
    : null;

  const setStatus = async (status) => {
    try { await setTableStatus(selected.id, status); } catch (e) { Alert.alert('Update failed', friendlyErr(e)); }
  };

  return (
    <Screen staff title="Bistro Floor Map" subtitle="Live table status · tap a table to update" right={<Chip label="STAFF PORTAL" tone="ink" />}>
      <Row style={{ flexWrap: 'wrap' }}>
        {Object.keys(TONE).map((k) => (
          <TouchableOpacity key={k} onPress={() => setShow({ ...show, [k]: !show[k] })} style={{ opacity: show[k] ? 1 : 0.35 }}>
            <Chip label={`${show[k] ? '☑' : '☐'} ${k.toUpperCase()} (${withStatus.filter((t) => t.st === k).length})`} tone={k === 'available' ? 'green' : k === 'occupied' ? 'red' : 'amber'} />
          </TouchableOpacity>
        ))}
      </Row>

      {areas.length === 0 ? <Muted>No tables yet — seed demo data from the Dashboard.</Muted> : null}
      {areas.map((a) => (
        <Card key={a}>
          <Label>{a}</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {withStatus.filter((t) => t.area === a && show[t.st]).map((t) => (
              <TouchableOpacity
                key={t.id}
                onPress={() => setSel(t.id)}
                style={{
                  width: '31%', minHeight: 84, borderRadius: 14, padding: 10, backgroundColor: TONE[t.st].bg,
                  borderWidth: sel === t.id ? 3 : 1.5, borderColor: sel === t.id ? colors.ink : TONE[t.st].fg,
                }}
              >
                <Text style={{ fontSize: 20, fontWeight: '900', color: colors.ink }}>{t.name}</Text>
                <Text style={{ color: colors.sub, fontSize: 12 }}>{t.capacity} Pax</Text>
                <Text style={{ color: TONE[t.st].fg, fontWeight: '900', fontSize: 11, marginTop: 4 }}>{TONE[t.st].label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      ))}

      <Card style={{ borderColor: colors.ink, borderWidth: 1.5 }}>
        <Label>Selected table actions</Label>
        {selected ? (
          <>
            <Row style={{ justifyContent: 'space-between' }}>
              <H>{selected.name} · {selected.capacity} seats</H>
              <Chip label={selected.st.toUpperCase()} tone={selected.st === 'available' ? 'green' : selected.st === 'occupied' ? 'red' : 'amber'} />
            </Row>
            {resv ? <Muted>Reserved {fmtTime(resv.time)} — {resv.name} (party of {resv.partySize}) · {resv.bookingId}</Muted> : null}
            <Row>
              {selected.st === 'occupied' ? (
                <Button style={{ flex: 1 }} title="Set Available" variant="secondary" onPress={() => setStatus('available')} />
              ) : (
                <Button style={{ flex: 1 }} title="Set Occupied" variant="secondary" onPress={() => setStatus('occupied')} />
              )}
              <Button
                style={{ flex: 1 }}
                title="Seat Party Now"
                disabled={!queue.length || selected.st === 'occupied'}
                onPress={() => navigation.navigate('TableAssignment', { tableId: selected.id })}
              />
            </Row>
          </>
        ) : (
          <Muted>Select a table above.</Muted>
        )}
      </Card>
    </Screen>
  );
}
