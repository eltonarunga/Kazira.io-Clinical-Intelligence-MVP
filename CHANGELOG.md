# Changelog & Version Control

All notable changes to the Kazira.io project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.11.2] - 2026-10-03

### Authentication & UX
- **Exclusive Google Sign In / Sign Up & Guest Access (`components/auth/SignInView.tsx`):**
  - Streamlined authentication gateway to support strictly two verified entry paths:
    1. **Google Sign In / Sign Up (Single Sign-On):** Passwordless authentication backed by verified Firebase identity (`signInWithGooglePopup`). Existing facilities restore their cloud Firestore profile instantly; new facilities are onboarded via a clean 1-minute facility profile setup (Hospital Name, KMHFL code, classification, county).
    2. **Guest Sandbox Access:** Instant zero-credential exploration of the synthetic demo clinic partition (`MFL #DEMO-01`) with pre-loaded Kenyan FHIR encounters and KES 3.42M unbilled gap ledgers.
  - Eliminated all legacy username/password inputs, password toggles, manual credential submission handlers, and synthetic persona bypasses.
  - Aligned with statutory KDPA 2019 data protection principles: zero storage or transmission of plaintext passwords.

## [2.11.1] - 2026-10-03

### Security
- **Strict Token-Only Authentication & Removal of Header-Based Bypasses (`server/security.ts`, `server.ts`, `services/apiService.ts`):**
  - Removed client-controlled `x-is-guest: true` and `?isGuest=true` bypasses in `requireAuth`. All API requests now strictly require a cryptographically signed Bearer session token.
  - Guest sessions authenticate via `/api/auth/login` to obtain an immutable signed token bound to the demo partition (`'MFL #DEMO-01'`).
  - Regular clinic users are strictly locked to their verified token's `facilityCode`; client headers cannot spoof or switch facility partitions.
  - Refined supervisory target facility inspection: only cryptographically verified `moh` or `county_health` tokens can supply an audit target parameter.
- **Production `AUTH_SECRET` Guard & Ephemeral Dev Key (`server/security.ts`, `.env.example`):**
  - Server explicitly throws a fatal startup error if `AUTH_SECRET` is missing, shorter than 16 characters, or matches public repository defaults in production (`process.env.NODE_ENV === 'production'`).
  - Non-production environments auto-generate an unguessable 256-bit cryptographic key per process run, preventing forged tokens with repository strings.
  - Documented `AUTH_SECRET` in `.env.example`.

### Architecture & Grounding
- **Client Session Bootstrapping & Dual-Loop Reconciliation Parity (`App.tsx`, `services/apiService.ts`, `services/geminiService.ts`):**
  - Added session bootstrap on mount (`apiService.ensureSession()`) and inside guest login handlers to ensure an active Bearer token is always attached to API calls.
  - Updated `services/geminiService.ts` to attach Authorization Bearer tokens to `/api/ai/*` routes.
  - Re-verified deterministic reconciliation wiring in `App.tsx`: `apiService.reconcileBilling` executes exact math first, feeds deterministic summaries to the Gemini narrative generator, and overrides generative metrics.
- **Conservative Phrasing Audit (`AiAuditView.tsx`):**
  - Updated remaining claims from "Zero Hallucination Guaranteed" to "Audited by Second Model Pass" and "Dual-Loop AI Architecture (Gemini 3.8 / 2.5 Flash)".

## [2.11.0] - 2026-10-03

### Security
- **Strict Tenant Isolation in Firestore Security Rules (`firestore.rules`, `services/firebase.ts`, `firebase-blueprint.json`):**
  - Eliminated open read/write access under `/facilities/{facilityId}` in `firestore.rules`.
  - Added facility-bound tenant boundary validation: practitioners and facility admins are restricted strictly to documents matching their authenticated facility partition (`facilityId` / `facilityCode`).
  - Cross-tenant data inspection and tampering are explicitly rejected; supervisory oversight roles (`county_health`, `moh`) are granted read access strictly for statutory disease surveillance and public compliance mandates.
  - Deployed updated security rules to production via `deploy_firebase`.
- **Server Routes Authentication & Tenant Authorization Middleware (`server.ts`, `server/security.ts`):**
  - Built and mounted `requireAuth` middleware with cryptographic HMAC SHA-256 session token verification.
  - Bound session tokens to facility identifiers, preventing facility spoofing.
  - Protected all ledger and sensitive data routes (`/api/debts`, `/api/claims`, `/api/recovery-log`, `/api/baseline-config`, `/api/reports`, `/api/audit-logs`) with `requireAuth` and role-based guards for destructive mutations (`requireRoles: ['facility_admin', 'moh', 'county_health', 'guest']`).
- **Removed Hardcoded Admin Profile (`constants/profiles.ts`):**
  - Removed `user-elton-arunga` and development session bypass from `constants/profiles.ts`.
  - Re-anchored initial default profile on realistic clinic evaluator profiles (`Dr. Amina Mutua, MBChB` at Nairobi West Memorial Hospital and `Guest Health Auditor` for sandbox exploration).

### Added
- **Deterministic Procedural Billing Reconciliation Engine & Automated Test Suite (`utils/deterministicBilling.ts`, `tests/deterministicBilling.test.ts`, `server.ts`, `package.json`):**
  - Created `reconcileProceduresAgainstInvoices` engine executing exact arithmetic comparison between clinical encounter procedures and billed invoices/claims.
  - Computes `totalPotentialRevenueKes`, `totalBilledRevenueKes`, `totalUnbilledRevenueKes`, `leakagePercentage`, and department/practitioner breakdown without relying on generative model hallucinations.
  - Created automated test suite with 5 test cases testing completely unbilled procedures, underbilled tariff variances, fully reconciled procedures, multi-department shifts, and empty arrays.
  - Added `"test": "tsx --test tests/**/*.test.ts"` script to `package.json`; 100% passing.
  - Mounted `/api/reconcile/billing` endpoint for direct batch procedure reconciliation and automatic receivables ledger population.

### Changed
- **DPIA Status & Regulatory Phrasing Audit (`README.md`, `server.ts`):**
  - Updated README compliance badge from "DPIA Certified" to regulator-defensible "DPIA In Progress".
  - Replaced "zero-hallucination" phrasing with "audited by a second model pass" and "deterministic procedural reconciliation with dual-model verification".
  - Updated server telemetry compliance status (`dpiaStatus: 'IN_PROGRESS'`).
- **Storage Architecture & Ephemerality Safeguards (`server/store.ts`, `README.md`):**
  - Clarified dual-tier storage architecture: multi-tenant Cloud Firestore database (`ai-studio-kaziraioclinicin-ed928fd1-5a41-4c48-ad3d-3be773cab9f4`) for real-time production cloud persistence, local JSON fallback for dev, and PostgreSQL roadmap.
  - Hardened `server/store.ts` to log and bypass local filesystem writes gracefully in serverless lambda environments (e.g., Vercel) without throwing unhandled exceptions.

## [2.10.10] - 2026-10-02

### Removed
- **Removed Duplicate Pop-Up Notifications (`App.tsx`, `components/ToastBanner.tsx`):**
  - Consolidated all application notifications onto a single, unified toast pipeline powered by Sonner (`Toaster`).
  - Removed duplicate triggering where both `ToastBanner` (custom bottom-right card) and Sonner (`toast.success` / `toast.warning` / `toast.info` top-right) fired concurrently for every action.
  - Removed obsolete `ToastBanner.tsx` component and `currentToast` state machine, eliminating UI overhead and stacked banner redundancy.

## [2.10.9] - 2026-10-02

