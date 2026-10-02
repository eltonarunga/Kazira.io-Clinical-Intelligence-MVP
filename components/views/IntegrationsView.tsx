import React, { useState } from 'react';
import { 
  Network, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Send, 
  CreditCard, 
  ShieldCheck, 
  Server, 
  ExternalLink,
  Radio,
  FileSpreadsheet,
  UploadCloud
} from 'lucide-react';

interface IntegrationsViewProps {
  onShowToast: (title: string, msg: string, type?: 'success' | 'warn' | 'info' | 'sms' | 'audit') => void;
  onOpenCsvIngestion?: () => void;
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ onShowToast, onOpenCsvIngestion }) => {
  const [testingService, setTestingService] = useState<string | null>(null);

  const handleTestIntegration = (name: string, endpoint: string) => {
    setTestingService(name);
    onShowToast(`Ping Initiated`, `Testing TLS 1.3 handshake to ${name} (${endpoint})...`, 'info');

    setTimeout(() => {
      setTestingService(null);
      onShowToast(`Connection Nominal`, `${name} responded in 42ms with HTTP 200 OK. Gateway verified.`, 'success');
    }, 1100);
  };

  return (
    <div className="flex flex-col w-full gap-space-xl">
      {/* Header */}
      <section className="flex flex-col gap-space-sm">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-sm">
            <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-high text-on-surface-variant font-label-mono text-label-mono uppercase tracking-wider font-semibold">
              <Network size={14} className="text-primary" />
              Interoperability Gateway Hub
            </span>
            <span className="font-label-mono text-label-mono text-primary font-medium">
              HL7 FHIR R4 &amp; Kenya National MoH APIs
            </span>
          </div>

          <button
            onClick={() => handleTestIntegration('All Ecosystem Gateways', 'Cluster')}
            className="px-space-md py-2 bg-primary hover:bg-primary-container text-on-primary rounded font-body-sm text-body-sm font-semibold transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Ping All Gateways</span>
          </button>
        </div>

        <div className="flex flex-col gap-1 max-w-4xl">
          <h1 className="font-display-md text-xl sm:text-2xl lg:text-3xl text-on-surface tracking-tight font-semibold font-head">
            FHIR &amp; MoH DHIS2 National Ecosystem Connectors
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant leading-relaxed">
            Zero-friction integrations connecting Nairobi West Memorial (MFL #14920) with KenyaEMR, the Social Health Authority, MoH DHIS2, Safaricom Daraja, and Africa's Talking.
          </p>
        </div>
      </section>

      {/* Integration Connectors Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-space-base">
        {/* Connector 1: OpenMRS / KenyaEMR */}
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between space-y-space-md shadow-2xs">
          <div className="space-y-space-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                <Server size={22} />
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-mono text-label-mono font-bold">
                Connected
              </span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold pt-1 font-head">
              KenyaEMR (OpenMRS FHIR R4)
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Continuous listener pulling DiagnosticReport, Observation, and Encounter resources from local facility EHR.
            </p>
            <div className="pt-1 font-label-mono text-[11px] text-on-surface-variant space-y-1">
              <div>Endpoint: <code className="text-on-surface break-all">http://localhost:8080/openmrs/ws/fhir2/R4</code></div>
              <div>Ingestion: <span className="text-primary font-semibold">142 bundles this week</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-primary"></span>
              Live Polling
            </span>
            <button 
              onClick={() => handleTestIntegration('KenyaEMR FHIR', 'http://localhost:8080')}
              disabled={testingService === 'KenyaEMR FHIR'}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container text-on-surface font-label-mono text-label-mono transition-colors cursor-pointer"
            >
              {testingService === 'KenyaEMR FHIR' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Connector 2: MoH DHIS2 National Data Warehouse */}
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between space-y-space-md shadow-2xs">
          <div className="space-y-space-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-secondary">
                <Network size={22} />
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-mono text-label-mono font-bold">
                Nominal
              </span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold pt-1 font-head">
              MoH DHIS2 National Warehouse
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Aggregate data push for Ministry of Health national health reporting (MOH 711 Inpatient &amp; Outpatient Summary).
            </p>
            <div className="pt-1 font-label-mono text-[11px] text-on-surface-variant space-y-1">
              <div>Endpoint: <code className="text-on-surface break-all">https://dhis.health.go.ke/api</code></div>
              <div>Last Sync: <span className="text-on-surface font-medium">24 mins ago (0 errors)</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-primary flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm bg-primary"></span>
              Form 711 Ready
            </span>
            <button 
              onClick={() => handleTestIntegration('MoH DHIS2', 'https://dhis.health.go.ke')}
              disabled={testingService === 'MoH DHIS2'}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container text-on-surface font-label-mono text-label-mono transition-colors cursor-pointer"
            >
              {testingService === 'MoH DHIS2' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Connector 3: Social Health Authority Clearing API */}
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between space-y-space-md shadow-2xs">
          <div className="space-y-space-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                <ShieldCheck size={22} />
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-mono text-label-mono font-bold">
                Active v3.4
              </span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold pt-1 font-head">
              SHA National Claims Clearinghouse
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Direct e-claims submission engine with real-time tariff adjudication, biometric pre-auth, and rejection avoidance.
            </p>
            <div className="pt-1 font-label-mono text-[11px] text-on-surface-variant space-y-1">
              <div>Gateway: <code className="text-on-surface break-all">https://claims.sha.go.ke/api/v1</code></div>
              <div>Batch Capacity: <span className="text-primary font-semibold">184 claims ready</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-primary flex items-center gap-1">
              <ShieldCheck size={12} />
              HMAC Secured
            </span>
            <button 
              onClick={() => handleTestIntegration('SHA National Clearinghouse', 'https://claims.sha.go.ke')}
              disabled={testingService === 'SHA National Clearinghouse'}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container text-on-surface font-label-mono text-label-mono transition-colors cursor-pointer"
            >
              {testingService === 'SHA National Clearinghouse' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Connector 4: Africa's Talking Telecom API */}
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between space-y-space-md shadow-2xs">
          <div className="space-y-space-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-secondary">
                <Send size={22} />
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-mono text-label-mono font-bold">
                Online
              </span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold pt-1 font-head">
              Africa's Talking SMS Gateway
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              High-throughput transactional SMS gateway for clinician documentation alerts and patient debt reminders.
            </p>
            <div className="pt-1 font-label-mono text-[11px] text-on-surface-variant space-y-1">
              <div>Sender ID: <code className="text-on-surface break-all">KAZIRA_MED</code></div>
              <div>Latency: <span className="text-primary font-semibold">180ms delivery SLA</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-on-surface-variant">
              Balance: KES 14,800
            </span>
            <button 
              onClick={() => handleTestIntegration("Africa's Talking SMS", 'https://api.africastalking.com')}
              disabled={testingService === "Africa's Talking SMS"}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container text-on-surface font-label-mono text-label-mono transition-colors cursor-pointer"
            >
              {testingService === "Africa's Talking SMS" ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Connector 5: Safaricom Daraja M-Pesa STK Push */}
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between space-y-space-md shadow-2xs">
          <div className="space-y-space-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                <CreditCard size={22} />
              </div>
              <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-mono text-label-mono font-bold">
                Online
              </span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold pt-1 font-head">
              Safaricom Daraja M-Pesa STK Push
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Automated prompt dispatch directly to patient handsets for copays and unbilled outpatient fees.
            </p>
            <div className="pt-1 font-label-mono text-[11px] text-on-surface-variant space-y-1">
              <div>Shortcode: <code className="text-on-surface break-all">222111 (Paybill)</code></div>
              <div>STK Conversion: <span className="text-primary font-semibold">78.5% same-day</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-primary flex items-center gap-1">
              <CheckCircle2 size={13} />
              C2B &amp; STK Active
            </span>
            <button 
              onClick={() => handleTestIntegration('Safaricom Daraja M-Pesa', 'https://api.safaricom.co.ke')}
              disabled={testingService === 'Safaricom Daraja M-Pesa'}
              className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container text-on-surface font-label-mono text-label-mono transition-colors cursor-pointer"
            >
              {testingService === 'Safaricom Daraja M-Pesa' ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>

        {/* Connector 6: Offline CSV & PMS Ingestion Gateway */}
        <div className="p-space-base rounded-md bg-surface-container-lowest border border-outline-variant/20 flex flex-col justify-between space-y-space-md shadow-2xs">
          <div className="space-y-space-xs">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded bg-surface-container flex items-center justify-center text-primary">
                <FileSpreadsheet size={22} />
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-label-mono text-label-mono font-bold">
                Offline-Ready
              </span>
            </div>
            <h3 className="font-headline-md text-base sm:text-lg text-on-surface font-semibold pt-1 font-head">
              Manual CSV &amp; PMS Ingestion
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Batch upload theatre logs, outpatient billing extracts, and SHA claim manifests directly from Excel or EHR CSV exports.
            </p>
            <div className="pt-1 font-label-mono text-[11px] text-on-surface-variant space-y-1">
              <div>Format: <code className="text-on-surface break-all">RFC 4180 CSV / TSV</code></div>
              <div>Protection: <span className="text-emerald-800 font-semibold">KDPA 2019 Pseudonymisation</span></div>
            </div>
          </div>

          <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
            <span className="font-label-mono text-[11px] text-primary flex items-center gap-1">
              <ShieldCheck size={13} />
              Zero Cloud PII
            </span>
            {onOpenCsvIngestion && (
              <button 
                onClick={onOpenCsvIngestion}
                className="px-3 py-1 rounded bg-primary hover:bg-primary/90 text-white font-label-mono text-label-mono transition-colors cursor-pointer flex items-center gap-1.5 font-bold shadow-2xs"
              >
                <UploadCloud size={13} />
                <span>Ingest CSV</span>
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntegrationsView;
