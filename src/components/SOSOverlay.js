import React from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../utils/i18n';
import { COLORS, SIZES } from '../theme';

export default function SOSOverlay({ visible, onDismiss }) {
  const { t } = useTranslation();

  if (!visible) return null;

  const handleCallCrisis = () => {
    Linking.openURL('tel:1166');
  };

  return (
    <View style={styles.overlay}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.riskCritical} />
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="warning" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>{t('sosTitle')}</Text>
        <Text style={styles.message}>{t('sosMessage')}</Text>

        <TouchableOpacity style={styles.callButton} onPress={handleCallCrisis} activeOpacity={0.8}>
          <Ionicons name="call" size={24} color={COLORS.white} />
          <Text style={styles.callButtonText}>{t('sosCrisisLine')} (1166)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={onDismiss} activeOpacity={0.7}>
          <Text style={styles.dismissText}>{t('sosDismiss')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.riskCritical,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: SIZES.xxl,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: SIZES.lg,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 32,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    width: '100%',
    height: 64,
    borderRadius: SIZES.borderRadiusSm,
    gap: 12,
    marginBottom: 16,
  },
  callButtonText: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.riskCritical,
  },
  dismissButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: SIZES.borderRadiusSm,
    width: '100%',
    alignItems: 'center',
  },
  dismissText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: SIZES.base,
    fontWeight: '600',
  },
});
