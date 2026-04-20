# Kazira Clinical Intelligence

An AI-powered medical billing gap detection and revenue tracking platform for private and public healthcare facilities in East Africa.

## Overview
Kazira helps clinics and public facilities stop revenue leakage and automate the SHA claims pipeline. By integrating directly into existing workflows and utilizing dual-agent verification, it provides 100% accurate, pseudonymised reporting without hallucinations.

## Key Features
- **Missed Billing Detection:** Identifies unbilled procedures, missing charges, and clinical anomalies.
- **SHA Claims Verification:** Ensures correct claim codes and tracks the acceptance pipeline for public/faith-based facilities under the SHA mechanism.
- **Dual-Agent Verification:** A Narrative Agent and an Audit Agent work together to verify logic and eliminate AI hallucinations.
- **Multi-Tenant Dashboards:** Role-based access control for Facility Admins, County Health Departments, and Ministry of Health (MoH) oversight.
- **Data Privacy by Design:** Built-in pseudonymisation and mandatory Kenya Data Protection Act 2019 DPIA compliance flows.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend Architecture:** Built for Node.js / Serverless deployment
- **AI Integration:** `@google/genai` (Gemini 2.5 Pro)

## Getting Started

### Prerequisites
- Node.js (v18+)
- Gemini API Key

### Installation & Setup
1. Clone the repository
2. Run `npm install` to install dependencies
3. Create a `.env` file in the root based on `.env.example`
4. Add your `GEMINI_API_KEY` to `.env`
5. Run `npm run dev` to start the development server on port 3000

## Use Cases

### Private Clinics
- Uncover missed procedures to immediately boost bottom-line revenue.
- View daily/weekly ROI and automated executive summaries.
- Track individual practitioner performance precisely.

### Public / SHA Facilities
- Ensure 95%+ claims accuracy before submitting to the SHA portal.
- Roll up data for County Health & Ministry of Health oversight.
- Sustain facility operations by minimizing rejected claims.

## License
Proprietary. All rights reserved by Kazira.
