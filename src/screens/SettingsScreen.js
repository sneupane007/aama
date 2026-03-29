import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../utils/i18n';
import { getUnsyncedCount, getActiveAlertsForProfile, getVolunteerStats } from '../db';
import RiskBadge from '../components/RiskBadge';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function SettingsScreen({ onLogout, volunteer, navigation }) {
  const { t, lang, setLanguage } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState({ totalVisits: 0, activeAlerts: 0, criticalAlerts: 0 });
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [fchvName, setFchvName] = useState('');
  const [fchvDistrict, setFchvDistrict] = useState('');

  useFocusEffect(
    useCallback(() => {
      try {
        setPendingCount(getUnsyncedCount());
        setStats(getVolunteerStats());
        setActiveAlerts(getActiveAlertsForProfile());
      } catch {}
      AsyncStorage.getItem('fchv-name').then((v) => v && setFchvName(v));
      AsyncStorage.getItem('fchv-district').then((v) => v && setFchvDistrict(v));
    }, []),
  );

  async function saveProfile() {
    await AsyncStorage.setItem('fchv-name', fchvName);
    await AsyncStorage.setItem('fchv-district', fchvDistrict);
    setShowEditProfile(false);
    Alert.alert('', t('profileSaved'));
  }

  const displayName = volunteer
    ? (lang === 'ne' ? volunteer.nameNe : volunteer.name)
    : (fchvName || '—');
  const displayDistrict = volunteer?.district || fchvDistrict || '—';
  const volunteerId = volunteer?.id || '—';

  const initials = displayName !== '—'
    ? displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scrollContent}>

      {/* ── Volunteer Profile Card ── */}
      <View style={styles.profileCard}>
        <View style={styles.profileTop}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{displayName}</Text>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
              <Text style={styles.verifiedText}>{t('verifiedBadge')}</Text>
            </View>
            <Text style={styles.profileIdText}>{volunteerId}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => setShowEditProfile(!showEditProfile)}
          >
            <Ionicons name={showEditProfile ? 'close' : 'pencil'} size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{displayDistrict}</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.metaText}>{t('memberSince')} 2024</Text>
          </View>
        </View>

        {showEditProfile && (
          <View>
            <View style={styles.editDivider} />
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
            <View style={[commonStyles.row, { gap: 10, marginTop: 14 }]}>
              <TouchableOpacity
                style={[commonStyles.btnSecondary, { flex: 1 }]}
                onPress={() => setShowEditProfile(false)}
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

      {/* ── Stats Row ── */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { borderLeftColor: COLORS.primary }]}>
          <Text style={styles.statNum}>{stats.totalVisits}</Text>
          <Text style={styles.statLbl}>{t('totalVisitsLabel')}</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.riskHigh }]}>
          <Text style={[styles.statNum, stats.activeAlerts > 0 && { color: COLORS.riskHigh }]}>
            {stats.activeAlerts}
          </Text>
          <Text style={styles.statLbl}>{t('activeAlertsLabel')}</Text>
        </View>
        <View style={[styles.statBox, { borderLeftColor: COLORS.riskCritical }]}>
          <Text style={[styles.statNum, stats.criticalAlerts > 0 && { color: COLORS.riskCritical }]}>
            {stats.criticalAlerts}
          </Text>
          <Text style={styles.statLbl}>{t('criticalLabel')}</Text>
        </View>
      </View>

      {/* ── Active Patient Alerts ── */}
      <View style={styles.alertsHeaderRow}>
        <Text style={commonStyles.sectionTitle}>{t('myAlerts')}</Text>
        {activeAlerts.length > 3 && (
          <TouchableOpacity onPress={() => navigation && navigation.navigate('Patients')}>
            <Text style={styles.viewAllText}>{t('viewAll')}</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={[commonStyles.subtitle, { marginTop: -8, marginBottom: 12 }]}>{t('patientAlertsSub')}</Text>

      {activeAlerts.length === 0 ? (
        <View style={styles.noAlerts}>
          <Ionicons name="checkmark-circle" size={36} color={COLORS.riskLow} />
          <Text style={styles.noAlertsText}>{t('noActiveAlerts')}</Text>
        </View>
      ) : (
        <View>
          {activeAlerts.slice(0, 5).map((item) => (
            <TouchableOpacity
              key={item.patientId}
              style={[
                styles.alertItem,
                item.riskLevel === 'critical' && styles.alertItemCritical,
              ]}
              onPress={() => navigation && navigation.navigate('PatientDetail', {
                patientId: item.patientId,
                patientName: item.patientName,
              })}
              activeOpacity={0.8}
            >
              <View style={[styles.alertAvatar, item.riskLevel === 'critical' && styles.alertAvatarCritical]}>
                <Text style={[styles.alertAvatarText, item.riskLevel === 'critical' && { color: COLORS.riskCritical }]}>
                  {item.patientName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.alertName}>{item.patientName}</Text>
                <Text style={styles.alertMeta}>
                  {item.patientType === 'postnatal' ? t('postnatalMother') : t('youth')}
                  {' · '}{t('age')} {item.age}
                  {item.selfHarmFlag ? '  ⚠️' : ''}
                </Text>
                <Text style={styles.alertDate}>{t('lastVisit')}: {item.lastVisitDate}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <RiskBadge riskLevel={item.riskLevel} lang={lang} size="small" />
                <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
          {activeAlerts.length > 5 && (
            <TouchableOpacity
              style={styles.viewMoreBtn}
              onPress={() => navigation && navigation.navigate('Patients')}
            >
              <Text style={styles.viewMoreText}>
                +{activeAlerts.length - 5} {lang === 'ne' ? 'थप बिरामीहरू' : 'more patients'}
              </Text>
              <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Language ── */}
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

      {/* ── Sync ── */}
      <Text style={commonStyles.sectionTitle}>{t('syncSettings')}</Text>
      <View style={commonStyles.card}>
        <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 16 }]}>
          <View style={[commonStyles.row, { gap: 12 }]}>
            <View style={[styles.settingIcon, { backgroundColor: '#fef3c7' }]}>
              <Ionicons name="sync" size={18} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.settingLabel}>{t('pendingSync')}</Text>
              <Text style={styles.settingSublabel}>{pendingCount} {t('pendingRecords')}</Text>
            </View>
          </View>
          <View style={[styles.syncBadge, pendingCount > 0 ? styles.syncBadgePending : styles.syncBadgeSynced]}>
            <View style={[styles.syncDot, { backgroundColor: pendingCount > 0 ? COLORS.accent : COLORS.riskLow }]} />
            <Text style={[styles.syncBadgeText, { color: pendingCount > 0 ? COLORS.accent : COLORS.riskLow }]}>
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

      {/* ── About ── */}
      <Text style={commonStyles.sectionTitle}>{t('about')}</Text>
      <View style={commonStyles.card}>
        <View style={[commonStyles.row, { gap: 12, marginBottom: 12 }]}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>आ</Text>
          </View>
          <View>
            <Text style={{ fontWeight: '800', fontSize: SIZES.lg, color: COLORS.text }}>AAMA सखी</Text>
            <Text style={{ fontSize: SIZES.xs, color: COLORS.textSecondary }}>{t('version')} 1.0.0</Text>
          </View>
        </View>
        <Text style={styles.aboutText}>
          {lang === 'ne'
            ? 'AAMA सखी नेपालका स्वयंसेवकहरूको लागि एक अफलाइन-फर्स्ट मानसिक स्वास्थ्य स्क्रिनिङ उपकरण हो।'
            : "AAMA Sakhi is an offline-first mental health screening tool for Nepal's 50,000+ FCHVs."}
        </Text>
      </View>

      {/* ── Sign Out ── */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => Alert.alert(
          lang === 'ne' ? 'साइन आउट' : 'Sign Out',
          t('logoutConfirm'),
          [
            { text: t('cancel'), style: 'cancel' },
            { text: t('logout'), style: 'destructive', onPress: onLogout },
          ],
        )}
      >
        <Ionicons name="log-out-outline" size={20} color={COLORS.riskHigh} />
        <Text style={styles.logoutBtnText}>{t('logout')}</Text>
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 16, paddingBottom: 32 },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: COLORS.primary,
  },
  avatarText: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary },
  profileName: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: 3 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  verifiedText: {
    fontSize: SIZES.xs, fontWeight: '700', color: COLORS.primary,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  profileIdText: { fontSize: SIZES.xs, color: COLORS.textMuted },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  profileMeta: {
    flexDirection: 'row', alignItems: 'center',
    marginTop: 14, paddingTop: 14,
    borderTopWidth: 1, borderTopColor: COLORS.border,
    gap: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  metaDivider: { width: 1, height: 16, backgroundColor: COLORS.border },
  editDivider: { height: 1, backgroundColor: COLORS.border, marginVertical: 16 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statBox: {
    flex: 1, backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm, padding: 12, borderLeftWidth: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  statNum: { fontSize: SIZES.xl, fontWeight: '900', color: COLORS.text },
  statLbl: { fontSize: 10, color: COLORS.textSecondary, marginTop: 1, fontWeight: '600' },
  alertsHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  viewAllText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  noAlerts: {
    alignItems: 'center', paddingVertical: 24, gap: 8,
    backgroundColor: COLORS.surface, borderRadius: SIZES.borderRadiusSm, marginBottom: 20,
  },
  noAlertsText: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  alertItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: SIZES.borderRadiusSm,
    padding: 14, marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: COLORS.border,
  },
  alertItemCritical: {
    borderColor: COLORS.riskCritical, borderWidth: 1.5, backgroundColor: '#fff5f5',
  },
  alertAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center',
  },
  alertAvatarCritical: { backgroundColor: '#fecdd3' },
  alertAvatarText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.riskHigh },
  alertName: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  alertMeta: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  alertDate: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 1 },
  viewMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 12, backgroundColor: '#f0fdfa',
    borderRadius: SIZES.borderRadiusSm, borderWidth: 1, borderColor: '#99f6e4', marginBottom: 16,
  },
  viewMoreText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  langBtn: {
    flex: 1, height: SIZES.buttonHeight, justifyContent: 'center', alignItems: 'center',
    borderRadius: SIZES.borderRadiusSm, borderWidth: 2, borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceSecondary,
  },
  langBtnActive: { borderColor: COLORS.primary, backgroundColor: '#ccfbf1' },
  langBtnText: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textSecondary },
  langBtnTextActive: { color: COLORS.primary },
  settingIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text },
  settingSublabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  syncBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: SIZES.borderRadiusFull, gap: 6,
  },
  syncBadgePending: { backgroundColor: '#fef3c7' },
  syncBadgeSynced: { backgroundColor: '#dcfce7' },
  syncDot: { width: 6, height: 6, borderRadius: 3 },
  syncBadgeText: { fontSize: SIZES.xs, fontWeight: '700' },
  logoIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center',
  },
  logoText: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.white },
  aboutText: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 22 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#fff1f2', borderWidth: 1.5, borderColor: '#fecdd3',
    borderRadius: SIZES.borderRadiusSm, padding: 16, marginBottom: 8,
  },
  logoutBtnText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.riskHigh },
});
