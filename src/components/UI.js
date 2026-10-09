import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export function Screen({ children, staff, title, subtitle, onBack, right, footer }) {
  return (
    <SafeAreaView edges={['top']} style={[st.flex, { backgroundColor: staff ? colors.staffBg : colors.bg }]}>
      {title ? (
        <View style={st.header}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={st.back} hitSlop={10}>
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </TouchableOpacity>
          ) : null}
          <View style={st.flex}>
            <Text style={st.title}>{title}</Text>
            {subtitle ? <Text style={st.subtitle}>{subtitle}</Text> : null}
          </View>
          {right}
        </View>
      ) : null}
      <ScrollView style={st.flex} contentContainerStyle={st.body} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      {footer}
    </SafeAreaView>
  );
}

const variants = {
  primary: { bg: colors.ink, fg: '#fff', border: colors.ink },
  accent: { bg: colors.accent, fg: '#fff', border: colors.accent },
  secondary: { bg: '#fff', fg: colors.ink, border: colors.ink },
  danger: { bg: colors.red, fg: '#fff', border: colors.red },
  dangerOutline: { bg: '#fff', fg: colors.red, border: colors.red },
};

export function Button({ title, onPress, variant = 'primary', disabled, loading, icon, style }) {
  const v = variants[variant];
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      onPress={onPress}
      style={[st.btn, { backgroundColor: v.bg, borderColor: v.border, opacity: disabled ? 0.45 : 1 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={18} color={v.fg} style={{ marginRight: 8 }} /> : null}
          <Text style={[st.btnTxt, { color: v.fg }]}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export const Card = ({ children, style, dark, onPress }) => {
  const C = onPress ? TouchableOpacity : View;
  return (
    <C onPress={onPress} activeOpacity={0.85} style={[st.card, dark && { backgroundColor: colors.ink, borderColor: colors.ink }, style]}>
      {children}
    </C>
  );
};

const tones = {
  green: [colors.greenSoft, colors.green],
  red: [colors.redSoft, colors.red],
  amber: [colors.amberSoft, colors.amber],
  accent: [colors.accentSoft, colors.accent],
  gray: ['#EEE9E0', colors.sub],
  ink: [colors.ink, '#fff'],
};
export function Chip({ label, tone = 'gray' }) {
  const [bg, fg] = tones[tone];
  return (
    <View style={[st.chip, { backgroundColor: bg }]}>
      <Text style={[st.chipTxt, { color: fg }]}>{label}</Text>
    </View>
  );
}

export const Label = ({ children, style }) => <Text style={[st.label, style]}>{children}</Text>;
export const H = ({ children, style }) => <Text style={[st.h, style]}>{children}</Text>;
export const Muted = ({ children, style }) => <Text style={[st.muted, style]}>{children}</Text>;

export function Stat({ label, value, sub, dark, tone }) {
  return (
    <View style={[st.stat, dark && { backgroundColor: colors.ink, borderColor: colors.ink }]}>
      <Text style={[st.label, dark && { color: '#bbb' }]}>{label}</Text>
      <Text style={[st.statVal, dark && { color: '#fff' }, tone && { color: tones[tone][1] }]}>{value}</Text>
      {sub ? <Text style={[st.muted, dark && { color: '#bbb' }]}>{sub}</Text> : null}
    </View>
  );
}

export function Choice({ label, selected, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[st.choice, selected && { backgroundColor: colors.ink, borderColor: colors.ink }, disabled && { opacity: 0.4 }]}
    >
      <Text style={[st.choiceTxt, selected && { color: '#fff' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function RadioCard({ title, subtitle, tag, tagTone, selected, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[st.card, selected && { borderColor: colors.accent, borderWidth: 2 }, disabled && { opacity: 0.45 }]}
    >
      <View style={st.row}>
        <View style={st.flex}>
          <Text style={st.h}>{title}</Text>
          {subtitle ? <Text style={st.muted}>{subtitle}</Text> : null}
        </View>
        {tag ? <Chip label={tag} tone={tagTone} /> : null}
        <Ionicons
          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
          size={26}
          color={selected ? colors.accent : colors.sub}
          style={{ marginLeft: 10 }}
        />
      </View>
    </TouchableOpacity>
  );
}

export function Field({ label, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput placeholderTextColor="#aaa" autoCapitalize="none" {...props} style={[st.input, props.style]} />
    </View>
  );
}

export function Progress({ value }) {
  return (
    <View style={st.progBg}>
      <View style={[st.progFill, { width: `${Math.max(4, Math.min(100, value * 100))}%` }]} />
    </View>
  );
}

export const Loading = () => (
  <View style={[st.flex, { alignItems: 'center', justifyContent: 'center', padding: 40 }]}>
    <ActivityIndicator size="large" color={colors.accent} />
  </View>
);

export const Row = ({ children, style }) => <View style={[st.row, style]}>{children}</View>;

// photo-less hero block (keeps the app independent of image hosting)
export function Hero({ title, subtitle, chip, height = 150, style }) {
  return (
    <View style={[{ height, borderRadius: 20, backgroundColor: '#3B2418', padding: 16, justifyContent: 'flex-end', overflow: 'hidden' }, style]}>
      <Ionicons name="restaurant" size={110} color="rgba(255,255,255,0.08)" style={{ position: 'absolute', right: -10, top: -6 }} />
      {chip ? <View style={{ position: 'absolute', top: 14, left: 14 }}><Chip label={chip} tone="accent" /></View> : null}
      <Text style={{ color: '#fff', fontSize: 26, fontWeight: '800' }}>{title}</Text>
      {subtitle ? <Text style={{ color: '#E8D9C8', marginTop: 2 }}>{subtitle}</Text> : null}
    </View>
  );
}

// big status banner (UI-04: bold call-out instead of subtle instructions)
export function Callout({ icon = 'alert-circle', tone = 'amber', title, text }) {
  const [bg, fg] = tones[tone];
  return (
    <View style={{ backgroundColor: bg, borderRadius: 14, padding: 14, flexDirection: 'row', gap: 10, borderWidth: 1.5, borderColor: fg }}>
      <Ionicons name={icon} size={24} color={fg} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: fg, fontWeight: '800', fontSize: 15 }}>{title}</Text>
        {text ? <Text style={{ color: colors.ink, marginTop: 2 }}>{text}</Text> : null}
      </View>
    </View>
  );
}

export const Empty = ({ icon = 'albums-outline', text }) => (
  <View style={{ alignItems: 'center', padding: 24, gap: 8 }}>
    <Ionicons name={icon} size={34} color={colors.sub} />
    <Text style={[st.muted, { textAlign: 'center' }]}>{text}</Text>
  </View>
);

export const st = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6, gap: 8 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  title: { fontSize: 22, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 12, color: colors.sub, marginTop: 2 },
  body: { padding: 16, paddingBottom: 40, gap: 12 },
  btn: { minHeight: 52, borderRadius: 14, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnTxt: { fontSize: 16, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 1, borderColor: colors.line, gap: 8 },
  chip: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  chipTxt: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  label: { fontSize: 11, fontWeight: '700', color: colors.sub, textTransform: 'uppercase', letterSpacing: 0.6 },
  h: { fontSize: 17, fontWeight: '800', color: colors.ink },
  muted: { fontSize: 13, color: colors.sub },
  stat: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 12, borderWidth: 1, borderColor: colors.line, gap: 2 },
  statVal: { fontSize: 24, fontWeight: '800', color: colors.ink },
  choice: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: colors.line, backgroundColor: '#fff', minWidth: 54, alignItems: 'center' },
  choiceTxt: { fontSize: 15, fontWeight: '700', color: colors.ink },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, minHeight: 50, fontSize: 16, color: colors.ink },
  progBg: { height: 8, borderRadius: 4, backgroundColor: '#EADFD0', overflow: 'hidden' },
  progFill: { height: 8, borderRadius: 4, backgroundColor: colors.accent },
});
