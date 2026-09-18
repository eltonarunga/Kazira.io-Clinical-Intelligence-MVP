import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Send, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  X, 
  Download,
  FileSpreadsheet,
  AlertCircle,
  Check
} from 'lucide-react';
import { DebtItem } from '../../types';
import { exportDebtsToCsv } from '../../utils/exportCsv';
import { sanitizeInput, validateKesAmount } from '../../utils/sanitize';

export interface LedgerItem {
  id: string;
  patientToken: string;
  time: string;
  location: string;
  doctor: string;
  procedure: string;
  tariff: string;
  estimatedKes: number;
  rootCause: string;
  status: 'Unbilled' | 'SHA Review' | 'SMS Sent' | 'Resolved';
  department: 'theatre' | 'radiology' | 'lab' | 'casualty' | 'obgyn';
  missingItem: string;
  smsText: string;
}

const GUEST_SAMPLE_LEDGER_ITEMS: LedgerItem[] = [
  {
    id: '8812',
    patientToken: 'ANON-PAT-8812',
    time: 'Today 11:45',
    location: 'Radiology Room B',
    doctor: 'Dr. Peter Karanja',
    procedure: 'Abdominal Ultrasound & Doppler',
    tariff: 'RAD-US-04',
    estimatedKes: 18500,
    rootCause: 'Cashier Bypass',
    status: 'Unbilled',
    department: 'radiology',
    missingItem: 'Ultrasound Scan not added to cashier bill',
    smsText: 'Jambo, your Nairobi West Memorial invoice #8812 has an outstanding ultrasound fee of KES 18,500. Paybill: 222111 Acct: 8812.'
  },
  {
    id: '7490',
    patientToken: 'ANON-PAT-7490',
    time: 'Today 09:12',
    location: 'Main Theatre 2',
    doctor: 'Dr. Kevin Omondi',
    procedure: 'Emergency C-Section Consumables',
    tariff: 'SURG-CS-02',
    estimatedKes: 45000,
    rootCause: 'Theatre Note Omission',
    status: 'SHA Review',
    department: 'theatre',
    missingItem: 'Surgical pack and disposable trocars',
    smsText: 'Jambo, Nairobi West Memorial invoice #7490 has an insurance pre-authorization balance of KES 45,000.'
  },
  {
    id: '6201',
    patientToken: 'ANON-PAT-6201',
    time: 'Yesterday 16:30',
    location: 'Core Laboratory',
    doctor: 'Dr. Grace Wanjiku',
    procedure: 'Histopathology Biopsy Panel',
    tariff: 'LAB-HP-11',
    estimatedKes: 32000,
    rootCause: 'Lab System Sync Lag',
    status: 'Unbilled',
    department: 'lab',
    missingItem: 'Tissue block processing fee',
    smsText: 'Jambo, your Nairobi West Memorial lab invoice #6201 has an unbilled test balance of KES 32,000.'
  },
  {
    id: '5539',
    patientToken: 'ANON-PAT-5539',
    time: '24 Oct 14:10',
    location: 'Ward 3 (Surgical)',
    doctor: 'Dr. George Odhiambo',
    procedure: 'Lower Limb Traction Kit',
    tariff: 'ORTH-TR-01',
    estimatedKes: 14200,
    rootCause: 'Ward Store Lag',
    status: 'SMS Sent',
    department: 'theatre',
    missingItem: 'Ward traction equipment pack',
    smsText: 'Jambo, Nairobi West Memorial invoice #5539 equipment balance KES 14,200. Inquiries: 0711000000.'
  },
  {
    id: '4119',
    patientToken: 'ANON-PAT-4119',
    time: '24 Oct 10:20',
    location: 'Casualty / ER',
    doctor: 'Dr. Mary Nduta',
    procedure: 'IV Infusion & Emergency Resuscitation',
    tariff: 'EM-TH-09',
    estimatedKes: 22000,
    rootCause: 'Emergency Intake Lag',
    status: 'Resolved',
    department: 'casualty',
    missingItem: 'Emergency medication infusion line',
    smsText: 'Receipt confirmed for KES 22,000 for invoice #4119. Thank you.'
  }
];

