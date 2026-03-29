# AAMA सखी — Pitch Document

## 🎯 Elevator Pitch (30 seconds)

> Every year, thousands of Nepali mothers and youth die by suicide — undetected by the 50,000 health volunteers who visit them weekly. **AAMA** is an offline-first app that hides validated depression screening inside the existing physical health checklist. The volunteer doesn't screen for mental health — they just do their normal job, and the app does the clinical thinking. When it finds risk, it alerts a psychiatric nurse automatically. **Zero new training. Zero internet required. Maximum lives saved.**

---

## 📊 Problem Understanding

### The Gap
| Metric | Value |
|---|---|
| Rural population without psychiatric access | **90%** |
| FCHVs already visiting homes | **50,000+** |
| Suicide as % of maternal deaths | **Leading cause** (16% of deaths in women 15-49) |
| Mental health items on FCHV checklist | **0** |
| Psychiatrists per 100,000 people | **0.36** (vs. 16 in USA) |

### Root Cause
- FCHVs check physical health (vaccines, vitamins) — **no mental health training**
- Adding formal psychiatric training to 50,000 semi-literate volunteers is **impractical**
- The existing visit is the **perfect screening moment** — it just needs the right tool

---

## 💡 Innovation

### What Makes AAMA Different

1. **Question Masking** — We don't ask "Are you depressed?" We ask "How has your sleep been?" The EPDS and PHQ-A questions are reframed as general wellness inquiries. The FCHV never knows she's screening for depression. This removes stigma and training barriers simultaneously.

2. **Decision Tree, Not AI** — No black-box ML model. We use the exact same scoring algorithms published in peer-reviewed psychiatric journals (Cox et al., 1987 for EPDS). Every score is explainable and auditable.

3. **Zero-Infrastructure** — No internet? No problem. The app works on a $50 Android phone with no SIM card. IndexedDB stores everything locally. Sync happens opportunistically.

4. **Dual-Population Screening** — Most tools only screen mothers OR youth. AAMA handles both using the right validated instrument for each (EPDS for postnatal, PHQ-A for adolescents with Nepal-specific age-adjusted cut-offs).

5. **Built-in FCHV Training** — Bite-sized modules teach FCHVs how to ask sensitive questions naturally, what each risk color means, and exactly what to do in a crisis — all offline.

---

## 🏗 Technical Complexity

### Architecture Highlights

| Component | Technology | Rationale |
|---|---|---|
| **Offline Storage** | Dexie.js (IndexedDB) | 50MB+ capacity, structured queries, no server needed |
| **PWA Shell** | Workbox + vite-plugin-pwa | Full app cached on first load, works offline indefinitely |
| **Risk Engine** | Pure JS decision tree | EPDS reverse-scoring on 7 items, PHQ-A age-adjusted thresholds |
| **Alert Routing** | Express + SQLite | Matches patient location to nearest psychiatric nurse by district |
| **i18n** | Custom React context | Lightweight, no npm dependency, instant toggle EN↔NE |
| **Geolocation** | Web Geolocation API | Enables regional risk heatmaps without any external service |

### Technical Differentiators
- **Self-harm escalation**: EPDS Q10 or PHQ-A Q9 positive → bypasses normal scoring → immediate CRITICAL alert + SOS overlay with crisis hotline
- **Conflict-free sync**: Last-write-wins with client-side sync queue — handles days of offline operation
- **<100KB JS bundle** (production): Runs on 2G networks and low-end devices

---

## 🎨 UX/UI Design Decisions

| Decision | Rationale |
|---|---|
| **Dark theme** | Reduces battery drain on OLED phones; works better in low-light home visit settings |
| **Large tap targets** | FCHVs may have limited fine motor skills; all buttons ≥48px |
| **Emoji-based icons** | Universally understood, no cultural translation needed |
| **4-step progress stepper** | FCHVs see exactly where they are and how much is left |
| **Color-coded risk** | Green/Yellow/Red is intuitive across cultures |
| **SOS full-screen overlay** | Critical alerts cannot be accidentally dismissed |
| **Bilingual toggle** | One tap to switch — supervisor can use English, FCHV uses Nepali |

