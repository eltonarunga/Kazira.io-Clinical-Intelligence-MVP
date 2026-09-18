import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ShieldCheck, 
  DollarSign, 
  Layers, 
  Cpu, 
  FileText,
  Building2,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

interface FaqItem {
  id: string;
  category: 'billing' | 'sha' | 'kdpa' | 'ai' | 'integrations';
  question: string;
  answer: string;
  highlights?: string[];
}

const FAQ_DATA: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'billing',
    question: 'How does Kazira detect unbilled revenue and procedure leakage?',
    answer: 'Kazira cross-references patient encounter records (such as doctor consultation notes, surgical theatre logs, and laboratory requisition slips) against the facility’s finalized billing invoices. When a documented consumable, lab panel, ultrasound scan, or minor surgical procedure has no corresponding line item in the hospital billing system, Kazira flags the discrepancy with an estimated KES loss and attributes it to the attending clinician for immediate reconciliation.',
    highlights: [
      'Automated reconciliation between clinical charts and billing invoices',
      'Instant categorization across Pharmacy, Lab, Surgery, and Diagnostics',
      'Estimated KES calculation with provider attribution'
    ]
  },
  {
    id: 'faq-2',
    category: 'sha',
    question: 'How does Kazira handle Social Health Authority (SHA) claims and tariffs?',
    answer: 'Kazira validates all encounter claims against current Kenya Social Health Authority (SHA) benefit packages and tariff guidelines. Before submission to the MoH DHIS2/SHA gateway, Kazira audits pre-authorization codes, beneficiary member numbers, diagnostic ICD-10 codes, and clinical justifications. This pre-submission scrubbing reduces claim rejection rates from the national average of ~28% to under 4%.',
    highlights: [
      'Pre-submission audit against Kenya SHA statutory benefit schedules',
      'Batch resubmission tracking within statutory 14-day revision windows',
      'Rejection root-cause analysis (mismatched tokens, invalid tariff codes)'
    ]
  },
  {
    id: 'faq-3',
    category: 'kdpa',
    question: 'How does Kazira ensure strict compliance with the Kenya Data Protection Act 2019?',
    answer: 'Under KDPA 2019, health data is classified as sensitive personal data. Kazira enforces cryptographic pseudonymisation at the ingestion boundary: patient names, national identity numbers, and phone numbers are converted into irreversible SHA-256 tokens before any analytics or intelligence algorithms execute. Furthermore, Kazira supports local Kenyan sovereign data hosting and mandates a Data Protection Impact Assessment (DPIA) for public facilities.',
    highlights: [
      'Cryptographic SHA-256 pseudonymisation at ingestion boundary',
      'Zero unmasked PII transmitted to external models or cloud services',
      'Data residency on sovereign Kenyan cloud infrastructure (Local DC)'
    ]
  },
  {
    id: 'faq-4',
    category: 'ai',
    question: 'What is the Gemini 3.8 Dual-Loop deterministic audit architecture?',
    answer: 'Kazira utilizes a dual-loop pattern: Loop 1 generates a clinical narrative report summarizing weekly volume, revenue variances, and encounter trends using Google Gemini 3.8 Flash. Loop 2 is an independent, deterministic audit pass that independently verifies the narrative arithmetic, checks every figure against the source ledger, flags discrepancies, and generates a mathematical audit score. This guarantees that no hallucinated statistics ever enter executive medical briefings.',
    highlights: [
      'Dual-agent validation: Generator agent paired with an independent Auditor agent',
      'Deterministic arithmetic reconciliation (100% mathematical parity guarantee)',
      'Confidence scoring (High, Medium, Flagged) for every executive metric'
    ]
  },
  {
    id: 'faq-5',
    category: 'integrations',
    question: 'Which Electronic Medical Records (EMRs) and Hospital Systems connect with Kazira?',
    answer: 'Kazira connects natively to HL7 FHIR R4 interfaces used across Kenya, including KenyaEMR (OpenMRS), Kranium, Funsoft HMIS, CareCloud, and AfyaKE. For facilities without automated API endpoints, Kazira provides secure offline CSV/Excel drag-and-drop batch ingestion with automatic column mapping and instant pseudonymisation.',
    highlights: [
      'Native HL7 FHIR R4 and REST connectors for OpenMRS / KenyaEMR',
      'MoH DHIS2 aggregate aggregate-sync gateway',
      'Encrypted CSV/Excel offline batch ingestion for non-API clinics'
    ]
  },
  {
    id: 'faq-6',
    category: 'billing',
    question: 'Can we resolve and dismiss unbilled gap items with custom reason codes?',
    answer: 'Yes. When an administrator or billing officer reviews an unbilled gap in the Ledger, they can mark it as "Collected" (recording the invoice number and actual KES received), "Dismissed" (selecting reason codes such as "Included in Global Package", "Write-off Approved", "Patient Refused", or "Duplicate Entry"), or "Escalated" for clinical audit review.',
    highlights: [
      'Audited status transitions with tamper-evident logbook timestamps',
      'Direct synchronization with facility cashbook and accounts receivable',
      'Reason codes recorded for root-cause loss prevention training'
    ]
  },
  {
    id: 'faq-7',
    category: 'integrations',
    question: 'Does Kazira work offline if the clinic internet goes down?',
    answer: 'Yes. Kazira features an offline-first architecture with localized browser caching (IndexedDB/safeStorage) and local server persistence. In the event of network disruption, clinical staff can continue logging resolutions, checking receivables, and queueing encounter bundles. As soon as connectivity is restored, items automatically synchronize with the central ledger and DHIS2 gateway.',
    highlights: [
      'Offline queueing for debt updates and encounter reviews',
      'Automatic background synchronization upon reconnection',
      'Zero downtime for hospital cash desks and clinical leads'
    ]
  },
  {
    id: 'faq-8',
    category: 'sha',
    question: 'How do facility directors export briefings for County Health Teams (CHMT) and Board meetings?',
    answer: 'Kazira allows one-click export of executive intelligence dossiers in both CSV and formatted PDF briefing layouts. Exported reports feature executive summaries, KDPA pseudonymised tables, SHA tariff breakdowns, practitioner attribution charts, and statutory certification stamps suitable for submission to County Health Executives and hospital audit committees.',
    highlights: [
      'One-click CSV & printable executive briefing export',
      'Complies with Master Facility List (MFL) reporting formats',
      'Includes cryptographic verification hash for regulatory authenticity'
    ]
  }
];

