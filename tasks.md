# Pending Tasks

## High Priority
- [ ] **Data Parsing Integration:** Replace the raw text `.csv` drop with robust CSV and PDF parsing modules (e.g. PapaParse for CSV, react-pdf for documents).
- [ ] **Data Architecture Base:** Set up Supabase / PostgreSQL schemas for multi-tenant data storage (Facility, County, National).
- [ ] **DPIA Implementation:** Create a hard stop enforcement for unverified DPIA documents in the `Onboarding` flow for all public facility roles.
- [ ] **Report Persistence:** Currently, report history is stored in `localStorage`. Move this to encrypted, secure database storage.

## Medium Priority
- [ ] **DHIS2 Integration Mockup:** Create sample API calls and service structures for pushing SHA aggregate claims to DHIS2.
- [ ] **KenyaEMR / OpenMRS FHIR Client:** Scaffold FHIR API structures for pulling encounters and data mappings in real time securely.
- [ ] **Role Management & Routing:** Extract role configuration and routing logic for Facility Admin / County / MoH out of `App.tsx` into a proper React Router architecture.

## Low Priority / Polish
- [ ] **SMS Reporting:** Integrate notification delivery (e.g., Twilio or Africa's Talking) for weekly summaries to practitioners.
- [ ] **Swahili i18n:** Add `react-i18next` to support EN/SW toggles for the entire interface, catering specifically to County/MoH clerks.
- [ ] **Offline PWA:** Setup service workers for offline caching and synchronization when web connectivity frequently fluctuates.