---

## 💰 Business Impact & Feasibility

### Impact Metrics (Projected at Scale)

| Metric | Year 1 | Year 3 |
|---|---|---|
| FCHVs onboarded | 5,000 | 50,000 |
| Mothers screened | 150,000 | 1,500,000 |
| Youth screened | 100,000 | 1,000,000 |
| High-risk detections | ~15,000 | ~150,000 |
| Suicide interventions | ~1,500 | ~15,000 |
| Cost per screening | $0.02 | $0.005 |

### Business Model

**Phase 1 — NGO/Grant Funded** (Year 1)
- Partner with Nepal's Department of Health Services (DoHS)
- Apply for WHO Digital Health Innovation grants
- Cost: ~$150K (development + 5,000 tablets + training)
- Revenue: Grant-funded

**Phase 2 — Government Integration** (Year 2-3)
- Integrate into Nepal's national FCHV digital health platform
- Government procures tablets as part of FCHV kit
- AAMA becomes a standard module alongside MANTRA
- Revenue: Government contract / per-FCHV licensing

**Phase 3 — Regional Expansion** (Year 3+)
- Adapt for India's ASHA workers (1M+ volunteers), Bangladesh's Shasthya Shebikas
- White-label for international NGOs (UNICEF, WHO, MSF)
- Revenue: SaaS licensing per NGO deployment

### Why It's Feasible
1. **Zero new infrastructure** — FCHVs already receive phones/tablets through existing programs
2. **No behavior change** — They keep doing the same physical health checklist; we just add questions
3. **Validated instruments** — EPDS and PHQ-A are already clinically validated in Nepal
4. **Government support** — Nepal's 2020 Mental Health Act mandates community-level screening
5. **Open source** — MIT licensed, free for any government or NGO to adopt

---

## 🎤 Demo Script (5 minutes)

### Act 1: The Problem (1 min)
> "Meet Sita, a 28-year-old mother in Lamjung district. She just had her second child. Every week, an FCHV named Kamala visits to check vaccines and vitamins. But Sita hasn't slept in weeks. She blames herself for everything. She's thought about dying. Kamala checks the physical health boxes and leaves. Nobody knows."

### Act 2: The Solution (2 min)
> "Now, Kamala opens AAMA on her tablet. Same checklist. But after the vaccines, the app naturally flows into: 'How has your sleep been?' 'How are you managing daily responsibilities?' 'Have you had any thoughts about your safety?'"

*[Demo: Complete the New Visit flow live]*

> "Kamala doesn't know she just administered the Edinburgh Postnatal Depression Scale. But the app does. Score: 17 out of 30. HIGH RISK. The screen turns red."

### Act 3: The Intervention (1 min)
> "When Kamala's phone hits the cell tower on her walk home, the data syncs. An alert routes to Anita Gurung, the nearest psychiatric nurse 20km away. Anita gets an SMS: 'URGENT: High-risk postnatal depression detected. Patient: Sita, Lamjung Ward 3.' Anita schedules a targeted visit. Sita gets help."

### Act 4: The Impact (1 min)
> "50,000 FCHVs × 30 visits/month = 1.5 million screenings per year. At $0.005 per screening. Using validated instruments that already exist. On a device they already carry. With zero psychiatric training required."

> "This is AAMA. No new infrastructure. No new training. No internet required. Just a better checklist."

---

## 🤝 Team & Ask

**What we need:**
- **$150K seed grant** for pilot in 3 districts (Kaski, Gorkha, Lamjung)
- **Partnership with Nepal DoHS** for FCHV access and data sharing
- **Clinical advisor** for ongoing instrument validation and protocol refinement
- **6-month pilot** to demonstrate detection rates and false-positive management

**What we deliver:**
- Working PWA deployed to 5,000 FCHVs
- Dashboard for district health officers to monitor mental health burden
- Peer-reviewed publication on community-based mental health screening
- Replicable model for South Asian community health programs
