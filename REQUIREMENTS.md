# Kazira.io Clinic Intelligence MVP - Product Requirements Document (PRD)

## 1. Overview
Kazira.io is an autonomous clinic intelligence system designed to replace manual business analysis. It ingests raw clinic data (revenue, appointments, practitioner performance) and uses AI to generate weekly executive narrative reports, audit the findings, and extract structured metrics for visualization.

## 2. Core Features
- **Data Ingestion:** Support for raw text, CSV, and Markdown data input via text area, file upload, or drag-and-drop.
- **Narrative Generation:** Uses Google's Gemini AI (Flash model) to synthesize data into a readable, actionable executive summary.
- **Audit Verification:** Uses Google's Gemini AI (Pro model) to cross-reference and audit the narrative report for mathematical and logical accuracy.
- **Metrics Extraction:** Extracts structured KPIs (Revenue, Utilization, Cancellations, Procedure Mix, Practitioner Load) into a JSON format.
- **Interactive Dashboard:** Visualizes extracted metrics using responsive charts (Bar, Pie).
- **Report History:** Saves the last 10 generated reports locally in the browser for quick retrieval.
- **Export Functionality:** Allows users to download the generated narrative and audit logs as a `.md` (Markdown) file.
- **Interactive Onboarding:** Guides new users through the platform's capabilities.

## 3. Technical Stack
- **Frontend Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **AI Integration:** `@google/genai` SDK
- **Data Visualization:** Recharts
- **Markdown Rendering:** `react-markdown`, `remark-gfm`
- **Icons:** Lucide React

## 4. Security & Privacy
- **API Key Management:** Uses environment variables (`process.env.GEMINI_API_KEY`) injected securely at build/runtime.
- **Data Handling:** All data processing is done client-side and sent directly to the Gemini API. No backend database is currently used for storing sensitive clinic data.
- **XSS Prevention:** Uses `react-markdown` to safely render AI-generated content, preventing cross-site scripting attacks.

## 5. Future Enhancements (Roadmap)
- Direct integration with Practice Management Systems (PMS).
- Multi-clinic dashboard support.
- User authentication and cloud-based report storage (e.g., Firebase).
- Custom PDF report exports.