### Optimized
- **Cross-Screen Responsive Architecture Across All Pages (`App.tsx`, `OverviewRecoveryView.tsx`, `UnbilledGapLedgerView.tsx`, `ShaClaimsView.tsx`, `AiAuditView.tsx`, `IntegrationsView.tsx`, `ProfileView.tsx`, `SignInView.tsx`, `CsvIngestionModal.tsx`):**
  - **Dynamic Layout & Workspace Padding (`App.tsx`):** Adjusted main workspace padding to `px-3 sm:px-gutter-desktop py-4 sm:py-space-xl min-w-0`, maximizing usable data real estate on small smartphone screens (320px–480px) while maintaining comfortable gutters on desktop (1440px+).
  - **Weekly Billing Trend Chart (`OverviewRecoveryView.tsx`):** Made SVG day labels responsive (`Fri (Peak)` on small mobile vs `Fri (Highest Gaps)` on tablet/desktop) preventing label overlap on narrow viewports.
  - **Clinical Data Tables (`UnbilledGapLedgerView.tsx`, `OverviewRecoveryView.tsx`):** Enforced responsive minimum table width (`min-w-[480px] sm:min-w-full`) inside horizontal scroll wrappers with momentum touch scrolling, ensuring doctor names, procedure codes, amounts, and action buttons never collapse into cramped single-character columns.
  - **Filter Bars & Sub-tab Navigators (`AiAuditView.tsx`, `ShaClaimsView.tsx`, `CsvIngestionModal.tsx`):** Made tab bars horizontally scrollable with `overflow-x-auto scrollbar-none shrink-0` across AI Audit steps, SHA claim status pills, and CSV ingestion source tabs.
  - **Endpoint & Code Text Safety (`IntegrationsView.tsx`):** Applied `break-all` to EMR and FHIR endpoint URIs (`http://localhost:8080/openmrs/ws/fhir2/R4`), eliminating card blowout on mobile.
  - **Authentication & Identity Gateway (`SignInView.tsx`, `ProfileView.tsx`):** Compacted 3-way navigation tabs with responsive labels (`Sign Up` / `Sign Up Facility`, `Guest` / `Guest Sandbox`) and added fluid avatar monogram scaling (`w-14 h-14` on mobile to `w-20 h-20` on desktop).

## [2.10.8] - 2026-10-02

### Removed
- **Removed Domain Whitelist Dialog from Authentication Gateway (`components/auth/SignInView.tsx`):**
  - Removed the targeted "Firebase Domain Whitelist Required" resolution modal (`showUnauthorizedDomainModal`) following confirmation of domain authorization in Firebase Console.
  - Removed inline whitelist helper link beneath the Google Sign-In button, restoring the clean, uncluttered gateway interface.
  - Cleaned up obsolete modal state variables, helper methods, and unused icon imports.

## [2.10.7] - 2026-10-01

### Fixed
- **Firebase Auth Domain Resolution & Error 0/1 Fix (`services/firebase.ts`, `components/auth/SignInView.tsx`, `constants/profiles.ts`):**
  - Suppressed uncaught `console.error` on Firebase `auth/unauthorized-domain` in `services/firebase.ts` and `SignInView.tsx`, routing domain verification into structured warnings and user-facing resolution flows.
  - Implemented the "Firebase Domain Whitelist Required" interactive modal with single-click hostname copying, direct link to Firebase Console Authentication Settings, and guidance for registering preview/staging URLs.
  - Added Elton Arunga (`eltonarunga@gmail.com`) to `PROFILES` with full executive administration rights, enabling instantaneous 1-click verified login while Firebase Console domain authorization propagates.
  - Added an inline domain whitelist helper link directly under the Google Sign-In button for quick diagnostic access.

## [2.10.6] - 2026-10-01

### Changed
- **Synchronized Web App Firebase Project Configuration (`firebase-applet-config.json`, `firestore.rules`):**
  - Updated `appId` to `1:669567718651:web:eef03592c52ebc425ecc5e` for project `kazira-io` matching the user's registered Firebase web app credentials.
  - Deployed `firestore.rules` enforcing security and access control boundaries.

### Removed
- **Removed Codebase-Only Artifacts from Website UI (`components/AppFooter.tsx`, `App.tsx`):**
  - Removed "Changelog" (`button#footer-nav-changelog`) and "API & Docs" (`button#footer-nav-docs`) buttons and modal dialogues from the healthcare application interface.
  - Retained all release notes, architecture specifications, and API documentation exclusively within the codebase repository (`CHANGELOG.md`, `README.md`, etc.).

## [2.10.5] - 2026-09-30

### Removed
- **Removed Compliance Card from Overview Recovery Dashboard (`components/views/OverviewRecoveryView.tsx`):**
  - Removed the targeted KDPA compliance badge card from the right-hand column of the recovery workspace.
  - Streamlined the column to focus strictly on actionable items (AI Audit Findings and the Priority Recovery Queue).

## [2.10.4] - 2026-09-30

### Removed
- **Design System UI Trigger Removed from App Navigation (`components/AppFooter.tsx`, `App.tsx`, `components/Sidebar.tsx`):**
  - Removed the targeted "Design System" button (`button#footer-nav-design-system`) from the institutional footer navigation (`AppFooter.tsx`).
  - Removed `onOpenDesignSystem` prop and the runtime modal component `DesignSystemModal.tsx`.
  - Design system specifications, tokens, and geometric rules remain documented exclusively in the codebase (`/design_language.md`).

## [2.10.3] - 2026-09-30

### Changed
- **Logo Restoration & Design System Documentation (`design_language.md`, `components/KaziraLogo.tsx`, `components/BrandLogo.tsx`, `public/favicon.svg`, `components/AppHeader.tsx`, `components/Sidebar.tsx`, `components/auth/SignInView.tsx`, `components/DesignSystemModal.tsx`):**
  - **Returned Official Healthcare Shield Emblem**: Restored the previous two-tone medical shield emblem (`KaziraEmblem`) with forest green (`#0d5d3a`) and warm ochre gold (`#c58c2b`) frame, central clinical staff, Caduceus coils, and upward recovery trend arrow as the primary brand identifier.
  - **Favicon & Headers Restored**: Replaced the monogram with the official shield emblem in `public/favicon.svg`, navigation headers (`AppHeader.tsx`), sidebar drawer (`Sidebar.tsx`), and the authentication gateway badge (`SignInView.tsx`).
  - **BrandLogo Defaults**: Set default variant to `'emblem'` across `BrandIcon`, `BrandEmblem`, and `ExecutiveLogo`.
  - **`design_language.md` Updated**: Added detailed documentation of the Healthcare Shield Emblem in Section 2, including full vector SVG specification, two-tone color symbolism (clinical sovereignty & revenue recovery), and healthcare authority alignment.

## [2.10.2] - 2026-09-30

### Changed
- **Design Language Harmonization & Official Monogram Implementation (`design_language.md`, `components/KaziraLogo.tsx`, `components/BrandLogo.tsx`, `index.css`, `public/favicon.svg`, `components/AppHeader.tsx`, `components/Sidebar.tsx`, `components/auth/SignInView.tsx`, `components/DesignSystemModal.tsx`):**
  - **Official Monogram ("The A has no crossbar. Kazira shows the gap.")**: Implemented the true `KaziraMonogram` SVG component representing the solid open 'A' geometry with the dashed red gap line (`#C4372A` / `#F0705F`) marking unbilled clinical revenue gaps. Previously `KaziraMonogram` was incorrectly aliased to `KaziraEmblem`.
  - **Color Tokens Alignment**: Synced `index.css` CSS variables with `design_language.md` v2.0 specification (`--surface: #F4F4F2` Paper in light mode, `--ink2: #5C5C5C` Ash, `--line: #DEDEDA`, `--surface: #171717` Graphite in dark mode, and added missing `--recover: #E5A11C` in dark mode).
  - **Marigold Rule**: Strictly enforced WCAG AA accessibility rule that Marigold (`#E5A11C`) carries `#0E0E0E` black text (`.chip.rec`).
  - **Favicon Synchronization**: Updated `public/favicon.svg` with the official open 'A' monogram showing the dashed red gap bar.
  - **Header & Navigation Consistency**: Integrated the official monogram into `AppHeader.tsx`, `Sidebar.tsx`, and `BrandLogo.tsx`, maintaining instant visual brand recognition.
  - **Design System Guide**: Expanded the Logo & Monogram showcase in `DesignSystemModal.tsx` to display wordmark and monogram across both dark and light contexts.

