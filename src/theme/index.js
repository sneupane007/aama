import { StyleSheet } from 'react-native';

export const COLORS = {
  primary: '#0f766e',
  primaryLight: '#14b8a6',
  primaryDark: '#0d5c56',
  background: '#f0fdf4',
  surface: '#ffffff',
  surfaceSecondary: '#f1f5f9',
  text: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  border: '#e2e8f0',

  riskLow: '#22c55e',
  riskLowBg: '#dcfce7',
  riskModerate: '#f59e0b',
  riskModerateBg: '#fef3c7',
  riskHigh: '#ef4444',
  riskHighBg: '#fee2e2',
  riskCritical: '#dc2626',
  riskCriticalBg: '#fecaca',

  accent: '#f59e0b',
  white: '#ffffff',
  black: '#000000',
};

export const SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  buttonHeight: 56,
  inputHeight: 52,
  borderRadius: 16,
  borderRadiusSm: 12,
  borderRadiusFull: 999,
  iconSize: 24,
};

export const RISK_COLORS = {
  low: COLORS.riskLow,
  moderate: COLORS.riskModerate,
  high: COLORS.riskHigh,
  critical: COLORS.riskCritical,
};

export const RISK_BG_COLORS = {
  low: COLORS.riskLowBg,
  moderate: COLORS.riskModerateBg,
  high: COLORS.riskHighBg,
  critical: COLORS.riskCriticalBg,
};

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenPadded: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
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
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  subtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.borderRadiusSm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnPrimaryText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  btnSecondary: {
    backgroundColor: COLORS.surfaceSecondary,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.borderRadiusSm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnSecondaryText: {
    color: COLORS.text,
    fontSize: SIZES.base,
    fontWeight: '600',
  },
  btnDanger: {
    backgroundColor: COLORS.riskHigh,
    height: SIZES.buttonHeight,
    borderRadius: SIZES.borderRadiusSm,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  btnDangerText: {
    color: COLORS.white,
    fontSize: SIZES.lg,
    fontWeight: '700',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadiusSm,
    height: SIZES.inputHeight,
    paddingHorizontal: 16,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  label: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
