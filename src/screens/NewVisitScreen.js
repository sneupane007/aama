import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useTranslation } from '../utils/i18n';
import { epdsQuestions } from '../data/epds';
import { phqaQuestions } from '../data/phqa';
import { physicalHealthItems } from '../data/physicalHealth';
import { calculateRisk } from '../utils/riskEngine';
import { saveVisit } from '../db';
import { createAutoAlert } from '../utils/alertService';
import SOSOverlay from '../components/SOSOverlay';
import RiskBadge from '../components/RiskBadge';
import { COLORS, SIZES, commonStyles, RISK_COLORS } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

function ProtocolStep({ icon, color, text, done, bold }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <Ionicons name={done ? 'checkmark-circle' : icon} size={18} color={color} style={{ marginTop: 1 }} />
      <Text style={{ flex: 1, fontSize: SIZES.sm, color: done ? COLORS.textSecondary : COLORS.text, fontWeight: bold ? '700' : '400', lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}

function AlertPreviewCard({ patientName, patientAge, patientType, riskLevel, riskScore, maxScore, selfHarm, lang, t }) {
  const [expanded, setExpanded] = useState(false);
  const now = new Date();
  const timeStr = now.toLocaleTimeString(lang === 'ne' ? 'ne-NP' : 'en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={styles.previewCard}>
      <TouchableOpacity
        style={styles.previewToggle}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <Ionicons name="document-text-outline" size={16} color={COLORS.primary} />
        <Text style={styles.previewToggleText}>{t('alertPreviewToggle')}</Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.previewBody}>
          <Text style={styles.previewTitle}>{t('alertPreviewTitle')}</Text>
          {[
            ['Patient', patientName],
            ['Type', patientType === 'postnatal' ? (lang === 'ne' ? 'सुत्केरी आमा' : 'Postnatal Mother') : (lang === 'ne' ? 'युवा' : 'Youth')],
            ['Age', patientAge],
            ['Risk Level', riskLevel?.toUpperCase()],
            ['Score', `${riskScore} / ${maxScore}`],
            ['Self-harm Flag', selfHarm ? '⚠️ Yes' : 'No'],
            ['Date', now.toLocaleDateString()],
            [t('alertTimestamp'), timeStr],
          ].map(([label, value]) => (
            <View key={label} style={styles.previewRow}>
              <Text style={styles.previewLabel}>{label}</Text>
              <Text style={styles.previewValue}>{value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function NewVisitScreen({ navigation }) {
  const { t, lang } = useTranslation();
  const [step, setStep] = useState(0);
  const [showSOS, setShowSOS] = useState(false);

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientType, setPatientType] = useState('postnatal');
  const [patientAddress, setPatientAddress] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [geoLocation, setGeoLocation] = useState(null);

  const [checkedItems, setCheckedItems] = useState({});
  const [responses, setResponses] = useState({});
  const [result, setResult] = useState(null);
  const [alertResult, setAlertResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);
  const [sessionNotes, setSessionNotes] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setGeoLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
        } catch {}
      }
    })();
  }, []);

  const steps = [t('step1'), t('step2'), t('step3'), t('step4')];
  const questions = patientType === 'postnatal' ? epdsQuestions : phqaQuestions;
  const physChecklist = physicalHealthItems[patientType] || physicalHealthItems.postnatal;

  const canProceedStep0 = patientName.trim() && patientAge;
  const canProceedStep2 = Object.keys(responses).length === questions.length;

  function handleToggleCheck(id) {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSelectOption(questionId, optionIndex) {
    setResponses((prev) => ({ ...prev, [questionId]: optionIndex }));
  }

  function handleNext() {
    if (step === 2) {
      const age = parseInt(patientAge) || 18;
      const riskResult = calculateRisk(patientType, responses, questions, age);
      setResult(riskResult);
      if (riskResult.selfHarmFlag) {
        setShowSOS(true);
      }
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  async function handleSaveVisit() {
    setSaving(true);
    try {
      const { patient, visit } = await saveVisit({
        patient: {
          name: patientName,
          age: parseInt(patientAge),
          type: patientType,
          address: patientAddress,
          phone: patientPhone,
        },
        physicalChecks: checkedItems,
        screeningResponses: responses,
        riskResult: result,
        geoLocation,
        notes: sessionNotes,
      });

      if (result.riskLevel === 'high' || result.riskLevel === 'critical') {
        const district = (await AsyncStorage.getItem('fchv-district')) || 'Kaski';
        const alertRes = await createAutoAlert({
          visitId: visit.id,
          patientId: patient.id,
          patientName: patientName,
          riskLevel: result.riskLevel,
          district,
        });
        setAlertResult(alertRes);
      } else {
        navigation.navigate('Home');
      }
    } catch (e) {
      console.error('Error saving visit:', e);
      Alert.alert('Error', lang === 'ne' ? 'सुरक्षित गर्न सकिएन' : 'Could not save visit');
    } finally {
      setSaving(false);
    }
  }

  if (showSOS) {
    return <SOSOverlay visible onDismiss={() => setShowSOS(false)} />;
  }

  if (alertResult) {
    const psych = alertResult.psychiatrist;
    return (
      <ScrollView style={commonStyles.screen} contentContainerStyle={styles.alertContainer}>
        <View style={styles.alertIconCircle}>
          <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.alertTitle}>{t('alertSent')}</Text>
        <Text style={styles.alertSubtitle}>{t('alertAutoRouted')}</Text>

        {/* Alert preview — what was sent */}
        <AlertPreviewCard
          patientName={patientName}
          patientAge={patientAge}
          patientType={patientType}
          riskLevel={result?.riskLevel}
          riskScore={result?.score}
          maxScore={result?.maxScore}
          selfHarm={result?.selfHarmFlag}
          lang={lang}
          t={t}
        />

        {psych && (
          <View style={commonStyles.card}>
            <Text style={styles.alertSectionLabel}>{t('assignedPsychiatrist')}</Text>
            <Text style={styles.psychName}>{lang === 'ne' ? psych.nameNe : psych.name}</Text>
            <Text style={styles.psychFacility}>{lang === 'ne' ? psych.facilityNe : psych.facility}</Text>
            <Text style={styles.psychDistrict}>{lang === 'ne' ? psych.districtNe : psych.district}</Text>

            <View style={styles.alertActions}>
              <TouchableOpacity
                style={[commonStyles.btnPrimary, { flex: 1 }]}
                onPress={() => Linking.openURL(`tel:${psych.phone}`)}
              >
                <Ionicons name="call" size={20} color={COLORS.white} />
                <Text style={commonStyles.btnPrimaryText}>{t('callPsychiatrist')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[commonStyles.btnSecondary, { flex: 1 }]}
                onPress={() => Linking.openURL(`sms:${psych.phone}`)}
              >
                <Ionicons name="chatbubble" size={20} color={COLORS.text} />
                <Text style={commonStyles.btnSecondaryText}>{t('sendSMS')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={[commonStyles.sectionTitle, { marginTop: 8 }]}>{t('manualContact')}</Text>
        <TouchableOpacity style={commonStyles.btnSecondary} onPress={() => Linking.openURL('tel:1166')}>
          <Ionicons name="alert-circle" size={20} color={COLORS.riskHigh} />
          <Text style={commonStyles.btnSecondaryText}>{t('callCrisisHotline')}</Text>
        </TouchableOpacity>

        <View style={{ height: 12 }} />

        <TouchableOpacity
          style={commonStyles.btnSecondary}
          onPress={() =>
            Alert.alert(
              lang === 'ne' ? 'बढाइयो' : 'Escalated',
              lang === 'ne' ? 'सुपरभाइजरलाई सूचना पठाइयो' : 'Supervisor has been notified',
            )
          }
        >
          <Ionicons name="arrow-up-circle" size={20} color={COLORS.accent} />
          <Text style={commonStyles.btnSecondaryText}>{t('escalateToSupervisor')}</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />

        <TouchableOpacity
          style={[commonStyles.btnPrimary, { backgroundColor: COLORS.primaryLight }]}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={20} color={COLORS.white} />
          <Text style={commonStyles.btnPrimaryText}>{t('navHome')}</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scrollContent}>
      {/* Stepper */}
      <View style={styles.stepper}>
        {steps.map((label, i) => (
          <React.Fragment key={i}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  i === step && styles.stepCircleActive,
                  i < step && styles.stepCircleCompleted,
                ]}
              >
                {i < step ? (
                  <Ionicons name="checkmark" size={14} color={COLORS.white} />
                ) : (
                  <Text style={[styles.stepNumber, (i === step || i < step) && { color: COLORS.white }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[styles.stepLabel, i === step && styles.stepLabelActive]}>{label}</Text>
            </View>
            {i < steps.length - 1 && (
              <View style={[styles.stepLine, i < step && styles.stepLineCompleted]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Step 0: Patient Info */}
      {step === 0 && (
        <View>
          <Text style={styles.pageTitle}>{t('step1')}</Text>
          <Text style={commonStyles.subtitle}>
            {lang === 'ne' ? 'बिरामीको विवरण भर्नुहोस्' : 'Enter patient details'}
          </Text>

          <Text style={commonStyles.label}>{t('patientName')}</Text>
          <TextInput
            style={commonStyles.input}
            value={patientName}
            onChangeText={setPatientName}
            placeholder={lang === 'ne' ? 'पूरा नाम' : 'Full name'}
            placeholderTextColor={COLORS.textMuted}
          />

          <View style={[commonStyles.row, { gap: 12, marginTop: 16 }]}>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>{t('age')}</Text>
              <TextInput
                style={commonStyles.input}
                value={patientAge}
                onChangeText={setPatientAge}
                placeholder="25"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={commonStyles.label}>{t('patientType')}</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeBtn, patientType === 'postnatal' && styles.typeBtnActive]}
                  onPress={() => setPatientType('postnatal')}
                >
                  <Text style={[styles.typeBtnText, patientType === 'postnatal' && styles.typeBtnTextActive]}>
                    🤱 {lang === 'ne' ? 'आमा' : 'Mother'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, patientType === 'youth' && styles.typeBtnActive]}
                  onPress={() => setPatientType('youth')}
                >
                  <Text style={[styles.typeBtnText, patientType === 'youth' && styles.typeBtnTextActive]}>
                    🧑 {lang === 'ne' ? 'युवा' : 'Youth'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={commonStyles.label}>{t('address')}</Text>
            <TextInput
              style={commonStyles.input}
              value={patientAddress}
              onChangeText={setPatientAddress}
              placeholder={lang === 'ne' ? 'गाउँ / वडा नम्बर' : 'Village / Ward number'}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={commonStyles.label}>{t('phone')}</Text>
            <TextInput
              style={commonStyles.input}
              value={patientPhone}
              onChangeText={setPatientPhone}
              placeholder="+977..."
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          {geoLocation && (
            <View style={styles.locationBanner}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>
                {lang === 'ne' ? 'स्थान क्याप्चर भयो' : 'Location captured'}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[commonStyles.btnPrimary, { marginTop: 24 }, !canProceedStep0 && { opacity: 0.5 }]}
            onPress={handleNext}
            disabled={!canProceedStep0}
          >
            <Text style={commonStyles.btnPrimaryText}>{t('next')}</Text>
            <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Step 1: Physical Health */}
      {step === 1 && (
        <View>
          <Text style={styles.pageTitle}>{t('physicalHealthTitle')}</Text>
          <Text style={commonStyles.subtitle}>{t('physicalHealthDesc')}</Text>

          {physChecklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.checkItem, checkedItems[item.id] && styles.checkItemChecked]}
              onPress={() => handleToggleCheck(item.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkBox, checkedItems[item.id] && styles.checkBoxChecked]}>
                {checkedItems[item.id] && <Ionicons name="checkmark" size={16} color={COLORS.white} />}
              </View>
              <Text style={[styles.checkLabel, checkedItems[item.id] && styles.checkLabelChecked]}>
                {lang === 'ne' ? item.ne : item.en}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={[commonStyles.row, { gap: 12, marginTop: 24 }]}>
            <TouchableOpacity style={[commonStyles.btnSecondary, { flex: 1 }]} onPress={() => setStep(0)}>
              <Ionicons name="arrow-back" size={18} color={COLORS.text} />
              <Text style={commonStyles.btnSecondaryText}>{t('back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[commonStyles.btnPrimary, { flex: 2 }]} onPress={handleNext}>
              <Text style={commonStyles.btnPrimaryText}>{t('next')}</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 2: Mental Health Screening */}
      {step === 2 && !consentAcknowledged && (
        <View style={styles.consentCard}>
          <View style={styles.consentIconRow}>
            <View style={styles.consentIconBg}>
              <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.consentTitle}>{t('consentTitle')}</Text>
          </View>
          <Text style={styles.consentBody}>{t('consentBody')}</Text>
          <TouchableOpacity
            style={[commonStyles.btnPrimary, { marginTop: 20 }]}
            onPress={() => setConsentAcknowledged(true)}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={commonStyles.btnPrimaryText}>{t('consentBtn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[commonStyles.btnSecondary, { marginTop: 10 }]}
            onPress={() => setStep(1)}
          >
            <Ionicons name="arrow-back" size={18} color={COLORS.text} />
            <Text style={commonStyles.btnSecondaryText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 2 && consentAcknowledged && (
        <View>
          <Text style={styles.pageTitle}>{t('wellnessTitle')}</Text>
          <Text style={commonStyles.subtitle}>{t('wellnessDesc')}</Text>

          <View style={styles.progressPill}>
            <Text style={styles.progressText}>
              {Object.keys(responses).length} / {questions.length} {t('answered')}
            </Text>
          </View>

          {questions.map((q, i) => (
            <View key={q.id} style={styles.questionCard}>
              <View style={styles.questionHeader}>
                <View style={styles.questionNumber}>
                  <Text style={styles.questionNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.questionText}>
                  {lang === 'ne' ? q.ne : q.en}
                </Text>
              </View>

              {q.options.map((opt, oi) => (
                <TouchableOpacity
                  key={oi}
                  style={[styles.optionBtn, responses[q.id] === oi && styles.optionBtnSelected]}
                  onPress={() => handleSelectOption(q.id, oi)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.optionRadio, responses[q.id] === oi && styles.optionRadioSelected]}>
                    {responses[q.id] === oi && <View style={styles.optionRadioDot} />}
                  </View>
                  <Text style={[styles.optionText, responses[q.id] === oi && styles.optionTextSelected]}>
                    {lang === 'ne' ? opt.ne : opt.en}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={[commonStyles.row, { gap: 12, marginTop: 16 }]}>
            <TouchableOpacity style={[commonStyles.btnSecondary, { flex: 1 }]} onPress={() => setStep(1)}>
              <Ionicons name="arrow-back" size={18} color={COLORS.text} />
              <Text style={commonStyles.btnSecondaryText}>{t('back')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[commonStyles.btnPrimary, { flex: 2 }, !canProceedStep2 && { opacity: 0.5 }]}
              onPress={handleNext}
              disabled={!canProceedStep2}
            >
              <Text style={commonStyles.btnPrimaryText}>{t('next')}</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Step 3: Results */}
      {step === 3 && result && (
        <View style={styles.resultContainer}>
          <Text style={styles.pageTitle}>{t('resultTitle')}</Text>

          <View style={[styles.scoreRing, { borderColor: RISK_COLORS[result.riskLevel] || COLORS.riskLow }]}>
            <Text style={[styles.scoreValue, { color: RISK_COLORS[result.riskLevel] || COLORS.riskLow }]}>
              {result.score}
            </Text>
            <Text style={styles.scoreMax}>
              {t('scoreSuffix')} {result.maxScore}
            </Text>
          </View>

          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <RiskBadge riskLevel={result.riskLevel} lang={lang} />
          </View>

          <View style={[commonStyles.card, result.riskLevel === 'critical' && styles.protocolCardCritical]}>
            <View style={[commonStyles.row, { gap: 8, marginBottom: 12 }]}>
              <Ionicons
                name={result.riskLevel === 'critical' ? 'alert' : result.riskLevel === 'high' ? 'warning' : 'shield-checkmark'}
                size={20}
                color={result.riskLevel === 'critical' ? COLORS.riskCritical : result.riskLevel === 'high' ? COLORS.riskHigh : COLORS.primary}
              />
              <Text style={[styles.protocolTitle, result.riskLevel === 'critical' && { color: COLORS.riskCritical }]}>
                {result.riskLevel === 'critical' ? t('protocolCritTitle') : t('protocolTitle')}
              </Text>
            </View>

            {result.riskLevel === 'low' && (
              <View style={styles.protocolSteps}>
                <ProtocolStep icon="checkmark-circle" color={COLORS.riskLow} text={t('protocolLow1')} done />
                <ProtocolStep icon="calendar" color={COLORS.textSecondary} text={t('protocolLow2')} />
              </View>
            )}
            {result.riskLevel === 'moderate' && (
              <View style={styles.protocolSteps}>
                <ProtocolStep icon="checkmark-circle" color={COLORS.riskLow} text={t('protocolMod1')} done />
                <ProtocolStep icon="phone-portrait" color={COLORS.accent} text={t('protocolMod2')} />
              </View>
            )}
            {result.riskLevel === 'high' && (
              <View style={styles.protocolSteps}>
                <ProtocolStep icon="flash" color={COLORS.riskHigh} text={t('protocolHigh1')} />
                <ProtocolStep icon="medkit" color={COLORS.riskHigh} text={t('protocolHigh2')} />
              </View>
            )}
            {result.riskLevel === 'critical' && (
              <View style={styles.protocolSteps}>
                <ProtocolStep icon="hand-left" color={COLORS.riskCritical} text={t('protocolCrit1')} bold />
                <ProtocolStep icon="chatbubble-ellipses" color={COLORS.riskCritical} text={t('protocolCrit2')} />
                <ProtocolStep icon="call" color={COLORS.riskCritical} text={t('protocolCrit3')} />
              </View>
            )}

            <View style={[commonStyles.row, { gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Ionicons name="calendar-outline" size={14} color={COLORS.textMuted} />
              <Text style={{ fontSize: SIZES.xs, color: COLORS.textMuted }}>
                {lang === 'ne' ? 'अर्को भेट' : 'Follow-up'}: {result.followUpDate} ({result.followUpDays}{' '}
                {lang === 'ne' ? 'दिन' : 'days'})
              </Text>
            </View>
          </View>

          <View style={commonStyles.card}>
            <Text style={{ fontWeight: '700', fontSize: SIZES.base, marginBottom: 4 }}>{patientName}</Text>
            <Text style={{ fontSize: SIZES.sm, color: COLORS.textSecondary }}>
              {patientType === 'postnatal' ? t('postnatalMother') : t('youth')} · {t('age')}: {patientAge}
              {patientAddress ? ` · ${patientAddress}` : ''}
            </Text>
          </View>

          <View style={commonStyles.card}>
            <Text style={commonStyles.label}>{t('addSessionNotes')}</Text>
            <TextInput
              style={[commonStyles.input, styles.notesInput]}
              value={sessionNotes}
              onChangeText={setSessionNotes}
              placeholder={lang === 'ne' ? 'यस भेटको बारेमा टिप्पणी...' : 'Notes about this visit...'}
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[commonStyles.btnPrimary, saving && { opacity: 0.6 }]}
            onPress={handleSaveVisit}
            disabled={saving}
          >
            <Ionicons name="save" size={20} color={COLORS.white} />
            <Text style={commonStyles.btnPrimaryText}>{saving ? t('saving') : t('saveVisit')}</Text>
          </TouchableOpacity>

          {result.riskLevel === 'critical' && (
            <TouchableOpacity
              style={[commonStyles.btnDanger, { marginTop: 12 }]}
              onPress={() => Linking.openURL('tel:1166')}
            >
              <Ionicons name="call" size={20} color={COLORS.white} />
              <Text style={commonStyles.btnDangerText}>{t('callCrisisHotline')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  stepCircleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepCircleCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  stepNumber: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  stepLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    maxWidth: 60,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  stepLine: {
    width: 24,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
    marginBottom: 16,
  },
  stepLineCompleted: {
    backgroundColor: COLORS.primary,
  },
  pageTitle: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 6,
  },
  typeBtn: {
    flex: 1,
    height: SIZES.inputHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#ccfbf1',
  },
  typeBtnText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  typeBtnTextActive: {
    color: COLORS.primary,
  },
  locationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    padding: 12,
    backgroundColor: '#ccfbf1',
    borderRadius: SIZES.borderRadiusSm,
  },
  locationText: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    marginBottom: 8,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkItemChecked: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBoxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkLabel: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  checkLabelChecked: {
    fontWeight: '600',
    color: COLORS.primary,
  },
  progressPill: {
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: SIZES.borderRadiusFull,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  progressText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  questionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  questionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionNumberText: {
    fontSize: SIZES.sm,
    fontWeight: '800',
    color: COLORS.primary,
  },
  questionText: {
    flex: 1,
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
    lineHeight: 24,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: SIZES.borderRadiusSm,
    marginBottom: 6,
    gap: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionBtnSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#ccfbf1',
  },
  optionRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: COLORS.primary,
  },
  optionRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: COLORS.primary,
  },
  resultContainer: {
    alignItems: 'stretch',
  },
  scoreRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 20,
    backgroundColor: COLORS.surface,
  },
  scoreValue: {
    fontSize: SIZES.xxxl,
    fontWeight: '900',
  },
  scoreMax: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  recommendationText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  alertContainer: {
    padding: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  alertIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  alertSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  alertSectionLabel: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  psychName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  psychFacility: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  psychDistrict: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  alertActions: {
    flexDirection: 'row',
    gap: 10,
  },
  consentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  consentIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  consentIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  consentTitle: {
    fontSize: SIZES.lg,
    fontWeight: '800',
    color: COLORS.text,
    flex: 1,
  },
  consentBody: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 22,
  },
  protocolTitle: {
    fontSize: SIZES.base,
    fontWeight: '800',
    color: COLORS.text,
  },
  protocolSteps: {
    marginTop: 4,
  },
  protocolCardCritical: {
    borderWidth: 2,
    borderColor: COLORS.riskCritical,
    backgroundColor: '#fff5f5',
  },
  notesInput: {
    height: 80,
    paddingTop: 10,
  },
  previewCard: {
    width: '100%',
    backgroundColor: '#f0fdfa',
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginBottom: 16,
    overflow: 'hidden',
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  previewToggleText: {
    flex: 1,
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  previewTitle: {
    fontSize: SIZES.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  previewBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.primary,
    padding: 12,
    gap: 6,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  previewLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  previewValue: {
    fontSize: SIZES.xs,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 12,
  },
});
