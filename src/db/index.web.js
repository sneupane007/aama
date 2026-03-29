// Web platform database — same API as index.js but backed by in-memory JS arrays.
// Metro automatically uses this file instead of index.js when bundling for web.

function uuid() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

let patients = [];
let visits = [];
let alerts = [];
let seeded = false;

function ensureSeeded() {
  if (!seeded) {
    seeded = true;
    seedDemoData();
  }
}

export function getTodayVisits() {
  ensureSeeded();
  const today = new Date().toISOString().split('T')[0];
  return visits.filter((v) => v.visit_date === today);
}

export function getUnsyncedCount() {
  ensureSeeded();
  return visits.filter((v) => !v.synced).length;
}

export function getAllPatientsWithRisk() {
  ensureSeeded();
  const sorted = [...visits].sort((a, b) => b.created_at - a.created_at);
  return [...patients].sort((a, b) => b.created_at - a.created_at).map((p) => {
    const pv = sorted.filter((v) => v.patient_id === p.id);
    const latest = pv[0] || null;
    return {
      id: p.id,
      name: p.name,
      age: p.age,
      patientType: p.patient_type,
      address: p.address,
      phone: p.phone,
      visitCount: pv.length,
      latestVisit: latest ? { ...latest, createdAt: latest.created_at, riskLevel: latest.risk_level } : null,
      latestRisk: latest?.risk_level || null,
      createdAt: p.created_at,
    };
  });
}

export function getHighRiskCount() {
  ensureSeeded();
  const sorted = [...visits].sort((a, b) => b.created_at - a.created_at);
  return patients.filter((p) => {
    const latest = sorted.find((v) => v.patient_id === p.id);
    return latest && (latest.risk_level === 'high' || latest.risk_level === 'critical');
  }).length;
}

export function getRecentAlerts(limit = 10) {
  ensureSeeded();
  return [...alerts].sort((a, b) => b.created_at - a.created_at).slice(0, limit);
}

export function getPatientById(id) {
  ensureSeeded();
  return patients.find((p) => p.id === id) || null;
}

export function getVisitsByPatient(patientId) {
  ensureSeeded();
  return visits
    .filter((v) => v.patient_id === patientId)
    .sort((a, b) => b.created_at - a.created_at);
}

export function getAlertByVisit(visitId) {
  ensureSeeded();
  return alerts.find((a) => a.visit_id === visitId) || null;
}

export function saveVisit({ patient, physicalChecks, screeningResponses, riskResult, geoLocation, notes = '' }) {
  ensureSeeded();
  const patientId = uuid();
  const visitId = uuid();
  const now = Date.now();

  patients.push({
    id: patientId,
    name: patient.name,
    age: patient.age,
    patient_type: patient.type,
    address: patient.address,
    phone: patient.phone || '',
    geo_lat: geoLocation?.lat || 0,
    geo_lng: geoLocation?.lng || 0,
    created_at: now,
  });

  visits.push({
    id: visitId,
    patient_id: patientId,
    visit_date: new Date().toISOString().split('T')[0],
    risk_level: riskResult.riskLevel,
    risk_score: riskResult.score,
    max_score: riskResult.maxScore,
    self_harm_flag: riskResult.selfHarmFlag ? 1 : 0,
    physical_checks: JSON.stringify(physicalChecks),
    screening_responses: JSON.stringify(screeningResponses),
    notes,
    synced: 0,
    created_at: now,
  });

  return { patient: { id: patientId, name: patient.name }, visit: { id: visitId } };
}

export function createAlertRecord({ visitId, patientId, patientName, riskLevel, psychiatrist }) {
  ensureSeeded();
  const alertId = uuid();
  const now = Date.now();
  alerts.push({
    id: alertId,
    visit_id: visitId,
    patient_id: patientId,
    patient_name: patientName,
    risk_level: riskLevel,
    status: 'sent',
    psychiatrist_id: psychiatrist?.id || '',
    psychiatrist_name: psychiatrist?.name || '',
    psychiatrist_phone: psychiatrist?.phone || '',
    escalated: 0,
    notes: '',
    created_at: now,
  });
  return { id: alertId };
}

