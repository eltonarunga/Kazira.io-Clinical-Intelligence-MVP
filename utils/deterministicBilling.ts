/**
 * Kazira Clinical Intelligence - Deterministic Billing Reconciliation Engine
 * 
 * Strict architectural rule:
 * Core financial metrics (unbilled procedures, revenue leakage, underbilled variance)
 * MUST be calculated algorithmically using deterministic comparison between clinical
 * encounter procedures and billed invoices/claims.
 * 
 * Generative AI models are strictly reserved for narrative synthesis, clinical summaries,
 * and conversational audit trails—NEVER for computing underlying financial figures.
 */

import { DebtItem } from '../types';

export interface PerformedProcedure {
  id: string;
  patientPseudonym: string; // e.g. "ANON-PAT-8812"
  procedureCode: string;    // e.g. "RAD-US-01", "SURG-MIN-02"
  procedureName: string;
  standardTariffKes: number;
  department: string;       // e.g. "Radiology", "Theatre", "Laboratory", "Pharmacy"
  doctorName: string;
  encounterDate: string;    // YYYY-MM-DD
  notes?: string;
}

export interface BilledInvoice {
  id: string;
  patientPseudonym: string;
  procedureCode?: string;
  procedureName?: string;
  billedAmountKes: number;
  status: 'paid' | 'invoiced' | 'pending' | 'rejected' | 'unbilled';
  invoiceRef?: string;
  encounterDate?: string;
}

export interface DepartmentLeakageSummary {
  department: string;
  unbilledCount: number;
  unbilledKes: number;
  totalProcedures: number;
  potentialKes: number;
  leakagePercentage: number;
}

export interface PractitionerLeakageSummary {
  doctorName: string;
  unbilledCount: number;
  unbilledKes: number;
  totalProcedures: number;
}

export interface ReconciliationResult {
  totalProceduresPerformed: number;
  totalPotentialRevenueKes: number;
  totalBilledRevenueKes: number;
  totalUnbilledRevenueKes: number;
  leakagePercentage: number;
  unbilledProceduresCount: number;
  underbilledProceduresCount: number;
  fullyBilledProceduresCount: number;
  unbilledItems: Array<{
    procedure: PerformedProcedure;
    gapType: 'Completely Unbilled' | 'Underbilled Variance';
    unbilledAmountKes: number;
    matchingInvoice?: BilledInvoice;
  }>;
  departmentBreakdown: Record<string, DepartmentLeakageSummary>;
  practitionerBreakdown: Record<string, PractitionerLeakageSummary>;
  generatedDebtItems: DebtItem[];
}

/**
 * Normalizes strings for robust matching (removes punctuation, lowercases)
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Reconciles clinical encounter procedures against billing invoices deterministically.
 */
