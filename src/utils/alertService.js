import { createAlertRecord, escalateAlert as dbEscalateAlert } from '../db';
import { findNearestPsychiatrist } from '../data/demoPsychiatrists';

export async function createAutoAlert({ visitId, patientId, patientName, riskLevel, district }) {
  const psychiatrist = findNearestPsychiatrist(district, riskLevel);

  const alert = await createAlertRecord({
    visitId,
    patientId,
    patientName,
    riskLevel,
    psychiatrist: psychiatrist
      ? { id: psychiatrist.id, name: psychiatrist.name, phone: psychiatrist.phone }
      : null,
  });

  return {
    alert,
    psychiatrist,
    autoRouted: !!psychiatrist,
  };
}

export async function manualEscalate(alertId, notes = '') {
  return dbEscalateAlert(alertId, notes);
}

export function getAlertStatusLabel(status, lang = 'en') {
  const labels = {
    pending: { en: 'Pending', ne: 'बाँकी' },
    sent: { en: 'Alert Sent', ne: 'सूचना पठाइयो' },
    acknowledged: { en: 'Acknowledged', ne: 'स्वीकृत' },
    escalated: { en: 'Escalated', ne: 'बढाइयो' },
  };
  return labels[status]?.[lang] || labels.pending[lang];
}
