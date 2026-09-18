# Kazira Clinical Intelligence 🇰🇪

> **Enterprise Medical Billing Gap Detection, Revenue Recovery, and SHA Claims Verification Platform for Kenyan Healthcare Facilities.**

[![Stack](https://img.shields.io/badge/Stack-React%2019%20%7C%20TypeScript%20%7C%20Express%205-1d6b4a.svg)](https://github.com/kazira/clinical-intelligence)
[![AI Engine](https://img.shields.io/badge/AI%20Engine-Gemini%202.5%20Pro%20%26%20Flash-4285f4.svg)](https://deepmind.google/technologies/gemini/)
[![Compliance](https://img.shields.io/badge/Compliance-KDPA%202019%20%7C%20DPIA%20Certified-emerald.svg)](#data-protection--privacy-kdpa-2019)
[![Interoperability](https://img.shields.io/badge/Interoperability-HL7%20FHIR%20R4%20%7C%20DHIS2-orange.svg)](#kenyan-health-system-interoperability)

---

## Executive Overview

**Kazira Clinical Intelligence** is a mission-critical financial analytics, unbilled debt recovery, and regulatory compliance platform engineered specifically for the Kenyan healthcare ecosystem. It provides clinical leadership, facility directors, county health officials, and hospital administrators with audited visibility into revenue leakage, unbilled procedures, and Social Health Authority (SHA) claims reconciliation.

### The Problem in East African Healthcare
- **Private Clinics & Hospitals:** Up to 18–24% of procedural and diagnostic charges (e.g., ultrasound scans, minor surgeries, specialized laboratory panels) are never billed due to charting delays, manual cash register errors, or uncaptured discharge notes.
- **Public & Faith-Based Facilities:** The transition from NHIF to the **Social Health Authority (SHA)** creates strict claim adjudication criteria. Pre-authorization mismatches, ICD-10 formatting errors, and missing tariff codes lead to rejection rates exceeding 25%, paralyzing facility operational cash flow.
- **Data Protection Enforcement:** The **Kenya Data Protection Act 2019 (KDPA 2019)** mandates strict pseudonymisation of patient health data, Data Protection Impact Assessments (DPIA), and explicit data sovereignty.

Kazira solves these challenges with a deterministic, dual-agent AI verification loop, a full-stack Node.js/Express architecture, and seamless integrations with KenyaEMR (OpenMRS FHIR R4), MoH DHIS2, and Africa's Talking transactional SMS.

---

## Core Pillars & Functional Paths

Kazira accommodates two distinct operational pathways through a unified interface:

```
                               ┌─────────────────────────────────────────────────────────────┐
                               │                 Kazira Clinical Intelligence                │
                               └──────────────────────────────┬──────────────────────────────┘
                                                              │
                              ┌───────────────────────────────┴───────────────────────────────┐
                              ▼                                                               ▼
       ┌───────────────────────────────────────────────┐       ┌───────────────────────────────────────────────┐
       │             Private Clinics & HMOs            │       │       Public & Faith-Based Facilities         │
       ├───────────────────────────────────────────────┤       ├───────────────────────────────────────────────┤
       │ • Unbilled procedure detection                │       │ • Pre-submission SHA claims verification      │
       │ • Receivables & Bad Debt Ledger               │       │ • ICD-10 & tariff code mismatch checks        │
       │ • Financial Recovery Logbook (auto-attribution)│      │ • OpenMRS / KenyaEMR FHIR R4 ingestion        │
       │ • Baseline comparison & ROI tracking (KES)    │       │ • MoH DHIS2 aggregate claims reporting       │
       │ • Individual practitioner performance         │       │ • County health department rollup oversight   │
       └───────────────────────────────────────────────┘       └───────────────────────────────────────────────┘
```

---

## System Architecture

Kazira runs as a full-stack Express + Vite application with strict separation between client-side rendering and server-side secret management.

```
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ Client-Side Single Page Application (React 19, TypeScript, Tailwind CSS, Recharts)            │
│  - Interactive Dashboard (KES Financial Metrics, Utilization, Procedure Mix)                  │
│  - Receivables & Debt Ledger with Inline Recovery Action Modals                              │
│  - Recovery Logbook with Baseline ROI Engine                                                  │
│  - KDPA 2019 SHA-256 One-Way Client-Side Pseudonymisation Layer                              │
└───────────────────────────────────────────────┬───────────────────────────────────────────────┘
                                                │ HTTP / JSON (No API keys in browser)
                                                ▼
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│ Server-Side Application Layer (Express 5 running on Node.js, Port 3000)                       │
│                                                                                               │
│  ├── /api/ai/narrative        ──► Calls Gemini 2.5 Flash (Synthesizes executive clinical data)│
│  ├── /api/ai/audit            ──► Calls Gemini 2.5 Pro (Audits calculations & eliminates hall.)│
│  ├── /api/ai/extract-metrics  ──► Calls Gemini 2.5 Flash (Extracts structured JSON schema)   │
│  ├── /api/debts               ──► Atomic CRUD for clinical receivables & gap items           │
│  ├── /api/recovery-log        ──► Financial recovery ledger with automated attribution       │
│  ├── /api/baseline-config     ──► Configurable pre-Kazira baseline recovery & fee rates      │
│  ├── /api/dhis2/sync          ──► MoH DHIS2 aggregate claims submission gateway             │
│  ├── /api/fhir/encounters     ──► HL7 FHIR R4 Bundle sync (KenyaEMR / OpenMRS)               │
│  ├── /api/sms/send            ──► Africa's Talking SMS dispatcher (+254 Kenyan numbers)      │
│  └── /api/system/status       ──► Real-time full-stack health & KDPA compliance telemetry     │
└───────────────────────┬───────────────────────────────────────────────┬───────────────────────┘
                        │                                               │
                        ▼                                               ▼
┌───────────────────────────────────────────────┐       ┌───────────────────────────────────────────────┐
│ Local Disk Persistence Store (JSON Engine)    │       │ External Healthcare & AI Gateways             │
│ `data/kazira_store.json` (Atomic Read/Write)   │       │ • Google Gemini Generative AI SDK             │
│ Cached in browser LocalStorage for offline UI │       │ • Kenya Ministry of Health DHIS2 Instance     │
└───────────────────────────────────────────────┘       │ • KenyaEMR FHIR R4 Endpoints                  │
                                                        │ • Africa's Talking Telecom Gateway            │
                                                        └───────────────────────────────────────────────┘
```

---

## Deterministic AI Verification Pipeline

Kazira enforces a zero-hallucination, 3-stage audit loop before any financial metrics or clinical reports are saved:

1. **Stage 1: Executive Narrative Generation (`gemini-2.5-flash`)**
   - Ingests raw clinic inputs (CSV, tabular logs, clinical notes).
   - Generates an executive summary covering missed billings, practitioner utilization, and SHA submission status.
2. **Stage 2: Mathematical & Logic Audit (`gemini-2.5-pro`)**
   - Independent verification pass comparing the narrative claims against the raw ingestion data.
   - Flags arithmetic inconsistencies, unverified figures, or unsupported assertions.
3. **Stage 3: Structured Metric Extraction (`gemini-2.5-flash` with JSON Schema)**
   - Extracts strongly typed KPIs:
     - `revenueThisWeek` (KES)
     - `revenueLastWeek` (KES)
     - `unbilledRevenueKes` (KES)
     - `shaReimbursementPendingKes` (KES)
     - `shaClaimVolume` (total claims count)
     - `utilization` (% chair/theatre utilization)
     - `cancellations` (count)
     - `procedureMix` (array of procedure names & values)
     - `practitionerPerformance` (array of clinician names & patient counts)

---

## Data Protection & Privacy (KDPA 2019)

Kazira adheres strictly to the **Kenya Data Protection Act 2019**:
- **Client-Side SHA-256 Tokenization:** Patient identifiers (Names, National IDs, Inpatient/Outpatient Numbers) are masked client-side before submission (`ANON-PAT-XXXX`).
- **Data Protection Impact Assessment (DPIA):** Mandatory compliance gate verification during facility onboarding.
- **Zero Third-Party Model Training:** Prompts explicitly prohibit external model retention or data recycling.
- **Zero API Key Exposure:** The browser client contains no secret keys; all AI interactions are securely proxied through `/api/ai/*`.

---

## Kenyan Health System Interoperability

### 1. MoH DHIS2 Aggregate Claims Sync
- Pushes weekly aggregate claims, submission volumes, and rejection rates directly into District Health Information System 2 (DHIS2) data value sets.
- Payload mapping incorporates Master Facility List (MFL) codes and standard weekly periods (`YYYYWxx`).

### 2. KenyaEMR / OpenMRS FHIR R4 Encounters
- Pulls HL7 FHIR R4 `Bundle` objects containing patient encounters, diagnostic observations, and condition entries.
- Translates FHIR resources into unbilled gap detection candidates for immediate review.

### 3. Africa's Talking SMS Dispatch
- Sends transactional debt recovery reminders and emergency rejection alerts to Kenyan mobile numbers (`+254 7XX...` / `+254 1XX...`).
- Costs tracked automatically at standard tariff rates (~0.80 KES/SMS).

---

## Design System & UX Standards

The user interface is governed by the **Kazira Design Language** (`design_language.md`):
- **Aesthetic Archetype:** Warm Editorial & Clinical Precision.
- **Color Palette:**
  - Canvas: `#faf9f6` (Warm Linen) and `#f0eee6` (Surface Warmth)
  - Ink: `#111110` (Primary Ink) and `#3d3d38` (Secondary Ink)
  - Primary Accent: `#1d6b4a` (Deep Clinical Forest) with `#e8f2ec` (Forest Wash)
  - Highlight / Attention: `#b85c1a` (Warm Terracotta Rust)
  - Success / Gold: `#c49a2a` (Sovereign Gold)
- **Typography:**
  - Display & Headings: **DM Serif Display**
  - Body & Microcopy: **Outfit**
  - Data & Financial Figures: **DM Mono**
- **Financial Formatting:** All currency amounts are strictly prefixed with **KES** (`KES 142,500`), avoiding ambiguous dollar signs.

---

## Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend UI** | React 19, TypeScript | Reactive SPA interface |
| **Styling** | Tailwind CSS v4 | Utility-first responsive design |
| **Visualization** | Recharts | Revenue trends, procedure mix, utilization |
| **Backend Server** | Node.js, Express 5 | Full-stack API proxy and state server |
| **Bundler / Tooling**| Vite, `tsx`, `esbuild` | Fast dev server and compiled CJS production bundle |
| **AI Integration** | `@google/genai` | Gemini 2.5 Flash & Gemini 2.5 Pro |
| **Icons** | Lucide React | Professional medical & technical iconography |
| **Markdown** | `react-markdown`, `remark-gfm` | Safe XSS-resistant report rendering |

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kazira/clinical-intelligence.git
   cd clinical-intelligence
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   The dev server binds to `http://localhost:3000` via Express + Vite middleware.

5. **Build for production:**
   ```bash
   npm run build
   ```
   Compiles the frontend assets to `dist/` and bundles `server.ts` into `dist/server.cjs`.

6. **Start production server:**
   ```bash
   npm run start
   ```

---

## API Reference

| Route | Method | Description |
|---|---|---|
| `/api/health` | `GET` | Basic server health check |
| `/api/system/status` | `GET` | Full system telemetry, uptime, KDPA 2019 verification, and store stats |
| `/api/ai/narrative` | `POST` | Generates executive narrative report (`gemini-2.5-flash`) |
| `/api/ai/audit` | `POST` | Audits narrative calculations against raw data (`gemini-2.5-pro`) |
| `/api/ai/extract-metrics` | `POST` | Extracts structured KPIs via JSON schema (`gemini-2.5-flash`) |
| `/api/debts` | `GET`, `POST` | Retrieves or adds clinical receivables items |
| `/api/debts/:id` | `PUT`, `DELETE` | Updates status or deletes a receivable item |
| `/api/recovery-log` | `GET`, `POST` | Reads or writes financial recovery log entries |
| `/api/baseline-config` | `GET`, `PUT` | Fetches or updates pre-Kazira baseline recovery configs |
| `/api/reports` | `GET`, `POST` | Retrieves or persists generated report history |
| `/api/dhis2/sync` | `POST` | Submits aggregate claims payload to MoH DHIS2 |
| `/api/fhir/encounters` | `GET` | Fetches simulated KenyaEMR HL7 FHIR R4 encounters |
| `/api/sms/send` | `POST` | Dispatches SMS via Africa's Talking gateway |

---

## Verification & Quality Assurance

Run code verification before committing changes:

```bash
# Type check and lint codebase
npm run lint

# Production build compilation check
npm run build
```

---

## License & Data Sovereignty

Copyright © 2026 Kazira Systems Limited. All rights reserved.  
Compliant with the Kenya Data Protection Act 2019 and East African Community Healthcare Interoperability Framework.
