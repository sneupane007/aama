import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking,
  Modal, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { getPatientById, getVisitsByPatient, getAlertByVisit, assignPsychiatristToVisit } from '../db';
import { demoPsychiatrists } from '../data/demoPsychiatrists';
import RiskBadge from '../components/RiskBadge';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function PatientDetailScreen({ route }) {
  const { patientId } = route.params;
  const { t, lang } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [expandedVisit, setExpandedVisit] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // visitId being assigned

  function reload() {
    try {
      const p = getPatientById(patientId);
      setPatient(p);
      const v = getVisitsByPatient(patientId);
      setVisits(v);
      if (v.length > 0 && !expandedVisit) setExpandedVisit(v[0].id);
      const alertMap = {};
      for (const visit of v) {
        const a = getAlertByVisit(visit.id);
        if (a) alertMap[visit.id] = a;
      }
      setAlerts(alertMap);
    } catch (e) {
      console.error('Error loading patient detail:', e);
    }
  }

  useEffect(() => { reload(); }, [patientId]);

  if (!patient) return null;

  function handleAssign(psych) {
    const visit = visits.find(v => v.id === assignModal);
    if (!visit) return;
    try {
      assignPsychiatristToVisit({
        visitId: visit.id,
        patientId: patient.id,
        patientName: patient.name,
        riskLevel: visit.risk_level,
        psychiatrist: { id: psych.id, name: psych.name, phone: psych.phone },
      });
      setAssignModal(null);
      reload();
      Alert.alert('', `${t('assignSuccess')}: ${psych.name}`);
    } catch (e) {
      console.error('Assign error:', e);
    }
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatVisitDate = (dateStr) => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  return (
    <>
      <ScrollView style={commonStyles.screen} contentContainerStyle={styles.content}>
        {/* Patient Header */}
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{getInitials(patient.name)}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientMeta}>
              {patient.patient_type === 'postnatal' ? t('postnatalMother') : t('youth')}
              {'  ·  '}{t('age')} {patient.age}
            </Text>
            {patient.address ? (
              <View style={[commonStyles.row, { gap: 4, marginTop: 4 }]}>
                <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.patientAddress}>{patient.address}</Text>
              </View>
            ) : null}
            {patient.phone ? (
              <View style={[commonStyles.row, { gap: 4, marginTop: 2 }]}>
                <Ionicons name="call-outline" size={13} color={COLORS.textMuted} />
                <Text style={styles.patientAddress}>{patient.phone}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Quick Assign button for the latest visit */}
        {visits.length > 0 && (
          <TouchableOpacity
            style={styles.quickAssignBtn}
            onPress={() => setAssignModal(visits[0].id)}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={18} color={COLORS.white} />
            <Text style={styles.quickAssignText}>
              {alerts[visits[0].id]
                ? t('reassignPsychiatrist')
                : t('assignPsychiatrist')}
            </Text>
            {alerts[visits[0].id] && (
              <Text style={styles.quickAssignSub}>
                {alerts[visits[0].id].psychiatrist_name}
              </Text>
            )}
          </TouchableOpacity>
        )}

        {/* Visit History */}
        <Text style={commonStyles.sectionTitle}>
          {t('visitHistory')} ({visits.length})
        </Text>

        {visits.length === 0 ? (
          <View style={styles.emptyVisits}>
            <Ionicons name="calendar-outline" size={40} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>{t('noVisitsToday')}</Text>
          </View>
        ) : (
          visits.map((visit) => {
            const isExpanded = expandedVisit === visit.id;
            const alert = alerts[visit.id];
            const isHighRisk = visit.risk_level === 'high' || visit.risk_level === 'critical';

            return (
              <View
                key={visit.id}
                style={[styles.visitCard, isHighRisk && styles.visitCardHighlight]}
              >
                <TouchableOpacity
                  style={styles.visitRow}
                  onPress={() => setExpandedVisit(isExpanded ? null : visit.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.visitRowLeft}>
                    <Text style={styles.visitDate}>{formatVisitDate(visit.visit_date)}</Text>
                    <Text style={styles.visitScore}>
                      {visit.risk_score}/{visit.max_score}
                      {visit.self_harm_flag ? '  ⚠️' : ''}
                    </Text>
                  </View>
                  <View style={[commonStyles.row, { gap: 8 }]}>
                    <RiskBadge riskLevel={visit.risk_level} lang={lang} size="small" />
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={COLORS.textMuted}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.visitDetail}>
                    {/* Volunteer Notes */}
                    <View style={styles.detailBlock}>
                      <View style={[commonStyles.row, { gap: 6, marginBottom: 6 }]}>
                        <Ionicons name="document-text-outline" size={15} color={COLORS.primary} />
                        <Text style={styles.detailLabel}>{t('sessionNotes')}</Text>
                      </View>
                      <Text style={styles.notesText}>
                        {visit.notes && visit.notes.trim() ? visit.notes : t('noNotes')}
                      </Text>
                    </View>

                    {/* Assigned Psychiatrist */}
                    {alert ? (
                      <View style={[styles.detailBlock, styles.psychiatristBlock]}>
                        <View style={[commonStyles.row, { justifyContent: 'space-between', marginBottom: 8 }]}>
                          <View style={[commonStyles.row, { gap: 6 }]}>
                            <Ionicons name="medical-outline" size={15} color={COLORS.riskHigh} />
                            <Text style={styles.detailLabel}>{t('assignedPsychiatrist')}</Text>
                            <View style={[
                              styles.statusBadge,
                              alert.escalated ? styles.statusEscalated : styles.statusSent,
                            ]}>
                              <Text style={[
                                styles.statusBadgeText,
                                { color: alert.escalated ? COLORS.riskCritical : COLORS.riskHigh },
                              ]}>
                                {alert.escalated
                                  ? (lang === 'ne' ? 'बढाइयो' : 'Escalated')
                                  : (lang === 'ne' ? 'सूचना पठाइयो' : 'Alerted')}
                              </Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.reassignBtn}
                            onPress={() => setAssignModal(visit.id)}
                          >
                            <Ionicons name="swap-horizontal" size={13} color={COLORS.primary} />
                            <Text style={styles.reassignBtnText}>{t('reassignPsychiatrist')}</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.psychiatristName}>{alert.psychiatrist_name}</Text>
                        {alert.psychiatrist_phone ? (
                          <TouchableOpacity
                            style={styles.callBtn}
                            onPress={() => Linking.openURL(`tel:${alert.psychiatrist_phone}`)}
                          >
                            <Ionicons name="call" size={15} color={COLORS.white} />
                            <Text style={styles.callBtnText}>{alert.psychiatrist_phone}</Text>
                          </TouchableOpacity>
                        ) : null}
                        {alert.notes && alert.notes.trim() ? (
                          <View style={{ marginTop: 10 }}>
                            <Text style={styles.detailLabel}>{lang === 'ne' ? 'फलो-अप नोट' : 'Follow-up Note'}</Text>
                            <Text style={styles.notesText}>{alert.notes}</Text>
                          </View>
                        ) : null}
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.assignPromptBtn}
                        onPress={() => setAssignModal(visit.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.assignPromptIcon}>
                          <Ionicons name="person-add-outline" size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.assignPromptTitle}>{t('assignPsychiatrist')}</Text>
                          <Text style={styles.assignPromptSub}>{t('assignSubtitle')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Assign Psychiatrist Modal */}
      <Modal
        visible={!!assignModal}
        animationType="slide"
        transparent
        onRequestClose={() => setAssignModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            <Text style={styles.modalTitle}>{t('assignTitle')}</Text>
            <Text style={styles.modalSubtitle}>{t('assignSubtitle')}</Text>

            {/* Current assignment notice */}
            {assignModal && alerts[assignModal] && (
              <View style={styles.currentAssignedBanner}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} />
                <Text style={styles.currentAssignedText}>
                  {t('currentlyAssigned')}: {alerts[assignModal].psychiatrist_name}
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              {demoPsychiatrists.map((psych) => {
                const isCurrent = assignModal && alerts[assignModal]?.psychiatrist_name === psych.name;
                return (
                  <TouchableOpacity
                    key={psych.id}
                    style={[styles.psychCard, isCurrent && styles.psychCardCurrent]}
                    onPress={() => handleAssign(psych)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.psychAvatar}>
                      <Text style={styles.psychAvatarText}>
                        {psych.name.split(' ').find(w => !w.startsWith('Dr'))?.[0] || '?'}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={[commonStyles.row, { gap: 8 }]}>
                        <Text style={styles.psychName}>
                          {lang === 'ne' ? psych.nameNe : psych.name}
                        </Text>
                        {isCurrent && (
                          <View style={styles.currentBadge}>
                            <Text style={styles.currentBadgeText}>
                              {lang === 'ne' ? 'तोकिएको' : 'Assigned'}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.psychSpecialty}>
                        {lang === 'ne' ? psych.specialty.ne : psych.specialty.en}
                      </Text>
                      <View style={[commonStyles.row, { gap: 6, marginTop: 3 }]}>
                        <View style={[
                          styles.availDot,
                          { backgroundColor: psych.available ? COLORS.riskLow : COLORS.textMuted },
                        ]} />
                        <Text style={[
                          styles.psychAvailText,
                          { color: psych.available ? COLORS.riskLow : COLORS.textMuted },
                        ]}>
                          {psych.available
                            ? t('available')
                            : t('unavailableNote')}
                        </Text>
                        <Text style={styles.psychDistrict}>· {lang === 'ne' ? psych.districtNe : psych.district}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.callSmallBtn}
                      onPress={() => Linking.openURL(`tel:${psych.phone}`)}
                    >
                      <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[commonStyles.btnSecondary, { marginTop: 12 }]}
              onPress={() => setAssignModal(null)}
            >
              <Text style={commonStyles.btnSecondaryText}>{t('cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarLarge: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary },
  headerInfo: { flex: 1 },
  patientName: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 2 },
  patientMeta: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  patientAddress: { fontSize: SIZES.xs, color: COLORS.textMuted },
  quickAssignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadiusSm,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 20,
  },
  quickAssignText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.white, flex: 1 },
  quickAssignSub: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.8)' },
  emptyVisits: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: SIZES.base, color: COLORS.textSecondary },
  visitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  visitCardHighlight: { borderColor: COLORS.riskHigh, borderWidth: 1.5 },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  visitRowLeft: { flex: 1 },
  visitDate: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  visitScore: { fontSize: SIZES.xs, color: COLORS.textMuted, marginTop: 2 },
  visitDetail: { borderTopWidth: 1, borderTopColor: COLORS.border, padding: 14, gap: 12 },
  detailBlock: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: SIZES.borderRadiusSm,
    padding: 12,
  },
  psychiatristBlock: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  detailLabel: {
    fontSize: SIZES.xs, fontWeight: '700', color: COLORS.textMuted,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  notesText: { fontSize: SIZES.sm, color: COLORS.text, lineHeight: 20 },
  psychiatristName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    alignSelf: 'flex-start', backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.borderRadiusFull,
  },
  callBtnText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.white },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: SIZES.borderRadiusFull },
  statusSent: { backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa' },
  statusEscalated: { backgroundColor: '#fff1f2', borderWidth: 1, borderColor: '#fecdd3' },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  reassignBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: SIZES.borderRadiusFull,
    borderWidth: 1, borderColor: COLORS.primary,
    backgroundColor: '#f0fdfa',
  },
  reassignBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  assignPromptBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#f0fdfa',
    borderWidth: 1.5, borderColor: '#99f6e4', borderStyle: 'dashed',
    borderRadius: SIZES.borderRadiusSm, padding: 14,
  },
  assignPromptIcon: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center',
  },
  assignPromptTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  assignPromptSub: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 36,
    maxHeight: '85%',
  },
  sheetHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: COLORS.border, alignSelf: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  modalSubtitle: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: 16 },
  currentAssignedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#f0fdfa', borderRadius: SIZES.borderRadiusSm,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 12,
    borderWidth: 1, borderColor: '#99f6e4',
  },
  currentAssignedText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600' },
  psychCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  psychCardCurrent: { borderColor: COLORS.primary, borderWidth: 1.5, backgroundColor: '#f0fdfa' },
  psychAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#ccfbf1', justifyContent: 'center', alignItems: 'center',
  },
  psychAvatarText: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.primary },
  psychName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  psychSpecialty: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  availDot: { width: 6, height: 6, borderRadius: 3 },
  psychAvailText: { fontSize: SIZES.xs, fontWeight: '700' },
  psychDistrict: { fontSize: SIZES.xs, color: COLORS.textMuted },
  currentBadge: {
    backgroundColor: '#ccfbf1', borderRadius: SIZES.borderRadiusFull,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  currentBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.primary },
  callSmallBtn: {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center',
  },
});