function mapDebtToLedgerItem(d: DebtItem): LedgerItem {
  let mappedStatus: 'Unbilled' | 'SHA Review' | 'SMS Sent' | 'Resolved' = 'Unbilled';
  if (d.status === 'collected') mappedStatus = 'Resolved';
  else if (d.status === 'escalated') mappedStatus = 'SHA Review';
  else if (d.status === 'pending') mappedStatus = 'Unbilled';

  return {
    id: d.id.replace('DEBT-', ''),
    patientToken: d.patientRef || `PAT-${d.id.slice(-4)}`,
    time: d.datePerformed || 'Recent',
    location: d.department === 'theatre' ? 'Main Theatre' : d.department === 'radiology' ? 'Radiology Wing' : 'Clinical Ward',
    doctor: d.doctorName || 'Attending Physician',
    procedure: d.procedureName,
    tariff: d.icd10Code || 'PROC-01',
    estimatedKes: d.estimatedKes,
    rootCause: d.notes || d.gapType || 'Discovered Procedural Gap',
    status: mappedStatus,
    department: (d.department && ['theatre', 'radiology', 'lab', 'casualty', 'obgyn'].includes(d.department) ? d.department : 'theatre') as any,
    missingItem: d.gapType || d.procedureName,
    smsText: `Jambo, outstanding procedural balance KES ${d.estimatedKes.toLocaleString()} for ref ${d.patientRef}.`
  };
}

interface UnbilledGapLedgerViewProps {
  debts: DebtItem[];
  onUpdateDebt: (debt: DebtItem) => void;
  onAddDebt: (debt: DebtItem) => void;
  onBatchAddDebts?: (debts: DebtItem[]) => void;
  onOpenCsvIngestion?: () => void;
  onShowToast: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  isGuest?: boolean;
}

