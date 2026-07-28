import Papa from 'papaparse';
import { processClinicData } from './dataPipeline';

export interface CSVParseResult {
  rawText: string;
  sanitizedText: string;
  rowCount: number;
  columnHeaders: string[];
  dataQualityScore: number; // 0 - 100%
  warnings: string[];
  anonymizedCount: number;
  parsedRows: Record<string, string>[];
}

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
      parsedRows: []
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
    if (h.includes('patient') || h.includes('client') || h.includes('id')) hasPatientCol = true;
    if (h.includes('doctor') || h.includes('practitioner') || h.includes('provider')) hasDoctorCol = true;
    if (h.includes('procedure') || h.includes('treatment') || h.includes('service') || h.includes('diagnosis')) hasProcedureCol = true;
    if (h.includes('amount') || h.includes('fee') || h.includes('cost') || h.includes('kes') || h.includes('claim')) hasAmountCol = true;
  });

  if (!hasProcedureCol) warnings.push('Missing explicit "Procedure" or "Service" column.');
  if (!hasAmountCol) warnings.push('Missing explicit "Amount" or "Fee" column for financial reconciliation.');

  // Calculate Data Quality Score
  rows.forEach((row) => {
    const rowValues = Object.values(row);
    const hasNum = rowValues.some((v) => !isNaN(parseFloat(v)));
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
    parsedRows: rows.slice(0, 50) // sample rows for preview UI
  };
};