## [2.10.1] - 2026-09-30

### Fixed
- **Resolved Blank Screen on Applet Load (`server/security.ts`, `components/Sidebar.tsx`, `components/AppHeader.tsx`):**
  - **IFrame Embedding Restriction**: Removed `X-Frame-Options: SAMEORIGIN` header from `applySecurityHeaders` which was blocking the preview from rendering inside the Google AI Studio development iframe.
  - **Vite JSON Import Interception**: Fixed statutory route guard in `server/security.ts` that erroneously returned `403 Forbidden` for `.json` files, preventing Vite from loading `firebase-applet-config.json` module imports needed by `services/firebase.ts`.
  - **Frame Ancestors CSP Policy**: Configured `Content-Security-Policy` with `frame-ancestors 'self' https://*.google.com https://*.run.app https://aistudio.google.com https://ai.studio;` ensuring compliant, secure embedding.
  - **Defensive Rendering Guards**: Added optional chaining and safe fallback defaults for `activeProfile` references across `Sidebar.tsx` and `AppHeader.tsx` preventing runtime crashes when session states initialize.

## [2.10.0] - 2026-09-30

### Added
- **Firebase Firestore Database & Cloud Integration (`firebase-blueprint.json`, `firestore.rules`, `services/firebase.ts`, `server/security.ts`, `App.tsx`):**
  - Provisioned and integrated Firebase Firestore for real-time cloud data storage (`kazira-io`).
  - Added intermediate representation blueprint `firebase-blueprint.json` modeling `UserProfile`, `Facility`, `DebtItem`, and `ShaClaim`.
  - Authored and deployed secure Firestore security rules (`firestore.rules`) enforcing user-scoped read/write boundaries and tenant-partitioned access.
  - Implemented cloud synchronization for unbilled debts, patient procedures, and clinical recovery ledgers.
  - Hardened server Content-Security-Policy (`server/security.ts`) to permit Firebase Auth, Google APIs, and Firestore sockets (`identitytoolkit.googleapis.com`, `firestore.googleapis.com`, `accounts.google.com`).
  - Hardened database connection handling and guarded against unhandled promise rejections during initial network readiness checks.
- **Google Sign-In with Automated Facility Binding (`components/auth/SignInView.tsx`, `services/firebase.ts`):**
  - Integrated 1-click **Continue with Google** via Firebase Auth popup across both Sign In and Sign Up tabs.
  - Implemented automatic Firestore user profile lookup and synchronization upon Google authentication.
  - Added streamlined first-time Google onboarding modal enabling doctors and clinic admins to bind their Google accounts directly to their Kenyan hospital name and KMHFL code.

### Changed
- **Minimalist Hamburger Menu Overhaul (`components/Sidebar.tsx`):**
  - Stripped away visual clutter, redundant metric cards, and duplicate launchers.
  - Focused strictly on 5 core workspaces: **Dashboard**, **Unbilled Gaps**, **Insurance & SHA**, **AI Audit**, and **Integrations**.
  - Retained a compact, single-row Quick Tools menu (**Ingest CSV**, **Audit History**, and **Facility Settings**).
  - Pinned a clean, ergonomic session footer with user avatar, name, facility code, and direct one-click Sign Out.

## [2.9.1] - 2026-09-29

### Changed
- **Logo Restoration (`components/KaziraLogo.tsx`, `components/BrandLogo.tsx`, `components/AppFooter.tsx`):**
  - Restored the official Kazira Clinical Intelligence shield emblem featuring the caduceus serpents, central medical staff with ring terminal, and upward golden recovery trend arrow.
  - Retained `KaziraEmblem` across `AppHeader`, `Sidebar`, `BrandLogo`, `AppFooter`, and institutional branding.
- **Primarily White Canvas & Dark Mode Toggle (`index.html`, `index.css`, `tailwind.config.js`, `App.tsx`, `AppHeader.tsx`, `Sidebar.tsx`, `Settings.tsx`, `utils/theme.ts`, `components/auth/SignInView.tsx`):**
  - Set the default background across the application canvas, body, and cards to crisp, high-contrast white (`#FFFFFF`) in light mode.
  - Implemented full dark mode option with low-light graphite (`#171717`) and deep black (`#0E0E0E`) surfaces with high-contrast typography (`#F5F5F3`).
  - Added dedicated theme toggle controls in:
    - **App Header (`#theme-mode-toggle`)**: Quick one-click Sun/Moon toggle next to practitioner profile.
    - **Sidebar Drawer (`#sidebar-theme-toggle` & `#sidebar-theme-row`)**: Fast switch in the top header and Session & Account section.
    - **Sign In / Sign Up Gate (`SignInView.tsx`)**: Prominent theme toggle in the top bar for testing both themes immediately.
    - **Facility Settings (`components/Settings.tsx`)**: Visual theme selection cards ("Primarily White" and "Dark Mode").
  - Persisted user theme preference in `safeStorage` (`kazira_theme`) with synchronous document attribute (`data-theme`) and `.dark` class synchronization.
- **Sign Up & Sign In Handling Overhaul (`components/auth/SignInView.tsx`, `App.tsx`, `components/AppHeader.tsx`):**
  - Structured facility onboarding into three intuitive clinical sections: Facility Identification, Administrator & Clinical Lead, and Security & Statutory KDPA Compliance.
  - Added complete 47-county registry of Kenya for precise facility jurisdiction mapping.
  - Improved credential handling with dual support for Master Health Facility List (KMHFL) codes and official emails.
  - Added live password match indicator, password length policy verification, and show/hide password toggle.
  - Enhanced 1-click Quick-Fill accounts with instant direct-login capability.
  - Added device workstation registry with 1-click session resume and profile removal.
  - Added discrete Header Sign Out / Switch Facility action (`#header-signout-btn`).

## [2.9.0] - 2026-09-29

### Added
- **Official Kazira Design System Specification (`design_language.md`):**
  - Documented the design system: *"The A has no crossbar. Kazira shows the gap."*
  - Detailed the 4 core design principles: **Show the Gap** (dashed missing revenue outline), **Black and White First** (monochrome base, color strictly reserved for financial meaning), **Say the Action** (every insight concludes with a next step sentence), and **Calm and Exact** (generous space, tabular numbers, no urgency theatre).
  - Specified official vector geometry for both the **Kazira Wordmark** (open 'A' glyphs without crossbars) and the **Kazira Monogram** (open 'A' with dashed leak-red bar marking the gap).
  - Documented semantic color tokens: Black (`#0E0E0E`), White (`#FFFFFF`), Paper (`#F4F4F2`), Graphite (`#171717`), Ash (`#5C5C5C` / `#A0A0A0`), Line (`#DEDEDA` / `#2A2A2A`), Marigold (`#E5A11C` - strictly paired with black text `#0E0E0E`), Leak Red (`#C4372A` / `#F0705F`), Billed Green (`#1F7A4F` / `#5FC496`), and Focus Blue (`#1B6FD1`).
  - Added comprehensive guidelines for typography (Sora for headings/figures in sentence-case; Source Sans 3 for body/tables), component patterns (`.gapc`, `.btn`, `.chip`, `.say`), and accessibility compliance (WCAG AA).
- **Interactive Design System Showcase Modal (`components/DesignSystemModal.tsx`):**
  - Integrated a live visual guide presenting the wordmark on dark/light surfaces, animated monogram, color swatches, typography scales, buttons, chips, and "Say the Action" component patterns.
  - Linked launcher buttons in the sidebar shortcuts grid (`#shortcut-design-system`) and in the institutional footer (`#footer-nav-design-system`).