export function reconcileProceduresAgainstInvoices(
  procedures: PerformedProcedure[],
  invoices: BilledInvoice[],
  facilityCode: string = 'MFL #14920'
): ReconciliationResult {
  let totalPotentialRevenueKes = 0;
  let totalBilledRevenueKes = 0;
  let totalUnbilledRevenueKes = 0;
  let unbilledProceduresCount = 0;
  let underbilledProceduresCount = 0;
  let fullyBilledProceduresCount = 0;

  const unbilledItems: ReconciliationResult['unbilledItems'] = [];
  const generatedDebtItems: DebtItem[] = [];

  const deptMap: Record<string, { unbilledCount: number; unbilledKes: number; totalProcedures: number; potentialKes: number }> = {};
  const doctorMap: Record<string, { unbilledCount: number; unbilledKes: number; totalProcedures: number }> = {};

  // Build lookup index of invoices by patient and procedure
  // Key format: `${patientNorm}_${procedureCodeNorm}` or fallback `${patientNorm}`
  const invoiceLookup = new Map<string, BilledInvoice[]>();
  for (const inv of invoices) {
    const pNorm = normalizeKey(inv.patientPseudonym);
    const cNorm = inv.procedureCode ? normalizeKey(inv.procedureCode) : '';
    const key = `${pNorm}_${cNorm}`;
    
    if (!invoiceLookup.has(key)) {
      invoiceLookup.set(key, []);
    }
    invoiceLookup.get(key)!.push(inv);

    // Also index by patient alone for fuzzy fallback
    if (!invoiceLookup.has(pNorm)) {
      invoiceLookup.set(pNorm, []);
    }
    invoiceLookup.get(pNorm)!.push(inv);
  }

  // Set of matched invoice IDs to prevent double counting
  const matchedInvoiceIds = new Set<string>();

  for (const proc of procedures) {
    const tariff = Math.max(0, Math.round(proc.standardTariffKes));
    totalPotentialRevenueKes += tariff;

    // Track department potential
    const dept = proc.department || 'General Outpatient';
    if (!deptMap[dept]) {
      deptMap[dept] = { unbilledCount: 0, unbilledKes: 0, totalProcedures: 0, potentialKes: 0 };
    }
    deptMap[dept].totalProcedures += 1;
    deptMap[dept].potentialKes += tariff;

    // Track doctor total
    const doctor = proc.doctorName || 'Unassigned Attending';
    if (!doctorMap[doctor]) {
      doctorMap[doctor] = { unbilledCount: 0, unbilledKes: 0, totalProcedures: 0 };
    }
    doctorMap[doctor].totalProcedures += 1;

    // Try finding matching invoice
    const pNorm = normalizeKey(proc.patientPseudonym);
    const cNorm = normalizeKey(proc.procedureCode);
    const specificKey = `${pNorm}_${cNorm}`;

    let matchedInvoice: BilledInvoice | undefined = undefined;

    // 1. Try exact patient + procedureCode match
    const specificMatches = invoiceLookup.get(specificKey) || [];
    for (const cand of specificMatches) {
      if (!matchedInvoiceIds.has(cand.id)) {
        matchedInvoice = cand;
        matchedInvoiceIds.add(cand.id);
        break;
      }
    }

    // 2. Try patient match where name matches or date matches
    if (!matchedInvoice) {
      const patientMatches = invoiceLookup.get(pNorm) || [];
      for (const cand of patientMatches) {
        if (!matchedInvoiceIds.has(cand.id)) {
          const nameMatches = cand.procedureName && normalizeKey(cand.procedureName) === normalizeKey(proc.procedureName);
          const dateMatches = cand.encounterDate && cand.encounterDate === proc.encounterDate;
          if (nameMatches || dateMatches) {
            matchedInvoice = cand;
            matchedInvoiceIds.add(cand.id);
            break;
          }
        }
      }
    }

    // Analyze billing status
    if (!matchedInvoice || matchedInvoice.status === 'unbilled' || matchedInvoice.billedAmountKes <= 0) {
      // Completely unbilled procedure
      unbilledProceduresCount += 1;
      totalUnbilledRevenueKes += tariff;
      deptMap[dept].unbilledCount += 1;
      deptMap[dept].unbilledKes += tariff;
      doctorMap[doctor].unbilledCount += 1;
      doctorMap[doctor].unbilledKes += tariff;

      unbilledItems.push({
        procedure: proc,
        gapType: 'Completely Unbilled',
        unbilledAmountKes: tariff,
        matchingInvoice: matchedInvoice
      });

      generatedDebtItems.push({
        id: `DEBT-AUTO-${proc.id}`,
        patientRef: proc.patientPseudonym,
        datePerformed: proc.encounterDate,
        procedureName: proc.procedureName,
        gapType: 'Unbilled Procedure',
        estimatedKes: tariff,
        daysOutstanding: Math.max(1, Math.floor((Date.now() - new Date(proc.encounterDate).getTime()) / (1000 * 60 * 60 * 24)) || 1),
        status: 'pending',
        attribution: 'kazira_flagged',
        department: dept,
        doctorName: proc.doctorName
      });
    } else if (matchedInvoice.billedAmountKes < tariff) {
      // Underbilled procedure (partial fee billed, difference uncaptured)
      const diffKes = tariff - matchedInvoice.billedAmountKes;
      underbilledProceduresCount += 1;
      totalBilledRevenueKes += matchedInvoice.billedAmountKes;
      totalUnbilledRevenueKes += diffKes;
      deptMap[dept].unbilledCount += 1;
      deptMap[dept].unbilledKes += diffKes;
      doctorMap[doctor].unbilledCount += 1;
      doctorMap[doctor].unbilledKes += diffKes;

      unbilledItems.push({
        procedure: proc,
        gapType: 'Underbilled Variance',
        unbilledAmountKes: diffKes,
        matchingInvoice: matchedInvoice
      });

      generatedDebtItems.push({
        id: `DEBT-UNDER-${proc.id}`,
        patientRef: proc.patientPseudonym,
        datePerformed: proc.encounterDate,
        procedureName: `${proc.procedureName} (Underbilled Tariff Variance)`,
        gapType: 'Underbilled Procedure Item',
        estimatedKes: diffKes,
        daysOutstanding: Math.max(1, Math.floor((Date.now() - new Date(proc.encounterDate).getTime()) / (1000 * 60 * 60 * 24)) || 1),
        status: 'pending',
        attribution: 'kazira_flagged',
        department: dept,
        doctorName: proc.doctorName
      });
    } else {
      // Fully billed
      fullyBilledProceduresCount += 1;
      totalBilledRevenueKes += matchedInvoice.billedAmountKes;
    }
  }

  // Calculate leakage percentage
  const leakagePercentage = totalPotentialRevenueKes > 0
    ? Number(((totalUnbilledRevenueKes / totalPotentialRevenueKes) * 100).toFixed(2))
    : 0;

  // Finalize department breakdown
  const departmentBreakdown: Record<string, DepartmentLeakageSummary> = {};
  for (const [deptName, stats] of Object.entries(deptMap)) {
    const lPct = stats.potentialKes > 0
      ? Number(((stats.unbilledKes / stats.potentialKes) * 100).toFixed(2))
      : 0;
    departmentBreakdown[deptName] = {
      department: deptName,
      unbilledCount: stats.unbilledCount,
      unbilledKes: stats.unbilledKes,
      totalProcedures: stats.totalProcedures,
      potentialKes: stats.potentialKes,
      leakagePercentage: lPct
    };
  }

  // Finalize doctor breakdown
  const practitionerBreakdown: Record<string, PractitionerLeakageSummary> = {};
  for (const [docName, stats] of Object.entries(doctorMap)) {
    practitionerBreakdown[docName] = {
      doctorName: docName,
      unbilledCount: stats.unbilledCount,
      unbilledKes: stats.unbilledKes,
      totalProcedures: stats.totalProcedures
    };
  }

  return {
    totalProceduresPerformed: procedures.length,
    totalPotentialRevenueKes,
    totalBilledRevenueKes,
    totalUnbilledRevenueKes,
    leakagePercentage,
    unbilledProceduresCount,
    underbilledProceduresCount,
    fullyBilledProceduresCount,
    unbilledItems,
    departmentBreakdown,
    practitionerBreakdown,
    generatedDebtItems
  };
}

