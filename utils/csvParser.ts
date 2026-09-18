import Papa from 'papaparse';
import { processClinicData } from './dataPipeline';
import { DebtItem } from '../types';

export interface CSVParseResult {
  rawText: string;
  sanitizedText: string;
  rowCount: number;
  columnHeaders: string[];
  dataQualityScore: number; // 0 - 100%
  warnings: string[];
  anonymizedCount: number;
  parsedRows: Record<string, string>[];
  allRows: Record<string, string>[];
}

export const SAMPLE_THEATRE_CSV = `Patient ID,Encounter Date,Department,Attending Clinician,Procedure / Service,Tariff Code,Fee (KES),Insurer,Billing Note
PAT-8812,2026-09-14,Radiology,Dr. Peter Karanja,Abdominal Ultrasound & Doppler,RAD-US-04,18500,Out-of-Pocket,Cashier note bypass
PAT-7490,2026-09-14,Theatre,Dr. Kevin Omondi,Emergency C-Section Consumables & Pack,SURG-CS-02,45000,SHA,Disposable trocars omitted from bill
PAT-6201,2026-09-13,Laboratory,Dr. Grace Wanjiku,Histopathology Biopsy Panel,LAB-HP-11,32000,Jubilee,Tissue block processing fee unbilled
PAT-5539,2026-09-13,Theatre,Dr. George Odhiambo,Lower Limb Traction Kit & Pins,ORTH-TR-01,14200,SHA,Ward store equipment lag
PAT-4119,2026-09-12,Casualty,Dr. Mary Nduta,IV Infusion & Emergency Resuscitation,EM-TH-09,22000,Out-of-Pocket,Emergency intake medication line
PAT-9034,2026-09-12,OBGYN,Dr. Kevin Omondi,Neonatal Phototherapy 24hr Protocol,PED-NEO-06,28000,SHA,Nursery phototherapy bed fee unbilled
PAT-3382,2026-09-11,Radiology,Dr. Peter Karanja,Chest CT Contrast Enhancement,RAD-CT-02,36500,AAR,Contrast media charge unentered
PAT-2195,2026-09-11,Laboratory,Dr. Grace Wanjiku,Cardiac Troponin & Enzyme Panel,LAB-CARD-03,16800,Out-of-Pocket,Point of care stat test not logged`;

export const SAMPLE_SHA_CLAIMS_CSV = `Patient Ref,Encounter Date,Department,Attending Doctor,Service Name,SHA Tariff Code,KES Amount,Payer,Gap Category
ANON-9921,2026-09-15,Casualty,Dr. Mary Nduta,Specialist Emergency Consultation,SHA-OP-01,7500,SHA,Unbilled Consultation
ANON-8834,2026-09-15,Radiology,Dr. Peter Karanja,Pelvic MRI with Sagittal View,SHA-RAD-08,52000,SHA,Pre-Auth Omission
ANON-7712,2026-09-14,Theatre,Dr. George Odhiambo,Laparoscopic Appendectomy Trocar Kit,SHA-SURG-14,64000,SHA,Consumables Bypass
ANON-6643,2026-09-14,OBGYN,Dr. Kevin Omondi,Elective C-Section Surgical Pack,SHA-MAT-02,40000,SHA,Theatre Pack Lag
ANON-5529,2026-09-13,Laboratory,Dr. Grace Wanjiku,Full Hemogram & Renal Function Test,SHA-LAB-04,12500,SHA,Unbilled Lab Panel
ANON-4418,2026-09-13,Casualty,Dr. Mary Nduta,Fracture Closed Reduction & Cast,SHA-ORTH-03,18000,SHA,Missing SHA Pre-Auth Number`;

export const SAMPLE_OUTPATIENT_CSV = `Client ID,Visit Date,Clinic Room,Practitioner,Procedure,Amount KES,Payment Type,Notes
CL-1044,2026-09-15,Consultation 3,Dr. Peter Karanja,Cardiology Follow-Up & ECG,12000,Cash,Cashier note missing
CL-1045,2026-09-15,Procedure Room A,Dr. Kevin Omondi,Wound Debridement & Suture Kit,15500,Insurance,Dressing pack omitted
CL-1046,2026-09-14,Eye Clinic,Dr. Grace Wanjiku,Slit Lamp Exam & Tonometry,8500,Cash,Registration fee only paid
CL-1047,2026-09-14,Minor Theatre,Dr. Mary Nduta,Foreign Body Removal (ENT),19000,SHA,Procedure not entered in billing
CL-1048,2026-09-13,Dental Suite,Dr. Peter Karanja,Surgical Tooth Extraction & Suture,14000,Cash,Anesthetic charge missing`;