export function assignPsychiatristToVisit({ visitId, patientId, patientName, riskLevel, psychiatrist }) {
  ensureSeeded();
  const existing = alerts.find((a) => a.visit_id === visitId);
  const now = Date.now();
  if (existing) {
    existing.psychiatrist_id = psychiatrist.id;
    existing.psychiatrist_name = psychiatrist.name;
    existing.psychiatrist_phone = psychiatrist.phone;
    existing.status = 'sent';
    return { id: existing.id };
  }
  const alertId = uuid();
  alerts.push({
    id: alertId,
    visit_id: visitId,
    patient_id: patientId,
    patient_name: patientName,
    risk_level: riskLevel || 'low',
    status: 'sent',
    psychiatrist_id: psychiatrist.id,
    psychiatrist_name: psychiatrist.name,
    psychiatrist_phone: psychiatrist.phone,
    escalated: 0,
    notes: '',
    created_at: now,
  });
  return { id: alertId };
}

export function escalateAlert(alertId, notes) {
  ensureSeeded();
  const alert = alerts.find((a) => a.id === alertId);
  if (alert) {
    alert.escalated = 1;
    alert.status = 'escalated';
    alert.notes = notes;
  }
}

export function getActiveAlertsForProfile() {
  ensureSeeded();
  const sorted = [...visits].sort((a, b) => b.created_at - a.created_at);
  const results = patients
    .map((p) => {
      const pv = sorted.filter((v) => v.patient_id === p.id);
      const latest = pv[0];
      if (!latest) return null;
      if (latest.risk_level !== 'high' && latest.risk_level !== 'critical') return null;
      return {
        patientId: p.id,
        patientName: p.name,
        age: p.age,
        patientType: p.patient_type,
        riskLevel: latest.risk_level,
        lastVisitDate: latest.visit_date,
        selfHarmFlag: !!latest.self_harm_flag,
        visitCount: pv.length,
      };
    })
    .filter(Boolean);
  results.sort((a, b) => {
    if (a.riskLevel === 'critical' && b.riskLevel !== 'critical') return -1;
    if (b.riskLevel === 'critical' && a.riskLevel !== 'critical') return 1;
    return 0;
  });
  return results;
}

export function getVolunteerStats() {
  ensureSeeded();
  const sorted = [...visits].sort((a, b) => b.created_at - a.created_at);
  const active = new Set(
    patients
      .map((p) => {
        const latest = sorted.find((v) => v.patient_id === p.id);
        return latest && (latest.risk_level === 'high' || latest.risk_level === 'critical') ? p.id : null;
      })
      .filter(Boolean),
  );
  const critical = new Set(
    patients
      .map((p) => {
        const latest = sorted.find((v) => v.patient_id === p.id);
        return latest && latest.risk_level === 'critical' ? p.id : null;
      })
      .filter(Boolean),
  );
  return { totalVisits: visits.length, activeAlerts: active.size, criticalAlerts: critical.size };
}

export function hasDemoData() {
  return patients.length > 0;
}

