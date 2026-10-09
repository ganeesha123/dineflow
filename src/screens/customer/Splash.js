// c01 – Splash / start (improved UI with login + register navigation)
import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ImageBackground,
  Animated, Dimensions, StyleSheet
} from 'react-native';
import { Muted } from '../../components/UI';
import { colors } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

export default function Splash({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={st.container}>
      {/* Full-screen hero image */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80' }}
        style={st.hero}
        imageStyle={{ opacity: 0.75 }}
      >
        <View style={st.overlay} />

        {/* Logo and title */}
        <Animated.View style={[st.logoArea, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={st.logoBox}>
            <Text style={st.logoText}>DF</Text>
          </View>
          <Text style={st.appName}>DineFlow</Text>
          <Text style={st.tagline}>Reserve. Queue. Dine.</Text>

          <View style={st.badges}>
            <View style={st.badge}><Ionicons name="time-outline" size={13} color="#fff" /><Text style={st.badgeTxt}> Live Availability</Text></View>
            <View style={st.badge}><Ionicons name="people-outline" size={13} color="#fff" /><Text style={st.badgeTxt}> Virtual Queue</Text></View>
            <View style={st.badge}><Ionicons name="notifications-outline" size={13} color="#fff" /><Text style={st.badgeTxt}> Table Alerts</Text></View>
          </View>
        </Animated.View>

        {/* Bottom action card */}
        <Animated.View style={[st.card, { opacity: fadeAnim }]}>
          <Text style={st.cardTitle}>Get started</Text>
          <Muted style={{ textAlign: 'center', marginBottom: 20 }}>
            Create an account to book a table or join the virtual queue at any time
          </Muted>

          <TouchableOpacity style={st.primaryBtn} onPress={() => navigation.navigate('CustomerRegister')}>
            <Text style={st.primaryBtnTxt}>Create Account</Text>
          </TouchableOpacity>

          <TouchableOpacity style={st.secondaryBtn} onPress={() => navigation.navigate('CustomerLogin')}>
            <Text style={st.secondaryBtnTxt}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('StaffLogin')}
            style={{ alignItems: 'center', paddingTop: 16 }}
          >
            <Text style={{ color: colors.sub, fontSize: 13, fontWeight: '600' }}>
              Restaurant staff?{' '}
              <Text style={{ color: colors.accent, fontWeight: '800' }}>Staff Login</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  hero: { flex: 1, justifyContent: 'space-between' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
    gap: 10,
  },
  logoBox: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.accent, shadowOpacity: 0.7, shadowRadius: 20, shadowOffset: { width: 0, height: 6 },
    elevation: 12,
  },
  logoText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  appName: { color: '#fff', fontSize: 42, fontWeight: '900', letterSpacing: -0.5, marginTop: 8 },
  tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '500' },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 16 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  badgeTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, paddingBottom: 36,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20, elevation: 20,
  },
  cardTitle: { fontSize: 24, fontWeight: '900', color: colors.ink, textAlign: 'center', marginBottom: 8 },
  primaryBtn: {
    backgroundColor: colors.ink, borderRadius: 16,
    minHeight: 54, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.ink, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  primaryBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '800' },
  secondaryBtn: {
    backgroundColor: '#fff', borderRadius: 16, borderWidth: 2, borderColor: colors.ink,
    minHeight: 54, alignItems: 'center', justifyContent: 'center',
  },
  secondaryBtnTxt: { color: colors.ink, fontSize: 17, fontWeight: '800' },
});
