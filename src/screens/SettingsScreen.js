import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from '../utils/i18n';
import { getUnsyncedCount } from '../db';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function SettingsScreen() {
  const { t, lang, setLanguage } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);
  const [fchvName, setFchvName] = useState('');
  const [fchvDistrict, setFchvDistrict] = useState('');
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    getUnsyncedCount().then(setPendingCount).catch(() => {});
    AsyncStorage.getItem('fchv-name').then((v) => v && setFchvName(v));
    AsyncStorage.getItem('fchv-district').then((v) => v && setFchvDistrict(v));
  }, []);

  async function saveProfile() {
    await AsyncStorage.setItem('fchv-name', fchvName);
    await AsyncStorage.setItem('fchv-district', fchvDistrict);
    setShowProfile(false);
    Alert.alert('', t('profileSaved'));
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{t('settingsTitle')}</Text>
      <Text style={commonStyles.subtitle}>{t('appTagline')}</Text>

      {/* Profile */}
      <Text style={commonStyles.sectionTitle}>{t('fchvProfile')}</Text>
      <View style={commonStyles.card}>
        {!showProfile ? (
          <TouchableOpacity
            style={[commonStyles.row, { justifyContent: 'space-between' }]}
            onPress={() => setShowProfile(true)}
          >
            <View style={[commonStyles.row, { gap: 12 }]}>
              <View style={styles.profileIcon}>
                <Ionicons name="person" size={22} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.profileName}>
                  {fchvName || (lang === 'ne' ? 'नाम सेट गर्नुहोस्' : 'Set your name')}
                </Text>
                <Text style={styles.profileDistrict}>
                  {fchvDistrict || (lang === 'ne' ? 'जिल्ला' : 'District')}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={commonStyles.label}>{t('fchvName')}</Text>
            <TextInput
              style={commonStyles.input}
              value={fchvName}
              onChangeText={setFchvName}
              placeholder={lang === 'ne' ? 'तपाईंको नाम' : 'Your name'}
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={{ height: 12 }} />
            <Text style={commonStyles.label}>{t('fchvDistrict')}</Text>
            <TextInput
              style={commonStyles.input}
              value={fchvDistrict}
              onChangeText={setFchvDistrict}
              placeholder={lang === 'ne' ? 'जिल्ला नाम' : 'District name'}
              placeholderTextColor={COLORS.textMuted}
            />
            <View style={[commonStyles.row, { gap: 10, marginTop: 16 }]}>
              <TouchableOpacity
                style={[commonStyles.btnSecondary, { flex: 1 }]}
                onPress={() => setShowProfile(false)}
              >
                <Text style={commonStyles.btnSecondaryText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[commonStyles.btnPrimary, { flex: 1 }]} onPress={saveProfile}>
                <Ionicons name="checkmark" size={18} color={COLORS.white} />
                <Text style={commonStyles.btnPrimaryText}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Language */}
      <Text style={commonStyles.sectionTitle}>{t('language')}</Text>
      <View style={commonStyles.card}>
        <View style={[commonStyles.row, { gap: 10 }]}>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
            onPress={() => setLanguage('en')}
          >
            <Text style={[styles.langBtnText, lang === 'en' && styles.langBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, lang === 'ne' && styles.langBtnActive]}
            onPress={() => setLanguage('ne')}
          >
            <Text style={[styles.langBtnText, lang === 'ne' && styles.langBtnTextActive]}>नेपाली</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sync */}
      <Text style={commonStyles.sectionTitle}>{t('syncSettings')}</Text>
      <View style={commonStyles.card}>
        <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
          <View style={[commonStyles.row, { gap: 12 }]}>
            <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="sync" size={18} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.settingLabel}>{t('pendingSync')}</Text>
              <Text style={styles.settingSublabel}>
                {pendingCount} {t('pendingRecords')}
              </Text>
            </View>
          </View>
          <View style={[styles.syncBadge, pendingCount > 0 ? styles.syncBadgePending : styles.syncBadgeSynced]}>
            <View
              style={[
                styles.syncDot,
                { backgroundColor: pendingCount > 0 ? COLORS.accent : COLORS.riskLow },
              ]}
            />
            <Text
              style={[
                styles.syncBadgeText,
                { color: pendingCount > 0 ? COLORS.accent : COLORS.riskLow },
              ]}
            >
              {pendingCount > 0 ? (lang === 'ne' ? 'बाँकी' : 'Pending') : (lang === 'ne' ? 'सिंक' : 'Synced')}
            </Text>
          </View>
        </View>

        <View style={[commonStyles.row, { justifyContent: 'space-between' }]}>
          <View style={[commonStyles.row, { gap: 12 }]}>
            <View style={[styles.settingIcon, { backgroundColor: '#dbeafe' }]}>
              <Ionicons name="server" size={18} color="#3b82f6" />
            </View>
            <View>
              <Text style={styles.settingLabel}>{t('localData')}</Text>
              <Text style={styles.settingSublabel}>{t('encryptedDB')}</Text>
            </View>
          </View>
          <Ionicons name="shield-checkmark" size={18} color={COLORS.riskLow} />
        </View>
      </View>

      {/* About */}
      <Text style={commonStyles.sectionTitle}>{t('about')}</Text>
      <View style={commonStyles.card}>
        <View style={[commonStyles.row, { gap: 12, marginBottom: 12 }]}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>आ</Text>
          </View>
          <View>
            <Text style={{ fontWeight: '800', fontSize: SIZES.lg, color: COLORS.text }}>AAMA सखी</Text>
            <Text style={{ fontSize: SIZES.xs, color: COLORS.textSecondary }}>
              {t('version')} 1.0.0
            </Text>
          </View>
        </View>
        <Text style={styles.aboutText}>
          {lang === 'ne'
            ? 'AAMA सखी नेपालका स्वयंसेवकहरूको लागि एक अफलाइन-फर्स्ट मानसिक स्वास्थ्य स्क्रिनिङ उपकरण हो। यो उपकरणले शारीरिक स्वास्थ्य जाँचमा मान्य मनोवैज्ञानिक ट्रिएज प्रश्नहरू एकीकृत गर्दछ।'
            : "AAMA Sakhi is an offline-first mental health screening tool for Nepal's community health volunteers. It integrates validated psychological triage into routine physical health visits to detect suicide risk and route alerts to psychiatric nurses."}
        </Text>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  profileDistrict: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  langBtn: {
    flex: 1,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSecondary,
  },
  langBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#ccfbf1',
  },
  langBtnText: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  langBtnTextActive: {
    color: COLORS.primary,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingSublabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadiusFull,
    gap: 6,
  },
  syncBadgePending: {
    backgroundColor: '#fef3c7',
  },
  syncBadgeSynced: {
    backgroundColor: '#dcfce7',
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  syncBadgeText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.white,
  },
  aboutText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});
