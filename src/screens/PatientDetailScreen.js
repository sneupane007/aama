import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { getPatientById, getVisitsByPatient, getAlertByVisit } from '../db';
import RiskBadge from '../components/RiskBadge';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function PatientDetailScreen({ route }) {
  const { patientId } = route.params;
  const { t, lang } = useTranslation();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [expandedVisit, setExpandedVisit] = useState(null);

  useEffect(() => {
    try {
      const p = getPatientById(patientId);
      setPatient(p);
      const v = getVisitsByPatient(patientId);
      setVisits(v);
      if (v.length > 0) setExpandedVisit(v[0].id);
      const alertMap = {};
      for (const visit of v) {
        const a = getAlertByVisit(visit.id);
        if (a) alertMap[visit.id] = a;
      }
      setAlerts(alertMap);
    } catch (e) {
      console.error('Error loading patient detail:', e);
    }
  }, [patientId]);

  if (!patient) return null;

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
        visits.map((visit, index) => {
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
                      <View style={[commonStyles.row, { gap: 6, marginBottom: 8 }]}>
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
                  ) : isHighRisk ? (
                    <View style={[styles.detailBlock, { opacity: 0.5 }]}>
                      <View style={[commonStyles.row, { gap: 6 }]}>
                        <Ionicons name="medical-outline" size={15} color={COLORS.textMuted} />
                        <Text style={[styles.detailLabel, { color: COLORS.textMuted }]}>
                          {t('noAssignment')}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              )}
            </View>
          );
        })
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarLarge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: SIZES.lg,
    fontWeight: '800',
    color: COLORS.primary,
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
  },
  patientAddress: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
  },
  emptyVisits: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  visitCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  visitCardHighlight: {
    borderColor: COLORS.riskHigh,
    borderWidth: 1.5,
  },
  visitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  visitRowLeft: {
    flex: 1,
  },
  visitDate: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
  },
  visitScore: {
    fontSize: SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  visitDetail: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 14,
    gap: 12,
  },
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
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notesText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  psychiatristName: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.borderRadiusFull,
  },
  callBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadiusFull,
  },
  statusSent: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  statusEscalated: {
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
});