### Changed
- **Typography & Font Integration (`index.html`, `index.css`, `tailwind.config.js`):**
  - Connected Google Fonts for `Sora` (400, 600, 700) and `Source Sans 3` (400, 600, 700).
  - Configured `:root` and `:root[data-theme="dark"]` CSS variables and base typography rules with `tabular-nums` for all financial figures.
- **Brand Marks & Vector Graphics (`components/KaziraLogo.tsx`, `components/BrandLogo.tsx`, `components/AppHeader.tsx`, `components/Sidebar.tsx`):**
  - Replaced legacy emblems with official `KaziraWordmark` and `KaziraMonogram`.
  - Added dashed gap animation (`@keyframes d`) conforming to `prefers-reduced-motion`.
- **Button & Component Tokens (`components/Button.tsx`, `components/views/OverviewRecoveryView.tsx`):**
  - Standardized `Button` to the 44px min-height ergonomic touch standard with `btn-kazira` variants.
  - Refreshed KPI cards on the executive recovery dashboard using `.gapc` (dashed border for unbilled gaps), Marigold chips for recovered revenue, and Sora tabular displays.

## [2.8.4] - 2026-09-18

### Added
- **Manual CSV & Hospital PMS Ingestion Module on Dashboard (`components/views/OverviewRecoveryView.tsx`, `App.tsx`):**
  - Added a dedicated "Manual CSV & Hospital PMS Ingestion" action section (`#dashboard-csv-pms-ingestion`) right on the executive recovery dashboard.
  - Provided direct modal launcher button (`#dashboard-cta-upload-csv`) for uploading or pasting encounter CSV records with real-time KDPA 2019 SHA-256 HMAC pseudonymisation.
  - Implemented 1-click blank template download (`#dashboard-cta-download-template`) tailored to the active facility's MFL code.
  - Added supported PMS format badges (KenyaEMR, Fun-Soft, Meditech, OpenMRS FHIR, Kranium, Standard CSV) and direct PMS connector navigation.
  - Added "Manual CSV / PMS" action button in the dashboard top header and an "Ingest Hospital CSV" CTA within the zero-state billing trend chart.

## [2.8.3] - 2026-09-17

### Changed
- **Shortcut Grid & Visual Alignment in Hamburger Menu (`components/Sidebar.tsx`):**
  - Standardized the 2-column shortcut tools grid with uniform touch-friendly dimensions (`h-10 min-h-[40px] px-2.5`) and optical baseline alignment across all items.
  - Implemented dedicated micro-icon containers (`w-6 h-6 rounded-md bg-surface-container-high/80`) for all shortcuts (History, Ingest CSV, Data Vault, Settings, Take Tour, FAQ & Help, Share Briefing) ensuring optical column and row alignment down to the single pixel.
  - Harmonized color palettes across shortcut icons to the cohesive brand primary tone, eliminating inconsistent amber styling.
  - Fixed invalid Tailwind padding classes and enhanced touch ergonomics and active/focus states.
  - Added unique `id` attributes (`shortcut-history`, `shortcut-ingest-csv`, `shortcut-data-vault`, `shortcut-settings`, `shortcut-take-tour`, `shortcut-faq`, `shortcut-share-briefing`, etc.) and ARIA attributes for full accessibility compliance.

## [2.8.2] - 2026-09-17

### Removed
- **"Switch Persona" Section (`components/views/ProfileView.tsx`):**
  - Removed the targeted Persona Switcher card (`div#root > ... > div:nth-of-type(2) > div:nth-of-type(2) > div:nth-of-type(2)`) and its header from the Practitioner Profile view.
  - Persona management and role testing are now housed exclusively within the mobile hamburger drawer and sidebar, eliminating duplication and streamlining statutory registration credentials.

## [2.8.1] - 2026-09-17

### Removed
- **Guest Sandbox Mode Notification Banner (`App.tsx`):**
  - Deleted the targeted Guest Sandbox Mode notification banner element (`#guest-mode-banner`) from the main content container.
  - Removes vertical overhead and banner clutter, allowing direct, immediate visibility of the executive revenue overview and clinical data views.

## [2.8.0] - 2026-09-17

### Changed
- **Unified Navigation & Operational Shortcuts in Hamburger Menu / Sidebar (`Sidebar.tsx`, `AppHeader.tsx`, `App.tsx`):**
  - Migrated all shortcut menu details previously housed in the `AppHeader` dropdown popover directly into the hamburger menu / sidebar drawer.
  - Integrated **Clinical Control & AI Engine** section into the sidebar: Run Dual-Loop AI Audit, Total Recovered telemetry capsule, and live Sovereign Server node indicator.
  - Integrated **Operational Shortcuts** grid into the sidebar: Audit History with dynamic badge count, Share Briefing with clipboard fallback, System FAQ, Ingest CSV, Settings, Take Tour, and Data Vault & Export.
  - Integrated **Session & Account Management** into the sidebar: Profile overview card, Guest Sandbox mode switcher, persona/role switcher, and session sign out.
  - Removed the redundant dropdown chevron button (`#shortcut-menu-trigger`) and floating popover from `AppHeader.tsx`, providing a cleaner, institutional header layout with direct access to user profile and hamburger drawer toggle.

## [2.7.3] - 2026-09-17

### Removed
- **Selected Guest Access Icons (`SignInView.tsx`):**
  - Deleted the targeted SVG elements from the `Guest Access` tab button (`#auth-tab-guest > svg:nth-of-type(1)`) and the `Standard Sandbox Guest Mode` card header (`div#root > ... > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > svg:nth-of-type(1)`).
  - Streamlines the Guest Access pane and navigation tabs, matching the minimalist, typography-led institutional aesthetic.

## [2.7.2] - 2026-09-17

### Removed
- **Selected Registration Notice Banner (`SignInView.tsx`):**
  - Deleted the targeted notice element (`div#root > ... > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1)`) from the Facility Registration / Sign Up tab.
  - Eliminates visual clutter above the registration form, allowing hospital onboarding staff to focus directly on entering facility and administrator credentials.

## [2.7.1] - 2026-09-17

### Removed
- **Selected Sign-In Footer Cross-Link Container (`SignInView.tsx`):**
  - Deleted the targeted `<div>` element (`div#root > ... > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2)`) containing the redundant cross-link prompt below the Facility Sign In form.
  - Streamlines the Sign In pane to keep user attention strictly focused on hospital credential submission, leaving tab switching to the primary top navigation segments.

## [2.7.0] - 2026-09-17

### Added
- **Manual Clinical CSV Ingestion Engine (`components/CsvIngestionModal.tsx`, `utils/csvParser.ts`):**
  - Full-stack manual CSV ingestion allowing authenticated hospital accounts and guest evaluators to batch ingest clinical records directly from KenyaEMR or billing spreadsheets.
  - Client-side parser with KDPA 2019 SHA-256 HMAC pseudonymisation transforms patient names and MRNs into secure pseudonyms before leaving the browser.
  - Interactive modal with drag-and-drop file upload, raw text editor, real-time data quality scoring (0–100%), column headers detection, and live table preview.
  - Three pre-packaged clinical sample datasets: Main Theatre Consumables, SHA Gazette Claims Manifest, and Outpatient Fee Register.
  - Blank CSV template generator with standard column schemas for clinical staff.
  - Direct trigger to launch the dual-loop Gemini AI recovery audit on ingested records.
- **Batch Debt API & Storage (`server.ts`, `serverStore.ts`, `services/apiService.ts`):**
  - Added `POST /api/debts/batch` with multi-tenant partitioning (`isGuest` and `facilityCode`).
  - Added `saveDebtItemsBatch` method in `apiService` for atomic synchronization with offline local caching in `safeStorage`.