export function seedDemoData() {
  const now = Date.now();
  function daysAgoDate(n) {
    return new Date(now - n * 86400000).toISOString().split('T')[0];
  }
  function daysAgoTs(n) {
    return now - n * 86400000;
  }

  const demoPatients = [
    { id: 'demo-p1',  name: 'Sita Sharma',     age: 28, type: 'postnatal', address: 'Kaski Ward 6',   lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p2',  name: 'Gita Rai',         age: 24, type: 'postnatal', address: 'Pokhara Ward 3', lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p3',  name: 'Maya Thapa',       age: 30, type: 'postnatal', address: 'Gorkha Ward 4',  lat: 28.0005, lng: 84.6200 },
    { id: 'demo-p4',  name: 'Anita Gurung',     age: 22, type: 'postnatal', address: 'Lamjung Ward 2', lat: 28.1500, lng: 84.4200 },
    { id: 'demo-p5',  name: 'Rajesh K.C.',      age: 16, type: 'youth',     address: 'Kaski Ward 8',   lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p6',  name: 'Priya Magar',      age: 14, type: 'youth',     address: 'Syangja Ward 1', lat: 28.0800, lng: 83.8800 },
    { id: 'demo-p7',  name: 'Kopila Shrestha',  age: 26, type: 'postnatal', address: 'Tanahu Ward 3',  lat: 27.9000, lng: 84.0000 },
    { id: 'demo-p8',  name: 'Aarav Tamang',     age: 17, type: 'youth',     address: 'Baglung Ward 2', lat: 28.2700, lng: 83.5900 },
    { id: 'demo-p9',  name: 'Nirmala Adhikari', age: 26, type: 'postnatal', address: 'Pokhara Ward 5', lat: 28.2100, lng: 83.9900 },
    { id: 'demo-p10', name: 'Sunita Pun',       age: 31, type: 'postnatal', address: 'Syangja Ward 3', lat: 28.0750, lng: 83.8700 },
    { id: 'demo-p11', name: 'Rahul Bhattarai',  age: 15, type: 'youth',     address: 'Kaski Ward 2',   lat: 28.2050, lng: 83.9750 },
    { id: 'demo-p12', name: 'Sarita Khadka',    age: 27, type: 'postnatal', address: 'Gorkha Ward 1',  lat: 27.9950, lng: 84.6100 },
    { id: 'demo-p13', name: 'Deepa Malla',      age: 23, type: 'postnatal', address: 'Tanahu Ward 7',  lat: 27.8900, lng: 84.0100 },
    { id: 'demo-p14', name: 'Prashant Karki',   age: 13, type: 'youth',     address: 'Lamjung Ward 5', lat: 28.1400, lng: 84.4100 },
  ];

  const demoVisits = [
    { id: 'demo-v1',   pid: 'demo-p1',  risk: 'low',      score: 5,  max: 30, sh: 0, days: 0,  notes: 'Patient appears well. Baby feeding regularly. Husband supportive.' },
    { id: 'demo-v1b',  pid: 'demo-p1',  risk: 'low',      score: 6,  max: 30, sh: 0, days: 35, notes: 'First postnatal home visit at 6 weeks. Mother adjusting well.' },
    { id: 'demo-v1c',  pid: 'demo-p1',  risk: 'low',      score: 4,  max: 30, sh: 0, days: 70, notes: 'Pre-discharge check. Patient in good spirits.' },
    { id: 'demo-v2',   pid: 'demo-p2',  risk: 'moderate', score: 11, max: 30, sh: 0, days: 1,  notes: 'Occasional sadness, low energy. Husband migrated to Qatar.' },
    { id: 'demo-v2b',  pid: 'demo-p2',  risk: 'low',      score: 7,  max: 30, sh: 0, days: 30, notes: 'Improvement noted. Mother-in-law helping with childcare.' },
    { id: 'demo-v2c',  pid: 'demo-p2',  risk: 'low',      score: 5,  max: 30, sh: 0, days: 60, notes: 'Initial screening. Patient well.' },
    { id: 'demo-v3',   pid: 'demo-p3',  risk: 'high',     score: 17, max: 30, sh: 0, days: 2,  notes: 'Patient tearful. Difficulty sleeping, overwhelmed with newborn.' },
    { id: 'demo-v3b',  pid: 'demo-p3',  risk: 'moderate', score: 12, max: 30, sh: 0, days: 14, notes: 'More withdrawn. Insomnia and reduced appetite.' },
    { id: 'demo-v3c',  pid: 'demo-p3',  risk: 'low',      score: 8,  max: 30, sh: 0, days: 35, notes: 'Routine 6-week check. Tired but managing.' },
    { id: 'demo-v3d',  pid: 'demo-p3',  risk: 'low',      score: 4,  max: 30, sh: 0, days: 70, notes: 'Initial postnatal visit. Mother recovering well.' },
    { id: 'demo-v4',   pid: 'demo-p4',  risk: 'critical', score: 22, max: 30, sh: 1, days: 3,  notes: 'Patient disclosed self-harm thoughts. Crisis protocol followed.' },
    { id: 'demo-v4b',  pid: 'demo-p4',  risk: 'high',     score: 19, max: 30, sh: 0, days: 14, notes: 'Significant decline. Unable to care for baby alone.' },
    { id: 'demo-v4c',  pid: 'demo-p4',  risk: 'moderate', score: 13, max: 30, sh: 0, days: 28, notes: 'Tearful and lonely. Husband away for work.' },
    { id: 'demo-v4d',  pid: 'demo-p4',  risk: 'low',      score: 6,  max: 30, sh: 0, days: 56, notes: 'Post-delivery check. Patient healthy.' },
    { id: 'demo-v5',   pid: 'demo-p5',  risk: 'low',      score: 4,  max: 27, sh: 0, days: 0,  notes: 'Healthy and engaged. Active in school football.' },
    { id: 'demo-v5b',  pid: 'demo-p5',  risk: 'low',      score: 5,  max: 27, sh: 0, days: 35, notes: 'Good academic performance.' },
    { id: 'demo-v5c',  pid: 'demo-p5',  risk: 'low',      score: 3,  max: 27, sh: 0, days: 70, notes: 'Initial screening. Student cheerful.' },
    { id: 'demo-v6',   pid: 'demo-p6',  risk: 'moderate', score: 9,  max: 27, sh: 0, days: 4,  notes: 'Withdrawn. Teacher reports declining grades.' },
    { id: 'demo-v6b',  pid: 'demo-p6',  risk: 'moderate', score: 10, max: 27, sh: 0, days: 30, notes: 'Quieter than usual. Difficulty concentrating.' },
    { id: 'demo-v6c',  pid: 'demo-p6',  risk: 'low',      score: 5,  max: 27, sh: 0, days: 65, notes: 'Initial screening. Student doing well.' },
    { id: 'demo-v7',   pid: 'demo-p7',  risk: 'high',     score: 15, max: 30, sh: 0, days: 5,  notes: 'Very anxious about household debt. Not sleeping.' },
    { id: 'demo-v7b',  pid: 'demo-p7',  risk: 'moderate', score: 11, max: 30, sh: 0, days: 21, notes: 'Mild improvement. Husband found part-time work.' },
    { id: 'demo-v7c',  pid: 'demo-p7',  risk: 'low',      score: 6,  max: 30, sh: 0, days: 56, notes: 'Post-delivery check at 6 weeks.' },
    { id: 'demo-v8',   pid: 'demo-p8',  risk: 'low',      score: 3,  max: 27, sh: 0, days: 6,  notes: 'Cooperative and cheerful. Good appetite and sleep.' },
    { id: 'demo-v8b',  pid: 'demo-p8',  risk: 'low',      score: 4,  max: 27, sh: 0, days: 42, notes: 'Initial screening. No concerns.' },
    { id: 'demo-v9',   pid: 'demo-p9',  risk: 'low',      score: 7,  max: 30, sh: 0, days: 3,  notes: 'Good progress. Patient smiling. Baby gaining weight.' },
    { id: 'demo-v9b',  pid: 'demo-p9',  risk: 'low',      score: 8,  max: 30, sh: 0, days: 17, notes: 'Continued improvement. Joined mothers support group.' },
    { id: 'demo-v9c',  pid: 'demo-p9',  risk: 'moderate', score: 11, max: 30, sh: 0, days: 31, notes: 'Some difficulty adjusting. Feeling isolated.' },
    { id: 'demo-v9d',  pid: 'demo-p9',  risk: 'moderate', score: 12, max: 30, sh: 0, days: 50, notes: 'Initial check. Mild low mood.' },
    { id: 'demo-v10',  pid: 'demo-p10', risk: 'high',     score: 14, max: 30, sh: 0, days: 1,  notes: 'Significant deterioration. Patient crying throughout.' },
    { id: 'demo-v10b', pid: 'demo-p10', risk: 'moderate', score: 10, max: 30, sh: 0, days: 21, notes: 'Increasing anxiety. Financial stress.' },
    { id: 'demo-v10c', pid: 'demo-p10', risk: 'low',      score: 5,  max: 30, sh: 0, days: 50, notes: 'Initial check post-delivery. Patient in reasonable spirits.' },
    { id: 'demo-v11',  pid: 'demo-p11', risk: 'moderate', score: 9,  max: 27, sh: 0, days: 2,  notes: 'Social withdrawal. Avoids group activities.' },
    { id: 'demo-v11b', pid: 'demo-p11', risk: 'moderate', score: 8,  max: 27, sh: 0, days: 30, notes: 'Mild improvement but still quiet.' },
    { id: 'demo-v11c', pid: 'demo-p11', risk: 'moderate', score: 10, max: 27, sh: 0, days: 60, notes: 'Persistent low mood. Parents divorced last year.' },
    { id: 'demo-v11d', pid: 'demo-p11', risk: 'low',      score: 4,  max: 27, sh: 0, days: 90, notes: 'Initial screening.' },
    { id: 'demo-v12',  pid: 'demo-p12', risk: 'moderate', score: 10, max: 30, sh: 0, days: 7,  notes: 'Recovery progressing. Patient laughing with mother today.' },
    { id: 'demo-v12b', pid: 'demo-p12', risk: 'high',     score: 16, max: 30, sh: 0, days: 21, notes: 'Still distressed but no self-harm ideation.' },
    { id: 'demo-v12c', pid: 'demo-p12', risk: 'critical', score: 24, max: 30, sh: 1, days: 35, notes: "Patient in crisis. Expressed wish to \"not be here anymore.\"" },
    { id: 'demo-v12d', pid: 'demo-p12', risk: 'moderate', score: 13, max: 30, sh: 0, days: 56, notes: 'First visit after delivery. Very anxious.' },
    { id: 'demo-v13',  pid: 'demo-p13', risk: 'low',      score: 4,  max: 30, sh: 0, days: 8,  notes: 'Excellent spirits. Breastfeeding going well.' },
    { id: 'demo-v13b', pid: 'demo-p13', risk: 'low',      score: 5,  max: 30, sh: 0, days: 42, notes: 'Good adjustment to motherhood.' },
    { id: 'demo-v13c', pid: 'demo-p13', risk: 'low',      score: 3,  max: 30, sh: 0, days: 80, notes: 'Initial check. Healthy delivery.' },
    { id: 'demo-v14',  pid: 'demo-p14', risk: 'high',     score: 15, max: 27, sh: 0, days: 1,  notes: 'Refusing school. Not left his room in 3 days.' },
    { id: 'demo-v14b', pid: 'demo-p14', risk: 'moderate', score: 11, max: 27, sh: 0, days: 21, notes: 'Worsening. Reports bullying at school.' },
    { id: 'demo-v14c', pid: 'demo-p14', risk: 'moderate', score: 9,  max: 27, sh: 0, days: 50, notes: 'Becoming quieter. Frequent stomach aches.' },
    { id: 'demo-v14d', pid: 'demo-p14', risk: 'low',      score: 4,  max: 27, sh: 0, days: 90, notes: 'Initial screening. Student happy and active.' },
  ];

  const demoAlerts = [
    { id: 'demo-a1', vid: 'demo-v3',   pid: 'demo-p3',  name: 'Maya Thapa',      risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', esc: 0 },
    { id: 'demo-a2', vid: 'demo-v4',   pid: 'demo-p4',  name: 'Anita Gurung',    risk: 'critical', psychId: 'psych-2', psychName: 'Dr. Prakash Adhikari', psychPhone: '9841034567', esc: 1 },
    { id: 'demo-a3', vid: 'demo-v7',   pid: 'demo-p7',  name: 'Kopila Shrestha', risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', esc: 0 },
    { id: 'demo-a4', vid: 'demo-v4b',  pid: 'demo-p4',  name: 'Anita Gurung',    risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', esc: 0 },
    { id: 'demo-a5', vid: 'demo-v10',  pid: 'demo-p10', name: 'Sunita Pun',      risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', esc: 0 },
    { id: 'demo-a6', vid: 'demo-v12c', pid: 'demo-p12', name: 'Sarita Khadka',   risk: 'critical', psychId: 'psych-2', psychName: 'Dr. Prakash Adhikari', psychPhone: '9841034567', esc: 1 },
    { id: 'demo-a7', vid: 'demo-v14',  pid: 'demo-p14', name: 'Prashant Karki',  risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', esc: 0 },
  ];

  for (const p of demoPatients) {
    if (!patients.find((x) => x.id === p.id)) {
      patients.push({ id: p.id, name: p.name, age: p.age, patient_type: p.type, address: p.address, phone: '', geo_lat: p.lat, geo_lng: p.lng, created_at: daysAgoTs(0) });
    }
  }

  for (const v of demoVisits) {
    if (!visits.find((x) => x.id === v.id)) {
      visits.push({ id: v.id, patient_id: v.pid, visit_date: daysAgoDate(v.days), risk_level: v.risk, risk_score: v.score, max_score: v.max, self_harm_flag: v.sh, physical_checks: '{}', screening_responses: '{}', notes: v.notes, synced: 0, created_at: daysAgoTs(v.days) });
    }
  }

  for (const a of demoAlerts) {
    if (!alerts.find((x) => x.id === a.id)) {
      alerts.push({ id: a.id, visit_id: a.vid, patient_id: a.pid, patient_name: a.name, risk_level: a.risk, status: 'sent', psychiatrist_id: a.psychId, psychiatrist_name: a.psychName, psychiatrist_phone: a.psychPhone, escalated: a.esc, notes: '', created_at: daysAgoTs(0) });
    }
  }
}
