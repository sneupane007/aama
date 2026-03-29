import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../utils/i18n';
import { getTodayVisits, getUnsyncedCount, getAllPatientsWithRisk, getHighRiskCount, seedDemoData } from '../db';
import RiskBadge from '../components/RiskBadge';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function HomeScreen({ navigation }) {
  const { t, lang } = useTranslation();
  const [stats, setStats] = useState({ todayVisits: 0, pendingSync: 0, highRisk: 0, totalPatients: 0 });
  const [recentPatients, setRecentPatients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const todayVisitsList = await getTodayVisits();
      const pendingCount = await getUnsyncedCount();
      const allPatients = await getAllPatientsWithRisk();
      const highRiskCount = await getHighRiskCount();

      setStats({
        todayVisits: todayVisitsList.length,
        pendingSync: pendingCount,
        highRisk: highRiskCount,
        totalPatients: allPatients.length,
      });

      const sorted = [...allPatients].sort(
        (a, b) => (b.latestVisit?.createdAt || b.createdAt) - (a.latestVisit?.createdAt || a.createdAt),
      );
      setRecentPatients(sorted.slice(0, 5));
    } catch (e) {
      console.error('Error loading dashboard:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  async function handleLoadDemo() {
    setDemoLoading(true);
    try {
      seedDemoData();
      await loadData();
      Alert.alert('', t('demoLoaded'));
    } catch (e) {
      console.error('Demo seed error:', e);
    } finally {
      setDemoLoading(false);
    }
  }

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return t('today');
    if (diffDays === 1) return t('yesterday');
    return `${diffDays} ${t('daysAgo')}`;
  };

  const hour = new Date().getHours();
  const timeEmoji = hour < 12 ? '🌅' : hour < 17 ? '☀️' : '🌙';

  return (
    <ScrollView
      style={commonStyles.screen}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <View style={styles.greeting}>
        <Text style={styles.greetingEmoji}>{timeEmoji}</Text>
        <Text style={styles.greetingName}>{t('greeting')}, सखी!</Text>
        <Text style={styles.greetingDate}>
          {new Date().toLocaleDateString(lang === 'ne' ? 'ne-NP' : 'en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </View>

      <View style={styles.statGrid}>
        <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
          <Text style={styles.statValue}>{stats.todayVisits}</Text>
          <Text style={styles.statLabel}>{t('todayVisits')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.accent }]}>
          <Text style={styles.statValue}>{stats.pendingSync}</Text>
          <Text style={styles.statLabel}>{t('pendingSync')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.riskHigh }]}>
          <Text style={styles.statValue}>{stats.highRisk}</Text>
          <Text style={styles.statLabel}>{t('highRisk')}</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: COLORS.primaryLight }]}>
          <Text style={styles.statValue}>{stats.totalPatients}</Text>
          <Text style={styles.statLabel}>{t('totalPatients')}</Text>
        </View>
      </View>

      {stats.totalPatients > 0 && (
        <View style={styles.impactBanner}>
          <View style={styles.impactLeft}>
            <Text style={styles.impactNumber}>{Math.max(0, stats.totalPatients - stats.highRisk)}</Text>
            <Text style={styles.impactLabel}>{t('consultationsSaved')}</Text>
          </View>
          <View style={styles.impactDivider} />
          <Text style={styles.impactDesc}>{t('consultationsSavedDesc')}</Text>
        </View>
      )}

      <Text style={commonStyles.sectionTitle}>{t('quickActions')}</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('NewVisit')} activeOpacity={0.7}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#ccfbf1' }]}>
            <Ionicons name="add-circle" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.quickActionLabel}>{t('startVisit')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Patients')} activeOpacity={0.7}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#fef3c7' }]}>
            <Ionicons name="people" size={28} color={COLORS.accent} />
          </View>
          <Text style={styles.quickActionLabel}>{t('viewPatients')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('Guide')} activeOpacity={0.7}>
          <View style={[styles.quickActionIcon, { backgroundColor: '#dbeafe' }]}>
            <Ionicons name="book" size={28} color="#3b82f6" />
          </View>
          <Text style={styles.quickActionLabel}>{t('navGuide')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={commonStyles.sectionTitle}>{t('recentVisits')}</Text>
      {recentPatients.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyText}>{t('noVisitsToday')}</Text>
          <TouchableOpacity
            style={[commonStyles.btnPrimary, { marginTop: 16, paddingHorizontal: 24 }]}
            onPress={() => navigation.navigate('NewVisit')}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={commonStyles.btnPrimaryText}>{t('startVisit')}</Text>
          </TouchableOpacity>
          {stats.totalPatients === 0 && (
            <TouchableOpacity
              style={[styles.demoBtn, demoLoading && { opacity: 0.6 }]}
              onPress={handleLoadDemo}
              disabled={demoLoading}
            >
              <Ionicons name="flask" size={18} color={COLORS.primary} />
              <View>
                <Text style={styles.demoBtnTitle}>{demoLoading ? '...' : t('loadDemo')}</Text>
                <Text style={styles.demoBtnDesc}>{t('loadDemoDesc')}</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View>
          {recentPatients.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.visitItem}
              onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id, patientName: patient.name })}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(patient.name)}</Text>
              </View>
              <View style={styles.visitInfo}>
                <Text style={styles.visitName}>{patient.name}</Text>
                <Text style={styles.visitMeta}>
                  {patient.patientType === 'postnatal' ? t('postnatalMother') : t('youth')}
                  {patient.latestVisit ? ` · ${formatDate(patient.latestVisit.createdAt)}` : ''}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <RiskBadge riskLevel={patient.latestRisk} lang={lang} size="small" />
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  greeting: {
    marginBottom: 20,
  },
  greetingEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  greetingName: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  greetingDate: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ccfbf1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  visitInfo: {
    flex: 1,
  },
  visitName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  visitMeta: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  impactBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ccfbf1',
    borderRadius: SIZES.borderRadiusSm,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  impactLeft: {
    alignItems: 'center',
    minWidth: 52,
  },
  impactNumber: {
    fontSize: SIZES.xxl,
    fontWeight: '900',
    color: COLORS.primary,
  },
  impactLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  impactDivider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.primaryLight,
    opacity: 0.4,
  },
  impactDesc: {
    flex: 1,
    fontSize: SIZES.xs,
    color: COLORS.primary,
    lineHeight: 18,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    padding: 14,
    borderRadius: SIZES.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    backgroundColor: '#f0fdfa',
    width: '100%',
  },
  demoBtnTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  demoBtnDesc: {
    fontSize: SIZES.xs,
    color: COLORS.primaryLight,
    marginTop: 1,
  },
});
