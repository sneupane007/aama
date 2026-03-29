# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npm start

# Run on specific platform (requires native build)
npm run ios
npm run android

# Generate native projects (required before first platform run)
npx expo prebuild
```

No lint or test scripts are configured.

## Architecture

**AAMA सखी** is an offline-first React Native (Expo) mobile app for Nepal's Female Community Health Volunteers (FCHVs) to conduct mental health screenings during routine home visits.

### Key Design Decisions

- **Offline-first:** All data stored in SQLite locally; no backend required during visits.
- **Transparent clinical approach:** Volunteers explicitly disclose to patients that the visit includes a mental health check, using a soft and reassuring tone. The validated EPDS (postnatal) and PHQ-A (adolescents 12-19) questions are shown as-is — no masking.
- **Bilingual:** English ↔ Nepali via `I18nProvider` context wrapping the entire app. Default language is Nepali.

### Layer Overview

```
App.js
└── I18nProvider (src/utils/i18n.js)       ← translation context, persisted via AsyncStorage
    └── LoginScreen                         ← FCHV credential gate (frontend-only, no backend)
        └── AppNavigator (src/navigation/)  ← React Navigation bottom tabs (5 tabs)
            ├── HomeScreen                  ← dashboard: stats, recent visits
            ├── NewVisitScreen              ← 4-step form: patient info → physical health → wellness Qs → results
            ├── PatientsScreen              ← patient list with risk-level filter; tap → PatientDetailScreen
            ├── ConsultScreen               ← two tabs: call specialists / volunteer self-wellbeing request
            └── SettingsScreen              ← volunteer profile, quick links, privacy info, language toggle, sync
```

### Data Flow for a Visit

1. `NewVisitScreen` collects patient info and screening responses
2. `src/utils/riskEngine.js` scores EPDS (0-30) or PHQ-A (0-27) and assigns risk level (low/moderate/high/critical)
3. Self-harm questions (EPDS Q10, PHQ-A Q9) trigger CRITICAL override regardless of total score
4. `src/utils/alertService.js` auto-routes high/critical cases to nearest psychiatrist by district
5. All data written to SQLite via `src/db/index.js` (tables: `patients`, `visits`, `alerts`)

### Database Schema (SQLite)

- `patients`: id, name, age, patient_type (`postnatal`|`youth`), address, phone, geo_lat, geo_lng
- `visits`: id, patient_id, visit_date, risk_level, risk_score, max_score, self_harm_flag, physical_checks (JSON), screening_responses (JSON), notes, synced, created_at
- `alerts`: id, visit_id, patient_id, patient_name, risk_level, status, psychiatrist_id/name/phone, escalated, notes, created_at

### Risk Thresholds

| Scale | Low | Moderate | High | Critical |
|-------|-----|----------|------|----------|
| EPDS (postnatal) | 0-9 | 10-12 | 13+ | Q10 self-harm |
| PHQ-A ages 12-14 | — | — | ≥13 | Q9 self-harm |
| PHQ-A ages 15-19 | — | — | ≥11 | Q9 self-harm |

## Gotchas

- **iOS simulator haptic noise:** `[CoreHaptics] CHHapticPattern.mm:487` errors about missing `hapticpatternlibrary.plist` are simulator-only noise — not an app bug. Safe to ignore.
- **`screenOptions` navigation access:** Tab.Navigator `screenOptions` must destructure `navigation` explicitly — `screenOptions={({ route, navigation }) => ({` — to use it in `headerRight` or similar callbacks.
- **District must be English:** `AsyncStorage` key `fchv-district` must store the English district name (e.g. `"Kaski"`, not `"कास्की"`). `findNearestPsychiatrist()` in `alertService.js` compares against English strings only. `LoginScreen.js` always saves `match.district` (never `match.districtNe`).
- **Demo data:** `seedDemoData()` in `src/db/index.js` uses `INSERT OR IGNORE` / `INSERT OR REPLACE`. Re-running does not duplicate records. Called at end of `initTables()` — safe to re-run on every DB open.
- **Session keys (AsyncStorage):** `fchv-session` (volunteer JSON), `fchv-district` (English district), `fchv-lang` (`"en"` | `"ne"`).
- **Psychiatrist assignment:** Any visit can have a psychiatrist assigned at any time via `assignPsychiatristToVisit()` — no appointment needed. Uses upsert (UPDATE existing alert or INSERT new one).
- **`useFocusEffect`:** Profile (SettingsScreen) and PatientsScreen use `useFocusEffect` to reload data on tab focus — not `useEffect`.

### Key Files

- `src/screens/LoginScreen.js` — FCHV credential gate; demo volunteers defined here
- `src/screens/PatientDetailScreen.js` — per-patient visit history + psychiatrist assignment modal
- `src/data/demoPsychiatrists.js` — psychiatrist roster used for assignment and consult screens
- `src/data/physicalHealth.js` — physical health check question definitions
- `src/utils/riskEngine.js` — scoring logic and thresholds
- `src/utils/alertService.js` — psychiatrist matching and escalation
- `src/utils/i18n.js` — all translation strings; export is `useTranslation()` (alias: `useI18n`)
- `src/theme/index.js` — COLORS, SIZES, shared styles (teal primary: `#0f766e`)
- `src/db/index.js` — SQLite init and all query functions
- `src/data/epds.js`, `src/data/phqa.js` — question banks
- `src/components/SOSOverlay.js` — fullscreen critical alert (cannot be accidentally dismissed)
