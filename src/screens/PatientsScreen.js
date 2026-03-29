import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from '../utils/i18n';
import { getAllPatientsWithRisk } from '../db';
import RiskBadge from '../components/RiskBadge';
import { COLORS, SIZES, commonStyles } from '../theme';

export default function PatientsScreen({ navigation }) {
  const { t, lang } = useTranslation();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useFocusEffect(
    useCallback(() => {
      loadPatients();
    }, []),
  );

  async function loadPatients() {
    try {
      const all = await getAllPatientsWithRisk();
      setPatients(all);
    } catch (e) {
      console.error('Error loading patients:', e);
    }
  }

  const filtered = patients.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || p.latestRisk === filter;
    return matchesSearch && matchesFilter;
  });

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

  const filters = [
    { key: 'all', label: t('allPatients') },
    { key: 'low', label: t('filterLow') },
    { key: 'moderate', label: t('filterModerate') },
    { key: 'high', label: t('filterHigh') },
    { key: 'critical', label: t('filterCritical') },
  ];

  return (
    <ScrollView style={commonStyles.screen} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.title}>{t('navPatients')}</Text>
      <Text style={commonStyles.subtitle}>
        {patients.length} {t('patientsOnRecord')}
      </Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchPatients')}
          placeholderTextColor={COLORS.textMuted}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterPill, filter === f.key && styles.filterPillActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.filterPillText, filter === f.key && styles.filterPillTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="people-outline" size={56} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>{t('noPatients')}</Text>
        </View>
      ) : (
        <View>
          {filtered.map((patient) => (
            <TouchableOpacity
              key={patient.id}
              style={styles.patientItem}
              onPress={() => navigation.navigate('PatientDetail', { patientId: patient.id, patientName: patient.name })}
              activeOpacity={0.7}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(patient.name)}</Text>
              </View>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientMeta}>
                  {patient.patientType === 'postnatal' ? t('postnatalMother') : t('youth')}
                  {' · '}
                  {patient.visitCount} {t('visits')}
                  {patient.latestVisit
                    ? ` · ${t('lastVisit')} ${formatDate(patient.latestVisit.createdAt)}`
                    : ''}
                </Text>
              </View>
              <View style={[commonStyles.row, { gap: 6 }]}>
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
  title: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadiusSm,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  filterRow: {
    marginBottom: 16,
    flexGrow: 0,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: SIZES.borderRadiusFull,
    backgroundColor: COLORS.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.white,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: SIZES.base,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  patientItem: {
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
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: SIZES.base,
    fontWeight: '600',
    color: COLORS.text,
  },
  patientMeta: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
