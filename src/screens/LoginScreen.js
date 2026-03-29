import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES } from '../theme';

const DEMO_VOLUNTEERS = [
  { id: 'FCHV-1001', pin: '1234', name: 'Kamala Devi Sharma', nameNe: 'कमला देवी शर्मा', district: 'Kaski', districtNe: 'कास्की' },
  { id: 'FCHV-1002', pin: '5678', name: 'Sunita Rai', nameNe: 'सुनिता राई', district: 'Pokhara Metro', districtNe: 'पोखरा महानगर' },
];

export default function LoginScreen({ onLogin }) {
  const { t, lang } = useTranslation();
  const [volunteerId, setVolunteerId] = useState('');
  const [pin, setPin] = useState('');
  const [pinVisible, setPinVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSignIn() {
    if (!volunteerId.trim() || !pin.trim()) return;
    setLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800)); // simulate network
    const match = DEMO_VOLUNTEERS.find(
      (v) => v.id === volunteerId.trim().toUpperCase() && v.pin === pin.trim(),
    );
    if (match) {
      const session = JSON.stringify({ id: match.id, name: match.name, nameNe: match.nameNe, district: match.district, districtNe: match.districtNe });
      await AsyncStorage.setItem('fchv-session', session);
      await AsyncStorage.setItem('fchv-name', lang === 'ne' ? match.nameNe : match.name);
      await AsyncStorage.setItem('fchv-district', lang === 'ne' ? match.districtNe : match.district);
      onLogin(match);
    } else {
      setError(t('invalidCredentials'));
    }
    setLoading(false);
  }

  function fillDemo() {
    setVolunteerId('FCHV-1001');
    setPin('1234');
    setError('');
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Branding */}
        <View style={styles.brandBlock}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>आ</Text>
          </View>
          <Text style={styles.appName}>{t('loginTitle')}</Text>
          <Text style={styles.tagline}>{t('appTagline')}</Text>
        </View>

        {/* Verified Badge */}
        <View style={styles.verifiedRow}>
          <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
          <Text style={styles.verifiedText}>{t('verifiedBadge')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>{t('volunteerId')}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="card-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={volunteerId}
              onChangeText={(v) => { setVolunteerId(v); setError(''); }}
              placeholder="FCHV-1001"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>{t('volunteerPin')}</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={pin}
              onChangeText={(v) => { setPin(v); setError(''); }}
              placeholder="••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!pinVisible}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity onPress={() => setPinVisible(!pinVisible)} style={styles.eyeBtn}>
              <Ionicons name={pinVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {error ? (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle" size={15} color={COLORS.riskHigh} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.signInBtn, (!volunteerId || !pin || loading) && { opacity: 0.6 }]}
            onPress={handleSignIn}
            disabled={!volunteerId || !pin || loading}
          >
            {loading ? (
              <Text style={styles.signInBtnText}>{t('signingIn')}</Text>
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={COLORS.white} />
                <Text style={styles.signInBtnText}>{t('signIn')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoHintRow} onPress={fillDemo}>
            <Ionicons name="flask-outline" size={14} color={COLORS.primary} />
            <Text style={styles.demoHintText}>{t('demoHint')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          {lang === 'ne'
            ? 'Nepal\'s 50,000+ FCHV नेटवर्कको लागि'
            : "Built for Nepal's 50,000+ FCHV network"}
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
    paddingBottom: 48,
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: COLORS.white,
  },
  appName: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#ccfbf1',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
  },
  verifiedText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  form: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 20,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    height: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  eyeBtn: {
    padding: 4,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  errorText: {
    fontSize: SIZES.xs,
    color: COLORS.riskHigh,
    flex: 1,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    height: 54,
    marginTop: 24,
  },
  signInBtnText: {
    fontSize: SIZES.base,
    fontWeight: '800',
    color: COLORS.white,
  },
  demoHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    padding: 8,
  },
  demoHintText: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
  },
});
