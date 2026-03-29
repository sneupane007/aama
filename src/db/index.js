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

export function saveVisit({ patient, physicalChecks, screeningResponses, riskResult, geoLocation }) {
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
    `INSERT INTO visits (id, patient_id, visit_date, risk_level, risk_score, max_score, self_harm_flag, physical_checks, screening_responses, synced, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
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
