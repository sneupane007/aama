import * as SQLite from 'expo-sqlite';

let db = null;

function getDb() {
  if (!db) {
    db = SQLite.openDatabaseSync('aama.db');
    initTables();
  }
  return db;
}

function initTables() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      patient_type TEXT,
      address TEXT,
      phone TEXT,
      geo_lat REAL,
      geo_lng REAL,
      created_at INTEGER
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      visit_date TEXT,
      risk_level TEXT,
      risk_score INTEGER,
      max_score INTEGER,
      self_harm_flag INTEGER DEFAULT 0,
      physical_checks TEXT,
      screening_responses TEXT,
      synced INTEGER DEFAULT 0,
      created_at INTEGER
    );
  `);
  db.execSync(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      visit_id TEXT,
      patient_id TEXT,
      patient_name TEXT,
      risk_level TEXT,
      status TEXT,
      psychiatrist_id TEXT,
      psychiatrist_name TEXT,
      psychiatrist_phone TEXT,
      escalated INTEGER DEFAULT 0,
      notes TEXT,
      created_at INTEGER
    );
  `);
  // Migration: add notes column for volunteer session notes
  try { db.execSync('ALTER TABLE visits ADD COLUMN notes TEXT DEFAULT ""'); } catch {}
}

function uuid() {
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
}

export function getTodayVisits() {
  const today = new Date().toISOString().split('T')[0];
  return getDb().getAllSync('SELECT * FROM visits WHERE visit_date = ?', [today]);
}

export function getUnsyncedCount() {
  const row = getDb().getFirstSync('SELECT COUNT(*) as cnt FROM visits WHERE synced = 0');
  return row?.cnt || 0;
}

export function getAllPatientsWithRisk() {
  const patients = getDb().getAllSync('SELECT * FROM patients ORDER BY created_at DESC');
  const visits = getDb().getAllSync('SELECT * FROM visits ORDER BY created_at DESC');

  return patients.map((p) => {
    const patientVisits = visits.filter((v) => v.patient_id === p.id);
    const latest = patientVisits[0] || null;
    return {
      id: p.id,
      name: p.name,
      age: p.age,
      patientType: p.patient_type,
      address: p.address,
      phone: p.phone,
      visitCount: patientVisits.length,
      latestVisit: latest ? { ...latest, createdAt: latest.created_at, riskLevel: latest.risk_level } : null,
      latestRisk: latest?.risk_level || null,
      createdAt: p.created_at,
    };
  });
}

export function getHighRiskCount() {
  const row = getDb().getFirstSync(`
    SELECT COUNT(DISTINCT p.id) as cnt FROM patients p
    JOIN visits v ON v.patient_id = p.id
    WHERE v.risk_level IN ('high','critical')
    AND v.created_at = (SELECT MAX(v2.created_at) FROM visits v2 WHERE v2.patient_id = p.id)
  `);
  return row?.cnt || 0;
}

export function getRecentAlerts(limit = 10) {
  return getDb().getAllSync('SELECT * FROM alerts ORDER BY created_at DESC LIMIT ?', [limit]);
}

export function getPatientById(id) {
  return getDb().getFirstSync('SELECT * FROM patients WHERE id = ?', [id]);
}

export function getVisitsByPatient(patientId) {
  return getDb().getAllSync(
    'SELECT * FROM visits WHERE patient_id = ? ORDER BY created_at DESC',
    [patientId],
  );
}

export function getAlertByVisit(visitId) {
  return getDb().getFirstSync('SELECT * FROM alerts WHERE visit_id = ?', [visitId]);
}

