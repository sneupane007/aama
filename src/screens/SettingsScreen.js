import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../utils/i18n';
import { getUnsyncedCount, getVolunteerStats } from '../db';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function SettingsScreen({ onLogout, volunteer, navigation }) {
  const { t, lang, setLanguage } = useTranslation();
  const [pendingCount, setPendingCount] = useState(0);
  const [stats, setStats] = useState({ totalVisits: 0, activeAlerts: 0, criticalAlerts: 0 });
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showFuture, setShowFuture] = useState(false);
  const [fchvName, setFchvName] = useState('');
  const [fchvDistrict, setFchvDistrict] = useState('');

  useFocusEffect(
    useCallback(() => {
      try {
        setPendingCount(getUnsyncedCount());
        setStats(getVolunteerStats());
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

      {/* ── Quick Links ── */}
      <View style={[commonStyles.row, { gap: 10, marginBottom: 20 }]}>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation && navigation.navigate('Patients')}
          activeOpacity={0.7}
        >
          <Ionicons name="people" size={22} color={COLORS.accent} />
          <Text style={styles.quickLinkText}>{lang === 'ne' ? 'बिरामीहरू' : 'Patients'}</Text>
          {stats.activeAlerts > 0 && (
            <View style={styles.quickLinkBadge}>
              <Text style={styles.quickLinkBadgeText}>{stats.activeAlerts}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation && navigation.navigate('Consult')}
          activeOpacity={0.7}
        >
          <Ionicons name="chatbubbles" size={22} color={COLORS.primary} />
          <Text style={styles.quickLinkText}>{lang === 'ne' ? 'सल्लाह' : 'Consult'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickLink}
          onPress={() => navigation && navigation.navigate('Guide')}
          activeOpacity={0.7}
        >
          <Ionicons name="help-circle" size={22} color="#3b82f6" />
          <Text style={styles.quickLinkText}>{lang === 'ne' ? 'गाइड' : 'Guide'}</Text>
        </TouchableOpacity>
      </View>

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

      {/* ── Privacy & Compliance ── */}
      <Text style={commonStyles.sectionTitle}>
        {lang === 'ne' ? 'गोपनीयता र अनुपालन' : 'Privacy & Compliance'}
      </Text>
      <View style={commonStyles.card}>
        {[
          { icon: 'lock-closed', color: '#3b82f6', bg: '#dbeafe',
            label: lang === 'ne' ? 'स्थानीय SQLite भण्डारण — इन्टरनेट बिना पनि सुरक्षित' : 'Local SQLite storage — secure without internet',
          },
          { icon: 'shield-checkmark', color: COLORS.riskLow, bg: '#dcfce7',
            label: lang === 'ne' ? 'WHO मानसिक स्वास्थ्य कार्य योजना २०१३–२०३० अनुरूप' : 'Aligned with WHO Mental Health Action Plan 2013–2030',
          },
          { icon: 'document-text', color: COLORS.primary, bg: '#ccfbf1',
            label: lang === 'ne' ? 'EPDS र PHQ-A: अन्तर्राष्ट्रिय रूपमा प्रमाणित स्क्रीनिंग उपकरण' : 'EPDS & PHQ-A: internationally validated screening instruments',
          },
          { icon: 'eye-off', color: '#a855f7', bg: '#f3e8ff',
            label: lang === 'ne' ? 'बिरामीको डाटा स्पष्ट सहमति बिना कसैसँग साझा गरिँदैन' : 'Patient data never shared without explicit informed consent',
          },
          { icon: 'people', color: COLORS.accent, bg: '#fef3c7',
            label: lang === 'ne' ? 'नेपाल स्वास्थ्य नीति र FCHV कार्यक्रम दिशानिर्देश अनुसार' : 'Follows Nepal Health Policy & FCHV Programme guidelines',
          },
          { icon: 'phone-portrait', color: '#6366f1', bg: '#e0e7ff',
            label: lang === 'ne' ? 'डाटा उपकरणमै रहन्छ — सिंकमा मात्र केन्द्रीय प्रणालीमा जान्छ' : 'All data stays on-device; uploaded to central system only on explicit sync',
          },
        ].map((item, i, arr) => (
          <View key={i} style={[styles.privacyRow, i < arr.length - 1 && styles.privacyRowBorder]}>
            <View style={[styles.privacyIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={16} color={item.color} />
            </View>
            <Text style={styles.privacyLabel}>{item.label}</Text>
          </View>
        ))}
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
            ? 'AAMA सखी नेपालका ५०,०००+ FCHV स्वयंसेवकहरूको लागि एक अफलाइन-फर्स्ट मानसिक स्वास्थ्य स्क्रिनिङ उपकरण हो।'
            : "AAMA Sakhi is an offline-first mental health screening tool for Nepal's 50,000+ FCHVs."}
        </Text>

        {/* Future features */}
        <TouchableOpacity
          style={styles.futureToggle}
          onPress={() => setShowFuture((v) => !v)}
          activeOpacity={0.7}
        >
          <Ionicons name="rocket-outline" size={16} color={COLORS.primary} />
          <Text style={styles.futureToggleText}>
            {lang === 'ne' ? 'भविष्यमा थपिने सुविधाहरू' : 'Planned Future Features'}
          </Text>
          <Ionicons name={showFuture ? 'chevron-up' : 'chevron-down'} size={14} color={COLORS.textMuted} />
        </TouchableOpacity>

        {showFuture && (
          <View style={styles.futureList}>
            {[
              { icon: 'videocam-outline',      text: lang === 'ne' ? 'मनोचिकित्सकसँग भिडियो परामर्श' : 'Video teleconsultation with psychiatrists' },
              { icon: 'notifications-outline', text: lang === 'ne' ? 'फलो-अप रिमाइन्डर (पुश नोटिफिकेशन)' : 'Automated follow-up reminders (push notifications)' },
              { icon: 'analytics-outline',     text: lang === 'ne' ? 'स्वास्थ्य चौकी सुपरभाइजरको लागि एनालिटिक्स ड्यासबोर्ड' : 'Analytics dashboard for health post supervisors' },
              { icon: 'language-outline',      text: lang === 'ne' ? 'थप भाषाहरू: मैथिली, भोजपुरी, तामाङ' : 'More languages: Maithili, Bhojpuri, Tamang' },
              { icon: 'id-card-outline',       text: lang === 'ne' ? 'नेपालको राष्ट्रिय स्वास्थ्य ID सँग एकीकरण' : "Integration with Nepal's National Health ID system" },
              { icon: 'sync-outline',          text: lang === 'ne' ? 'DHIS2 र स्वास्थ्य प्रणालीसँग रियल-टाइम सिंक' : 'Real-time sync with DHIS2 and district health systems' },
              { icon: 'chatbubble-ellipses-outline', text: lang === 'ne' ? 'FCHVहरूको लागि पीयर सपोर्ट ग्रुप च्याट' : 'Peer support group chat for FCHV network' },
              { icon: 'map-outline',           text: lang === 'ne' ? 'जिल्ला-स्तरीय जोखिम नक्सा (हिटम्याप)' : 'District-level risk heatmap for cluster targeting' },
            ].map((f, i) => (
              <View key={i} style={styles.futureItem}>
                <Ionicons name={f.icon} size={15} color={COLORS.primary} />
                <Text style={styles.futureItemText}>{f.text}</Text>
              </View>
            ))}
          </View>
        )}
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
  quickLink: {
    flex: 1, alignItems: 'center', gap: 6,
    backgroundColor: COLORS.surface, borderRadius: SIZES.borderRadiusSm,
    paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: COLORS.border,
    position: 'relative',
  },
  quickLinkText: { fontSize: SIZES.xs, fontWeight: '600', color: COLORS.text },
  quickLinkBadge: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: COLORS.riskHigh, borderRadius: 10,
    minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 4,
  },
  quickLinkBadgeText: { fontSize: 10, fontWeight: '800', color: COLORS.white },
  privacyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 10 },
  privacyRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  privacyIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  privacyLabel: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  futureToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  futureToggleText: { flex: 1, fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  futureList: { marginTop: 12, gap: 10 },
  futureItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  futureItemText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
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
