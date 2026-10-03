# Kazira Clinical Intelligence - Product Requirements Document (PRD)

## 1. Executive Overview & Mission
Kazira Clinical Intelligence is an audited, mission-critical financial analytics, unbilled procedural debt recovery, and Social Health Authority (SHA) regulatory compliance system engineered for Kenyan healthcare facilities. It replaces error-prone manual spreadsheets and billing delays with deterministic clinical reconciliation, strict KDPA 2019 pseudonymisation, and dual-model AI narrative synthesis.

## 2. Core Pillars & Architecture
1. **Public vs. Private Facility Split:**
   - **Private Clinics & Hospitals:** Focused on monthly recurring revenue (MRR), unbilled gap recovery across surgical/theatre/radiology/lab departments, patient SMS payment follow-ups, and baseline ROI comparison.
   - **Public & Faith-Based Facilities:** Focused on Social Health Authority (SHA) claim pre-flight adjudication, tariff cap validation, mandatory ICD-10 coding, and national reporting via MoH DHIS2 and OpenMRS / KenyaEMR FHIR R4 gateways.
2. **Deterministic Financial Reconciliation (No Generative Guesswork):**
   - Core financial metrics (unbilled procedures, tariff variances, leakage rates) are computed strictly by algorithmic code (`utils/deterministicBilling.ts`), comparing clinical procedure logs against billed invoices.
   - Large Language Models are strictly prohibited from calculating financial totals or hallucinating clinical debt items.
3. **Dual-Model AI Verification Loop:**
   - **Stage 1 (Qualitative Synthesis):** Synthesizes deterministic reconciliation summaries and encounter operational logs into executive Markdown briefings.
   - **Stage 2 (Mathematical Audit Pass):** An independent second model pass cross-checks narrative assertions against raw ground-truth telemetry and deterministic figures to verify parity.
   - **Stage 3 (Structured Metric Alignment):** Delivers typed JSON KPI metrics (`MetricSummary`) to power reactive dashboards.
4. **Data Protection & Sovereignty (Strict KDPA 2019):**
   - Client-side SHA-256 HMAC one-way tokenization masks all patient identifiers (`ANON-PAT-XXXX`) before transmission.
   - Zero Third-Party Model Training: AI prompts explicitly enforce zero data retention.
   - Data Protection Impact Assessment (DPIA) compliance tracking integrated into facility onboarding.

## 3. System Architecture & Tech Stack
- **Frontend SPA:** React 19, TypeScript, Tailwind CSS, Lucide React icons, Recharts visualization, Sonner notifications.
- **Backend API Server:** Node.js, Express 5, running on Port 3000 via `server.ts`.
- **Database & Persistence:**
  - **Authoritative Cloud System of Record (SoR):** Cloud Firestore (`ai-studio-kaziraioclinicin-ed928fd1-5a41-4c48-ad3d-3be773cab9f4`) with deployed tenant-partitioned `firestore.rules`.
  - **Local Development / Offline Fallback:** Graceful fallback to `data/kazira_store.json` with safe serverless read-only handling.
  - **Relational Migration Path:** PostgreSQL / Cloud SQL for high-volume enterprise hospital networks.
- **Authentication & Multi-Tenant Access Control (RBAC):**
  - Verified Firebase ID Token (`verifyFirebaseIdToken`) authentication at `/api/auth/login`.
  - Authoritative role and facility lookup strictly from the user's Firestore document (`/users/{uid}`), never trusting client-supplied request bodies.
  - Cryptographic HMAC SHA-256 session token generation with mandatory `AUTH_SECRET` environment configuration.
  - Strict tenant boundary isolation in `requireAuth`: regular facility admins and staff can only access records in their facility's partition.
  - Supervisory roles (`county_health`, `moh`) granted regulatory oversight access across facilities.
- **Health System Connectors:**
  - KenyaEMR / OpenMRS HL7 FHIR R4 encounter ingestion.
  - MoH DHIS2 aggregate claims reporting gateway.
  - Africa's Talking transactional SMS alert dispatcher (+254 Kenyan numbers).
  - Manual CSV & hospital PMS file upload with automated HMAC masking.

## 4. Key Functional Modules
- **Overview & Recovery Dashboard:** Executive KES financial KPIs, weekly billing vs. care delivery trend chart, priority unbilled recovery queue, clinician reminder dispatch.
- **Unbilled Gap Receivables Ledger:** Interactive clinical receivables management, inline status updates (`pending`, `collected`, `dismissed`, `escalated`), CSV batch ingestion, and single gap recording.
- **Social Health Authority (SHA) Claims Adjudication:** Pre-submission verification, tariff cap validation, ICD-10 omission checks, pre-auth verification, and batch portal submission.
- **AI Dual-Loop Audit View:** Dual-model narrative synthesis, verification audit logs, structured metric breakdown, and raw ground-truth telemetry inspection.
- **Ecosystem Integrations Hub:** Live ping diagnostics for KenyaEMR FHIR, MoH DHIS2, Safaricom Daraja M-Pesa, and Africa's Talking SMS.
- **Practitioner Profile & Sovereign Settings:** Credential governance, active tenant facility overview, notification preferences, and session termination.
- **Cross-Screen Ergonomics:** Fully optimized for mobile (360px–480px), tablet, laptop, and ultrawide displays with accessible touch targets ($\ge 44\text{px}$) and touch-scrollable tables.

## 5. Automated Verification & Quality Assurance
- **Deterministic Unit Test Suite:** `npm test` runs 5 comprehensive test cases covering zero-leakage parity, underbilled tariffs, completely unbilled procedures, and complex clinical shifts with zero failures.
- **Static Type Checking:** `npm run lint` (`tsc --noEmit`) validates strict TypeScript typing with zero errors.
- **Production Build Compilation:** `npm run build` bundles React SPA and Node.js server.
