import { UserProfile } from '../types';

export const PROFILES: UserProfile[] = [
  {
    id: 'user-elton-arunga',
    name: 'Elton Arunga',
    title: 'Chief Technology Officer & Lead Administrator',
    email: 'eltonarunga@gmail.com',
    role: 'facility_admin',
    facilityName: 'Kazira Clinical Health Systems',
    facilityCode: 'MFL #10001',
    facilityType: 'private',
    avatarMonogram: 'EA',
    avatarColor: 'bg-[#005235] text-white',
    isGuest: false,
    department: 'Health Informatics & Revenue Architecture',
    phone: '+254 700 000 000',
    permissions: [
      'Full Revenue Cycle Management',
      'Unbilled Gap Debt Resolution',
      'SHA Claim Verification & Submission',
      'Deterministic AI Dual-Loop Execution',
      'Facility Gateway & EMR Configuration',
      'Firestore Cloud Database Synchronization'
    ]
  },
  {
    id: 'user-amina-mutua',
    name: 'Dr. Amina Mutua, MBChB',
    title: 'Chief Medical Officer & Facility Admin',
    email: 'a.mutua@nairobiwestmed.co.ke',
    role: 'facility_admin',
    facilityName: 'Nairobi West Memorial Hospital',
    facilityCode: 'MFL #14920',
    facilityType: 'private',
    avatarMonogram: 'AM',
    avatarColor: 'bg-[#005235] text-white',
    isGuest: false,
    department: 'Executive Administration & Clinical Services',
    phone: '+254 722 849 102',
    permissions: [
      'Full Revenue Cycle Management',
      'Unbilled Gap Debt Resolution',
      'SHA Claim Verification & Submission',
      'Deterministic AI Dual-Loop Execution',
      'Facility Gateway & EMR Configuration'
    ]
  },
  {
    id: 'user-jane-kerubo',
    name: 'Dr. Jane Kerubo, MD, MPH',
    title: 'County Health Director & MoH Liaison',
    email: 'j.kerubo@nairobi.go.ke',
    role: 'county_health',
    facilityName: 'Nairobi County Department of Health Services',
    facilityCode: 'MOH-NRB-HQ',
    facilityType: 'public_faith',
    avatarMonogram: 'JK',
    avatarColor: 'bg-indigo-700 text-white',
    isGuest: false,
    department: 'County Disease Surveillance & Public Oversight',
    phone: '+254 733 912 450',
    permissions: [
      'County-wide Clinical Surveillance',
      'MoH DHIS2 Aggregate Submission',
      'KDPA 2019 Sovereign Data Governance',
      'Public Facility Tariff Benchmark Review'
    ]
  },
  {
    id: 'user-guest-auditor',
    name: 'Guest Health Auditor',
    title: 'Clinical Sandbox Evaluator (Guest)',
    email: 'guest.evaluator@kazira.sandbox',
    role: 'guest',
    facilityName: 'Kazira Clinical Sandbox (Demo Clinic)',
    facilityCode: 'MFL #DEMO-01',
    facilityType: 'private',
    avatarMonogram: 'GE',
    avatarColor: 'bg-[#d96414] text-white',
    isGuest: true,
    department: 'Independent Health Systems Evaluation',
    phone: 'Sandbox Session',
    permissions: [
      'Read-Only Unbilled Ledger Exploration',
      'Synthetic AI Dual-Loop Simulation',
      'SHA Pre-Submission Tariff Inspection',
      'KDPA Anonymization Pipeline Sandbox'
    ]
  },
  {
    id: 'user-david-kiprop',
    name: 'David Kiprop, CPA (K)',
    title: 'Chief Financial Officer & Billing Lead (Evaluator)',
    email: 'd.kiprop@eldoretdocplaza.co.ke',
    role: 'facility_admin',
    facilityName: 'Eldoret Doctors Plaza',
    facilityCode: 'MFL #18204',
    facilityType: 'private',
    avatarMonogram: 'DK',
    avatarColor: 'bg-emerald-700 text-white',
    isGuest: true,
    department: 'Revenue Cycle & Claims Assurance',
    phone: '+254 711 405 921',
    permissions: [
      'Revenue Leakage & Unbilled Gap Ledger',
      'Evaluator Dual-Loop AI Audit Simulation',
      'Doctor Unbilled Documentation Reminders',
      'SHA Claims Adjudication Preview'
    ]
  }
];

export const DEFAULT_PROFILE: UserProfile = PROFILES[0];
export const GUEST_PROFILE: UserProfile = PROFILES[2];
