# Changelog & Version Control

All notable changes to the Kazira.io project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
