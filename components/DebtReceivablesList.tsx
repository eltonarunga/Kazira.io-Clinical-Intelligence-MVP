import React, { useState } from 'react';
import { 
  DebtItem, 
  FlagStatus, 
  FlagAttribution, 
  ClaimStatus, 
  DismissalReasonCode 
} from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldAlert, 
  FileCheck2, 
  Building2, 
  Sparkles, 
  Clock, 
  Edit3, 
  DollarSign
} from 'lucide-react';
import { exportDebtListToCSV } from '../utils/exportCsv';
import { toast } from 'sonner';

interface DebtReceivablesListProps {
  debts: DebtItem[];
  onUpdateDebt: (updated: DebtItem) => void;
  onAddDebt: (newDebt: DebtItem) => void;
}

const DebtReceivablesList: React.FC<DebtReceivablesListProps> = ({
  debts,
  onUpdateDebt,
  onAddDebt
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [attributionFilter, setAttributionFilter] = useState<string>('all');
  const [insurerFilter, setInsurerFilter] = useState<string>('all');

  // Modal States
  const [activeResolveItem, setActiveResolveItem] = useState<DebtItem | null>(null);
  const [activeClaimItem, setActiveClaimItem] = useState<DebtItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states for Resolution Modal
  const [resolveStatus, setResolveStatus] = useState<FlagStatus>('collected');
  const [amountCollected, setAmountCollected] = useState<number>(0);
  const [invoiceRef, setInvoiceRef] = useState<string>('');
  const [dismissReason, setDismissReason] = useState<DismissalReasonCode>('already_invoiced');
  const [resolutionNote, setResolutionNote] = useState<string>('');
  const [escalatedTo, setEscalatedTo] = useState<string>('');

  // Form states for Insurance Claim Modal
  const [claimInsurer, setClaimInsurer] = useState<string>('');
  const [claimRefInput, setClaimRefInput] = useState<string>('');
  const [claimDateInput, setClaimDateInput] = useState<string>('');
  const [claimStatusInput, setClaimStatusInput] = useState<ClaimStatus>('submitted');

  // Form states for Manual Debt Item Creation
  const [newPatientRef, setNewPatientRef] = useState('ANON-PAT-MANUAL');
  const [newProcedure, setNewProcedure] = useState('');
  const [newGapType, setNewGapType] = useState('Unbilled Consultation');
  const [newEstimatedKes, setNewEstimatedKes] = useState<number>(5000);
  const [newInsurer, setNewInsurer] = useState('SHA');

  // Filter Logic
  const filteredDebts = debts.filter((item) => {
    const matchesSearch = 
      item.patientRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.procedureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gapType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.insurer && item.insurer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesAttribution = attributionFilter === 'all' || item.attribution === attributionFilter;
    const matchesInsurer = insurerFilter === 'all' || (item.insurer && item.insurer.toLowerCase() === insurerFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesAttribution && matchesInsurer;
  });

  // Calculate Summary KPIs
  const totalOutstandingKes = debts
    .filter((d) => d.status === 'pending' || d.status === 'escalated')
    .reduce((sum, d) => sum + d.estimatedKes, 0);

  const kaziraFlaggedKes = debts
    .filter((d) => d.attribution === 'kazira_flagged' && (d.status === 'pending' || d.status === 'escalated'))
    .reduce((sum, d) => sum + d.estimatedKes, 0);

  const totalCollectedKes = debts
    .filter((d) => d.status === 'collected')
    .reduce((sum, d) => sum + (d.amountCollectedKes || d.estimatedKes), 0);

  const pendingClaimsCount = debts.filter((d) => d.claimStatus === 'submitted' || d.claimStatus === 'resubmitted').length;

  const handleOpenResolve = (item: DebtItem) => {
    setActiveResolveItem(item);
    setResolveStatus(item.status === 'pending' ? 'collected' : item.status);
    setAmountCollected(item.estimatedKes);
    setInvoiceRef(item.invoiceRef || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setDismissReason(item.resolutionReason || 'already_invoiced');
    setResolutionNote(item.resolutionNote || '');
    setEscalatedTo(item.escalatedTo || 'Hospital Finance Director');
  };

  const handleSaveResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResolveItem) return;

    const updated: DebtItem = {
      ...activeResolveItem,
      status: resolveStatus,
      resolvedAt: new Date().toISOString().split('T')[0],
      amountCollectedKes: resolveStatus === 'collected' ? Number(amountCollected) : 0,
      invoiceRef: resolveStatus === 'collected' ? invoiceRef : undefined,
      resolutionReason: resolveStatus === 'dismissed' ? dismissReason : undefined,
      resolutionNote,
      escalatedTo: resolveStatus === 'escalated' ? escalatedTo : undefined
    };

    onUpdateDebt(updated);
    setActiveResolveItem(null);
    toast.success(`Debt item ${updated.id} marked as ${updated.status.toUpperCase()}`);
  };

  const handleOpenClaimModal = (item: DebtItem) => {
    setActiveClaimItem(item);
    setClaimInsurer(item.insurer || 'SHA');
    setClaimRefInput(item.claimRef || `SHA-CLM-2026-${Math.floor(1000 + Math.random() * 9000)}`);
    setClaimDateInput(item.submissionDate || new Date().toISOString().split('T')[0]);
    setClaimStatusInput(item.claimStatus || 'submitted');
  };

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClaimItem) return;

    const updated: DebtItem = {
      ...activeClaimItem,
      insurer: claimInsurer,
      claimRef: claimRefInput,
      submissionDate: claimDateInput,
      claimStatus: claimStatusInput
    };

    onUpdateDebt(updated);
    setActiveClaimItem(null);
    toast.success(`Insurance details updated for ${updated.id}`);
  };

  const handleCreateManualDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProcedure.trim()) {
      toast.error('Please enter a procedure name');
      return;
    }

    const newItem: DebtItem = {
      id: `DEBT-${Math.floor(200 + Math.random() * 800)}`,
      patientRef: newPatientRef.trim() || 'ANON-PAT-MANUAL',
      procedureName: newProcedure.trim(),
      datePerformed: new Date().toISOString().split('T')[0],
      gapType: newGapType,
      estimatedKes: Number(newEstimatedKes),
      insurer: newInsurer,
      daysOutstanding: 1,
      status: 'pending',
      attribution: 'manually_identified' // User logged it manually!
    };

    onAddDebt(newItem);
    setIsAddModalOpen(false);
    setNewProcedure('');
    toast.success(`Manual billing gap logged! (ID: ${newItem.id})`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-bold font-serif text-ink tracking-tight flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-accent" />
            Unbilled Receivables & Debt Ledger
          </h2>
          <p className="text-sm text-ink3 mt-1">
            Track, action, and resolve unbilled clinical revenue gaps with complete attribution tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-accent text-white rounded-xl text-xs font-bold hover:bg-accent2 transition-all shadow-md shadow-accent/20"
          >
            <PlusCircle size={15} /> Log Manual Gap
          </button>

          <button
            type="button"
            onClick={() => exportDebtListToCSV(filteredDebts)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-surface border border-border2 hover:border-accent text-ink rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download size={15} className="text-accent" /> Export Debt CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-ink3 flex items-center justify-between">
            <span>Outstanding Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            KES {totalOutstandingKes.toLocaleString()}
          </div>
          <p className="text-[11px] text-ink3">Total unbilled revenue identified</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-ink3 flex items-center justify-between">
            <span>Kazira Auto-Flagged</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-mono font-bold text-accent">
            KES {kaziraFlaggedKes.toLocaleString()}
          </div>
          <p className="text-[11px] text-accent/80 font-medium">Auto-detected by Kazira Engine</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-ink3 flex items-center justify-between">
            <span>Recovered Revenue</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-600">
            KES {totalCollectedKes.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Verified invoice receipts</p>
        </div>

        <div className="bg-surface p-4 rounded-xl border border-border2 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-ink3 flex items-center justify-between">
            <span>Pending Insurance Claims</span>
            <FileCheck2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-mono font-bold text-ink">
            {pendingClaimsCount} Claims
          </div>
          <p className="text-[11px] text-ink3">Submitted / Resubmitted to SHA & Insurers</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface2/60 p-3 rounded-xl border border-border2 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-ink3" />
          <input
            type="text"
            placeholder="Search patient, procedure, insurer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs outline-none focus:border-accent text-ink"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-ink3 font-semibold">
            <Filter size={14} /> Filter:
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-border2 rounded-lg text-xs px-2.5 py-1.5 outline-none focus:border-accent font-medium text-ink"
          >
            <option value="all">Status: All</option>
            <option value="pending">Pending</option>
            <option value="collected">Collected</option>
            <option value="dismissed">Dismissed</option>
            <option value="escalated">Escalated</option>
          </select>

          <select
            value={attributionFilter}
            onChange={(e) => setAttributionFilter(e.target.value)}
            className="bg-surface border border-border2 rounded-lg text-xs px-2.5 py-1.5 outline-none focus:border-accent font-medium text-ink"
          >
            <option value="all">Attribution: All</option>
            <option value="kazira_flagged">Kazira Auto-Flagged</option>
            <option value="manually_identified">Manual Entry</option>
          </select>

          <select
            value={insurerFilter}
            onChange={(e) => setInsurerFilter(e.target.value)}
            className="bg-surface border border-border2 rounded-lg text-xs px-2.5 py-1.5 outline-none focus:border-accent font-medium text-ink"
          >
            <option value="all">Insurer: All</option>
            <option value="sha">SHA</option>
            <option value="jubilee health">Jubilee Health</option>
            <option value="aar insurance">AAR Insurance</option>
            <option value="nhif / sha">NHIF / SHA</option>
            <option value="self-pay">Self-Pay</option>
          </select>
        </div>
      </div>

      {/* Main Debt Table */}
      <div className="bg-surface border border-border2 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface2/80 text-ink3 uppercase font-bold text-[10px] tracking-wider border-b border-border2">
              <tr>
                <th className="px-4 py-3">Patient Ref</th>
                <th className="px-4 py-3">Procedure / Service</th>
                <th className="px-4 py-3">Gap Type</th>
                <th className="px-4 py-3">Est. Value</th>
                <th className="px-4 py-3">Insurer & Claim</th>
                <th className="px-4 py-3">Days Out</th>
                <th className="px-4 py-3">Attribution</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border2">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-ink3 italic">
                    No billing gap items match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDebts.map((item) => (
                  <tr key={item.id} className="hover:bg-surface2/40 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-ink">
                      {item.patientRef}
                      <div className="text-[10px] text-ink3 font-sans">{item.datePerformed}</div>
                    </td>

                    <td className="px-4 py-3 font-medium text-ink max-w-[200px]">
                      {item.procedureName}
                      {item.invoiceRef && (
                        <div className="text-[10px] font-mono text-emerald-700 font-bold">
                          Inv: {item.invoiceRef}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-ink2">
                      <span className="px-2 py-0.5 bg-surface2 border border-border2 rounded text-[10px] font-medium">
                        {item.gapType}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-mono font-bold text-ink whitespace-nowrap">
                      KES {item.estimatedKes.toLocaleString()}
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink flex items-center gap-1">
                        <Building2 size={12} className="text-accent" />
                        {item.insurer || 'Self-Pay'}
                      </div>
                      {item.claimRef && (
                        <div className="text-[10px] font-mono text-ink3 flex items-center gap-1 mt-0.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.claimStatus === 'approved' ? 'bg-emerald-500' :
                            item.claimStatus === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                          }`} />
                          {item.claimRef} ({item.claimStatus})
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono text-ink3">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {item.daysOutstanding}d
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {item.attribution === 'kazira_flagged' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-light text-accent rounded-full text-[10px] font-bold border border-accent/20">
                          <Sparkles size={10} /> Kazira Flagged
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface2 text-ink3 rounded-full text-[10px] font-bold border border-border2">
                          Manual Log
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'collected' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        item.status === 'dismissed' ? 'bg-gray-100 text-gray-600 border border-gray-200' :
                        item.status === 'escalated' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status === 'collected' && <CheckCircle2 size={10} />}
                        {item.status === 'dismissed' && <XCircle size={10} />}
                        {item.status === 'escalated' && <ShieldAlert size={10} />}
                        {item.status === 'pending' && <AlertTriangle size={10} />}
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenClaimModal(item)}
                          className="px-2 py-1 bg-surface2 hover:bg-surface3 border border-border2 text-ink text-[11px] font-semibold rounded transition-all"
                          title="Edit Insurance Claim Info"
                        >
                          <Edit3 size={12} className="inline mr-1" /> Claim
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenResolve(item)}
                          className="px-2.5 py-1 bg-accent hover:bg-accent2 text-white text-[11px] font-bold rounded transition-all shadow-sm"
                        >
                          Action
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {activeResolveItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-border2 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-ink">Action Flag: {activeResolveItem.id}</h3>
                <p className="text-xs text-ink3">{activeResolveItem.procedureName} ({activeResolveItem.patientRef})</p>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveResolveItem(null)} 
                className="text-ink3 hover:text-ink font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink uppercase tracking-wider">Resolution Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolveStatus('collected')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      resolveStatus === 'collected' 
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20' 
                        : 'bg-surface2 border-border2 text-ink3 hover:bg-surface3'
                    }`}
                  >
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Collected</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolveStatus('dismissed')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      resolveStatus === 'dismissed' 
                        ? 'bg-gray-100 border-gray-500 text-gray-800 ring-2 ring-gray-500/20' 
                        : 'bg-surface2 border-border2 text-ink3 hover:bg-surface3'
                    }`}
                  >
                    <XCircle size={16} className="text-gray-600" />
                    <span>Dismissed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolveStatus('escalated')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      resolveStatus === 'escalated' 
                        ? 'bg-amber-50 border-amber-500 text-amber-800 ring-2 ring-amber-500/20' 
                        : 'bg-surface2 border-border2 text-ink3 hover:bg-surface3'
                    }`}
                  >
                    <ShieldAlert size={16} className="text-amber-600" />
                    <span>Escalated</span>
                  </button>
                </div>
              </div>

              {/* COLLECTED FIELDS */}
              {resolveStatus === 'collected' && (
                <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                  <div>
                    <label className="text-xs font-bold text-emerald-900 block mb-1">Invoice Reference *</label>
                    <input
                      type="text"
                      required
                      value={invoiceRef}
                      onChange={(e) => setInvoiceRef(e.target.value)}
                      placeholder="e.g. INV-2026-0941"
                      className="w-full px-3 py-1.5 bg-surface border border-emerald-300 rounded-lg text-xs font-mono font-bold text-ink"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-emerald-900 block mb-1">Amount Collected (KES) *</label>
                    <input
                      type="number"
                      required
                      value={amountCollected}
                      onChange={(e) => setAmountCollected(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-surface border border-emerald-300 rounded-lg text-xs font-mono font-bold text-ink"
                    />
                  </div>
                </div>
              )}

              {/* DISMISSED REASON CODES */}
              {resolveStatus === 'dismissed' && (
                <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-900 block mb-1">Dismissal Reason Code *</label>
                    <select
                      value={dismissReason}
                      onChange={(e) => setDismissReason(e.target.value as DismissalReasonCode)}
                      className="w-full px-3 py-1.5 bg-surface border border-gray-300 rounded-lg text-xs font-semibold text-ink"
                    >
                      <option value="already_invoiced">Already Invoiced (Prior Record)</option>
                      <option value="patient_refused">Patient Refused Service / Voided</option>
                      <option value="write_off">Approved Bad Debt Write-Off</option>
                      <option value="data_error">Data Entry / EHR Coding Error</option>
                      <option value="duplicate">Duplicate Encounter Flag</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ESCALATED FIELDS */}
              {resolveStatus === 'escalated' && (
                <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
                  <div>
                    <label className="text-xs font-bold text-amber-900 block mb-1">Escalate To (Role / Manager)</label>
                    <input
                      type="text"
                      value={escalatedTo}
                      onChange={(e) => setEscalatedTo(e.target.value)}
                      placeholder="e.g., Hospital Finance Director"
                      className="w-full px-3 py-1.5 bg-surface border border-amber-300 rounded-lg text-xs font-semibold text-ink"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Audit Resolution Note</label>
                <textarea
                  rows={2}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="Provide context for internal audit & compliance logs..."
                  className="w-full px-3 py-2 bg-surface border border-border2 rounded-lg text-xs text-ink outline-none focus:border-accent"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveResolveItem(null)}
                  className="px-4 py-2 bg-surface2 text-ink text-xs font-semibold rounded-xl hover:bg-surface3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent2 shadow-md shadow-accent/20"
                >
                  Save Flag Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLAIM MODAL */}
      {activeClaimItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-border2 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold font-serif text-ink">Insurance Claim Details</h3>
              <button type="button" onClick={() => setActiveClaimItem(null)} className="text-ink3 hover:text-ink font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveClaim} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Insurer Name</label>
                <input
                  type="text"
                  required
                  value={claimInsurer}
                  onChange={(e) => setClaimInsurer(e.target.value)}
                  placeholder="e.g. SHA, Jubilee, AAR"
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-semibold text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Claim Reference Number</label>
                <input
                  type="text"
                  value={claimRefInput}
                  onChange={(e) => setClaimRefInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-mono text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Submission Date</label>
                <input
                  type="date"
                  value={claimDateInput}
                  onChange={(e) => setClaimDateInput(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-mono text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Claim Processing Status</label>
                <select
                  value={claimStatusInput}
                  onChange={(e) => setClaimStatusInput(e.target.value as ClaimStatus)}
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-semibold text-ink"
                >
                  <option value="unsubmitted">Unsubmitted / Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="resubmitted">Resubmitted</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setActiveClaimItem(null)}
                  className="px-4 py-2 bg-surface2 text-ink text-xs font-semibold rounded-xl hover:bg-surface3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent2 shadow-md shadow-accent/20"
                >
                  Update Claim Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG MANUAL GAP MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-border2 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold font-serif text-ink">Log Manual Billing Gap</h3>
                <p className="text-xs text-ink3">Items logged manually will receive a "Manual Log" attribution badge.</p>
              </div>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-ink3 hover:text-ink font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualDebt} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Patient Ref (Masked / Pseudonymised)</label>
                <input
                  type="text"
                  required
                  value={newPatientRef}
                  onChange={(e) => setNewPatientRef(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-mono text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Procedure / Service Name *</label>
                <input
                  type="text"
                  required
                  value={newProcedure}
                  onChange={(e) => setNewProcedure(e.target.value)}
                  placeholder="e.g. Specialized Dental Surgery"
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-semibold text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Billing Gap Category</label>
                <select
                  value={newGapType}
                  onChange={(e) => setNewGapType(e.target.value)}
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-semibold text-ink"
                >
                  <option value="Unbilled Consultation">Unbilled Consultation</option>
                  <option value="Unbilled Procedure">Unbilled Procedure</option>
                  <option value="Unbilled Lab Diagnostic">Unbilled Lab Diagnostic</option>
                  <option value="Unbilled Pharmacy Item">Unbilled Pharmacy Item</option>
                  <option value="Missing SHA Beneficiary ID">Missing SHA Beneficiary ID</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Estimated Value (KES) *</label>
                <input
                  type="number"
                  required
                  value={newEstimatedKes}
                  onChange={(e) => setNewEstimatedKes(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-mono text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Insurer / Payment Method</label>
                <input
                  type="text"
                  value={newInsurer}
                  onChange={(e) => setNewInsurer(e.target.value)}
                  placeholder="e.g., SHA, Jubilee, Self-Pay"
                  className="w-full px-3 py-1.5 bg-surface border border-border2 rounded-lg text-xs font-semibold text-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-surface2 text-ink text-xs font-semibold rounded-xl hover:bg-surface3"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:bg-accent2 shadow-md shadow-accent/20"
                >
                  Save Manual Gap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebtReceivablesList;