export function saveVisit({ patient, physicalChecks, screeningResponses, riskResult, geoLocation, notes = '' }) {
  const d = getDb();
  const patientId = uuid();
  const visitId = uuid();
  const now = Date.now();

  d.runSync(
    `INSERT INTO patients (id, name, age, patient_type, address, phone, geo_lat, geo_lng, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patientId,
      patient.name,
      patient.age,
      patient.type,
      patient.address,
      patient.phone || '',
      geoLocation?.lat || 0,
      geoLocation?.lng || 0,
      now,
    ],
  );

  d.runSync(
    `INSERT INTO visits (id, patient_id, visit_date, risk_level, risk_score, max_score, self_harm_flag, physical_checks, screening_responses, notes, synced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      visitId,
      patientId,
      new Date().toISOString().split('T')[0],
      riskResult.riskLevel,
      riskResult.score,
      riskResult.maxScore,
      riskResult.selfHarmFlag ? 1 : 0,
      JSON.stringify(physicalChecks),
      JSON.stringify(screeningResponses),
      notes,
      now,
    ],
  );

  return { patient: { id: patientId, name: patient.name }, visit: { id: visitId } };
}

export function createAlertRecord({ visitId, patientId, patientName, riskLevel, psychiatrist }) {
  const alertId = uuid();
  const now = Date.now();

  getDb().runSync(
    `INSERT INTO alerts (id, visit_id, patient_id, patient_name, risk_level, status, psychiatrist_id, psychiatrist_name, psychiatrist_phone, escalated, notes, created_at)
     VALUES (?, ?, ?, ?, ?, 'sent', ?, ?, ?, 0, '', ?)`,
    [
      alertId,
      visitId,
      patientId,
      patientName,
      riskLevel,
      psychiatrist?.id || '',
      psychiatrist?.name || '',
      psychiatrist?.phone || '',
      now,
    ],
  );

  return { id: alertId };
}

export function escalateAlert(alertId, notes) {
  getDb().runSync('UPDATE alerts SET escalated = 1, status = ?, notes = ? WHERE id = ?', [
    'escalated',
    notes,
    alertId,
  ]);
}

export function hasDemoData() {
  const row = getDb().getFirstSync('SELECT COUNT(*) as cnt FROM patients');
  return (row?.cnt || 0) > 0;
}

