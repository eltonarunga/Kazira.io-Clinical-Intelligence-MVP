# Changelog & Version Control

All notable changes to the Kazira.io project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2026-08-11

### Added
- **Unbilled Debt & Receivables Ledger (`DebtReceivablesList.tsx`):** Named debt table featuring patient ref (pseudonymised), procedure name, date performed, gap type, estimated KES value, insurer, claim status, days outstanding, and status.
- **Flag Resolution & Reason Codes:** Contextual flag action modal with Collected (invoice reference + amount received), Dismissed (reason codes: already invoiced, patient refused, write-off, data error, duplicate), and Escalated workflows.
- **Insurance Claim Fields & Tracking:** Added claim reference, submission date, insurer name, and status (`unsubmitted`, `submitted`, `approved`, `rejected`, `resubmitted`) to billing gap models.
- **Financial Recovery Logbook (`RecoveryLogbook.tsx`):** 3-column running totals (Detected KES, Actioned KES, Collected KES) with Net Recovery ROI proof line and pre/post baseline comparison panel.
- **Attribution Badging (`kazira_flagged` vs `manually_identified`):** Strict attribution tags ensuring only auto-detected flags count towards Kazira ROI totals.
- **CSV Export Engine (`exportCsv.ts`):** Downloadable CSV exports for both Debt Receivables and Recovery Logbook.
- **Baseline Period Selector:** Pre-Kazira comparison period selector (default 12 weeks) integrated into onboarding and logbook.

### Fixed
- **Gemini Model Strings & Schema (`geminiService.ts`):** Corrected model aliases to `gemini-2.5-flash` and `gemini-2.5-pro` across narrative generation, auditing, and metric extraction. Added `unbilledRevenueKes`, `shaReimbursementPendingKes`, and `shaClaimVolume` to Gemini extraction schema.
- **Currency Formatting (`Dashboard.tsx`):** Removed threshold condition in `formatCurrency()` to consistently prefix `KES` across all revenue metrics regardless of amount.
- **Meta Description & Agent Framing:** Expanded `index.html` meta tags to cover both private and public healthcare facilities, and refined `AGENTS.md` instructions.

## [1.5.0] - 2026-07-28

### Added
- **PapaParse CSV Ingestion & Quality Engine (`csvParser.ts`):** RFC 4180 compliant CSV parsing with automatic header validation, clinical fee detection, data quality scoring (0-100%), and real-time KDPA 2019 patient pseudonymization.
- **DHIS2 Outbound SHA Claims Service (`dhis2Service.ts`):** End-to-end integration service for compiling and transmitting aggregate Social Health Authority (SHA) claims to Ministry of Health DHIS2 gateways with transaction references.
- **OpenMRS / KenyaEMR FHIR R4 Client (`fhirService.ts`):** HL7 FHIR R4 interoperability module for pulling clinical encounter bundles from hospital EHR systems and normalizing them for AI narrative analysis.
- **SMS Alert Dispatcher (`smsService.ts`):** Africa's Talking & Twilio SMS notification service for delivering revenue leakage alerts and SHA submission receipts to health facility directors.
- **Dynamic Currency & Metric Visualizations:** Refactored Recharts dashboards with automatic KES / USD currency formatting, zero-division math safety, and public vs private metric tracking.


### Added
- **Swahili Language Support (i18n):** Created modular Swahili translations schema and incorporated full Swahili language toggles into the core clinical intelligence interface.
- **Role-Based DPIA Hard Enforcement:** Introduced strict KDPA 2019 DPIA compliance validation in the user onboarding tour for public and faith-based facility administrators.
- **Enhanced Localized Data Visualization:** Integrated language awareness into Recharts dashboards to automatically translate labels and descriptive indicators.

## [1.3.0] - 2026-03-16

### Added
- **Legal Compliance:** Added comprehensive Terms of Service and Privacy Policy documents.
- **Security Prohibitions:** Explicitly prohibited unauthorized scraping, vulnerability testing, and security circumvention within the Terms of Service, outlining legal repercussions for violations.
- **Legal Modals:** Implemented a reusable `Modal` component to display legal documents seamlessly from the application footer.

## [1.2.0] - 2026-03-07

### Added
- **Production Error Boundary:** Implemented a React Error Boundary to catch unhandled exceptions and provide a graceful fallback UI.
- **Toast Notifications:** Integrated `sonner` for non-intrusive, professional toast notifications for success and error states.
- **Loading Skeleton:** Added a `DashboardSkeleton` component to improve perceived performance and UX during the data processing phase.
- **Structured JSON Schema:** Upgraded the `extractMetrics` Gemini call to use `responseSchema`, guaranteeing the AI returns a strictly typed JSON object, preventing parsing errors.

### Changed
- **Component Modularity:** Extracted the `ReportContent` markdown renderer into its own reusable component to clean up the main application file.
- **Math Safety:** Fixed a potential division-by-zero bug in the Dashboard's growth calculation.

## [1.1.0] - 2026-03-06

### Added
- **Data Processing Pipeline:** Implemented a robust data cleaning pipeline (`utils/dataPipeline.ts`) to sanitize raw clinic data before sending it to the Gemini models. This pipeline automatically redacts common PII (emails, phone numbers, SSNs), normalizes whitespace, and truncates excessive data to prevent token overflow.
- **Structured Metrics Extraction:** Implemented a new Gemini agent prompt to extract structured JSON metrics from raw clinic data.
- **Interactive Dashboard:** Added `recharts` to visualize revenue trends, procedure mix, and practitioner load dynamically based on extracted metrics.
- **Report History:** Implemented `localStorage` caching to save and retrieve the last 10 generated reports. Added a History sidebar UI.
- **Markdown Export:** Added a "Export MD" button to download the generated report and audit log as a `.md` file.
- **Markdown Rendering:** Integrated `react-markdown` and `remark-gfm` for safe, styled rendering of the AI-generated narrative reports.
- **Security Enhancements:** Updated API key initialization to use `process.env.GEMINI_API_KEY` as the primary source, falling back to `process.env.API_KEY`.

### Changed
- **UI/UX Overhaul:** Updated the application layout, typography, and color scheme to match a professional "Technical Dashboard" aesthetic.
- **Parallel Processing:** Optimized the `handleGenerate` function to run narrative generation and metric extraction in parallel using `Promise.all`.
- **Type Definitions:** Expanded `types.ts` to include `MetricSummary` and updated `ReportOutput` to store metrics.

### Fixed
- Fixed a TypeScript error in `Dashboard.tsx` related to the `height` property of `ResponsiveContainer`.
- Added a `lint` script to `package.json` for better code quality enforcement.

## [1.0.0] - Initial MVP

### Added
- Basic React application structure with Vite.
- Data input area with drag-and-drop and file upload support.
- Integration with `@google/genai` for Narrative Generation (Gemini Flash) and Audit Verification (Gemini Pro).
- Basic onboarding flow.
- Static placeholder dashboard.
