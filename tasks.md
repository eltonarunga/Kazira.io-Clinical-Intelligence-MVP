# Kazira Clinical Intelligence - Task Tracker

## High Priority
- [x] **Data Parsing Integration:** Integrated PapaParse CSV engine with header validation, data quality scoring (0-100%), and automatic KDPA 2019 patient pseudonymization. (Completed)
- [x] **DHIS2 Outbound SHA Claims:** Built `dhis2Service` for transmitting aggregate Social Health Authority (SHA) claim metrics directly to Ministry of Health DHIS2 endpoints with transaction references. (Completed)
- [x] **KenyaEMR / OpenMRS FHIR Client:** Implemented HL7 FHIR R4 client (`fhirService`) for pulling clinical encounter bundles and converting them into normalized clinical datasets. (Completed)
- [x] **DPIA Implementation:** Hard stop enforcement for unverified DPIA documents in the `Onboarding` flow for all public facility roles. (Completed)
- [x] **SMS Reporting & Notifications:** Implemented Africa's Talking / Twilio SMS alert service (`smsService`) for broadcasting revenue leakage alerts and SHA submission receipts to facility directors. (Completed)

## Medium Priority
- [x] **Public / Private Segment Split:** Built distinct presentation paths for private clinics (revenue leakage/MRR) and public/faith-based facilities (SHA claims, DHIS2, county oversight). (Completed)
- [x] **Role Management & Routing:** Role-gated views for `facility_admin`, `county_health`, and `moh` with dynamic dashboard switching. (Completed)
- [x] **Swahili i18n:** Bilingual Swahili/English language toggles for all clinical intelligence views and executive summaries. (Completed)

## Future Roadmap / Phase 2
- [ ] **Encrypted Database Storage:** Migrate local report history to PostgreSQL / Supabase encrypted cloud persistence.
- [ ] **Offline PWA Worker:** Service worker caching for low-connectivity rural health centers.