- **UI Entry Points (`UnbilledGapLedgerView.tsx`, `IntegrationsView.tsx`, `AppHeader.tsx`, `DataManagement.tsx`):**
  - Added "Ingest CSV Batch" action in the Unbilled Gap Ledger header and within the empty-state callout for real facilities.
  - Added "Manual CSV & PMS Ingestion" connector card in the Interoperability Gateway Hub.
  - Added "Ingest CSV" action in the AppHeader shortcuts menu.
  - Added "Manual CSV & PMS Ingestion" section in the Data Management & Vault modal.

## [2.6.4] - 2026-09-16

### Removed
- **Header Badge Pill Deletion (`SignInView.tsx`):**
  - Deleted the targeted `<span>` badge (`Zero-Mock Guarantee`) from the facility registration pane header (`div#root > ... > span:nth-of-type(1)`).
  - Aligned the evaluator sandbox header by removing the corresponding `Non-Destructive Demo` badge, establishing consistent, minimalist typography across all authentication tab headers.

## [2.6.3] - 2026-09-16

### Removed
- **Sign-In Quick Facility Switcher Segment (`SignInView.tsx`):**
  - Removed the targeted "Quick test facilities" segmented switcher block and persona chips from the primary sign-in form pane, eliminating demo clutter and presenting an unencumbered credential entry interface for operational facility staff.

## [2.6.2] - 2026-09-16

### Removed
- **Selected Element Deletion (`SignInView.tsx`):**
  - Deleted the targeted `<span>` element (`Sovereign Login` badge) from the Facility Sign In form pane header (`div#root > ... > span:nth-of-type(1)`), creating a cleaner and uncluttered section header for hospital users.

## [2.6.1] - 2026-09-16

### Added
- **Official Brand Logo & Vector Emblem (`components/KaziraLogo.tsx`, `public/kazira-logo.svg`, `public/favicon.svg`):**
  - Implemented the official Kazira Clinical Intelligence brand mark: a two-tone shield framing the Caduceus serpent coils, central ringed staff, and an upward revenue recovery growth arrow in authentic forest green (`#0d5d3a`) and warm ochre gold (`#c58c2b`).
  - Added vector component `<KaziraLogo>` and `<KaziraEmblem>` supporting both standalone emblem and full typographic lockup.
  - Exported standalone high-resolution SVG assets to `/public/kazira-logo.svg` and updated `/public/favicon.svg`.

### Changed
- **Selected Sign-In Header Logo Element (`SignInView.tsx`):**
  - Updated the focused logo container with elevated contrast styling (`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white shadow-lg border border-white/40 p-2 sm:p-2.5 transition-transform hover:scale-105`), rendering the new emblem crisply against the sovereign banner background.
  - Aligned brand marks across `Sidebar.tsx` and `AppHeader.tsx` to use the unified emblem.

## [2.6.0] - 2026-09-16

