
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

export const DEFAULT_CLINIC_DATA = `# CLINIC DATA - Week of Jan 1-7, 2026

## Revenue Data
- Total revenue this week: $28,400
- Last week revenue: $32,100
- Procedures revenue: $22,000 (↓ from $26,500)
- Consultations revenue: $6,400 (↑ from $5,600)

## Appointment Data
- Total appointments: 142
- Capacity: 180 slots
- Utilization rate: 78.9% (↓ from 87.2% last week)
- Cancellations: 23 (↑ from 14 last week)
- No-shows: 8

## Practitioner Performance
- Dr. Okonkwo: 52 patients (avg: 58)
- Dr. Amaka: 47 patients (avg: 49)
- Dr. Mensah: 43 patients (avg: 54) ⚠️
  - Monday-Wednesday: 32 patients (normal)
  - Thursday-Friday: 11 patients (Thursday had 6 unfilled slots)

## Procedure Mix
- Teeth cleaning: 45 procedures @ $80 = $3,600
- Fillings: 28 procedures @ $150 = $4,200
- Root canals: 8 procedures @ $450 = $3,600
- Extractions: 12 procedures @ $200 = $2,400
- Crowns: 6 procedures @ $800 = $4,800
- Other: 43 procedures @ $3,400

## Collections vs Billing
- Billed: $31,200
- Collected: $28,400
- Outstanding: $2,800 (9%)

## Cash Flow
- Cash at start of week: $45,000
- Cash at end of week: $38,200
- Weekly expenses: $35,200
  - Payroll: $22,000
  - Rent: $4,500
  - Supplies: $5,200
  - Utilities: $2,100
  - Other: $1,400

## Inventory Alerts
- Composite resin: 12 days remaining at current usage
- Anesthetic (lidocaine): 8 days remaining ⚠️
- Gloves: 45 days remaining

## Data Quality Notes
- Monday appointment data missing for Dr. Mensah (estimated)
- 3 procedures lack procedure codes (included in "Other")
- Cancellation reasons not recorded`;
