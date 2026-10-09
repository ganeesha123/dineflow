// Customer Profile tab – shows registered details, allows name update, sign out
import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Screen, Button, Card, Field, Label, H, Muted, Row } from '../../components/UI';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { colors } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
  const { user, guestName, setGuestName, logout } = useAuth();
  const [name, setName] = useState(guestName || '');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load full profile from Firestore
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((s) => {
        if (s.exists()) {
          const d = s.data();
          setName(d.name || guestName || '');
          setEmail(d.email || user.email || '');
          setMobile(d.mobile || '');
        } else {
          setName(guestName || '');
          setEmail(user.email || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.uid]);

  const saveName = async () => {
    if (!name.trim()) return;
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { name: name.trim() });
      }
      setGuestName(name.trim());
      setSaved(true);
    } catch (e) {
      // If no doc exists yet (old guest), just save locally
      setGuestName(name.trim());
      setSaved(true);
    }
  };

  return (
    <Screen title="My Profile" subtitle="Your details are only used for reservations and the queue">
      {/* Avatar */}
      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 28, fontWeight: '900' }}>
            {name.trim() ? name.trim()[0].toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '900', color: colors.ink, marginTop: 10 }}>{name || 'Guest'}</Text>
        {email ? <Text style={{ color: colors.sub, fontSize: 13 }}>{email}</Text> : null}
      </View>

      {/* Edit name */}
      <Card>
        <Label>Display name</Label>
        <Field
          value={name}
          onChangeText={(v) => { setName(v); setSaved(false); }}
          autoCapitalize="words"
          placeholder="Your name"
        />
        <Button
          title={saved ? 'Saved ✓' : 'Save name'}
          variant="secondary"
          disabled={!name.trim()}
          onPress={saveName}
        />
      </Card>

      {/* Profile info (read only) */}
      {(email || mobile) ? (
        <Card>
          <Label>Account info</Label>
          {email ? (
            <Row style={{ gap: 10 }}>
              <Ionicons name="mail-outline" size={16} color={colors.sub} />
              <Text style={{ color: colors.ink, fontWeight: '600' }}>{email}</Text>
            </Row>
          ) : null}
          {mobile ? (
            <Row style={{ gap: 10 }}>
              <Ionicons name="call-outline" size={16} color={colors.sub} />
              <Text style={{ color: colors.ink, fontWeight: '600' }}>{mobile}</Text>
            </Row>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <Label>About</Label>
        <H>DineFlow</H>
        <Muted>Restaurant Table Reservation & Queue App · IT3060 HCI · Group WE_127</Muted>
        <Muted>Only the minimum data needed for bookings is stored (NFR6). No payment or ID data is collected.</Muted>
      </Card>

      <Button title="Sign out" variant="dangerOutline" onPress={logout} />
    </Screen>
  );
}