export const UnbilledGapLedgerView: React.FC<UnbilledGapLedgerViewProps> = ({
  debts,
  onUpdateDebt,
  onAddDebt,
  onBatchAddDebts,
  onOpenCsvIngestion,
  onShowToast,
  isGuest = false
}) => {
  // Synchronize items: guest profile gets demo items to explore; real users get strictly their real items
  const [items, setItems] = useState<LedgerItem[]>(() => {
    if (debts && debts.length > 0) {
      return debts.map(mapDebtToLedgerItem);
    }
    return isGuest ? GUEST_SAMPLE_LEDGER_ITEMS : [];
  });

  useEffect(() => {
    if (debts && debts.length > 0) {
      setItems(debts.map(mapDebtToLedgerItem));
    } else if (isGuest) {
      setItems(GUEST_SAMPLE_LEDGER_ITEMS);
    } else {
      setItems([]);
    }
  }, [debts, isGuest]);

  const [selectedId, setSelectedId] = useState<string>('');

  useEffect(() => {
    if (items.length > 0 && (!selectedId || !items.some(i => i.id === selectedId))) {
      setSelectedId(items[0].id);
    }
  }, [items, selectedId]);

  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form State for Adding New Gap
  const [formPatId, setFormPatId] = useState('');
  const [formDept, setFormDept] = useState<'theatre' | 'radiology' | 'lab' | 'casualty' | 'obgyn'>('theatre');
  const [formEstKes, setFormEstKes] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProcedure, setFormProcedure] = useState('');

  const selectedItem = items.find(i => i.id === selectedId) || items[0] || null;

  const filteredItems = items.filter(item => {
    const matchesDept = deptFilter === 'all' || item.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = 
      item.patientToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.procedure.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tariff.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesStatus && matchesSearch;
  });

  // Dynamic calculations from current items
  const totalUnbilled = items.filter(i => i.status !== 'Resolved').reduce((sum, i) => sum + i.estimatedKes, 0);
  const inShaReview = items.filter(i => i.status === 'SHA Review').reduce((sum, i) => sum + i.estimatedKes, 0);
  const smsFollowup = items.filter(i => i.status === 'SMS Sent').reduce((sum, i) => sum + i.estimatedKes, 0);
  const recoveredAmount = items.filter(i => i.status === 'Resolved').reduce((sum, i) => sum + i.estimatedKes, 0);

  const pendingCount = items.filter(i => i.status === 'Unbilled').length;
  const shaReviewCount = items.filter(i => i.status === 'SHA Review').length;
  const smsSentCount = items.filter(i => i.status === 'SMS Sent').length;
  const resolvedCount = items.filter(i => i.status === 'Resolved').length;

  const handleSendSms = (item: LedgerItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'SMS Sent' } : i));
    onShowToast('SMS Dispatched', `Payment reminder sent to ${item.patientToken} for KES ${item.estimatedKes.toLocaleString()}.`, 'sms');
  };

  const handleResolve = (item: LedgerItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'Resolved' } : i));
    if (onUpdateDebt) {
      const existing = debts.find(d => d.id === `DEBT-${item.id}` || d.patientRef === item.patientToken);
      if (existing) {
        onUpdateDebt({
          ...existing,
          status: 'collected',
          resolvedAt: new Date().toISOString().split('T')[0],
          amountCollectedKes: item.estimatedKes
        });
      } else {
        onUpdateDebt({
          id: `DEBT-${item.id}`,
          patientRef: item.patientToken,
          procedureName: item.procedure,
          datePerformed: new Date().toISOString().split('T')[0],
          gapType: item.missingItem,
          daysOutstanding: 0,
          estimatedKes: item.estimatedKes,
          attribution: 'kazira_flagged',
          status: 'collected',
          resolvedAt: new Date().toISOString().split('T')[0],
          amountCollectedKes: item.estimatedKes
        });
      }
    }
    onShowToast('Gap Resolved', `Marked ${item.patientToken} as collected (KES ${item.estimatedKes.toLocaleString()}).`, 'success');
  };

  const handleCreateGap = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPatId = sanitizeInput(formPatId) || `ANON-PAT-${Math.floor(1000 + Math.random() * 9000)}`;
    const cleanProcedure = sanitizeInput(formProcedure) || 'Clinical Service / Consumables';
    const cleanDesc = sanitizeInput(formDesc) || 'Unrecorded consumable';
    const parsedKes = validateKesAmount(formEstKes);

    if (parsedKes <= 0) {
      onShowToast('Invalid Amount', 'Please provide a valid positive amount in KES.', 'warn');
      return;
    }

    const newId = String(Date.now()).slice(-4);
    const newItem: LedgerItem = {
      id: newId,
      patientToken: cleanPatId,
      time: 'Just now',
      location: formDept === 'theatre' ? 'Main Theatre' : formDept === 'radiology' ? 'Radiology Wing' : 'General Ward',
      doctor: 'Attending Clinician',
      procedure: cleanProcedure,
      tariff: 'PROC-MANUAL',
      estimatedKes: parsedKes,
      rootCause: cleanDesc,
      status: 'Unbilled',
      department: formDept,
      missingItem: cleanDesc,
      smsText: `Jambo, your facility invoice #${newId} has an unbilled procedural balance of KES ${parsedKes.toLocaleString()}.`
    };

    setItems([newItem, ...items]);
    setSelectedId(newItem.id);

    if (onAddDebt) {
      onAddDebt({
        id: `DEBT-${newItem.id}`,
        patientRef: newItem.patientToken,
        procedureName: newItem.procedure,
        datePerformed: new Date().toISOString().split('T')[0],
        gapType: newItem.missingItem,
        daysOutstanding: 0,
        estimatedKes: newItem.estimatedKes,
        attribution: 'manually_identified',
        status: 'pending',
        department: newItem.department
      });
    }

    setIsModalOpen(false);
    onShowToast('Gap Recorded', `Added ${newItem.patientToken} (KES ${newItem.estimatedKes.toLocaleString()}) to the ledger.`, 'success');

    setFormPatId('');
    setFormEstKes('');
    setFormDesc('');
    setFormProcedure('');
  };

  return (
    <div className="flex flex-col w-full space-y-6 animate-in fade-in duration-200">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">
              Unbilled Procedure Ledger
            </h1>
            {isGuest && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded">
                Guest Demo Sandbox
              </span>
            )}
          </div>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Review and resolve clinical services performed without billing lines.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenCsvIngestion && (
            <button 
              onClick={onOpenCsvIngestion}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface rounded text-xs font-semibold border border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/40 transition-colors cursor-pointer"
              title="Upload or paste clinical CSV records to batch ingest unbilled gaps"
            >
              <FileSpreadsheet size={15} className="text-primary" />
              <span>Ingest CSV Batch</span>
            </button>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
          >
            <PlusCircle size={15} />
            <span>Add Discovered Gap</span>
          </button>
          <button 
            onClick={() => {
              exportDebtsToCsv(debts.length > 0 ? debts : items.map(i => ({
                id: `DEBT-${i.id}`,
                patientRef: i.patientToken,
                procedureName: i.procedure,
                datePerformed: i.time,
                gapType: i.missingItem,
                daysOutstanding: 0,
                estimatedKes: i.estimatedKes,
                attribution: 'manually_identified' as const,
                status: i.status === 'Resolved' ? 'collected' : 'pending'
              })));
              onShowToast('Exported', 'Downloaded ledger as CSV.', 'success');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface rounded text-xs font-medium border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards (Dynamically Computed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-secondary">Total Unbilled Gaps</span>
          <div className="text-2xl font-bold text-secondary font-mono mt-2">
            KES {totalUnbilled.toLocaleString()}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{pendingCount} unbilled items</p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-on-surface-variant">In SHA Review</span>
          <div className="text-2xl font-bold text-on-surface font-mono mt-2">
            KES {inShaReview.toLocaleString()}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{shaReviewCount} claims under review</p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-on-surface-variant">SMS Follow-up</span>
          <div className="text-2xl font-bold text-on-surface font-mono mt-2">
            KES {smsFollowup.toLocaleString()}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{smsSentCount} reminders sent</p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-primary">Recovered Revenue</span>
          <div className="text-2xl font-bold text-primary font-mono mt-2">
            KES {recoveredAmount.toLocaleString()}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">{resolvedCount} items resolved</p>
        </div>
      </div>

      {/* Empty State for Real Facility User when no debts exist */}
      {items.length === 0 ? (
        <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 space-y-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <CheckCircle2 size={28} />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-base font-bold text-on-surface">No Unbilled Procedural Gaps</h3>
            <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
              Your facility ledger currently has zero unbilled gap records. Real authenticated accounts start completely clean without mock data. Ingest hospital encounters via CSV or record individual discovered gaps.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {onOpenCsvIngestion && (
              <button
                onClick={onOpenCsvIngestion}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors cursor-pointer shadow-xs"
              >
                <FileSpreadsheet size={15} />
                <span>Ingest Clinical CSV</span>
              </button>
            )}
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/30"
            >
              <PlusCircle size={15} />
              <span>Record Single Gap</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <div className="p-3.5 rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by patient ID, doctor, procedure..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-surface-container rounded-lg border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-hidden transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {(['all', 'theatre', 'radiology', 'lab', 'casualty'] as const).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => setDeptFilter(dept)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors font-medium cursor-pointer ${
                      deptFilter === dept 
                        ? 'bg-primary text-white' 
                        : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {dept === 'all' ? 'All Depts' : dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1 text-xs border-t border-outline-variant/10 pt-2.5 flex-wrap">
              <span className="text-on-surface-variant mr-1 font-medium">Status:</span>
              {(['all', 'Unbilled', 'SHA Review', 'SMS Sent', 'Resolved'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer ${
                    statusFilter === st 
                      ? 'bg-on-surface text-white font-medium' 
                      : 'text-on-surface-variant hover:text-on-surface bg-surface-container/60'
                  }`}
                >
                  {st === 'all' ? `All (${items.length})` : st}
                </button>
              ))}
            </div>
          </div>

          {/* Main Grid: Left Table (7 cols) + Right Detail (5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Table View */}
            <div className="lg:col-span-7 rounded-md bg-surface-container-lowest border border-outline-variant/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-surface-container/50 text-on-surface-variant border-b border-outline-variant/15 font-semibold">
                      <th className="py-2.5 px-3">Patient ID</th>
                      <th className="py-2.5 px-3">Procedure</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredItems.map((item) => {
                      const isSelected = selectedId === item.id;
                      return (
                        <tr 
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-primary/10 font-medium' 
                              : 'hover:bg-surface-container/40'
                          }`}
                        >
                          <td className="py-3 px-3">
                            <div className="font-semibold text-on-surface font-mono">
                              {item.patientToken}
                            </div>
                            <span className="text-[11px] text-on-surface-variant">
                              {item.doctor}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-on-surface">{item.procedure}</div>
                            <span className="text-[11px] text-on-surface-variant">
                              {item.location}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="font-mono font-bold text-secondary">
                              KES {item.estimatedKes.toLocaleString()}
                            </div>
                            <span className="text-[10px] text-on-surface-variant">
                              {item.tariff}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                              item.status === 'Resolved' 
                                ? 'bg-primary/10 text-primary' 
                                : item.status === 'SMS Sent' 
                                ? 'bg-amber-100 text-amber-900' 
                                : item.status === 'SHA Review'
                                ? 'bg-indigo-100 text-indigo-900'
                                : 'bg-secondary/10 text-secondary'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-sm ${
                                item.status === 'Resolved' ? 'bg-primary' : 'bg-secondary'
                              }`}></span>
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Detail / Action Inspector */}
            {selectedItem && (
              <div className="lg:col-span-5 p-5 rounded-md bg-surface-container-lowest border border-outline-variant/20 space-y-4 sticky top-20">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                  <div>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      {selectedItem.time}
                    </span>
                    <h2 className="text-base font-bold text-on-surface mt-0.5">
                      {selectedItem.patientToken}
                    </h2>
                  </div>
                  <span className="text-sm font-bold font-mono text-secondary">
                    KES {selectedItem.estimatedKes.toLocaleString()}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-on-surface-variant font-medium">Procedure:</span>
                    <p className="font-semibold text-on-surface mt-0.5">{selectedItem.procedure}</p>
                  </div>

                  <div>
                    <span className="text-on-surface-variant font-medium">Lead Doctor &amp; Location:</span>
                    <p className="text-on-surface mt-0.5">{selectedItem.doctor} • {selectedItem.location}</p>
                  </div>

                  <div>
                    <span className="text-on-surface-variant font-medium">Missing Item:</span>
                    <p className="text-on-surface mt-0.5">{selectedItem.missingItem}</p>
                  </div>

                  <div>
                    <span className="text-on-surface-variant font-medium">Detected Gap Cause:</span>
                    <p className="text-on-surface mt-0.5 text-secondary font-medium">{selectedItem.rootCause}</p>
                  </div>
                </div>

                <div className="p-3 rounded bg-surface-container border border-outline-variant/10 text-xs">
                  <span className="font-medium text-on-surface block mb-1">Pre-filled Patient SMS:</span>
                  <p className="text-on-surface-variant text-[11px] italic leading-relaxed">
                    "{selectedItem.smsText}"
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => handleSendSms(selectedItem)}
                    className="w-full py-2 bg-secondary text-white hover:bg-secondary/90 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Send SMS Reminder</span>
                  </button>

                  <button
                    onClick={() => handleResolve(selectedItem)}
                    disabled={selectedItem.status === 'Resolved'}
                    className="w-full py-2 bg-primary text-white hover:bg-primary/90 text-xs font-semibold rounded transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 size={14} />
                    <span>{selectedItem.status === 'Resolved' ? 'Resolved & Reconciled' : 'Mark as Reconciled'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal for Adding Discovered Gap */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-xl border border-outline-variant/30 shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h2 className="text-base font-bold text-on-surface">Record Discovered Gap</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateGap} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Pseudonymised Patient Ref / Token
                </label>
                <input 
                  type="text" 
                  value={formPatId}
                  onChange={(e) => setFormPatId(e.target.value)}
                  placeholder="e.g. ANON-PAT-9021"
                  className="w-full px-3 py-2 bg-surface-container rounded border border-outline-variant/20 focus:outline-hidden focus:border-primary text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">
                  Procedure or Clinical Service Name
                </label>
                <input 
                  type="text" 
                  value={formProcedure}
                  onChange={(e) => setFormProcedure(e.target.value)}
                  placeholder="e.g. Laparoscopic Trocar Consumable Kit"
                  className="w-full px-3 py-2 bg-surface-container rounded border border-outline-variant/20 focus:outline-hidden focus:border-primary text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Department</label>
                <select 
                  value={formDept}
                  onChange={(e) => setFormDept(e.target.value as any)}
                  className="w-full px-3 py-2 bg-surface-container rounded border border-outline-variant/20 focus:outline-hidden focus:border-primary text-on-surface cursor-pointer"
                >
                  <option value="theatre">Main Theatre / Surgical</option>
                  <option value="radiology">Radiology / Imaging</option>
                  <option value="lab">Laboratory / Pathology</option>
                  <option value="casualty">Casualty / Emergency</option>
                  <option value="obgyn">Maternity / OB-GYN</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Estimated Value (KES)</label>
                <input 
                  type="number" 
                  value={formEstKes}
                  onChange={(e) => setFormEstKes(e.target.value)}
                  placeholder="e.g. 24000"
                  className="w-full px-3 py-2 bg-surface-container rounded border border-outline-variant/20 focus:outline-hidden focus:border-primary text-on-surface"
                  required
                />
              </div>

              <div>
                <label className="block text-on-surface-variant font-medium mb-1">Omission Reason / Root Cause</label>
                <input 
                  type="text" 
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Theatre nurse chart discrepancy"
                  className="w-full px-3 py-2 bg-surface-container rounded border border-outline-variant/20 focus:outline-hidden focus:border-primary text-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition-colors font-semibold cursor-pointer shadow-xs"
                >
                  Save to Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnbilledGapLedgerView;
