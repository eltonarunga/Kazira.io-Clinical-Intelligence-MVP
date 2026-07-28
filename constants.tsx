
export const NARRATIVE_AGENT_SYSTEM_PROMPT = `
# ROLE
You are the Narrative Agent for Kazira.io, an autonomous clinic intelligence system.
Your job is to replace a business analyst by producing a weekly executive report for clinic owners.

# CONSTRAINTS
- Write in plain language (8th grade reading level)
- No jargon unless unavoidable
- Be direct and specific
- Never say "consider" or "you might want to" — give clear directives
- Always quantify (use numbers, percentages, money)
- If data is incomplete or uncertain, say so explicitly with confidence level
- Never apologize or hedge unnecessarily

# REPORT STRUCTURE
You will receive structured data and must produce a report with exactly these sections:

## 1. Executive Summary
One paragraph (3-4 sentences) that answers:
- Is the clinic up or down this week?
- By how much?
- What's the single biggest reason?
Format: "This week your clinic revenue is [up/down] [X%] to [amount] because [specific reason]."

## 2. What Changed
Bullet points showing key metrics vs last week:
- Revenue (with breakdown: procedures, consultations)
- Utilization (appointments filled vs capacity)
- Cash position (collections vs expenses)
Use format: "Revenue: $X (↑/↓ Y% vs last week)"

## 3. Why It Changed
Explain the top 2-3 drivers of change. Be specific.

## 4. What's At Risk
Identify 1-3 concrete risks in the next 30 days.

## 5. What To Do Next
Give 2-3 specific, actionable recommendations.

# CONFIDENCE SCORING
For each major claim, assess confidence: 🟢 High, 🟡 Medium, 🔴 Low. Show confidence inline.

# OUTPUT FORMAT
Return ONLY the formatted report in Markdown. No preamble.
`;

export const AUDIT_AGENT_SYSTEM_PROMPT = `
# ROLE
You are the Audit Agent. Your job is to verify the Narrative Agent's report for errors.

# INPUT
You will receive:
1. Raw clinic data
2. Generated report from Narrative Agent

# YOUR TASK
Check for:
1. Math errors
2. Logic errors
3. Confidence accuracy
4. Missing risks
5. Hallucinations

# OUTPUT FORMAT
Return ONLY:
- ✅ APPROVED (if no issues)
- ⚠️ ISSUES FOUND: [List specific problems]
`;

export const METRIC_EXTRACTION_SYSTEM_PROMPT = `
# ROLE
You are a data extraction specialist. Your task is to extract key performance indicators from raw clinic data into a structured JSON format.

# OUTPUT SCHEMA
Return a JSON object with the following structure:
{
  "revenueThisWeek": number,
  "revenueLastWeek": number,
  "utilization": number (percentage as decimal or whole number),
  "cancellations": number,
  "procedureMix": [
    { "name": string, "value": number (revenue amount) }
  ],
  "practitionerPerformance": [
    { "name": string, "patients": number }
  ]
}

# CONSTRAINTS
- Return ONLY the JSON object.
- If a value is missing, use 0.
- Ensure all numbers are clean (no currency symbols in values).
`;


export const PRIVATE_CLINIC_DATA = `# PRIVATE CLINIC DATA - Nairobi West Medical Centre (Week 25)
## Revenue & Financial Leakage
- Total revenue collected this week: KES 1,840,000 (↓ 11.5% vs KES 2,080,000 last week)
- Unbilled procedures / revenue leakage detected: KES 310,000 (14.4% unbilled variance)
- Consultations Billed: KES 420,000 | Unbilled: KES 65,000
- Lab & Imaging Billed: KES 780,000 | Unbilled: KES 145,000
- Pharmacy Dispensed: KES 640,000 | Unbilled / Inventory Variance: KES 100,000

## Capacity & Practitioner Performance
- Total Appointments Scheduled: 210 | Completed: 168 | Cancellations: 32 | No-shows: 10
- Room Utilization Rate: 72.5% (↓ from 84.0%)
- Dr. Wanjiru (ObsGyn): 58 patients seen | Unbilled consultations: 4
- Dr. Ochieng (Pediatrics): 62 patients seen | Unbilled lab tests: 12
- Dr. Kiprop (General Surgery): 48 patients seen | Unbilled procedure items: 8

## Procedure Mix
- Outpatient Consultations: 85 @ KES 3,000 = KES 255,000
- Ultrasound Scans: 34 @ KES 4,500 = KES 153,000
- Full Blood Count & Panels: 62 @ KES 2,500 = KES 155,000
- Minor Surgical Procedures: 14 @ KES 25,000 = KES 350,000
- Dental & Specialist Consults: 42 @ KES 5,000 = KES 210,000
- Pharmacy Dispensing: 120 scripts @ avg KES 4,000 = KES 480,000

## KDPA 2019 Privacy Compliance Audit
- Patient Records Processed: 168
- Patient Identity PII Status: 100% Pseudonymised via SHA-256 Token Masking
- DPIA Certificate Ref: KDPA/REG/2026/8942
`;

export const PUBLIC_FACILITY_CLINIC_DATA = `# PUBLIC / FAITH-BASED FACILITY DATA - Sub-County Level 4 Hospital (MFL-28341)
## Social Health Authority (SHA) Claims & Submissions
- SHA Aggregate Claims Volume: 412 claims generated this week
- Total SHA Reimbursable Claim Value: KES 2,890,000
- SHA Claims Submitted to DHIS2 Gateway: 380 claims (92.2% submission rate)
- Pending / Rejected SHA Claims: 32 claims (KES 245,000 value at risk)
- Primary Rejection Causes: Missing SHA Beneficiary Number (18), Unmatched MFL Facility Code (8), Coding Mismatch (6)

## Facility Utilization & Patient Encounters
- Total Patient Encounters (OpenMRS/KenyaEMR FHIR): 640 encounters
- Outpatient Care Encounters: 480
- Maternal & Primary Health Encounters: 110
- Inpatient Admissions: 50
- Facility Bed Capacity Utilization: 88.5%

## SHA Procedure Breakdown
- Primary Care Consultations: 320 encounters @ KES 1,500 = KES 480,000
- Antenatal & Maternal Health Services: 95 procedures @ KES 4,500 = KES 427,500
- Immunization & Child Health: 110 visits @ KES 800 = KES 88,000
- Inpatient Medical Days: 180 bed-days @ KES 3,500 = KES 630,000
- Essential Diagnostic Panels: 240 tests @ KES 1,800 = KES 432,000
- Chronic Disease Management (Hypertension/Diabetes): 120 consultations @ KES 2,200 = KES 264,000

## Public Health Oversight & Data Protection
- KDPA 2019 DPIA Status: HARD STOP VERIFIED (Cert: KDPA_DPIA_CERTIFICATE_REG_4839.pdf)
- DHIS2 Integration Status: Active Sync Ready
- Anonymization Protocol: HL7 FHIR Anonymised Bundle Standard
`;

export const DEFAULT_CLINIC_DATA = PRIVATE_CLINIC_DATA;

