import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES, commonStyles } from '../theme';

const SPECIALISTS = [
  {
    id: 'spec-1',
    name: 'Dr. Sushila Thapa',
    nameNe: 'डा. सुशीला थापा',
    title: 'Psychiatric Nurse Specialist',
    titleNe: 'मनोचिकित्सा नर्स विशेषज्ञ',
    specialization: 'Postpartum Depression · Women\'s Mental Health',
    specializationNe: 'प्रसवोत्तर अवसाद · महिला मानसिक स्वास्थ्य',
    district: 'Kaski',
    districtNe: 'कास्की',
    phone: '9856021345',
    available: true,
    hours: 'Mon–Sat, 9am–5pm',
    hoursNe: 'सोम–शनि, बिहान ९–साँझ ५',
  },
  {
    id: 'spec-2',
    name: 'Dr. Prakash Adhikari',
    nameNe: 'डा. प्रकाश अधिकारी',
    title: 'Clinical Psychologist',
    titleNe: 'क्लिनिकल मनोवैज्ञानिक',
    specialization: 'Crisis Intervention · Suicide Prevention',
    specializationNe: 'संकट हस्तक्षेप · आत्महत्या रोकथाम',
    district: 'Gandaki Province',
    districtNe: 'गण्डकी प्रदेश',
    phone: '9841034567',
    available: true,
    hours: 'Mon–Fri, 8am–6pm',
    hoursNe: 'सोम–शुक्र, बिहान ८–साँझ ६',
  },
  {
    id: 'spec-3',
    name: 'Dr. Mina Gurung',
    nameNe: 'डा. मिना गुरुङ',
    title: 'Child & Adolescent Psychiatrist',
    titleNe: 'बाल तथा किशोर मनोचिकित्सक',
    specialization: 'Adolescent Depression · Youth Mental Health',
    specializationNe: 'किशोर अवसाद · युवा मानसिक स्वास्थ्य',
    district: 'Pokhara Metro',
    districtNe: 'पोखरा महानगर',
    phone: '9857012890',
    available: false,
    hours: 'Tue–Sat, 10am–4pm',
    hoursNe: 'मंगल–शनि, बिहान १०–अपराह्न ४',
  },
  {
    id: 'spec-4',
    name: 'Dr. Ramesh Poudel',
    nameNe: 'डा. रमेश पौडेल',
    title: 'Psychiatric Nurse',
    titleNe: 'मनोचिकित्सा नर्स',
    specialization: 'General Mental Health · PTSD · Stress',
    specializationNe: 'सामान्य मानसिक स्वास्थ्य · PTSD · तनाव',
    district: 'Syangja',
    districtNe: 'स्याङ्जा',
    phone: '9852045678',
    available: true,
    hours: 'Mon–Fri, 9am–5pm',
    hoursNe: 'सोम–शुक्र, बिहान ९–साँझ ५',
  },
  {
    id: 'spec-5',
    name: 'Dr. Anita K.C.',
    nameNe: 'डा. अनिता के.सी.',
    title: 'Mental Health Counselor',
    titleNe: 'मानसिक स्वास्थ्य परामर्शदाता',
    specialization: 'Family Counseling · Volunteer Burnout · Domestic Stress',
    specializationNe: 'पारिवारिक परामर्श · स्वयंसेवक बर्नआउट · घरेलु तनाव',
    district: 'Tanahu',
    districtNe: 'तनहुँ',
    phone: '9869012345',
    available: true,
    hours: 'Wed–Sun, 8am–4pm',
    hoursNe: 'बुध–आइत, बिहान ८–अपराह्न ४',
  },
];

