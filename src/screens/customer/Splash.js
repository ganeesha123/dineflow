// c01 – Splash / start
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Screen, Button, Field, Chip, Muted } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { friendlyErr } from '../../utils';

export default function Splash({ navigation }) {
  const { startAsGuest, setGuestName, guestName } = useAuth();
  const [name, setName] = useState(guestName || '');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const start = async () => {
    if (!name.trim()) return setErr('Please enter your name so the host can call you.');
    setBusy(true);
    setErr('');
    try {
      setGuestName(name.trim());
      await startAsGuest();
    } catch (e) {
      setErr(friendlyErr(e));
      setBusy(false);
    }
  };

  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 28, gap: 6 }}>
        <View style={{ width: 84, height: 84, borderRadius: 24, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 34, fontWeight: '900' }}>DF</Text>
        </View>
        <Text style={{ fontSize: 34, fontWeight: '900', color: colors.ink, marginTop: 8 }}>DineFlow</Text>
        <Muted>Restaurant Reservations & Virtual Queue</Muted>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginVertical: 14 }}>
        <Chip label="LIVE TABLE AVAILABILITY" tone="green" />
        <Chip label="SKIP THE LINE" tone="accent" />
        <Chip label="TABLE-READY ALERTS" tone="amber" />
      </View>

      <Field label="Your name" value={name} onChangeText={setName} placeholder="e.g. Nimali" autoCapitalize="words" />
      {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
      <Button title="Start Application" onPress={start} loading={busy} />

      <TouchableOpacity onPress={() => navigation.navigate('StaffLogin')} style={{ alignItems: 'center', padding: 14 }}>
        <Text style={{ color: colors.sub, fontWeight: '700' }}>Restaurant staff? <Text style={{ color: colors.ink, textDecorationLine: 'underline' }}>Log in here</Text></Text>
      </TouchableOpacity>
    </Screen>
  );
}
