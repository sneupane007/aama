import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RISK_COLORS, RISK_BG_COLORS, SIZES } from '../theme';

export default function RiskBadge({ riskLevel, lang = 'en', size = 'normal' }) {
  if (!riskLevel) return null;

  const labels = {
    low: { en: 'Low', ne: 'कम' },
    moderate: { en: 'Moderate', ne: 'मध्यम' },
    high: { en: 'High', ne: 'उच्च' },
    critical: { en: 'Critical', ne: 'गम्भीर' },
  };

  const label = labels[riskLevel]?.[lang] || labels.low[lang];
  const color = RISK_COLORS[riskLevel] || RISK_COLORS.low;
  const bgColor = RISK_BG_COLORS[riskLevel] || RISK_BG_COLORS.low;
  const isSmall = size === 'small';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, isSmall && styles.badgeSmall]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, isSmall && styles.textSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.borderRadiusFull,
    gap: 6,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  textSmall: {
    fontSize: SIZES.xs,
  },
});