function PreviewCard({ rows, lang, t }) {
  return (
    <View style={styles.previewCard}>
      <View style={styles.previewHeader}>
        <Ionicons name="document-text-outline" size={15} color={COLORS.primary} />
        <Text style={styles.previewHeaderText}>{t('consultPreviewLabel')}</Text>
      </View>
      <View style={styles.previewBody}>
        {rows.map(([label, value]) => (
          <View key={label} style={styles.previewRow}>
            <Text style={styles.previewLabel}>{label}</Text>
            <Text style={styles.previewValue} numberOfLines={4}>{value || '—'}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function ConsultScreen({ volunteer }) {
  const { t, lang } = useTranslation();
  const [tab, setTab] = useState('patient');
  const [patientNote, setPatientNote] = useState('');
  const [selfNote, setSelfNote] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const availableCount = SPECIALISTS.filter((s) => s.available).length;
  const volunteerName = volunteer ? (lang === 'ne' ? volunteer.nameNe : volunteer.name) : '';
  const district = volunteer?.district || '';

  const now = new Date();
  const timeStr = now.toLocaleTimeString(lang === 'ne' ? 'ne-NP' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  function handleSendRequest() {
    if (!selfNote.trim()) {
      Alert.alert('', lang === 'ne' ? 'कृपया आफ्नो चिन्ता वर्णन गर्नुहोस्' : 'Please describe your concern first.');
      return;
    }
    setRequestSent(true);
  }

  if (requestSent) {
    return (
      <ScrollView style={commonStyles.screen} contentContainerStyle={styles.content}>
        <View style={styles.sentContainer}>
          <View style={styles.sentIconCircle}>
            <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
          </View>
          <Text style={styles.sentTitle}>{t('requestSent')}</Text>
          <Text style={styles.sentDesc}>{t('requestSentDesc')}</Text>
          <PreviewCard
            lang={lang}
            t={t}
            rows={[
              [lang === 'ne' ? 'स्वयंसेवक' : 'Volunteer', anonymous ? (lang === 'ne' ? '[गोप्य]' : '[Anonymous]') : volunteerName],
              [lang === 'ne' ? 'जिल्ला' : 'District', district],
              [lang === 'ne' ? 'मिति/समय' : 'Date/Time', `${now.toLocaleDateString()} ${timeStr}`],
              [lang === 'ne' ? 'सन्देश' : 'Message', selfNote],
            ]}
          />
          <TouchableOpacity
            style={[commonStyles.btnPrimary, { marginTop: 24 }]}
            onPress={() => { setRequestSent(false); setSelfNote(''); setShowPreview(false); }}
          >
            <Ionicons name="refresh" size={18} color={COLORS.white} />
            <Text style={commonStyles.btnPrimaryText}>{lang === 'ne' ? 'नयाँ अनुरोध' : 'New Request'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>{t('consultTitle')}</Text>

      {/* Tab toggle */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'patient' && styles.tabBtnActive]}
          onPress={() => setTab('patient')}
        >
          <Ionicons name="people-outline" size={15} color={tab === 'patient' ? COLORS.white : COLORS.primary} />
          <Text style={[styles.tabBtnText, tab === 'patient' && styles.tabBtnTextActive]}>{t('forPatient')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'myself' && styles.tabBtnActive]}
          onPress={() => setTab('myself')}
        >
          <Ionicons name="heart-outline" size={15} color={tab === 'myself' ? COLORS.white : COLORS.primary} />
          <Text style={[styles.tabBtnText, tab === 'myself' && styles.tabBtnTextActive]}>{t('forMyself')}</Text>
        </TouchableOpacity>
      </View>

      {tab === 'patient' ? (
        <>
          <Text style={commonStyles.subtitle}>{t('consultSubtitle')}</Text>
          <View style={styles.availSummary}>
            <View style={styles.availDot} />
            <Text style={styles.availText}>
              {availableCount} {lang === 'ne' ? 'विशेषज्ञ अहिले उपलब्ध' : 'specialists available now'}
            </Text>
          </View>

          {/* Note about patient */}
          <View style={commonStyles.card}>
            <Text style={commonStyles.label}>{t('consultNoteLabel')}</Text>
            <TextInput
              style={styles.noteInput}
              value={patientNote}
              onChangeText={setPatientNote}
              placeholder={t('consultNotePlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Text style={commonStyles.sectionTitle}>
            {lang === 'ne' ? 'उपलब्ध विशेषज्ञहरू' : 'Specialists'}
          </Text>

          {SPECIALISTS.map((spec) => {
            const isSelected = selectedId === spec.id;
            return (
              <TouchableOpacity
                key={spec.id}
                style={[styles.specCard, !spec.available && styles.specCardUnavailable, isSelected && styles.specCardSelected]}
                onPress={() => setSelectedId(isSelected ? null : spec.id)}
                activeOpacity={0.8}
              >
                <View style={styles.specHeader}>
                  <View style={styles.specAvatar}>
                    <Text style={styles.specAvatarText}>
                      {(lang === 'ne' ? spec.nameNe : spec.name).split(' ').find(w => !w.startsWith('Dr'))?.[0] || '?'}
                    </Text>
                  </View>
                  <View style={styles.specInfo}>
                    <View style={[commonStyles.row, { gap: 8 }]}>
                      <Text style={styles.specName}>{lang === 'ne' ? spec.nameNe : spec.name}</Text>
                      <View style={[styles.availBadge, spec.available ? styles.availBadgeOn : styles.availBadgeOff]}>
                        <View style={[styles.availDotSmall, { backgroundColor: spec.available ? COLORS.riskLow : COLORS.textMuted }]} />
                        <Text style={[styles.availBadgeText, { color: spec.available ? COLORS.riskLow : COLORS.textMuted }]}>
                          {spec.available ? t('available') : t('unavailable')}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.specTitle}>{lang === 'ne' ? spec.titleNe : spec.title}</Text>
                    <View style={[commonStyles.row, { gap: 4, marginTop: 2 }]}>
                      <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
                      <Text style={styles.specDistrict}>{lang === 'ne' ? spec.districtNe : spec.district}</Text>
                    </View>
                  </View>
                  <Ionicons name={isSelected ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textMuted} />
                </View>

                {isSelected && (
                  <View style={styles.specDetail}>
                    <View style={styles.specDetailRow}>
                      <Ionicons name="medical-outline" size={14} color={COLORS.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.specDetailLabel}>{t('specializationLabel')}</Text>
                        <Text style={styles.specDetailValue}>{lang === 'ne' ? spec.specializationNe : spec.specialization}</Text>
                      </View>
                    </View>
                    <View style={styles.specDetailRow}>
                      <Ionicons name="time-outline" size={14} color={COLORS.primary} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.specDetailLabel}>{t('hoursLabel')}</Text>
                        <Text style={styles.specDetailValue}>{lang === 'ne' ? spec.hoursNe : spec.hours}</Text>
                      </View>
                    </View>

                    {/* Preview what will be sent */}
                    {patientNote.trim().length > 0 && (
                      <PreviewCard
                        lang={lang}
                        t={t}
                        rows={[
                          [lang === 'ne' ? 'स्वयंसेवक' : 'Volunteer', volunteerName],
                          [lang === 'ne' ? 'जिल्ला' : 'District', district],
                          [lang === 'ne' ? 'सन्देश' : 'Message', patientNote],
                        ]}
                      />
                    )}

                    {spec.available && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => Linking.openURL(`tel:${spec.phone}`)}
                        >
                          <Ionicons name="call" size={16} color={COLORS.white} />
                          <Text style={styles.actionBtnText}>{t('callSpecialist')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnWa]}
                          onPress={() => Linking.openURL(`https://wa.me/977${spec.phone.replace(/^0/, '')}${patientNote ? `?text=${encodeURIComponent(patientNote)}` : ''}`)}
                        >
                          <Ionicons name="logo-whatsapp" size={16} color={COLORS.white} />
                          <Text style={styles.actionBtnText}>{t('whatsappLabel')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.actionBtnSms]}
                          onPress={() => Linking.openURL(`sms:${spec.phone}${patientNote ? `?body=${encodeURIComponent(patientNote)}` : ''}`)}
                        >
                          <Ionicons name="chatbubble" size={16} color={COLORS.primary} />
                          <Text style={[styles.actionBtnText, { color: COLORS.primary }]}>{t('smsLabel')}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Crisis line */}
          <View style={styles.crisisCard}>
            <Ionicons name="alert-circle" size={20} color={COLORS.riskCritical} />
            <View style={{ flex: 1 }}>
              <Text style={styles.crisisTitle}>{lang === 'ne' ? 'आपतकालीन: क्राइसिस हटलाइन' : 'Emergency: Crisis Hotline'}</Text>
              <Text style={styles.crisisDesc}>{lang === 'ne' ? 'तत्काल सहायताका लागि' : 'For immediate assistance'}</Text>
            </View>
            <TouchableOpacity style={styles.crisisBtn} onPress={() => Linking.openURL('tel:1166')}>
              <Ionicons name="call" size={16} color={COLORS.white} />
              <Text style={styles.crisisBtnText}>1166</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          {/* Volunteer Wellbeing tab */}
          <View style={styles.selfBanner}>
            <Ionicons name="heart" size={20} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.selfBannerTitle}>{t('selfConsultTitle')}</Text>
              <Text style={styles.selfBannerSub}>{t('selfConsultSub')}</Text>
            </View>
          </View>

          <View style={commonStyles.card}>
            <Text style={commonStyles.label}>{t('yourConcern')}</Text>
            <TextInput
              style={[styles.noteInput, { height: 110 }]}
              value={selfNote}
              onChangeText={setSelfNote}
              placeholder={t('yourConcernPlaceholder')}
              placeholderTextColor={COLORS.textMuted}
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[commonStyles.row, { gap: 10, marginTop: 14 }]}
              onPress={() => setAnonymous(!anonymous)}
            >
              <View style={[styles.checkbox, anonymous && styles.checkboxChecked]}>
                {anonymous && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
              </View>
              <Text style={styles.checkboxLabel}>{t('sendAnon')}</Text>
            </TouchableOpacity>
          </View>

          {/* Preview toggle */}
          <TouchableOpacity
            style={styles.previewToggle}
            onPress={() => setShowPreview(!showPreview)}
          >
            <Ionicons name="eye-outline" size={15} color={COLORS.primary} />
            <Text style={styles.previewToggleText}>
              {showPreview
                ? (lang === 'ne' ? 'प्रिव्यू लुकाउनुहोस्' : 'Hide preview')
                : (lang === 'ne' ? 'के पठाइनेछ हेर्नुहोस्' : 'Preview what will be sent')}
            </Text>
            <Ionicons name={showPreview ? 'chevron-up' : 'chevron-down'} size={15} color={COLORS.primary} />
          </TouchableOpacity>

          {showPreview && (
            <PreviewCard
              lang={lang}
              t={t}
              rows={[
                [lang === 'ne' ? 'स्वयंसेवक' : 'Volunteer', anonymous ? (lang === 'ne' ? '[गोप्य]' : '[Anonymous]') : volunteerName],
                [lang === 'ne' ? 'जिल्ला' : 'District', district],
                [lang === 'ne' ? 'मिति/समय' : 'Date/Time', `${now.toLocaleDateString()} ${timeStr}`],
                [lang === 'ne' ? 'सन्देश' : 'Message', selfNote || (lang === 'ne' ? '(खाली)' : '(empty)')],
              ]}
            />
          )}

          <Text style={commonStyles.sectionTitle}>{lang === 'ne' ? 'विशेषज्ञ छान्नुहोस्' : 'Choose a Specialist'}</Text>

          {SPECIALISTS.filter(s => s.available).map((spec) => (
            <TouchableOpacity
              key={spec.id}
              style={[styles.specCard, selectedId === spec.id && styles.specCardSelected]}
              onPress={() => setSelectedId(selectedId === spec.id ? null : spec.id)}
              activeOpacity={0.8}
            >
              <View style={styles.specHeader}>
                <View style={styles.specAvatar}>
                  <Text style={styles.specAvatarText}>
                    {(lang === 'ne' ? spec.nameNe : spec.name).split(' ').find(w => !w.startsWith('Dr'))?.[0] || '?'}
                  </Text>
                </View>
                <View style={styles.specInfo}>
                  <Text style={styles.specName}>{lang === 'ne' ? spec.nameNe : spec.name}</Text>
                  <Text style={styles.specTitle}>{lang === 'ne' ? spec.titleNe : spec.title}</Text>
                  <Text style={[styles.specDistrict, { marginTop: 2 }]}>
                    {lang === 'ne' ? spec.specializationNe : spec.specialization}
                  </Text>
                </View>
                <View style={[styles.availBadge, styles.availBadgeOn]}>
                  <View style={[styles.availDotSmall, { backgroundColor: COLORS.riskLow }]} />
                  <Text style={[styles.availBadgeText, { color: COLORS.riskLow }]}>{t('available')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={[commonStyles.btnPrimary, { marginTop: 8 }]} onPress={handleSendRequest}>
            <Ionicons name="send" size={18} color={COLORS.white} />
            <Text style={commonStyles.btnPrimaryText}>{t('sendRequest')}</Text>
          </TouchableOpacity>

          <View style={styles.crisisCard}>
            <Ionicons name="alert-circle" size={20} color={COLORS.riskCritical} />
            <View style={{ flex: 1 }}>
              <Text style={styles.crisisTitle}>{lang === 'ne' ? 'तत्काल सहायता' : 'Immediate Help'}</Text>
              <Text style={styles.crisisDesc}>{lang === 'ne' ? 'क्राइसिस हटलाइन: २४/७ उपलब्ध' : 'Crisis Hotline: Available 24/7'}</Text>
            </View>
            <TouchableOpacity style={styles.crisisBtn} onPress={() => Linking.openURL('tel:1166')}>
              <Ionicons name="call" size={16} color={COLORS.white} />
              <Text style={styles.crisisBtnText}>1166</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: SIZES.borderRadiusSm,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: SIZES.borderRadiusSm - 2,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  tabBtnTextActive: { color: COLORS.white },
  availSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  availDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.riskLow },
  availText: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.riskLow },
  noteInput: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    fontSize: SIZES.sm,
    color: COLORS.text,
    height: 80,
    marginTop: 8,
  },
  selfBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#f0fdfa',
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 16,
  },
  selfBannerTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.primary, marginBottom: 2 },
  selfBannerSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 20 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    borderWidth: 2, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: { backgroundColor: COLORS.primary },
  checkboxLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '500' },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#f0fdfa',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: '#99f6e4',
    marginBottom: 12,
  },
  previewToggleText: { flex: 1, fontSize: SIZES.sm, fontWeight: '600', color: COLORS.primary },
  previewCard: {
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f0fdfa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewHeaderText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  previewBody: { backgroundColor: COLORS.surface, padding: 12, gap: 8 },
  previewRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  previewLabel: {
    fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted,
    width: 70, textTransform: 'uppercase', letterSpacing: 0.3,
  },
  previewValue: { flex: 1, fontSize: SIZES.sm, color: COLORS.text, lineHeight: 18 },
  sentContainer: { alignItems: 'center', paddingTop: 24, paddingBottom: 40 },
  sentIconCircle: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  sentTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  sentDesc: {
    fontSize: SIZES.base, color: COLORS.textSecondary,
    textAlign: 'center', lineHeight: 24, marginBottom: 24, paddingHorizontal: 16,
  },
  specCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  specCardUnavailable: { opacity: 0.75 },
  specCardSelected: { borderColor: COLORS.primary, borderWidth: 1.5 },
  specHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  specAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center',
  },
  specAvatarText: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary },
  specInfo: { flex: 1 },
  specName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  specTitle: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  specDistrict: { fontSize: 11, color: COLORS.textMuted },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10,
  },
  availBadgeOn: { backgroundColor: '#dcfce7' },
  availBadgeOff: { backgroundColor: COLORS.surfaceSecondary },
  availDotSmall: { width: 5, height: 5, borderRadius: 3 },
  availBadgeText: { fontSize: 10, fontWeight: '700' },
  specDetail: {
    borderTopWidth: 1, borderTopColor: COLORS.border,
    padding: 14, gap: 10, backgroundColor: '#fafafa',
  },
  specDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  specDetailLabel: {
    fontSize: 10, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  specDetailValue: { fontSize: SIZES.sm, color: COLORS.text, marginTop: 1, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 5,
    backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 9,
  },
  actionBtnWa: { backgroundColor: '#25d366' },
  actionBtnSms: { backgroundColor: '#ccfbf1', borderWidth: 1, borderColor: COLORS.primary },
  actionBtnText: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.white },
  crisisCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff1f2', borderWidth: 1.5, borderColor: '#fecdd3',
    borderRadius: SIZES.borderRadiusSm, padding: 14, marginTop: 8,
  },
  crisisTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.riskCritical },
  crisisDesc: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 1 },
  crisisBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: COLORS.riskCritical, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
  },
  crisisBtnText: { fontSize: SIZES.sm, fontWeight: '800', color: COLORS.white },
});
