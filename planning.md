# Product Roadmap & Milestones

## Phase 1: MVP & Validation (Months 0-6)
- [x] Initial UI/UX for dual-role Landing Page (Private/Public).
- [x] Integrate Gemini AI for narrative summaries and audit extraction.
- [x] Define Public Sector metrics and Government Dashboard view.
- [x] Legal documents & DPIA compliance flow drafted.
- [x] Responsive cross-screen design architecture (Mobile 360px+ to Ultrawide 1520px+).
- [ ] Conduct 3-5 paid clinic audits to validate Willingness to Pay.

## Phase 2: Build & SHA Integration (Months 3-9)
- [x] Strict multi-tenant backend built for data isolation (`firestore.rules`, `server/security.ts`, token-only `requireAuth`).
- [x] Authoritative user identity binding via Firebase ID token verification and Firestore profile lookup.
- [x] Production `AUTH_SECRET` cryptographic signing guard with fatal startup enforcement.
- [x] Automated pseudonymisation pipeline before data hits the DB (KDPA 2019 SHA-256 HMAC).
- [x] Deterministic procedural billing reconciliation engine & unit test suite (`npm test`).
- [x] Swahili translations completed for critical user flows (`utils/translations.ts`).
- [x] SMS report delivery and clinician reminders via Africa's Talking gateway.
- [x] Manual CSV & Hospital PMS batch ingestion with automated HMAC pseudonymisation.
- [x] Pre-flight SHA claims adjudication engine with tariff cap and ICD-10 validation.
- [ ] Secure Letter of Support / MoU with a primary county MoH.

## Phase 3: Scale (Months 9-18)
- [ ] Onboard 20 private paying clinics.
- [ ] Scale to 20 public/faith-based facilities across target counties.
- [x] Live simulated KenyaEMR (FHIR R4) and OpenMRS inbound connectors.
- [x] Outbound MoH DHIS2 aggregate claims reporting gateway.
- [ ] Direct production EMR TLS tunnel pairing for enterprise private networks.
- [ ] Bulk pricing / cross-subsidy execution.

## Phase 4: Pipeline (Month 24+)
- [ ] **DentRx:** Contraindication and drug interaction agent at point of care.
- [ ] **KaziX:** Workflow automation for broader East African SMEs.
- [ ] **AI Skills Platform:** Standalone AI skills learning workflow.
- [ ] **Dedicated Cloud SQL / Sovereign Postgres Cluster:** Direct relational migration for national hospital networks.

