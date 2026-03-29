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
  // Auto-seed demo data on first install (INSERT OR IGNORE — safe to re-run)
  seedDemoData();
}

// Initialize DB eagerly at module load so demo data is seeded before any screen renders
getDb();

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

export function assignPsychiatristToVisit({ visitId, patientId, patientName, riskLevel, psychiatrist }) {
  const db = getDb();
  const existing = db.getFirstSync('SELECT id FROM alerts WHERE visit_id = ?', [visitId]);
  const now = Date.now();
  if (existing) {
    db.runSync(
      'UPDATE alerts SET psychiatrist_id = ?, psychiatrist_name = ?, psychiatrist_phone = ?, status = ? WHERE id = ?',
      [psychiatrist.id, psychiatrist.name, psychiatrist.phone, 'sent', existing.id],
    );
    return { id: existing.id };
  }
  const alertId = uuid();
  db.runSync(
    `INSERT INTO alerts (id, visit_id, patient_id, patient_name, risk_level, status, psychiatrist_id, psychiatrist_name, psychiatrist_phone, escalated, notes, created_at)
     VALUES (?, ?, ?, ?, ?, 'sent', ?, ?, ?, 0, '', ?)`,
    [alertId, visitId, patientId, patientName, riskLevel || 'low', psychiatrist.id, psychiatrist.name, psychiatrist.phone, now],
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

export function getActiveAlertsForProfile() {
  const patients = getDb().getAllSync('SELECT * FROM patients ORDER BY created_at DESC');
  const visits = getDb().getAllSync('SELECT * FROM visits ORDER BY created_at DESC');

  const results = patients
    .map((p) => {
      const patientVisits = visits.filter((v) => v.patient_id === p.id);
      const latest = patientVisits[0];
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
        visitCount: patientVisits.length,
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
  const totalRow = getDb().getFirstSync('SELECT COUNT(*) as cnt FROM visits');
  const alertRow = getDb().getFirstSync(
    `SELECT COUNT(DISTINCT p.id) as cnt FROM patients p
     JOIN visits v ON v.patient_id = p.id
     WHERE v.risk_level IN ('high','critical')
     AND v.created_at = (SELECT MAX(v2.created_at) FROM visits v2 WHERE v2.patient_id = p.id)`,
  );
  const critRow = getDb().getFirstSync(
    `SELECT COUNT(DISTINCT p.id) as cnt FROM patients p
     JOIN visits v ON v.patient_id = p.id
     WHERE v.risk_level = 'critical'
     AND v.created_at = (SELECT MAX(v2.created_at) FROM visits v2 WHERE v2.patient_id = p.id)`,
  );
  return {
    totalVisits: totalRow?.cnt || 0,
    activeAlerts: alertRow?.cnt || 0,
    criticalAlerts: critRow?.cnt || 0,
  };
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
    { id: 'demo-p1',  name: 'Sita Sharma',      age: 28, type: 'postnatal', address: 'Kaski Ward 6',    lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p2',  name: 'Gita Rai',          age: 24, type: 'postnatal', address: 'Pokhara Ward 3',  lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p3',  name: 'Maya Thapa',        age: 30, type: 'postnatal', address: 'Gorkha Ward 4',   lat: 28.0005, lng: 84.6200 },
    { id: 'demo-p4',  name: 'Anita Gurung',      age: 22, type: 'postnatal', address: 'Lamjung Ward 2',  lat: 28.1500, lng: 84.4200 },
    { id: 'demo-p5',  name: 'Rajesh K.C.',       age: 16, type: 'youth',     address: 'Kaski Ward 8',    lat: 28.2096, lng: 83.9856 },
    { id: 'demo-p6',  name: 'Priya Magar',       age: 14, type: 'youth',     address: 'Syangja Ward 1',  lat: 28.0800, lng: 83.8800 },
    { id: 'demo-p7',  name: 'Kopila Shrestha',   age: 26, type: 'postnatal', address: 'Tanahu Ward 3',   lat: 27.9000, lng: 84.0000 },
    { id: 'demo-p8',  name: 'Aarav Tamang',      age: 17, type: 'youth',     address: 'Baglung Ward 2',  lat: 28.2700, lng: 83.5900 },
    { id: 'demo-p9',  name: 'Nirmala Adhikari',  age: 26, type: 'postnatal', address: 'Pokhara Ward 5',  lat: 28.2100, lng: 83.9900 },
    { id: 'demo-p10', name: 'Sunita Pun',        age: 31, type: 'postnatal', address: 'Syangja Ward 3',  lat: 28.0750, lng: 83.8700 },
    { id: 'demo-p11', name: 'Rahul Bhattarai',   age: 15, type: 'youth',     address: 'Kaski Ward 2',    lat: 28.2050, lng: 83.9750 },
    { id: 'demo-p12', name: 'Sarita Khadka',     age: 27, type: 'postnatal', address: 'Gorkha Ward 1',   lat: 27.9950, lng: 84.6100 },
    { id: 'demo-p13', name: 'Deepa Malla',       age: 23, type: 'postnatal', address: 'Tanahu Ward 7',   lat: 27.8900, lng: 84.0100 },
    { id: 'demo-p14', name: 'Prashant Karki',    age: 13, type: 'youth',     address: 'Lamjung Ward 5',  lat: 28.1400, lng: 84.4100 },
  ];

  const allVisits = [
    // Sita Sharma — stable low risk (3 visits)
    { id: 'demo-v1',   pid: 'demo-p1',  risk: 'low',      score: 5,  maxScore: 30, selfHarm: 0, daysAgo: 0,  notes: 'Patient appears well. Baby feeding regularly. Husband supportive. No concerns at this time.' },
    { id: 'demo-v1b',  pid: 'demo-p1',  risk: 'low',      score: 6,  maxScore: 30, selfHarm: 0, daysAgo: 35, notes: 'First postnatal home visit at 6 weeks. Mother adjusting well. Baby healthy.' },
    { id: 'demo-v1c',  pid: 'demo-p1',  risk: 'low',      score: 4,  maxScore: 30, selfHarm: 0, daysAgo: 70, notes: 'Pre-discharge check. Patient in good spirits. Strong family support.' },
    // Gita Rai — moderate, improving (3 visits)
    { id: 'demo-v2',   pid: 'demo-p2',  risk: 'moderate', score: 11, maxScore: 30, selfHarm: 0, daysAgo: 1,  notes: 'Occasional sadness, low energy. Husband migrated to Qatar. Advised community support group.' },
    { id: 'demo-v2b',  pid: 'demo-p2',  risk: 'low',      score: 7,  maxScore: 30, selfHarm: 0, daysAgo: 30, notes: 'Improvement noted. Mother-in-law helping with childcare. Follow-up in 4 weeks.' },
    { id: 'demo-v2c',  pid: 'demo-p2',  risk: 'low',      score: 5,  maxScore: 30, selfHarm: 0, daysAgo: 60, notes: 'Initial screening. Patient well. Good social support from neighbors.' },
    // Maya Thapa — deteriorating to high (4 visits)
    { id: 'demo-v3',   pid: 'demo-p3',  risk: 'high',     score: 17, maxScore: 30, selfHarm: 0, daysAgo: 2,  notes: 'Patient tearful. Difficulty sleeping, overwhelmed with newborn. Mother-in-law conflict. Psychiatric nurse alerted.' },
    { id: 'demo-v3b',  pid: 'demo-p3',  risk: 'moderate', score: 12, maxScore: 30, selfHarm: 0, daysAgo: 14, notes: 'More withdrawn. Insomnia and reduced appetite. Husband working in Pokhara. Earlier follow-up scheduled.' },
    { id: 'demo-v3c',  pid: 'demo-p3',  risk: 'low',      score: 8,  maxScore: 30, selfHarm: 0, daysAgo: 35, notes: 'Routine 6-week check. Tired but managing. Advised community mothers\' group.' },
    { id: 'demo-v3d',  pid: 'demo-p3',  risk: 'low',      score: 4,  maxScore: 30, selfHarm: 0, daysAgo: 70, notes: 'Initial postnatal visit. Mother recovering well. Strong extended family.' },
    // Anita Gurung — critical self-harm history (4 visits)
    { id: 'demo-v4',   pid: 'demo-p4',  risk: 'critical', score: 22, maxScore: 30, selfHarm: 1, daysAgo: 3,  notes: 'Patient disclosed self-harm thoughts. Crisis protocol followed — stayed until family arrived. Emergency referral made.' },
    { id: 'demo-v4b',  pid: 'demo-p4',  risk: 'high',     score: 19, maxScore: 30, selfHarm: 0, daysAgo: 14, notes: 'Significant decline. Unable to care for baby alone. Mother-in-law called. District nurse alerted.' },
    { id: 'demo-v4c',  pid: 'demo-p4',  risk: 'moderate', score: 13, maxScore: 30, selfHarm: 0, daysAgo: 28, notes: 'Tearful and lonely. Husband away for work. Community support group suggested.' },
    { id: 'demo-v4d',  pid: 'demo-p4',  risk: 'low',      score: 6,  maxScore: 30, selfHarm: 0, daysAgo: 56, notes: 'Post-delivery check. Patient healthy, good spirits. Strong family support.' },
    // Rajesh KC — stable low (3 visits)
    { id: 'demo-v5',   pid: 'demo-p5',  risk: 'low',      score: 4,  maxScore: 27, selfHarm: 0, daysAgo: 0,  notes: 'Healthy and engaged. Active in school football. Good family support.' },
    { id: 'demo-v5b',  pid: 'demo-p5',  risk: 'low',      score: 5,  maxScore: 27, selfHarm: 0, daysAgo: 35, notes: 'Good academic performance. No concerns. Follow-up in 6 weeks.' },
    { id: 'demo-v5c',  pid: 'demo-p5',  risk: 'low',      score: 3,  maxScore: 27, selfHarm: 0, daysAgo: 70, notes: 'Initial screening. Student cheerful and cooperative.' },
    // Priya Magar — youth persistent moderate (3 visits)
    { id: 'demo-v6',   pid: 'demo-p6',  risk: 'moderate', score: 9,  maxScore: 27, selfHarm: 0, daysAgo: 4,  notes: 'Withdrawn. Teacher reports declining grades. Parents unaware. Family counseling suggested.' },
    { id: 'demo-v6b',  pid: 'demo-p6',  risk: 'moderate', score: 10, maxScore: 27, selfHarm: 0, daysAgo: 30, notes: 'Quieter than usual. Difficulty concentrating. Sleep issues mentioned.' },
    { id: 'demo-v6c',  pid: 'demo-p6',  risk: 'low',      score: 5,  maxScore: 27, selfHarm: 0, daysAgo: 65, notes: 'Initial screening at start of year. Student doing well — active in volleyball.' },
    // Kopila Shrestha — high risk, recovering (3 visits)
    { id: 'demo-v7',   pid: 'demo-p7',  risk: 'high',     score: 15, maxScore: 30, selfHarm: 0, daysAgo: 5,  notes: 'Very anxious about household debt. Not sleeping. Refusing to eat. District nurse notified.' },
    { id: 'demo-v7b',  pid: 'demo-p7',  risk: 'moderate', score: 11, maxScore: 30, selfHarm: 0, daysAgo: 21, notes: 'Mild improvement. Husband found part-time work. Follow-up in 2 weeks.' },
    { id: 'demo-v7c',  pid: 'demo-p7',  risk: 'low',      score: 6,  maxScore: 30, selfHarm: 0, daysAgo: 56, notes: 'Post-delivery check at 6 weeks. Patient healthy. Husband supportive.' },
    // Aarav Tamang — stable low (2 visits)
    { id: 'demo-v8',   pid: 'demo-p8',  risk: 'low',      score: 3,  maxScore: 27, selfHarm: 0, daysAgo: 6,  notes: 'Cooperative and cheerful. Good appetite and sleep. Follow-up in 6 weeks.' },
    { id: 'demo-v8b',  pid: 'demo-p8',  risk: 'low',      score: 4,  maxScore: 27, selfHarm: 0, daysAgo: 42, notes: 'Initial screening. No concerns.' },
    // Nirmala Adhikari — gradual recovery (4 visits)
    { id: 'demo-v9',   pid: 'demo-p9',  risk: 'low',      score: 7,  maxScore: 30, selfHarm: 0, daysAgo: 3,  notes: 'Good progress. Patient smiling. Baby gaining weight. Husband more involved at home.' },
    { id: 'demo-v9b',  pid: 'demo-p9',  risk: 'low',      score: 8,  maxScore: 30, selfHarm: 0, daysAgo: 17, notes: 'Continued improvement. Joined mothers\' support group at health post.' },
    { id: 'demo-v9c',  pid: 'demo-p9',  risk: 'moderate', score: 11, maxScore: 30, selfHarm: 0, daysAgo: 31, notes: 'Some difficulty adjusting. Feeling isolated — neighbors not supportive. Referred to support group.' },
    { id: 'demo-v9d',  pid: 'demo-p9',  risk: 'moderate', score: 12, maxScore: 30, selfHarm: 0, daysAgo: 50, notes: 'Initial check. Mild low mood. Follow-up in 2 weeks.' },
    // Sunita Pun — deterioration: low → moderate → high (3 visits)
    { id: 'demo-v10',  pid: 'demo-p10', risk: 'high',     score: 14, maxScore: 30, selfHarm: 0, daysAgo: 1,  notes: 'Significant deterioration. Patient crying throughout. Husband gambling, absent. Urgent district nurse referral.' },
    { id: 'demo-v10b', pid: 'demo-p10', risk: 'moderate', score: 10, maxScore: 30, selfHarm: 0, daysAgo: 21, notes: 'Increasing anxiety. Financial stress. Husband behavior erratic.' },
    { id: 'demo-v10c', pid: 'demo-p10', risk: 'low',      score: 5,  maxScore: 30, selfHarm: 0, daysAgo: 50, notes: 'Initial check post-delivery. Patient in reasonable spirits. Baby healthy.' },
    // Rahul Bhattarai — persistent moderate youth (4 visits)
    { id: 'demo-v11',  pid: 'demo-p11', risk: 'moderate', score: 9,  maxScore: 27, selfHarm: 0, daysAgo: 2,  notes: 'Social withdrawal. Avoids group activities. Teacher concerned.' },
    { id: 'demo-v11b', pid: 'demo-p11', risk: 'moderate', score: 8,  maxScore: 27, selfHarm: 0, daysAgo: 30, notes: 'Mild improvement but still quiet. Enjoys drawing. Art therapy suggested to parents.' },
    { id: 'demo-v11c', pid: 'demo-p11', risk: 'moderate', score: 10, maxScore: 27, selfHarm: 0, daysAgo: 60, notes: 'Persistent low mood. Parents divorced last year — major impact.' },
    { id: 'demo-v11d', pid: 'demo-p11', risk: 'low',      score: 4,  maxScore: 27, selfHarm: 0, daysAgo: 90, notes: 'Initial screening. Quiet but seemed okay. Recommended monitoring.' },
    // Sarita Khadka — critical history, now recovering (4 visits)
    { id: 'demo-v12',  pid: 'demo-p12', risk: 'moderate', score: 10, maxScore: 30, selfHarm: 0, daysAgo: 7,  notes: 'Recovery progressing. Patient laughing with mother today. Much better than previous visit.' },
    { id: 'demo-v12b', pid: 'demo-p12', risk: 'high',     score: 16, maxScore: 30, selfHarm: 0, daysAgo: 21, notes: 'Still distressed but no self-harm ideation. Continues psychiatric follow-up. Husband supportive.' },
    { id: 'demo-v12c', pid: 'demo-p12', risk: 'critical', score: 24, maxScore: 30, selfHarm: 1, daysAgo: 35, notes: 'Patient in crisis. Expressed wish to "not be here anymore." Stayed 2 hours. Emergency protocol. Family and psychiatrist contacted.' },
    { id: 'demo-v12d', pid: 'demo-p12', risk: 'moderate', score: 13, maxScore: 30, selfHarm: 0, daysAgo: 56, notes: 'First visit after delivery. Very anxious — baby admitted to NICU briefly.' },
    // Deepa Malla — stable low (3 visits)
    { id: 'demo-v13',  pid: 'demo-p13', risk: 'low',      score: 4,  maxScore: 30, selfHarm: 0, daysAgo: 8,  notes: 'Excellent spirits. Breastfeeding going well. Husband very involved. No concerns.' },
    { id: 'demo-v13b', pid: 'demo-p13', risk: 'low',      score: 5,  maxScore: 30, selfHarm: 0, daysAgo: 42, notes: 'Good adjustment to motherhood. Extended family support. Follow-up in 6 weeks.' },
    { id: 'demo-v13c', pid: 'demo-p13', risk: 'low',      score: 3,  maxScore: 30, selfHarm: 0, daysAgo: 80, notes: 'Initial check. Healthy delivery. Patient and family well-prepared.' },
    // Prashant Karki — escalating youth concern (4 visits)
    { id: 'demo-v14',  pid: 'demo-p14', risk: 'high',     score: 15, maxScore: 27, selfHarm: 0, daysAgo: 1,  notes: 'Refusing school. Not left his room in 3 days. Parents alarmed. Urgent referral to health post.' },
    { id: 'demo-v14b', pid: 'demo-p14', risk: 'moderate', score: 11, maxScore: 27, selfHarm: 0, daysAgo: 21, notes: 'Worsening. Reports bullying at school. Sleeps excessively. Parents agreed to seek professional help.' },
    { id: 'demo-v14c', pid: 'demo-p14', risk: 'moderate', score: 9,  maxScore: 27, selfHarm: 0, daysAgo: 50, notes: 'Becoming quieter. Frequent stomach aches — possible somatization.' },
    { id: 'demo-v14d', pid: 'demo-p14', risk: 'low',      score: 4,  maxScore: 27, selfHarm: 0, daysAgo: 90, notes: 'Initial screening. Student happy and active in classroom.' },
  ];

  const demoAlerts = [
    { id: 'demo-a1',  visitId: 'demo-v3',   pid: 'demo-p3',  name: 'Maya Thapa',      risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
    { id: 'demo-a2',  visitId: 'demo-v4',   pid: 'demo-p4',  name: 'Anita Gurung',    risk: 'critical', psychId: 'psych-2', psychName: 'Dr. Prakash Adhikari', psychPhone: '9841034567', escalated: 1 },
    { id: 'demo-a3',  visitId: 'demo-v7',   pid: 'demo-p7',  name: 'Kopila Shrestha', risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
    { id: 'demo-a4',  visitId: 'demo-v4b',  pid: 'demo-p4',  name: 'Anita Gurung',    risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
    { id: 'demo-a5',  visitId: 'demo-v10',  pid: 'demo-p10', name: 'Sunita Pun',      risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
    { id: 'demo-a6',  visitId: 'demo-v12c', pid: 'demo-p12', name: 'Sarita Khadka',   risk: 'critical', psychId: 'psych-2', psychName: 'Dr. Prakash Adhikari', psychPhone: '9841034567', escalated: 1 },
    { id: 'demo-a7',  visitId: 'demo-v14',  pid: 'demo-p14', name: 'Prashant Karki',  risk: 'high',     psychId: 'psych-1', psychName: 'Dr. Sushila Thapa',    psychPhone: '9856021345', escalated: 0 },
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

  for (const v of allVisits) {
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