/**
 * Creates a verified factual summary prompt string for Gemini,
 * guaranteeing the model only receives deterministic ground-truth numbers.
 */
export function buildVerifiedDeterministicSummary(result: ReconciliationResult): string {
  return [
    `DETERMINISTIC GROUND TRUTH (VERIFIED PROCEDURE AUDIT):`,
    `- Total Procedures Performed: ${result.totalProceduresPerformed}`,
    `- Total Potential Revenue: KES ${result.totalPotentialRevenueKes.toLocaleString()}`,
    `- Total Invoiced Revenue: KES ${result.totalBilledRevenueKes.toLocaleString()}`,
    `- Total Unbilled Revenue Variance: KES ${result.totalUnbilledRevenueKes.toLocaleString()}`,
    `- Clinical Revenue Leakage Rate: ${result.leakagePercentage}%`,
    `- Unbilled Procedures Count: ${result.unbilledProceduresCount}`,
    `- Underbilled Tariff Discrepancies Count: ${result.underbilledProceduresCount}`,
    `- Fully Reconciled Procedures Count: ${result.fullyBilledProceduresCount}`,
    `\nDEPARTMENT BREAKDOWN:`,
    ...Object.values(result.departmentBreakdown).map(
      d => `  * ${d.department}: KES ${d.unbilledKes.toLocaleString()} unbilled across ${d.unbilledCount} procedures (${d.leakagePercentage}% leakage)`
    ),
    `\nATTENDING PRACTITIONER BREAKDOWN:`,
    ...Object.values(result.practitionerBreakdown).map(
      p => `  * ${p.doctorName}: KES ${p.unbilledKes.toLocaleString()} unbilled (${p.unbilledCount} items)`
    )
  ].join('\n');
}