export const FaqModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({
    'faq-1': true,
    'faq-2': true
  });

  const toggleItem = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter(item => {
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchesQuery = 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.highlights && item.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-6 text-on-surface" id="kazira-faq-content">
      {/* Intro Header */}
      <div className="bg-surface-container p-5 rounded-md border border-outline-variant/30 flex items-start gap-4">
        <div className="w-10 h-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary mt-0.5">
          <HelpCircle size={22} />
        </div>
        <div>
          <h3 className="font-headline-sm text-lg font-bold text-on-surface">
            Frequently Asked Questions
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            Essential answers on revenue recovery, Social Health Authority (SHA) claim rules, KDPA 2019 compliance, and clinical EMR integrations for Kenyan health facilities.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions (e.g. SHA tariffs, KDPA, KenyaEMR, unbilled gaps)..."
            className="w-full pl-10 pr-4 py-2.5 bg-surface border border-outline-variant/30 rounded text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            aria-label="Search frequently asked questions"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'billing', label: 'Unbilled Revenue' },
            { id: 'sha', label: 'SHA Claims' },
            { id: 'kdpa', label: 'KDPA 2019' },
            { id: 'ai', label: 'Dual-Loop AI' },
            { id: 'integrations', label: 'EMR / FHIR' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ Items */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 bg-surface-container/40 rounded border border-outline-variant/20 p-6">
            <HelpCircle size={32} className="mx-auto text-on-surface-variant/40 mb-2" />
            <p className="text-sm font-medium text-on-surface">No matching questions found</p>
            <p className="text-xs text-on-surface-variant mt-1">Try searching for "claims", "unbilled", or "privacy".</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="mt-3 text-xs text-primary font-semibold hover:underline cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredFaqs.map(item => {
            const isOpen = Boolean(openIds[item.id]);
            return (
              <div 
                key={item.id}
                className="border border-outline-variant/30 rounded-md bg-surface-container-lowest overflow-hidden transition-colors hover:border-primary/40"
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  aria-expanded={isOpen}
                  className="w-full p-4 text-left flex items-start justify-between gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-sm text-on-surface leading-snug">
                    {item.question}
                  </span>
                  <ChevronDown 
                    size={18} 
                    className={`text-on-surface-variant shrink-0 mt-0.5 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-primary' : ''
                    }`} 
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/15 space-y-3 animate-in fade-in duration-150">
                    <p>{item.answer}</p>
                    
                    {item.highlights && item.highlights.length > 0 && (
                      <div className="bg-surface-container/60 p-3 rounded border border-outline-variant/20 space-y-1.5">
                        <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider block">
                          Key Operational Safeguards
                        </span>
                        <ul className="space-y-1">
                          {item.highlights.map((h, idx) => (
                            <li key={idx} className="flex items-start gap-1.5 text-[11px] text-on-surface">
                              <CheckCircle2 size={13} className="text-primary shrink-0 mt-0.5" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support & Contact Banner */}
      <div className="p-4 rounded-md bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Building2 size={18} className="text-primary" />
          <span className="text-on-surface font-medium">Need clinical onboarding assistance or custom HIS connector?</span>
        </div>
        <a 
          href="mailto:support@kazira.io?subject=Kazira%20Clinical%20Inquiry%20-%20Nairobi%20West" 
          className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline"
        >
          <span>Contact Clinical Support</span>
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};

export default FaqModal;
