# Kazira Clinical Intelligence - Task Tracker

## High Priority
- [x] **Gemini Model Strings & Schema Alignment:** Updated `geminiService.ts` to `gemini-2.5-flash` and `gemini-2.5-pro`, and added `unbilledRevenueKes`, `shaReimbursementPendingKes`, `shaClaimVolume` to `extractMetrics` schema. (Completed)
- [x] **Currency Formatting KES Fix:** Cleaned up `formatCurrency()` in `Dashboard.tsx` to unconditionally prefix KES across all revenue metrics. (Completed)
- [x] **Receivables & Unbilled Debt Ledger:** Built interactive Debt/Receivables list view (`DebtReceivablesList.tsx`) with patient ref, procedure, date, gap type, estimated KES, insurer, claim status, days outstanding, and status. (Completed)
- [x] **Flag Resolution & Reason Codes:** Built resolution modal allowing flags to be marked as Collected (with invoice ref & amount), Dismissed (with reason code: already invoiced, patient refused, write-off, data error, duplicate), or Escalated. (Completed)
- [x] **Insurance Claim Fields:** Integrated claim reference, submission date, insurer, and processing status tracking (`unsubmitted`, `submitted`, `approved`, `rejected`, `resubmitted`). (Completed)
- [x] **Financial Recovery Logbook:** Built dedicated Recovery Logbook tab (`RecoveryLogbook.tsx`) tracking Detected (KES), Actioned (KES), and Collected (KES) running totals with Net Recovery ROI proof line. (Completed)
- [x] **CSV Exports:** Implemented one-click CSV export utilities (`exportCsv.ts`) for both Debt Receivables and Recovery Logbook. (Completed)

## Medium Priority
- [x] **Baseline Comparison Period Selector:** Added pre-Kazira historical baseline selector (default 12 weeks) to onboarding and logbook to calculate pre/post leakage rate reductions. (Completed)
- [x] **Attribution Badging:** Added strict `kazira_flagged` vs `manually_identified` attribution badges, ensuring only auto-detected flags count toward Kazira ROI. (Completed)
- [x] **Meta Tags & Agent Framing:** Updated `index.html` meta description for private & public Kenyan facilities, and aligned `AGENTS.md` with no autonomous agents/complexity theatre principles. (Completed)

## Future Roadmap / Phase 2
- [ ] **Encrypted Database Storage:** Migrate local report history to PostgreSQL / Supabase encrypted cloud persistence.
- [ ] **Offline PWA Worker:** Service worker caching for low-connectivity rural health centers.