export function seedDemoData() {
  const db = getDb();
  const now = Date.now();

  function daysAgoDate(n) {
    return new Date(now - n * 86400000).toISOString().split('T')[0];
  }
  function daysAgoTs(n) {
    return now - n * 86400000;
  }

  const patients = [
    { id: 'demo-p1', name: 'Sita Sharma', age: 28, type: 'postnatal', address: 'Kaski Ward 6', lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p2', name: 'Gita Rai', age: 24, type: 'postnatal', address: 'Pokhara Ward 3', lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p3', name: 'Maya Thapa', age: 30, type: 'postnatal', address: 'Gorkha Ward 4', lat: 28.0005, lng: 84.6200 },
    { id: 'demo-p4', name: 'Anita Gurung', age: 22, type: 'postnatal', address: 'Lamjung Ward 2', lat: 28.1500, lng: 84.4200 },
    { id: 'demo-p5', name: 'Rajesh K.C.', age: 16, type: 'youth', address: 'Kaski Ward 8', lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p6', name: 'Priya Magar', age: 14, type: 'youth', address: 'Syangja Ward 1', lat: 28.0800, lng: 83.8800 },
    { id: 'demo-p7', name: 'Kopila Shrestha', age: 26, type: 'postnatal', address: 'Tanahu Ward 3', lat: 27.9000, lng: 84.0000 },
    { id: 'demo-p8', name: 'Aarav Tamang', age: 17, type: 'youth', address: 'Baglung Ward 2', lat: 28.2700, lng: 83.5900 },
  ];

  const visits = [
    { id: 'demo-v1', pid: 'demo-p1', risk: 'low',     score: 5,  maxScore: 30, selfHarm: 0, daysAgo: 0, notes: 'Patient appears well. Baby feeding regularly. Husband supportive. No concerns at this time.' },
    { id: 'demo-v2', pid: 'demo-p2', risk: 'moderate', score: 11, maxScore: 30, selfHarm: 0, daysAgo: 1, notes: 'Patient reported occasional sadness and low energy. Husband migrated to Qatar last month. Advised community support group and scheduled 2-week follow-up.' },
    { id: 'demo-v3', pid: 'demo-p3', risk: 'high',     score: 17, maxScore: 30, selfHarm: 0, daysAgo: 2, notes: 'Patient became tearful during visit. Reports difficulty sleeping and feeling overwhelmed with newborn. Mother-in-law conflict mentioned. Psychiatric nurse alerted.' },
    { id: 'demo-v4', pid: 'demo-p4', risk: 'critical', score: 22, maxScore: 30, selfHarm: 1, daysAgo: 3, notes: 'Patient disclosed thoughts of self-harm. Did not elaborate further. Crisis protocol followed — stayed with patient until family member arrived. Emergency referral made.' },
    { id: 'demo-v5', pid: 'demo-p5', risk: 'low',      score: 4,  maxScore: 27, selfHarm: 0, daysAgo: 0, notes: 'Student appears healthy and engaged. Active in school football team. Good family support. No concerns.' },
    { id: 'demo-v6', pid: 'demo-p6', risk: 'moderate', score: 9,  maxScore: 27, selfHarm: 0, daysAgo: 4, notes: 'Student seems withdrawn compared to previous visit. Teacher mentioned declining grades. Parents unaware. Suggested family counseling session at health post.' },
    { id: 'demo-v7', pid: 'demo-p7', risk: 'high',     score: 15, maxScore: 30, selfHarm: 0, daysAgo: 5, notes: 'Patient very anxious about household debt. Not sleeping more than 3 hours. Refuses to eat some days. High distress — district nurse notified and follow-up in 7 days.' },
    { id: 'demo-v8', pid: 'demo-p8', risk: 'low',      score: 3,  maxScore: 27, selfHarm: 0, daysAgo: 6, notes: 'Adolescent cooperative and cheerful. Good appetite and sleep. Family environment stable. Routine follow-up in 6 weeks.' },
  ];

  // Additional historical visits to show patient progression
  const extraVisits = [
    { id: 'demo-v1b', pid: 'demo-p1', risk: 'low',      score: 6,  maxScore: 30, selfHarm: 0, daysAgo: 35,  notes: 'First postnatal home visit at 6 weeks. Mother adjusting to newborn. Baby feeding regularly. Husband supportive.' },
    { id: 'demo-v1c', pid: 'demo-p1', risk: 'low',      score: 4,  maxScore: 30, selfHarm: 0, daysAgo: 70,  notes: 'Pre-discharge check at 3 days post-birth. Patient in good spirits. Strong family support present.' },
    { id: 'demo-v3b', pid: 'demo-p3', risk: 'moderate',  score: 12, maxScore: 30, selfHarm: 0, daysAgo: 14,  notes: 'Patient seems more withdrawn than last visit. Reports insomnia and reduced appetite. Husband now working in Pokhara. Scheduled earlier follow-up.' },
    { id: 'demo-v3c', pid: 'demo-p3', risk: 'low',      score: 8,  maxScore: 30, selfHarm: 0, daysAgo: 35,  notes: 'Routine 6-week check. Patient tired but managing. No major concerns. Advised on community mother\'s group.' },
    { id: 'demo-v4b', pid: 'demo-p4', risk: 'high',     score: 19, maxScore: 30, selfHarm: 0, daysAgo: 14,  notes: 'Significant decline in wellbeing. Patient unable to care for baby alone. Mother-in-law called in to help. District nurse alerted immediately.' },
    { id: 'demo-v4c', pid: 'demo-p4', risk: 'moderate',  score: 13, maxScore: 30, selfHarm: 0, daysAgo: 28,  notes: 'Patient tearful and emotional. Reports feeling lonely and unsupported. Husband away for work. Advised community support group. Follow-up in 2 weeks.' },
    { id: 'demo-v6b', pid: 'demo-p6', risk: 'low',      score: 5,  maxScore: 27, selfHarm: 0, daysAgo: 35,  notes: 'Initial screening at start of academic year. Student doing well — good grades, active in school volleyball team.' },
    { id: 'demo-v7b', pid: 'demo-p7', risk: 'low',      score: 6,  maxScore: 30, selfHarm: 0, daysAgo: 35,  notes: 'Post-delivery check at 6 weeks. Patient healthy and recovering well. Husband present and supportive.' },
  ];

  for (const v of extraVisits) {
    try {
      db.runSync(
        `INSERT OR REPLACE INTO visits (id, patient_id, visit_date, risk_level, risk_score, max_score, self_harm_flag, physical_checks, screening_responses, notes, synced, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '{}', '{}', ?, 0, ?)`,
        [v.id, v.pid, daysAgoDate(v.daysAgo), v.risk, v.score, v.maxScore, v.selfHarm, v.notes, daysAgoTs(v.daysAgo)],
      );
    } catch {}
  }

  // Additional alert for escalated visit
  const extraAlerts = [
    { id: 'demo-a4', visitId: 'demo-v4b', pid: 'demo-p4', name: 'Anita Gurung', risk: 'high', psychId: 'psych-1', psychName: 'Dr. Sushila Thapa', psychPhone: '9856021345', escalated: 0 },
  ];
  for (const a of extraAlerts) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO alerts (id, visit_id, patient_id, patient_name, risk_level, status, psychiatrist_id, psychiatrist_name, psychiatrist_phone, escalated, notes, created_at)
         VALUES (?, ?, ?, ?, ?, 'sent', ?, ?, ?, ?, '', ?)`,
        [a.id, a.visitId, a.pid, a.name, a.risk, a.psychId, a.psychName, a.psychPhone, a.escalated, daysAgoTs(0)],
      );
    } catch {}
  }

  const demoAlerts = [
    { id: 'demo-a1', visitId: 'demo-v3', pid: 'demo-p3', name: 'Maya Thapa', risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
    { id: 'demo-a2', visitId: 'demo-v4', pid: 'demo-p4', name: 'Anita Gurung', risk: 'critical', psychId: 'psych-2', psychName: 'Dr. Prakash Adhikari', psychPhone: '9841034567', escalated: 1 },
    { id: 'demo-a3', visitId: 'demo-v7', pid: 'demo-p7', name: 'Kopila Shrestha', risk: 'high',  psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
  ];

  for (const p of patients) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO patients (id, name, age, patient_type, address, phone, geo_lat, geo_lng, created_at)
         VALUES (?, ?, ?, ?, ?, '', ?, ?, ?)`,
        [p.id, p.name, p.age, p.type, p.address, p.lat, p.lng, daysAgoTs(0)],
      );
    } catch {}
  }

  for (const v of visits) {
    try {
      db.runSync(
        `INSERT OR REPLACE INTO visits (id, patient_id, visit_date, risk_level, risk_score, max_score, self_harm_flag, physical_checks, screening_responses, notes, synced, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, '{}', '{}', ?, 0, ?)`,
        [v.id, v.pid, daysAgoDate(v.daysAgo), v.risk, v.score, v.maxScore, v.selfHarm, v.notes, daysAgoTs(v.daysAgo)],
      );
    } catch {}
  }

  for (const a of demoAlerts) {
    try {
      db.runSync(
        `INSERT OR IGNORE INTO alerts (id, visit_id, patient_id, patient_name, risk_level, status, psychiatrist_id, psychiatrist_name, psychiatrist_phone, escalated, notes, created_at)
         VALUES (?, ?, ?, ?, ?, 'sent', ?, ?, ?, ?, '', ?)`,
        [a.id, a.visitId, a.pid, a.name, a.risk, a.psychId, a.psychName, a.psychPhone, a.escalated, daysAgoTs(0)],
      );
    } catch {}
  }
}
