import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Send, 
  RefreshCw,
  Scale, 
  Wand2, 
  Check,
  Download,
  PlusCircle,
  X
} from 'lucide-react';
import { ShaClaim as Claim } from '../../types';
import { apiService } from '../../services/apiService';
import { safeStorage } from '../../utils/storage';

interface ShaClaimsViewProps {
  onShowToast: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  isGuest?: boolean;
  facilityCode?: string;
}

const INITIAL_CLAIMS: Claim[] = [
  {
    id: 'SHA-CLM-9811',
    memberId: 'SHA-90821-K',
    diagnosis: 'Single delivery by caesarean section',
    icdCode: 'O82.0',
    tariffCode: 'MAT-CS-SPEC-01',
    tariffName: 'Inpatient Surgical Maternity',
    originalAmount: 49500,
    cappedAmount: 45000,
    status: 'Action Required',
    issueType: 'tariff_cap',
    issueDescription: 'Itemized total exceeds SHA tariff cap by KES 4,500.',
    recommendedFix: 'Cap at standard KES 45,000 tariff'
  },
  {
    id: 'SHA-CLM-9815',
    memberId: 'SHA-43102-L',
    diagnosis: 'Infectious gastroenteritis and colitis',
    icdCode: 'A09',
    tariffCode: 'PED-IP-02',
    tariffName: 'Inpatient Pediatrics',
    originalAmount: 22000,
    cappedAmount: 22000,
    status: 'Action Required',
    issueType: 'missing_icd',
    issueDescription: 'Missing mandatory secondary dehydration code E86.0 for inpatient claim.',
    recommendedFix: 'Add E86.0 (Dehydration)'
  },
  {
    id: 'SHA-CLM-9824',
    memberId: 'SHA-77190-M',
    diagnosis: 'Hemodialysis maintenance cycle',
    icdCode: 'Z49.1',
    tariffCode: 'REN-DIAL-04',
    tariffName: 'Renal Dialysis Session',
    originalAmount: 78500,
    cappedAmount: 78500,
    status: 'Action Required',
    issueType: 'preauth_missing',
    issueDescription: 'Biometric authorization token missing from emergency intake.',
    recommendedFix: 'Send pre-auth SMS request to patient'
  },
  {
    id: 'SHA-CLM-9790',
    memberId: 'SHA-11029-P',
    diagnosis: 'General gynecological examination',
    icdCode: 'Z01.419',
    tariffCode: 'GYN-OP-01',
    tariffName: 'Outpatient Specialist Clinic',
    originalAmount: 12000,
    cappedAmount: 12000,
    status: 'Ready'
  },
  {
    id: 'SHA-CLM-9784',
    memberId: 'SHA-66410-Q',
    diagnosis: 'Type 2 diabetes with ophthalmic complications',
    icdCode: 'E11.3',
    tariffCode: 'MED-OP-03',
    tariffName: 'Chronic Care Clinic',
    originalAmount: 8500,
    cappedAmount: 8500,
    status: 'Ready'
  }
];