### Removed
- **Sovereign KDPA Compliance Gateway Branding & Navigation:**
  - Removed `"& Sovereign KDPA Compliance Gateway"` from the header subtitle on the authentication screen (`SignInView.tsx`), refocusing the platform purely on `"Kenya Healthcare Revenue Recovery"`.
  - Applied clean, proportional typography styling (`text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-md font-medium tracking-normal`) to the target subtitle element.
  - Removed the standalone `Compliance` navigation tab from `Sidebar.tsx` and retired its route handler from `App.tsx` and `types.ts`.
  - Streamlined `OverviewRecoveryView.tsx` by replacing the gateway navigation button with an inline local encryption status badge (`Zero PII Exfiltration`).
  - Removed the simulated `KDPA Sovereign Node` gateway card from `IntegrationsView.tsx`, focusing the interoperability directory strictly on healthcare EHR and national financial infrastructure (KenyaEMR FHIR, MoH DHIS2, SHA National Clearinghouse, Africa's Talking, and Safaricom Daraja M-Pesa).

## [2.5.9] - 2026-09-16

### Fixed
- **AI Metric Extraction Request Payload Parameter Alignment (`server.ts`, `services/geminiService.ts`):**
  - Resolved `Missing "text" string in request body.` HTTP 400 error on `/api/ai/extract-metrics`.
  - Updated `/api/ai/extract-metrics`, `/api/ai/narrative`, and `/api/ai/audit` in `server.ts` to flexibly accept both `data` and `text` payload aliases.
  - Aligned `services/geminiService.ts` to dispatch both `data` and `text` properties across all AI proxy requests.

## [2.5.8] - 2026-09-16

### Enhanced
- **Minimalist & Visually Readable Institutional Footer (`AppFooter.tsx`, `App.tsx`):**
  - **Modular Architecture:** Extracted the footer from `App.tsx` into a dedicated `components/AppFooter.tsx` sub-component.
  - **Visual Hierarchy & Optical Readability:** Replaced the dense, monospaced single-line bullet list with an airy, two-tier layout featuring balanced negative space, subtle hairline dividers, and high-contrast body typography.
  - **Facility & Regulatory Context:** Consolidated institutional context into a clean facility badge (`MFL #` normalized to eliminate duplicated prefixes) paired with an active KDPA 2019 Sovereign Node indicator.
  - **Grouped Action Links:** Organized navigation links into scannable semantic groupings (Resources: System FAQ, API & Docs, Changelog; Governance: Privacy, Terms, KDPA DPA; Tools: Feedback, Data Vault) with single-line labels and clear hover transitions.
  - **Contact & Compliance Sub-line:** Structured phone, email, and sovereign local node confirmation cleanly on a subtle baseline row.

## [2.5.7] - 2026-09-16

### Added
- **Full-Stack Multi-Tenant Backend Integration (`server.ts`, `server/store.ts`, `services/apiService.ts`):**
  - **Facility Registration & Profiles API (`/api/auth/register`, `/api/auth/profiles`):** Connected the Sign-Up workflow directly to the sovereign Express backend. When hospital administrators register, the facility profile is securely recorded in the persistent server store, a sovereign session token is generated, and a zero-mock partitioned ledger is immediately initialized.
  - **SHA Claims Multi-Tenant Endpoints (`/api/claims` GET, POST, PUT, DELETE):** Exposed RESTful claims management endpoints partitioned by `isGuest` and `facilityCode` headers. Ensures strict isolation between guest sandbox simulation claims and production hospital batches.
  - **Full-Stack Claims Synchronization (`ShaClaimsView.tsx`):** Integrated real-time claims fetching, inline tariff adjustment persistence, KenyaEMR encounter ingestion, and manual claim creation directly with the backend API while maintaining resilient client cache fallback.
  - **Recovery Logbook Backend Persistence (`App.tsx`, `services/apiService.ts`):** Added automated dispatch of newly resolved debt recovery log entries (`apiService.saveRecoveryEntry`) upon debt collection, dismissal, or escalation.
  - **Deterministic AI Dual-Loop Report Audit Realignment:** Fixed argument order (`auditReport(data, narrative)`) in `/api/ai/audit` and normalized response structure (`result.audit || result.auditedReport`) across `server.ts` and `geminiService.ts`.

## [2.5.6] - 2026-09-16

### Added
- **Unified 3-Way Authentication Suite (`SignInView.tsx`):**
  - **Sign In Tab:** Credential and institutional MFL-based authentication with remember-me preference, dynamic facility validation against statutory records, and zero cloud spillover.
  - **Sign Up Tab:** Dedicated facility onboarding registration form capturing facility name, official MFL code, operational model (`private` vs. `public_faith`), county, clinical lead credentials, and KDPA compliance attestation. Instantly initializes fresh accounts with a strict zero-mock guarantee.
  - **Guest Access Tab:** One-click sandbox evaluation environment showcasing real Kenyan healthcare archetypes (Dr. Amina Mutua, David Kiprop, Dr. Jane Kerubo, or general Sandbox Evaluator) preloaded with benchmark simulation data.
  - **Tenant Data Isolation & Persistence (`App.tsx`):** Integrated `handleSignUp` and multi-tenant ledger resets so newly registered facilities onboard to empty unbilled ledgers, clean claims batches, and unpopulated debt queues ready for live EMR integration.

### Enhanced
- **Zero-Mock Assurance for Real Sign-In & Onboarding Profiles:**
  - **Onboarding Tour (`Onboarding.tsx`):** Neutralized hardcoded benchmark figures (e.g., KES 3.42M, 81% capture rate) from the onboarding tour copy to eliminate mock assumptions for newly onboarded clinics.
  - **Dynamic Top Navigation Capsule (`AppHeader.tsx` & `App.tsx`):** Converted the header "Total Recovered" indicator and capture badge to dynamically evaluate the authenticated facility's actual collections (`KES 0` / "Ready" upon first login) while preserving rich demo telemetry strictly for guest sandbox evaluators.
  - **Tenant Storage Hardening:** Verified that client and server data stores strictly isolate records (`kazira_debt_items_<facilityCode>`, `kazira_sha_claims_<facilityCode>`), ensuring new production accounts onboard to pristine, empty ledgers ready for live KenyaEMR or CSV ingestion.

## [2.5.4] - 2026-09-15

### Added
- **Restored Mock Entities (Eldoret Doctors Plaza & David Kiprop) to Guest Evaluator Access:**
  - Added "David Kiprop, CPA (K)" (`Eldoret Doctors Plaza`, `MFL #18204`) back as a dedicated evaluator guest profile in `constants/profiles.ts`.
  - Updated the **Guest Evaluator Access** panel in `SignInView.tsx` with a responsive 3-column selector covering:
    1. **Dr. Amina Mutua** (`Nairobi West Memorial Hospital`, `MFL #14920`)
    2. **David Kiprop, CPA (K)** (`Eldoret Doctors Plaza`, `MFL #18204`)
    3. **Dr. Jane Kerubo** (`Nairobi County Health Services`, `MOH-NRB-HQ`)
    Along with the standalone **Sandbox Guest** mode.
  - Enabled switching and access for evaluator sessions across all UI persona switchers (Profile view, App header menu, and Sign-In view).

## [2.5.3] - 2026-09-15

### Removed
- **Removed 1-Click Clinical Personas from Sign-In Interface (`SignInView.tsx`):**
  - Completely removed the "1-Click Clinical Personas (Evaluator Access)" block, the "Instant Access" badge, and the profile shortcut buttons (Dr. Amina Mutua and Dr. Jane Kerubo) from the sign-in modal.
  - The login view now centers strictly on facility credential entry (Work Email / MFL code and PIN/password) and the guest sandbox option.
  - Cleaned up unused icons and imports in `SignInView.tsx`.

## [2.5.2] - 2026-09-15

### Removed
- **Eliminated Hardcoded Mock Facility & Profile Artifacts:**
  - Removed "David Kiprop, CPA (K)" and "Eldoret Doctors Plaza" (`MFL #18204`) from `constants/profiles.ts`. Authenticated profiles now strictly reflect genuine production institutions (Dr. Amina Mutua at Nairobi West Memorial Hospital and Dr. Jane Kerubo at Nairobi County Department of Health Services).
  - Sanitized cached local storage session logic in `App.tsx` to automatically invalidate and purge any stale `user-david-kiprop` profiles, resetting seamlessly to the default administrator.
  - Adjusted quick sign-in grid in `SignInView.tsx` from 3 columns to 2 columns to cleanly present the active authenticatable profiles.
  - Replaced hardcoded "Dr. Kiprop" fallbacks in `server/gemini.ts` with dynamically extracted clinicians and neutral attending clinician references.
  - Updated sample data in `constants.tsx`, `components/views/OverviewRecoveryView.tsx`, and `components/views/UnbilledGapLedgerView.tsx` to eliminate all occurrences of "Dr. Kiprop".

## [2.5.1] - 2026-09-14

### Changed
- **Comprehensive Mock Data Elimination for Production Accounts:**
  - **SHA Claims Adjudication (`ShaClaimsView.tsx`):**
    - Isolated claims state by tenant using facility-specific local vaults (`kazira_sha_claims_${facilityCode}`) for authenticated accounts.
    - Production facilities start with clean zero-state queues instead of hardcoded sample claims, featuring active "Sync KenyaEMR" and "New Claim" modal actions.
    - Converted all batch metric cards (Total Claims, Ready to Submit, Action Required, Pass Rate) to 100% dynamic arithmetical calculations derived strictly from actual queued records when running in production mode.
  - **Dual-Loop AI Audit View (`AiAuditView.tsx`):**
    - Suppressed default Nairobi West Memorial Hospital synthetic narratives, verification logs, and financial metrics for authenticated facility profiles until an actual audit is triggered.
    - Added clean institutional zero-state cards with 1-click audit triggers tailored to the active facility's statutory name and MFL code.
    - Preserved rich synthetic demonstration data exclusively for interactive Guest Sandbox sessions (`isGuest: true`).
  - **App Orchestrator (`App.tsx`):**
    - Threaded `isGuest` and `activeProfile` props into `OverviewRecoveryView`, `ShaClaimsView`, and `AiAuditView` for uniform multi-tenant state governance.

## [2.5.0] - 2026-09-14

### Added
- **Multi-Tenant Sovereign Data Partitioning (`server/store.ts`, `server.ts`, `apiService.ts`, `App.tsx`):**
  - Implemented strict isolation between the interactive Guest Sandbox (`isGuest: true`) and real authenticated facilities (`isGuest: false`, scoped by statutory `facilityCode`).
  - Real hospital administrators and evaluators start with zero mock/sample data in their live clinical accounts, preventing mock data pollution in production records while preserving rich sandbox demonstration datasets for guest auditors.
- **Client-Side Resource Fallback & 404 Handler (`NotFoundView.tsx`):**
  - Created dedicated responsive 404 view displaying clinical guidance, clear HTTP status badges, and one-click return paths to the primary overview dashboard and unbilled ledger.
- **Security & Input Sanitization Layer (`utils/sanitize.ts`, `server/security.ts`):**
  - Added XSS sanitization and strip-tag routines for all clinical text inputs, patient pseudonym tokens, and procedure descriptions.
  - Added strict numeric validation for Kenya Shillings (`KES`) monetary fields to prevent negative or non-numeric values.
  - Enforced rate limiting, Content Security Policy, X-Content-Type-Options, and Bearer session verification on the sovereign Express backend.
- **Brand Mark Click Navigation (`AppHeader.tsx`, `Sidebar.tsx`):**
  - Enabled direct return navigation to the executive recovery overview when clicking the brand emblem across all headers and navigation sidebars.

### Fixed
- **TypeScript Strict Compilation & Type Alignment (`types.ts`, `UnbilledGapLedgerView.tsx`, `server.ts`):**
  - Extended `DebtItem` interface with optional clinical metadata (`department`, `doctorName`, `icd10Code`, `notes`) and `BaselineConfig` with `hospitalName`.
  - Resolved type discrepancies in CSV export attribution and guarded department array filter checks.
  - Eliminated duplicate key declarations in the server-side authentication response.

## [2.4.2] - 2026-09-13

### Fixed
- **API Error Resilience & Deterministic Fallback**:
  - Resolved `generateNarrative`, `extractMetrics`, and `auditReport` 400 `API key not valid` error logging when unconfigured or placeholder keys are provided.
  - Added `safeGeminiCall` wrapper that catches API key errors without generating unhandled runtime logs, automatically marks invalid keys, and seamlessly executes deterministic clinical audit extraction.
  - Added `isGeminiActive` telemetry to `/api/health` and `/api/system/status` endpoints to clearly distinguish between live API and sovereign deterministic offline operation.

## [2.4.1] - 2026-09-13

### Added
- **Direct Profile Page Navigation:**
  - Header profile button (avatar, name, facility code) now directs straight to the dedicated Clinical Practitioner Profile page (`activeTab = 'profile'`), styled with an active sovereign ring.
  - Added dedicated Profile button in `Sidebar.tsx` footer for direct access on both desktop and mobile layouts.
  - Implemented `ProfileView.tsx` component with practitioner credentials, editable contact endpoints (name, title, work email, phone, department), statutory credentials (KMPDC practice license, MoH MFL registry, KDPA ODPC certificate), notification preferences (Africa's Talking SMS alerts, SHA claims daily digest), granted permissions checklist, instant persona switcher, and session sign out controls.
- **Refined Sign In & Sign Out Flow:**
  - Implemented `isAuthenticated` session gating with local encrypted vault persistence in `safeStorage`.
  - Created sovereign `SignInView.tsx` with:
    - 1-Click Clinical Personas for instant evaluator access (Dr. Amina Mutua, Dr. Jane Kerubo, David Kiprop).
    - Facility work credentials authentication form (Work email or MFL code and facility PIN).
    - 1-Click Guest Sandbox Access with preloaded synthetic FHIR encounters.
    - Statutory KDPA Section 31 sovereign tokenization guarantee.
  - Added graceful sign-out confirmation modals in both `ProfileView.tsx` and `AppHeader.tsx`.

## [2.4.0] - 2026-09-13

### Added
- **Minimalist Header & Unified Shortcut Menu (`AppHeader.tsx`):**
  - Streamlined the global top header to display exclusively the minimalist brand logo and the Profile Shortcut pill, eliminating visual clutter.
  - Engineered an accessible, responsive Shortcut Menu dropdown consolidating all auxiliary tools and clinical actions:
    - **Active Profile Card**: Monogram avatar, full name, clinical title, email, facility name, MFL registry code, and KDPA status badge.
    - **Guest Sandbox Banner & Quick Toggle**: Direct action to switch between guest sandbox simulation and licensed facility administrator.
    - **Clinical AI Engine Trigger**: Primary "Run Dual-Loop AI Audit" button with Gemini 3.8 Dual-Loop badge and live spinner.
    - **Revenue Recovery Capsule**: Total recovered counter (KES 3,420,000 / 81% capture rate).
    - **Sovereign Status Indicator**: Online sync telemetry with roundtrip latency and Nairobi DC cloud status.
    - **Operational Shortcuts**: Audit History with live item counter, Executive Briefing share action, System FAQ knowledge base, Facility Settings & Gateways, Guided Onboarding Tour launcher, and Data Vault.
    - **Persona Switcher**: Seamless switching between Dr. Amina Mutua (Facility Admin), Dr. Jane Kerubo (County Health Director), David Kiprop, CPA (Finance Director), and Guest Evaluator.
- **Kenyan Clinical Persona & Profile Infrastructure (`types.ts`, `constants/profiles.ts`):**
  - Added strict `UserProfile` interface with role typing (`facility_admin`, `county_health`, `moh`, `guest`), facility metadata, MFL codes, and specific administrative permissions.
  - Implemented persistent profile storage via `safeStorage` with instant toast feedback upon switching.
- **Guest Sign In Flow:**
  - One-click Guest Sign In feature allowing immediate evaluation in a safe sandbox mode with synthetic patient records.
  - Contextual Guest Sandbox notice banner at the top of the workspace providing quick actions to take the guided tour or return to staff administrator mode.
- **Onboarding Machine (`Onboarding.tsx` & `App.tsx`):**
  - Full 8-step interactive tour detailing KDPA 2019 DPIA tokenization, pre-Kazira baseline configuration, KenyaEMR data ingestion, Gemini 3.8 dual-loop audit determinism, unbilled gap ledger reconciliation, and live launch.
  - Auto-launches for new visitors and is re-launchable anytime from the Profile Shortcut Menu or Guest Banner.

## [2.3.0] - 2026-09-13

### Added
- **Minimalist Sovereign Header (`AppHeader.tsx`):**
  - Redesigned top navigation with an ultra-clean geometric medical mark, single-line facility identifier, and sleek recovery capsule.
  - Added high-hierarchy "Run Audit" primary CTA with live Gemini 3.8 audit spinning indicators.
  - Implemented Web Share API briefing launcher with one-click clipboard fallback and notification toast.
  - Unified action icons (Settings, Audit History, FAQ, Status) with 44px minimum touch targets and accessible focus rings.
- **20-Point Site Optimization & Production Readiness:**
  - **1. Privacy Policy (`PrivacyPolicy.tsx`):** KDPA 2019 comprehensive policy covering Data Controller vs Processor roles, SHA-256 tokenization, 90-day retention, and DPO contact.
  - **2. Terms of Service (`TermsOfService.tsx`):** Master clinical agreement defining clinical non-interference boundaries, SHA pre-submission verification, and NCIA arbitration.
  - **3. Clear CTA:** High-contrast pine emerald primary action ("Run Audit") visible in header and recovery views.
  - **4. System FAQ (`FaqModal.tsx`):** Searchable, categorized knowledge base with 8 comprehensive topics on revenue leakage, SHA tariffs, KDPA compliance, and EMR integration.
  - **5. robots.txt (`public/robots.txt`):** Search engine crawler configuration allowing public indexing, disallowing internal `/api/`, and linking to sitemap.
  - **6. sitemap.xml (`public/sitemap.xml`):** Comprehensive XML sitemap covering all clinical routes and legal pages with priority rankings.
  - **7. Custom 404 (`public/404.html`):** Sovereign-branded 404 error page with diagnostic explanation and quick return actions.
  - **8. Alt Text & Accessible SVGs (`BrandLogo.tsx`):** Added `role="img"` and descriptive `aria-label` tags across all vector graphics and emblems.
  - **9. KDPA Analytics (`utils/analytics.ts`):** Client-side analytics engine with event catalog, cookie consent gating, and zero patient PII collection.
  - **10. Dynamic Meta Titles:** Synchronized `document.title` across every navigation view with hospital context.
  - **11. High-Conversion Meta Descriptions:** Tailored Kenyan health revenue recovery and SHA compliance descriptions in `index.html`.
  - **12. Social Share (OpenGraph & Twitter):** Added OpenGraph, Twitter Cards, and schema.org JSON-LD with `en_KE` locale.
  - **13. Sovereign Favicon (`public/favicon.svg`):** Vector medical cross with amber telemetry line on pine emerald `#005235`.
  - **14. Canonical URLs:** Standardized canonical tags in `index.html` and dynamic route updates.
  - **15. Cookie Consents (`CookieConsent.tsx`):** Minimalist floating consent banner separating strictly necessary KDPA tokens from optional telemetry.
  - **16. Mobile Responsiveness:** Verified mobile navigation drawer, fluid typography, and touch target standards across all viewports.
  - **17. Accessibility (a11y):** Implemented Escape key listeners in `Modal.tsx`, `role="dialog"`, `aria-modal="true"`, and WCAG AA contrast compliance.
  - **18. Form Validation & Testing:** Verified procedural gap addition, status transitions, and inline search filters.
  - **19. Link Verification:** Audited and resolved all footer and modal triggers across legal, documentation, and feedback dialogs.
  - **20. Performance Optimization:** Lazy loading for all modal dialogues via `React.lazy` and `Suspense`, lightweight SVG icons, and explicit Express crawler routes.

## [2.2.2] - 2026-09-12

### Fixed
- **Gemini Engine Error Handling & Fallback Resilience:**
  - Resolved `API_KEY_INVALID` runtime exceptions when initiating clinical AI narrative generation and structured metrics extraction.
  - Upgraded model selection to `gemini-3.8-flash` per modern `@google/genai` guidelines, and added `'aistudio-build'` User-Agent telemetry headers.
  - Implemented dual-mode intelligence fallback: queries live Gemini API first, seamlessly defaulting to deterministic KDPA-compliant clinical extraction if the external key is invalid or pending configuration, eliminating 500 errors.
  - Cleaned up client-side request headers in `geminiService.ts` to prevent stale browser tokens from overriding server-side credentials.
  - Redesigned `Settings.tsx` into a Facility & Compliance management module, removing prohibited client-side API key inputs and referencing platform Secrets management.

### Changed
- **Architectural & Visual Polish (Anti-Slop Compliance):**
  - Eliminated arbitrary glassmorphism and background blur effects across navigation headers, backdrops, and modal dialogs in favor of crisp, opaque surface layering with 1px tactile borders.
  - Standardized component corner geometry according to nested border radius mathematics (`rounded-md` on cards/containers, `rounded` on child controls and badges), removing pill-inside-card visual conflicts.
  - Stripped unnecessary artificial animations and glowing shadows across modals, badges, and interactive controls.
  - Refactored `ShaClaimsView`, `DebtReceivablesList`, `RecoveryLogbook`, `Onboarding`, and modal dialogues to adhere to high-contrast clinical design standards.

### Removed
- **Dead Code Elimination:** Removed unreferenced legacy `LandingPage.tsx` and unused `DashboardSkeleton.tsx` artifacts to maintain a lean, single-source-of-truth codebase.

## [2.2.0] - 2026-09-12

### Changed
- **Minimalist & Streamlined UI Refactoring:**
  - **App Header (`AppHeader.tsx`):** Reduced visual noise and redundancy by compacting MFL facility identifiers, live ping badges, and report history buttons into an uncluttered, high-contrast bar.
  - **Recovery Overview (`OverviewRecoveryView.tsx`):** Restructured into a clean, scannable layout featuring 4 easily understandable key metrics (Unbilled Gaps Detected, Recovered to Date, Recovery Rate, and At-Risk SHA Claims). Streamlined pathway selector, simplified weekly performance chart, and unified recent recovery actions into an intuitive feed.
  - **Unbilled Gap Ledger (`UnbilledGapLedgerView.tsx`):** Eliminated verbose cryptographic jargon and nested redundant boxes. Introduced clean status pills, quick departmental filters, clear table views with procedure/location/tariff, and a streamlined side inspector with one-click actions (SMS reminder and resolve).
  - **SHA Claims Adjudication (`ShaClaimsView.tsx`):** Replaced wall-of-text diagnostic banners with direct, one-click resolution cards for tariff caps and missing ICD-10 codes, clear submission readiness indicators, and simplified batch transmission workflows.


### Added
- **Warm Editorial & Clinical Precision Design System:** 
  - Restructured entire frontend aesthetic around high-contrast clinical clarity and typography pairings: *Newsreader* for editorial headings, *Plus Jakarta Sans* for dense clinical data, and *JetBrains Mono* for monetary figures, procedural codes, and transaction hashes.
  - Implemented semantic Tailwind token architecture (`surface`, `surface-container`, `primary`, `secondary`, `tertiary`, `outline`) with mathematical spacing scales.
- **Sovereign Fixed Navigation Sidebar (`Sidebar.tsx`):**
  - Left navigation supporting 6 dedicated views: *Clinical Recovery Overview*, *Unbilled Gap Ledger*, *SHA Claims Engine*, *Deterministic AI Audit*, *Ecosystem Integrations*, and *KDPA 2019 Telemetry*.
  - Real-time recovery snapshot (KES 1,290,000 recovered / 81% capture rate), KDPA 2019 Sovereign Node indicator, and mobile responsive drawer toggle.
- **Brand Identity & Header (`BrandLogo.tsx`, `AppHeader.tsx`):**
  - Clinical monogram emblem, MFL #14920 facility badge, full-stack live latency indicator, audit history drawer toggle, and global notifications.
- **Interactive Unbilled Gap Ledger (`UnbilledGapLedgerView.tsx`):**
  - Rich procedural ledger with status filtering, multi-condition search, quick reconciliation modal, slide-over encounter detail drawer, Africa's Talking clinician SMS trigger, and Safaricom Daraja M-Pesa STK push.
- **Social Health Authority (SHA) Adjudication Engine (`ShaClaimsView.tsx`):**
  - Pre-submission validation workflow for public and faith-based facility claims under Kenya Gazette Vol. CXXVI No. 112.
  - One-click Caesarean tariff cap adjustments, ICD-10 hydration secondary code application, biometric pre-auth SMS dispatch, and signed batch submission.
- **Deterministic Dual-Loop AI Audit Viewer (`AiAuditView.tsx`):**
  - Flash narrative synthesis alongside Stage 2 Gemini 2.5 Pro arithmetic determinism verification and raw JSON payload telemetry.
- **Interoperability Hub & Gateway Connectors (`IntegrationsView.tsx`):**
  - Live ping testable connectors for KenyaEMR / OpenMRS FHIR R4, MoH DHIS2 National Data Warehouse, SHA Claims Clearinghouse, Africa's Talking, Safaricom Daraja, and Sovereign Local Edge.
- **KDPA 2019 Sovereign Telemetry Hub (`ComplianceView.tsx`):**
  - In-browser client-side SHA-256 HMAC tokenization test sandbox, statutory compliance checklist (Sections 25, 31, 44, 50), and ODPC DPIA Certificate download.
- **Custom Institutional Toast Banner (`ToastBanner.tsx`):**
  - Floating status toast supporting success, warning, clinical audit, and telecom SMS actions.

## [2.0.0] - 2026-09-09

### Added
- **Full-Stack Architecture (Express + Vite + esbuild):** Transitioned application to a production-grade full-stack architecture running an Express server (`server.ts`) with custom Vite development middleware and compiled standalone `dist/server.cjs` production bundle.
- **Server-Side API Route Protection:** Moved all Gemini AI processing (`gemini-2.5-flash` narrative, `gemini-2.5-pro` audit, and structured metrics extraction) behind protected `/api/ai/*` server endpoints, completely eliminating client-side API key exposure.
- **Server-Side Clinical Data Persistence (`server/store.ts`):** Established a resilient server data store with disk-backed JSON persistence (`data/kazira_store.json`), supporting atomic CRUD operations for debt receivables, financial recovery logs, baseline configurations, and generated clinical reports.
- **Server-Side Health Interoperability Endpoints:**
  - `/api/dhis2/sync`: Authenticated gateway integration for Ministry of Health SHA aggregate claims submission.
  - `/api/fhir/encounters`: HL7 FHIR R4 encounter synchronization for OpenMRS / KenyaEMR interoperability.
  - `/api/sms/send`: Server-side transactional SMS notification gateway for Africa's Talking (+254 Kenyan mobile numbers).
  - `/api/system/status`: Real-time full-stack diagnostics and KDPA 2019 compliance verification.
- **Interactive Server Health Monitor (`ServerStatusModal.tsx`):** Added live system architecture modal in top navigation displaying connection state, server uptime, KDPA 2019 SHA-256 masking verification, and active database statistics.
- **Dual Server-Client State Synchronization (`apiService.ts`):** Implemented resilient offline-first API synchronization with local storage cache fallbacks for low-connectivity Kenyan clinic environments.
- **Enterprise Documentation & Architecture Guide (`README.md`):** Comprehensively overhauled README with system diagrams, deterministic AI verification flows, KDPA 2019 compliance specifications, full API endpoint tables, and setup instructions.

## [1.7.0] - 2026-08-20

### Added
- **Formalized Design Language System (`design_language.md`):** Complete design system codifying color tokens (`surface`, `ink`, `accent`, `warn`, `gold`), typography hierarchy (`DM Serif Display`, `Outfit`, `DM Mono`), mathematical spacing, and button/badge/modal standards.
- **Enhanced Documentation & Policy Modals:** Standardized styling for Help Center Documentation, Acceptable Use Policy (AUP), Data Processing Agreement (DPA), and Changelog with consistent typography, badge accents, and Lucide icons.

### Fixed
- **App-wide Currency Consistency:** Audited all components and history entries to ensure strict `KES` currency prefixing and monospaced number formatting.
- **Modal Geometry & Headings:** Aligned `Modal.tsx` and all dialog components with `font-serif` headings, subtle border contrasts, and unified corner radii.

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
