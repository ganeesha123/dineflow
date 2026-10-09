// Customer Login Screen
import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Field, Button } from '../../components/UI';
import { colors } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { friendlyErr } from '../../utils';

export default function CustomerLogin({ navigation }) {
  const { customerLogin, googleLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyGoogle, setBusyGoogle] = useState(false);
  const [err, setErr] = useState('');

  const login = async () => {
    setErr('');
    if (!email.trim()) return setErr('Please enter your email address.');
    if (!password) return setErr('Please enter your password.');
    setBusy(true);
    try {
      await customerLogin(email, password);
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
            <Text style={st.title}>Welcome Back</Text>
            <Text style={st.subtitle}>Sign in to your DineFlow account</Text>
          </View>

          {/* Form */}
          <View style={st.form}>
            <Field
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View>
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry={!showPwd}
              />
              <TouchableOpacity style={st.eyeBtn} onPress={() => setShowPwd(!showPwd)}>
                <Ionicons name={showPwd ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.sub} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ alignSelf: 'flex-end' }}>
              <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 13 }}>Forgot password?</Text>
            </TouchableOpacity>

            {err ? (
              <View style={st.errBox}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.red} />
                <Text style={st.errTxt}>{err}</Text>
              </View>
            ) : null}

            <Button title="Sign In" onPress={login} loading={busy} style={{ marginTop: 4 }} />

            {/* Google */}
            <View style={st.dividerRow}>
              <View style={st.dividerLine} />
              <Text style={st.dividerTxt}>or continue with</Text>
              <View style={st.dividerLine} />
            </View>

            <TouchableOpacity style={[st.googleBtn, busyGoogle && { opacity: 0.6 }]} onPress={handleGoogleLogin} disabled={busyGoogle}>
              <Ionicons name="logo-google" size={20} color="#EA4335" />
              <Text style={st.googleTxt}>{busyGoogle ? 'Signing in...' : 'Continue with Google'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('CustomerRegister')} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={{ color: colors.sub, fontSize: 14 }}>
                Don't have an account?{' '}
                <Text style={{ color: colors.accent, fontWeight: '800' }}>Create Account</Text>
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('StaffLogin')} style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: colors.sub, fontSize: 13 }}>
                Restaurant staff?{' '}
                <Text style={{ color: colors.ink, fontWeight: '700', textDecorationLine: 'underline' }}>Staff Login</Text>
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
  scroll: { padding: 20, paddingBottom: 48 },
  back: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E0D6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  header: { alignItems: 'center', marginBottom: 32, gap: 8 },
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