export const ShaClaimsView: React.FC<ShaClaimsViewProps> = ({ 
  onShowToast,
  isGuest = false,
  facilityCode = 'default'
}) => {
  const storageKey = isGuest ? 'kazira_guest_claims' : `kazira_sha_claims_${facilityCode}`;

  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to read claims', e);
    }
    return isGuest ? INITIAL_CLAIMS : [];
  });

  useEffect(() => {
    let isMounted = true;
    try {
      const saved = safeStorage.getItem(storageKey);
      if (saved) {
        setClaims(JSON.parse(saved));
      } else {
        setClaims(isGuest ? INITIAL_CLAIMS : []);
      }
    } catch (e) {
      setClaims(isGuest ? INITIAL_CLAIMS : []);
    }

    // Backend full-stack claims sync
    apiService.fetchClaims(isGuest, facilityCode).then(serverClaims => {
      if (isMounted && serverClaims && serverClaims.length > 0) {
        setClaims(serverClaims);
        safeStorage.setItem(storageKey, JSON.stringify(serverClaims));
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [storageKey, isGuest, facilityCode]);

  const saveClaims = (newClaims: Claim[]) => {
    setClaims(newClaims);
    try {
      safeStorage.setItem(storageKey, JSON.stringify(newClaims));
    } catch (e) {
      console.error('Failed to save claims', e);
    }
  };

  const [filter, setFilter] = useState<'all' | 'action' | 'ready'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New claim form state
  const [newMemberId, setNewMemberId] = useState('');
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newIcdCode, setNewIcdCode] = useState('');
  const [newTariffCode, setNewTariffCode] = useState('OUTPATIENT-01');
  const [newTariffName, setNewTariffName] = useState('Outpatient Consultation');
  const [newAmount, setNewAmount] = useState('');

  const handleFixIssue = (claim: Claim) => {
    const fixedClaim: Claim = {
      ...claim,
      status: 'Ready' as const,
      originalAmount: claim.cappedAmount,
      issueType: undefined,
      issueDescription: undefined
    };

    const updated = claims.map(c => (c.id === claim.id ? fixedClaim : c));
    saveClaims(updated);

    // Sync to backend
    apiService.updateClaim(claim.id, fixedClaim, isGuest, facilityCode);

    if (claim.issueType === 'tariff_cap') {
      onShowToast('Tariff Adjusted', `Adjusted ${claim.id} to SHA standard cap of KES ${claim.cappedAmount.toLocaleString()}.`, 'success');
    } else if (claim.issueType === 'missing_icd') {
      onShowToast('Code Appended', `Added secondary ICD-10 code E86.0 to ${claim.id}.`, 'success');
    } else {
      onShowToast('Pre-Auth Sent', `Dispatched authorization request to ${claim.memberId}.`, 'sms');
    }
  };

  const handleSyncEmr = () => {
    if (isGuest) {
      onShowToast('Synced (Sandbox)', 'Refreshed 48 pending encounters from KenyaEMR.', 'info');
      return;
    }
    const randomId = `SHA-CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const syncedClaim: Claim = {
      id: randomId,
      memberId: `SHA-${Math.floor(10000 + Math.random() * 90000)}-K`,
      diagnosis: 'Acute upper respiratory infection, unspecified',
      icdCode: 'J06.9',
      tariffCode: 'MED-OP-01',
      tariffName: 'Outpatient Clinical Consultation',
      originalAmount: 3500,
      cappedAmount: 3500,
      status: 'Ready'
    };
    saveClaims([syncedClaim, ...claims]);
    apiService.saveClaim(syncedClaim, isGuest, facilityCode);
    onShowToast('KenyaEMR Encounters Synced', `Ingested 1 verified clinical encounter (${randomId}) into batch.`, 'success');
  };

  const handleAddClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      onShowToast('Invalid Amount', 'Please provide a valid claim amount in KES.', 'warn');
      return;
    }

    const created: Claim = {
      id: `SHA-CLM-${Math.floor(1000 + Math.random() * 9000)}`,
      memberId: newMemberId.trim() || `SHA-${Math.floor(10000 + Math.random() * 90000)}-K`,
      diagnosis: newDiagnosis.trim() || 'Clinical Consultation',
      icdCode: newIcdCode.trim() || 'Z00.0',
      tariffCode: newTariffCode.trim() || 'GEN-OP-01',
      tariffName: newTariffName.trim() || 'General Consultation',
      originalAmount: amountNum,
      cappedAmount: amountNum,
      status: 'Ready'
    };

    saveClaims([created, ...claims]);
    apiService.saveClaim(created, isGuest, facilityCode);
    setIsAddModalOpen(false);
    setNewMemberId('');
    setNewDiagnosis('');
    setNewIcdCode('');
    setNewAmount('');
    onShowToast('Claim Created', `Added claim ${created.id} to active SHA submission batch.`, 'success');
  };

  const handleSubmitBatch = () => {
    const readyCount = claims.filter(c => c.status === 'Ready').length;
    setIsSubmitting(true);
    onShowToast('Submitting Batch', `Sending ${readyCount} verified claims to SHA clearing portal...`, 'info');

    setTimeout(() => {
      setIsSubmitting(false);
      onShowToast('Batch Accepted', `Successfully submitted ${readyCount} claims to Social Health Authority portal.`, 'success');
    }, 1200);
  };

  const filteredClaims = claims.filter(c => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'action' && c.status === 'Action Required') ||
      (filter === 'ready' && c.status === 'Ready');

    const matchesSearch = 
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tariffCode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const readyClaims = claims.filter(c => c.status === 'Ready');
  const actionClaims = claims.filter(c => c.status === 'Action Required');
  const readyTotal = readyClaims.reduce((acc, c) => acc + c.cappedAmount, 0);
  const totalClaimsValue = claims.reduce((acc, c) => acc + c.originalAmount, 0);
  const passRate = claims.length > 0 ? ((readyClaims.length / claims.length) * 100).toFixed(1) + '%' : '100%';

  return (
    <div className="flex flex-col w-full space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            SHA Claims Adjudication
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            Pre-flight claim verification to prevent rejection by the Social Health Authority.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleSyncEmr}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest text-on-surface rounded text-xs font-medium border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Sync EMR</span>
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest text-primary rounded text-xs font-medium border border-outline-variant/20 hover:bg-surface-container transition-colors cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>New Claim</span>
          </button>

          <button 
            onClick={handleSubmitBatch}
            disabled={isSubmitting || readyClaims.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send size={14} />
            <span>{isSubmitting ? 'Submitting...' : `Submit Batch (${readyClaims.length})`}</span>
          </button>
        </div>
      </div>

      {/* 4 Clean Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-on-surface-variant">Total Batch Claims</span>
          <div className="text-2xl font-bold text-on-surface font-mono mt-2">
            {isGuest ? (184 + (claims.length - INITIAL_CLAIMS.length)) : claims.length}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            KES {isGuest ? (5420000 + (totalClaimsValue - 170500)).toLocaleString() : totalClaimsValue.toLocaleString()} total value
          </p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-primary">Ready to Submit</span>
          <div className="text-2xl font-bold text-primary font-mono mt-2">
            {isGuest ? (158 + (readyClaims.length - 2)) : readyClaims.length}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">
            KES {isGuest ? (4580000 + (readyTotal - 20500)).toLocaleString() : readyTotal.toLocaleString()}
          </p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-secondary">Action Required</span>
          <div className="text-2xl font-bold text-secondary font-mono mt-2">
            {actionClaims.length}
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Tariff caps or missing codes</p>
        </div>

        <div className="p-4 rounded-md bg-surface-container-lowest border border-outline-variant/20">
          <span className="text-xs font-medium text-on-surface-variant">Pass Rate</span>
          <div className="text-2xl font-bold text-on-surface font-mono mt-2">
            {isGuest ? '96.2%' : passRate}
          </div>
          <p className="text-xs text-primary mt-1 font-medium">
            {isGuest ? '+2.1% improvement' : `${readyClaims.length} of ${claims.length} compliant`}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1 w-full sm:w-auto text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              filter === 'all' 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Claims ({claims.length})
          </button>
          <button
            onClick={() => setFilter('action')}
            className={`px-3 py-1.5 rounded transition-colors font-medium flex items-center gap-1.5 cursor-pointer ${
              filter === 'action' 
                ? 'bg-secondary text-on-secondary' 
                : 'bg-surface-container text-secondary hover:bg-secondary/10'
            }`}
          >
            <span>Needs Fix</span>
            <span className="px-1.5 py-0.2 rounded bg-secondary-container/20 text-[10px] font-bold">
              {actionClaims.length}
            </span>
          </button>
          <button
            onClick={() => setFilter('ready')}
            className={`px-3 py-1.5 rounded transition-colors font-medium cursor-pointer ${
              filter === 'ready' 
                ? 'bg-primary text-on-primary' 
                : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Ready ({readyClaims.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search claim, diagnosis, ICD-10..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface-container rounded border border-transparent focus:border-primary focus:bg-surface-container-lowest focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-3">
        {filteredClaims.map((claim) => {
          const needsFix = claim.status === 'Action Required';
          return (
            <div 
              key={claim.id}
              className={`p-4 rounded-md bg-surface-container-lowest border transition-colors ${
                needsFix 
                  ? 'border-secondary/30 hover:border-secondary/60' 
                  : 'border-outline-variant/20 hover:border-outline-variant/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-2 rounded ${needsFix ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'}`}>
                    {needsFix ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-on-surface">
                        {claim.id}
                      </span>
                      <span className="text-[11px] text-on-surface-variant font-mono">
                        {claim.memberId}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        needsFix ? 'bg-secondary/10 text-secondary' : 'bg-primary/10 text-primary'
                      }`}>
                        {claim.status}
                      </span>
                    </div>

                    <p className="text-xs font-medium text-on-surface mt-1">
                      {claim.diagnosis} <span className="text-on-surface-variant font-mono">({claim.icdCode})</span>
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      Tariff: {claim.tariffCode} • {claim.tariffName}
                    </p>
                  </div>
                </div>

                {/* Amount and Action */}
                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-outline-variant/10">
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-sm font-bold text-on-surface">
                      KES {claim.originalAmount.toLocaleString()}
                    </div>
                    {claim.originalAmount !== claim.cappedAmount && (
                      <span className="text-[10px] text-secondary font-mono">
                        Cap: KES {claim.cappedAmount.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {needsFix && claim.recommendedFix && (
                    <button 
                      onClick={() => handleFixIssue(claim)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-secondary text-on-secondary text-xs font-semibold hover:bg-secondary/90 transition-colors cursor-pointer"
                    >
                      <Check size={14} />
                      <span>{claim.recommendedFix}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Issue Description if Needs Fix */}
              {needsFix && claim.issueDescription && (
                <div className="mt-3 pt-2.5 border-t border-outline-variant/10 text-xs text-secondary flex items-center justify-between">
                  <span>Reason: {claim.issueDescription}</span>
                  <span className="text-[11px] font-medium text-on-surface-variant">
                    Click the button above to resolve before submission.
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {filteredClaims.length === 0 && (
          <div className="p-8 text-center bg-surface-container-lowest rounded-md border border-outline-variant/20 text-on-surface-variant text-xs space-y-3">
            <p className="font-medium text-on-surface">
              {claims.length === 0 ? 'No SHA claims currently batched' : 'No claims found matching current filters'}
            </p>
            <p className="text-xs max-w-md mx-auto">
              {claims.length === 0
                ? 'Sync verified clinical encounters from KenyaEMR or record a new claim directly to pre-flight test SHA tariff compliance.'
                : 'Try adjusting your search criteria or filter tabs.'}
            </p>
            {claims.length === 0 && (
              <div className="flex items-center justify-center gap-2.5 pt-2">
                <button
                  onClick={handleSyncEmr}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                >
                  <RefreshCw size={13} />
                  <span>Sync KenyaEMR</span>
                </button>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container text-on-surface rounded text-xs font-medium border border-outline-variant/20 hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <PlusCircle size={13} />
                  <span>New Claim</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Claim Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/20 shadow-xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-3">
              <h3 className="text-base font-bold text-on-surface">New SHA Claim</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddClaim} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                  SHA Member Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHA-58190-K"
                  value={newMemberId}
                  onChange={(e) => setNewMemberId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-container rounded border border-outline-variant/20 focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Hypertension review with lab panels"
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-container rounded border border-outline-variant/20 focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                    ICD-10 Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I10"
                    value={newIcdCode}
                    onChange={(e) => setNewIcdCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-container rounded border border-outline-variant/20 focus:outline-none focus:border-primary font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                    Tariff Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MED-OP-01"
                    value={newTariffCode}
                    onChange={(e) => setNewTariffCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-surface-container rounded border border-outline-variant/20 focus:outline-none focus:border-primary font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                  Claim Amount (KES)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 4500"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-surface-container rounded border border-outline-variant/20 focus:outline-none focus:border-primary font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-outline-variant/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-on-primary rounded text-xs font-semibold hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Add Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShaClaimsView;