export const SAMPLE_BLANK_TEMPLATE_CSV = `Patient ID,Encounter Date,Department,Attending Clinician,Procedure / Service,Tariff Code,Fee (KES),Insurer,Billing Note
ANON-001,2026-09-16,Theatre,Dr. Jane Doe,Surgical Procedure Name,SURG-01,25000,SHA,Missing consumable line
ANON-002,2026-09-16,Radiology,Dr. John Smith,Diagnostic Ultrasound,RAD-02,15000,Out-of-Pocket,Cashier bypass`;

/**
 * Parses and validates raw CSV/TSV data using PapaParse,
 * checks required clinical & financial fields, and applies KDPA 2019 pseudonymization.
 */
export const parseAndAnonymizeCSV = (csvInput: string): CSVParseResult => {
  if (!csvInput || !csvInput.trim()) {
    return {
      rawText: '',
      sanitizedText: '',
      rowCount: 0,
      columnHeaders: [],
      dataQualityScore: 0,
      warnings: ['No data provided.'],
      anonymizedCount: 0,
      parsedRows: [],
      allRows: []
    };
  }

  // 1. First run KDPA 2019 PII Redaction Pipeline
  const sanitized = processClinicData(csvInput);

  // 2. Parse using PapaParse
  const parsed = Papa.parse<Record<string, string>>(sanitized, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false
  });

  const columnHeaders = parsed.meta.fields || [];
  const rows = parsed.data || [];
  const warnings: string[] = [];

  let validFeeRows = 0;
  let hasPatientCol = false;
  let hasDoctorCol = false;
  let hasProcedureCol = false;
  let hasAmountCol = false;

  // Check headers against expected clinical billing schemas
  const lowerHeaders = columnHeaders.map((h) => h.toLowerCase());

  lowerHeaders.forEach((h) => {
    if (h.includes('patient') || h.includes('client') || h.includes('id') || h.includes('mrn') || h.includes('token')) hasPatientCol = true;
    if (h.includes('doctor') || h.includes('practitioner') || h.includes('provider') || h.includes('clinician')) hasDoctorCol = true;
    if (h.includes('procedure') || h.includes('treatment') || h.includes('service') || h.includes('diagnosis')) hasProcedureCol = true;
    if (h.includes('amount') || h.includes('fee') || h.includes('cost') || h.includes('kes') || h.includes('claim')) hasAmountCol = true;
  });

  if (!hasProcedureCol) warnings.push('Missing explicit "Procedure" or "Service" column.');
  if (!hasAmountCol) warnings.push('Missing explicit "Amount" or "Fee" column for financial reconciliation.');

  // Calculate Data Quality Score
  rows.forEach((row) => {
    const rowValues = Object.values(row);
    const hasNum = rowValues.some((v) => !isNaN(parseFloat(v?.replace(/[^0-9.]/g, ''))));
    if (hasNum) validFeeRows++;
  });

  const totalPossible = rows.length || 1;
  let qualityBase = Math.round((validFeeRows / totalPossible) * 70);
  if (hasAmountCol) qualityBase += 15;
  if (hasProcedureCol) qualityBase += 15;
  const qualityScore = Math.min(100, Math.max(10, qualityBase));

  // Count instances redacted
  const redactedMatches = sanitized.match(/\[(ANONYMISED|REDACTED|PATIENT_ID)[^\]]*\]/g);
  const anonymizedCount = redactedMatches ? redactedMatches.length : 0;

  return {
    rawText: csvInput,
    sanitizedText: sanitized,
    rowCount: rows.length,
    columnHeaders,
    dataQualityScore: qualityScore,
    warnings,
    anonymizedCount,
    parsedRows: rows.slice(0, 30), // sample rows for preview UI
    allRows: rows
  };
};

