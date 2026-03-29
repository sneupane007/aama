# AAMA सखी — Accessible Antenatal Mental-health Assessment

> **Offline-first mobile mental health screening for Nepal's 50,000+ Female Community Health Volunteers**

[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](LICENSE)
[![React Native](https://img.shields.io/badge/React%20Native-0.76-61dafb.svg)](https://reactnative.dev/)
[![WatermelonDB](https://img.shields.io/badge/WatermelonDB-SQLite-14b8a6.svg)](https://watermelondb.dev/)

---

## The Problem

- **90% of Nepal's rural population** will never see a psychiatrist
- Nepal has **50,000+ FCHVs** who visit every new mother and youth — but only check physical health
- **Suicide is the leading cause of death** for women of reproductive age in Nepal
- Mental health risk goes **completely undetected** during routine FCHV visits

## The Solution

**AAMA** (आमा = "mother" in Nepali) subtly integrates validated psychological triage into the FCHV's existing physical health checklist. The FCHV doesn't need to know psychiatry — the app does the clinical thinking.

### How It Works

1. **FCHV opens app** on phone during a home visit
2. **Physical checklist** — vaccines, vitals, vitamins (the routine they already know)
3. **"Wellness questions"** — EPDS/PHQ-A questions masked as general health inquiries
4. **Risk score** — calculated on-device instantly, color-coded green/yellow/red
5. **Hybrid alert** — auto-routes to nearest psychiatrist + manual escalation options

## Key Features

| Feature | Description |
|---|---|
| **Offline-First** | All data stored locally in WatermelonDB (SQLite) |
| **Validated Instruments** | Edinburgh Postnatal Depression Scale (EPDS) + PHQ-A for adolescents |
| **Masked Questions** | Mental health questions disguised as general wellness inquiries |
| **Self-Harm Detection** | EPDS Q10 / PHQ-A Q9 triggers immediate SOS alert with crisis hotline |
| **Bilingual** | Full English ↔ नेपाली toggle (Nepali default) |
| **Geolocation** | Auto-captures visit location for regional mapping |
| **Hybrid Alerts** | Auto-routes to nearest psychiatrist + manual contact/escalation |
| **Volunteer Guide** | Training modules, emergency numbers, mental health resources |
| **Simple UI** | Large touch targets, color-coded, designed for less-educated volunteers |

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native + Expo |
| **Offline Storage** | WatermelonDB (SQLite) |
| **Navigation** | React Navigation (Bottom Tabs) |
| **Icons** | @expo/vector-icons (Ionicons) |
| **i18n** | Custom React context with AsyncStorage persistence |
| **Location** | expo-location |
| **Alert Routing** | On-device matching to demo psychiatrist data |

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- Expo CLI
- Xcode (for iOS) or Android Studio (for Android)

### Installation

```bash
cd /path/to/aama
npm install
```

### Development

WatermelonDB requires native modules, so you need a development build:

```bash
# Generate native projects
npx expo prebuild

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

## Project Structure

```
aama/
├── App.js                          # Entry point
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel + WatermelonDB decorators
├── package.json
├── src/
│   ├── components/
│   │   ├── RiskBadge.js            # Color-coded risk level badge
│   │   └── SOSOverlay.js           # Full-screen critical alert overlay
│   ├── data/
│   │   ├── epds.js                 # Edinburgh Postnatal Depression Scale
│   │   ├── phqa.js                 # PHQ-A for adolescents
│   │   ├── physicalHealth.js       # Physical health checklist items
│   │   └── demoPsychiatrists.js    # Demo psychiatrist data + routing
│   ├── db/
│   │   ├── schema.js               # WatermelonDB schema
│   │   ├── models/
│   │   │   ├── Patient.js
│   │   │   ├── Visit.js
│   │   │   └── Alert.js
│   │   └── index.js                # Database instance + helpers
│   ├── navigation/
│   │   └── AppNavigator.js         # Bottom tab navigation
│   ├── screens/
│   │   ├── HomeScreen.js           # Dashboard with stats + quick actions
│   │   ├── NewVisitScreen.js       # 4-step visit form + alert routing
│   │   ├── PatientsScreen.js       # Patient list with search/filter
│   │   ├── VolunteerGuideScreen.js # Training, resources, emergency numbers
│   │   └── SettingsScreen.js       # Profile, language, sync status
│   ├── theme/
│   │   └── index.js                # Colors, sizes, common styles
│   └── utils/
│       ├── alertService.js         # Hybrid alert creation + escalation
│       ├── i18n.js                 # English ↔ Nepali translation
│       └── riskEngine.js           # EPDS/PHQ-A scoring engine
├── PITCH.md
└── README.md
```

## Screening Instruments

### EPDS (Edinburgh Postnatal Depression Scale)
- **10 questions**, scored 0-3 each (max 30)
- **Reverse-scored**: Q3, Q5, Q6, Q7, Q8, Q9, Q10
- **Thresholds**: 0-9 Low | 10-12 Moderate | 13+ High
- **Q10**: Self-harm — any positive response → CRITICAL alert

### PHQ-A (Patient Health Questionnaire — Adolescents)
- **9 questions**, scored 0-3 each (max 27)
- **Age-adjusted cut-offs** (validated for Nepali adolescents):
  - Ages 12-14: ≥13 = High Risk
  - Ages 15-19: ≥11 = High Risk
- **Q9**: Self-harm → CRITICAL alert

## Hybrid Alert System

When a visit results in **high** or **critical** risk:
1. System auto-matches to the nearest available psychiatrist by district
2. An alert record is created and routed automatically
3. Volunteer sees the assigned psychiatrist's name and contact info
4. Volunteer can **call** or **SMS** the psychiatrist directly
5. Volunteer can **escalate to supervisor** if needed
6. For critical cases, **Crisis Hotline (1166)** is always one tap away

## License

MIT License — free to use, modify, and distribute.

---

*Built for Nepal's community health workers*
