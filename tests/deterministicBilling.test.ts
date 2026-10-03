import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  reconcileProceduresAgainstInvoices,
  PerformedProcedure,
  BilledInvoice,
  buildVerifiedDeterministicSummary
} from '../utils/deterministicBilling';

describe('Deterministic Billing Reconciliation Engine', () => {
  it('should identify completely unbilled procedures with exact arithmetic calculation', () => {
    const procedures: PerformedProcedure[] = [
      {
        id: 'PROC-001',
        patientPseudonym: 'ANON-PAT-1001',
        procedureCode: 'RAD-US-01',
        procedureName: 'Obstetric Ultrasound Scan & Doppler',
        standardTariffKes: 14500,
        department: 'Radiology',
        doctorName: 'Dr. Amina Mutua',
        encounterDate: '2026-09-15'
      },
      {
        id: 'PROC-002',
        patientPseudonym: 'ANON-PAT-1002',
        procedureCode: 'LAB-FBC-02',
        procedureName: 'Full Blood Count & Renal Function',
        standardTariffKes: 6800,
        department: 'Laboratory',
        doctorName: 'Dr. Kevin Omondi',
        encounterDate: '2026-09-15'
      }
    ];

    const invoices: BilledInvoice[] = []; // No invoices generated

    const result = reconcileProceduresAgainstInvoices(procedures, invoices, 'MFL #14920');

    assert.equal(result.totalProceduresPerformed, 2);
    assert.equal(result.totalPotentialRevenueKes, 21300); // 14500 + 6800
    assert.equal(result.totalBilledRevenueKes, 0);
    assert.equal(result.totalUnbilledRevenueKes, 21300);
    assert.equal(result.leakagePercentage, 100);
    assert.equal(result.unbilledProceduresCount, 2);
    assert.equal(result.underbilledProceduresCount, 0);
    assert.equal(result.fullyBilledProceduresCount, 0);
    assert.equal(result.generatedDebtItems.length, 2);
    assert.equal(result.generatedDebtItems[0].estimatedKes, 14500);
    assert.equal(result.generatedDebtItems[1].estimatedKes, 6800);
  });

  it('should accurately calculate underbilled tariff variances', () => {
    const procedures: PerformedProcedure[] = [
      {
        id: 'PROC-003',
        patientPseudonym: 'ANON-PAT-2001',
        procedureCode: 'SURG-MAJ-01',
        procedureName: 'Emergency Caesarean Delivery',
        standardTariffKes: 75000,
        department: 'Theatre',
        doctorName: 'Dr. Amina Mutua',
        encounterDate: '2026-09-16'
      }
    ];

    // Invoiced, but at standard clinic fee instead of comprehensive surgical tariff
    const invoices: BilledInvoice[] = [
      {
        id: 'INV-101',
        patientPseudonym: 'ANON-PAT-2001',
        procedureCode: 'SURG-MAJ-01',
        procedureName: 'Emergency Caesarean Delivery',
        billedAmountKes: 50000, // Underbilled by 25,000 KES
        status: 'invoiced',
        invoiceRef: 'INV-2026-0012'
      }
    ];

    const result = reconcileProceduresAgainstInvoices(procedures, invoices);

    assert.equal(result.totalProceduresPerformed, 1);
    assert.equal(result.totalPotentialRevenueKes, 75000);
    assert.equal(result.totalBilledRevenueKes, 50000);
    assert.equal(result.totalUnbilledRevenueKes, 25000);
    assert.equal(result.leakagePercentage, 33.33); // 25,000 / 75,000 = 33.33%
    assert.equal(result.unbilledProceduresCount, 0);
    assert.equal(result.underbilledProceduresCount, 1);
    assert.equal(result.fullyBilledProceduresCount, 0);
    assert.equal(result.generatedDebtItems[0].estimatedKes, 25000);
  });

  it('should correctly flag fully reconciled procedures as zero leakage', () => {
    const procedures: PerformedProcedure[] = [
      {
        id: 'PROC-004',
        patientPseudonym: 'ANON-PAT-3001',
        procedureCode: 'DEN-EXT-01',
        procedureName: 'Molar Surgical Extraction',
        standardTariffKes: 12000,
        department: 'Dental',
        doctorName: 'Dr. Grace Wanjiku',
        encounterDate: '2026-09-17'
      }
    ];

    const invoices: BilledInvoice[] = [
      {
        id: 'INV-102',
        patientPseudonym: 'ANON-PAT-3001',
        procedureCode: 'DEN-EXT-01',
        billedAmountKes: 12000,
        status: 'paid',
        invoiceRef: 'INV-2026-0033'
      }
    ];

    const result = reconcileProceduresAgainstInvoices(procedures, invoices);

    assert.equal(result.totalProceduresPerformed, 1);
    assert.equal(result.totalPotentialRevenueKes, 12000);
    assert.equal(result.totalBilledRevenueKes, 12000);
    assert.equal(result.totalUnbilledRevenueKes, 0);
    assert.equal(result.leakagePercentage, 0);
    assert.equal(result.unbilledProceduresCount, 0);
    assert.equal(result.underbilledProceduresCount, 0);
    assert.equal(result.fullyBilledProceduresCount, 1);
    assert.equal(result.generatedDebtItems.length, 0);
  });

  it('should reconcile complex multi-department multi-practitioner clinical shifts', () => {
    const procedures: PerformedProcedure[] = [
      // 1. Radiology (Amina Mutua) - Unbilled
      {
        id: 'PROC-10',
        patientPseudonym: 'ANON-PAT-501',
        procedureCode: 'RAD-US-01',
        procedureName: 'Pelvic Ultrasound Scan',
        standardTariffKes: 8500,
        department: 'Radiology',
        doctorName: 'Dr. Amina Mutua',
        encounterDate: '2026-09-18'
      },
      // 2. Radiology (Amina Mutua) - Fully billed
      {
        id: 'PROC-11',
        patientPseudonym: 'ANON-PAT-502',
        procedureCode: 'RAD-XR-02',
        procedureName: 'Chest X-Ray 2-View',
        standardTariffKes: 4500,
        department: 'Radiology',
        doctorName: 'Dr. Amina Mutua',
        encounterDate: '2026-09-18'
      },
      // 3. Theatre (Dr. Omondi) - Underbilled by 15,000
      {
        id: 'PROC-12',
        patientPseudonym: 'ANON-PAT-503',
        procedureCode: 'SURG-MIN-05',
        procedureName: 'Tendon Repair & Debridement',
        standardTariffKes: 35000,
        department: 'Theatre',
        doctorName: 'Dr. Kevin Omondi',
        encounterDate: '2026-09-18'
      },
      // 4. Pharmacy (Dr. Grace Wanjiku) - Unbilled consumables
      {
        id: 'PROC-13',
        patientPseudonym: 'ANON-PAT-504',
        procedureCode: 'PHARM-IV-01',
        procedureName: 'IV Antibiotic Infusion Kit',
        standardTariffKes: 7200,
        department: 'Pharmacy',
        doctorName: 'Dr. Grace Wanjiku',
        encounterDate: '2026-09-18'
      }
    ];

    const invoices: BilledInvoice[] = [
      // Matches PROC-11 (Fully Billed)
      {
        id: 'INV-201',
        patientPseudonym: 'ANON-PAT-502',
        procedureCode: 'RAD-XR-02',
        billedAmountKes: 4500,
        status: 'paid'
      },
      // Matches PROC-12 (Underbilled)
      {
        id: 'INV-202',
        patientPseudonym: 'ANON-PAT-503',
        procedureCode: 'SURG-MIN-05',
        billedAmountKes: 20000, // 35,000 - 20,000 = 15,000 unbilled
        status: 'invoiced'
      }
    ];

    const result = reconcileProceduresAgainstInvoices(procedures, invoices);

    // Potential: 8500 + 4500 + 35000 + 7200 = 55,200 KES
    assert.equal(result.totalPotentialRevenueKes, 55200);
    // Billed: 4500 + 20000 = 24,500 KES
    assert.equal(result.totalBilledRevenueKes, 24500);
    // Unbilled: 8500 (unbilled) + 15000 (underbilled) + 7200 (unbilled) = 30,700 KES
    assert.equal(result.totalUnbilledRevenueKes, 30700);

    // Leakage % = (30700 / 55200) * 100 = 55.62%
    assert.equal(result.leakagePercentage, 55.62);

    // Counts: 2 completely unbilled (PROC-10, PROC-13), 1 underbilled (PROC-12), 1 fully billed (PROC-11)
    assert.equal(result.unbilledProceduresCount, 2);
    assert.equal(result.underbilledProceduresCount, 1);
    assert.equal(result.fullyBilledProceduresCount, 1);

    // Department verification
    assert.equal(result.departmentBreakdown['Radiology'].unbilledKes, 8500);
    assert.equal(result.departmentBreakdown['Theatre'].unbilledKes, 15000);
    assert.equal(result.departmentBreakdown['Pharmacy'].unbilledKes, 7200);

    // Practitioner verification
    assert.equal(result.practitionerBreakdown['Dr. Amina Mutua'].unbilledKes, 8500);
    assert.equal(result.practitionerBreakdown['Dr. Kevin Omondi'].unbilledKes, 15000);
    assert.equal(result.practitionerBreakdown['Dr. Grace Wanjiku'].unbilledKes, 7200);

    // Summary text builder should contain exact figures
    const summary = buildVerifiedDeterministicSummary(result);
    assert.ok(summary.includes('30,700'));
    assert.ok(summary.includes('55,200'));
    assert.ok(summary.includes('55.62%'));
  });

  it('should handle empty procedures array gracefully without NaN or errors', () => {
    const result = reconcileProceduresAgainstInvoices([], []);
    assert.equal(result.totalProceduresPerformed, 0);
    assert.equal(result.totalPotentialRevenueKes, 0);
    assert.equal(result.totalBilledRevenueKes, 0);
    assert.equal(result.totalUnbilledRevenueKes, 0);
    assert.equal(result.leakagePercentage, 0);
    assert.equal(result.unbilledItems.length, 0);
    assert.equal(result.generatedDebtItems.length, 0);
  });
});
