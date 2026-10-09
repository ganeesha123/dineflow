// Customer Register Screen
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, Button } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { friendlyErr } from '../../utils';

export default function CustomerRegister({ navigation }) {
  const { customerRegister, googleLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [err, setErr] = useState('');

  const register = async () => {
    setErr('');
    if (!name.trim()) return setErr('Please enter your full name.');
    if (!email.trim()) return setErr('Please enter a valid email address.');
    if (!mobile.trim() || mobile.trim().length < 7) return setErr('Please enter a valid mobile number.');
    if (password.length < 6) return setErr('Password must be at least 6 characters.');
    if (password !== confirm) return setErr('Passwords do not match.');

    setBusy(true);
    try {
      await customerRegister(name, email, mobile, password);
    } catch (e) {
      setErr(friendlyErr(e));
      setBusy(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErr('');
    setBusyGoogle(true);
    try {
      await googleLogin();
    } catch (e) {
      setErr(friendlyErr(e));
    } finally {
      setBusyGoogle(false);
    }
  };


  return (
    <SafeAreaView style={st.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={st.scroll} keyboardShouldPersistTaps="handled">

          {/* Back */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.back}>
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </TouchableOpacity>

          {/* Header */}
          <View style={st.header}>
            <View style={st.logoBox}>
              <Text style={st.logoText}>DF</Text>
            </View>
            <Text style={st.title}>Create Account</Text>
            <Text style={st.subtitle}>Join DineFlow and skip the wait</Text>
          </View>

          {/* Form */}
          <View style={st.form}>
            <Field
              label="Full name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Nimali Perera"
              autoCapitalize="words"
            />
            <Field
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Mobile number"
              value={mobile}
              onChangeText={setMobile}
              placeholder="+94 71 234 5678"
              keyboardType="phone-pad"
            />
            <View>
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Minimum 6 characters"
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity style={st.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.sub} />
              </TouchableOpacity>
            </View>
            <Field
              label="Confirm password"
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Re-enter your password"
              secureTextEntry={!showPwd}
            />

            {err ? (
              <View style={st.errBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
                <Text style={st.errTxt}>{err}</Text>
              </View>
            ) : null}

            <Button title="Create Account" onPress={register} loading={busy} style={{ marginTop: 8 }} />

            {/* Google */}
            <View style={st.dividerRow}>
              <View style={st.dividerLine} />
              <Text style={st.dividerTxt}>or continue with</Text>
              <View style={st.dividerLine} />
            </View>

            <TouchableOpacity style={[st.googleBtn, busyGoogle && { opacity: 0.6 }]} onPress={handleGoogleLogin} disabled={busyGoogle}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={st.googleTxt}>{busyGoogle ? 'Connecting...' : 'Continue with Google'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CustomerLogin')} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: colors.sub, fontSize: 14 }}>
                Already have an account?{' '}
                <Text style={{ color: colors.accent, fontWeight: '800' }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 20, paddingBottom: 48, gap: 0 },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E0D6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  header: { alignItems: 'center', marginBottom: 28, gap: 8 },
  logoBox: {
    width: 68, height: 68, borderRadius: 20, backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '900' },
  title: { fontSize: 28, fontWeight: '900', color: colors.ink },
  subtitle: { fontSize: 14, color: colors.sub },
  form: { gap: 14 },
  eyeBtn: { position: 'absolute', right: 14, bottom: 14 },
  errBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0F0', borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: '#FFD0D0',
  },
  errTxt: { color: colors.red, fontSize: 13, fontWeight: '600', flex: 1 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E0D6' },
  dividerTxt: { color: colors.sub, fontSize: 13, fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E0D6',
    minHeight: 52,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  googleTxt: { fontSize: 16, fontWeight: '700', color: colors.ink },
});