/**
 * Converts parsed CSV rows into standardized, KDPA-compliant DebtItem objects
 * ready for insertion into the Unbilled Procedure Ledger and financial recovery pipeline.
 */
export const convertCSVToDebtItems = (rows: Record<string, string>[]): DebtItem[] => {
  if (!rows || rows.length === 0) return [];

  const timestamp = Date.now();

  return rows.map((row, idx) => {
    const keys = Object.keys(row);
    const findVal = (keywords: string[]) => {
      const match = keys.find((k) => keywords.some((kw) => k.toLowerCase().includes(kw)));
      return match ? row[match]?.trim() : '';
    };

    const patientRaw = findVal(['patient', 'client', 'mrn', 'token', 'ref', 'id']) || `PAT-${1000 + idx}`;
    const procedureRaw = findVal(['procedure', 'service', 'treatment', 'description', 'intervention', 'item']) || 'Clinical Service';
    const doctorRaw = findVal(['doctor', 'physician', 'clinician', 'practitioner', 'surgeon', 'provider']) || 'Attending Physician';
    const feeRaw = findVal(['fee', 'amount', 'cost', 'kes', 'price', 'total', 'charge', 'claim', 'value']);
    const tariffRaw = findVal(['tariff', 'code', 'icd', 'billing_code', 'icd10']);
    const deptRaw = findVal(['department', 'dept', 'ward', 'location', 'unit', 'clinic', 'room']);
    const dateRaw = findVal(['date', 'time', 'encounter_date', 'visit_date', 'admitted']) || new Date().toISOString().split('T')[0];
    const insurerRaw = findVal(['insurer', 'payer', 'scheme', 'insurance', 'payment']) || 'SHA';
    const gapRaw = findVal(['gap', 'missing', 'root_cause', 'cause', 'omission', 'reason', 'notes', 'note']) || 'Discovered Procedural Gap';

    // Parse estimated KES amount
    let estimatedKes = 0;
    if (feeRaw) {
      const cleaned = feeRaw.replace(/[^0-9.]/g, '');
      const parsedNum = parseFloat(cleaned);
      if (!isNaN(parsedNum) && parsedNum > 0) {
        estimatedKes = Math.round(parsedNum);
      }
    }
    if (estimatedKes === 0) {
      estimatedKes = 18500;
    }

    // Classify department
    let department: 'theatre' | 'radiology' | 'lab' | 'casualty' | 'obgyn' = 'theatre';
    const dLower = (deptRaw + ' ' + procedureRaw).toLowerCase();
    if (dLower.includes('radio') || dLower.includes('scan') || dLower.includes('x-ray') || dLower.includes('mri') || dLower.includes('ultrasound') || dLower.includes('doppler') || dLower.includes('ct')) {
      department = 'radiology';
    } else if (dLower.includes('lab') || dLower.includes('biopsy') || dLower.includes('patholog') || dLower.includes('blood') || dLower.includes('hemogram') || dLower.includes('culture') || dLower.includes('panel')) {
      department = 'lab';
    } else if (dLower.includes('casualty') || dLower.includes('er') || dLower.includes('emergency') || dLower.includes('triage') || dLower.includes('resuscitation')) {
      department = 'casualty';
    } else if (dLower.includes('obgyn') || dLower.includes('c-section') || dLower.includes('maternity') || dLower.includes('neonatal') || dLower.includes('delivery')) {
      department = 'obgyn';
    }

    // Clean pseudonymized patient token
    let patientToken = patientRaw;
    if (!patientToken.startsWith('ANON-') && !patientToken.startsWith('[PATIENT')) {
      const digitsOrId = patientToken.replace(/[^a-zA-Z0-9]/g, '');
      patientToken = `ANON-PAT-${digitsOrId.slice(-4) || (1000 + idx)}`;
    }

    return {
      id: `DEBT-CSV-${timestamp}-${idx + 1}`,
      patientRef: patientToken,
      procedureName: procedureRaw,
      datePerformed: dateRaw,
      gapType: gapRaw,
      estimatedKes,
      insurer: insurerRaw,
      daysOutstanding: 0,
      status: 'pending',
      attribution: 'manually_identified',
      department,
      doctorName: doctorRaw,
      icd10Code: tariffRaw || 'PROC-01',
      notes: `Manual CSV ingestion: ${gapRaw}`
    };
  });
};
