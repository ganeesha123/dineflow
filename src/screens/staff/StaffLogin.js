// s01 – Staff login (role is checked against users/{uid}.role in Firestore)
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Chip, Field, Muted } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { friendlyErr } from '../../utils';

export default function StaffLogin({ navigation }) {
  const { staffLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const login = async () => {
    if (!email.trim() || !pw) return setErr('Enter your staff email and password.');
    setBusy(true);
    setErr('');
    try {
      await staffLogin(email, pw);
    } catch (e) {
      setErr(friendlyErr(e));
      setBusy(false);
    }
  };

  return (
    <Screen staff title="Staff Login" onBack={() => navigation.goBack()} right={<Chip label="RESTRICTED PORTAL" tone="ink" />}>
      <View style={{ alignItems: 'center', gap: 4, marginVertical: 12 }}>
        <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>DF</Text>
        </View>
        <Text style={{ fontSize: 26, fontWeight: '900', color: colors.ink }}>DineFlow Staff</Text>
        <Muted>Harbor Bistro · Host & Manager access</Muted>
      </View>
      <Card>
        <Field label="Staff email / username" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="bistro.manager@dineflow.com" />
        <Field label="Password" value={pw} onChangeText={setPw} secureTextEntry placeholder="••••••••" />
        {err ? <Text style={{ color: colors.red, fontWeight: '600' }}>{err}</Text> : null}
        <Button title="Log in to Shift" loading={busy} onPress={login} />
      </Card>
      <Muted style={{ textAlign: 'center' }}>Authorized staff only. Accounts are created by the restaurant manager.</Muted>
    </Screen>
  );
}
