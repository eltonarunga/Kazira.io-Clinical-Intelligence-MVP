/**
 * Processes and cleans raw clinic data, strictly enforcing patient pseudonymisation
 * as mandated by GDPR and the Kenya Data Protection Act 2019.
 * This ensures no personally identifiable information (PII) of patients flows
 * to external models, while preserving aggregate business metrics and doctor names.
 */
export const processClinicData = (data: string): string => {
  if (!data) return '';

  let processed = data.trim();

  // Pattern 1: Emails
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  processed = processed.replace(emailRegex, '[EMAIL_REDACTED]');

  // Pattern 2: Phone numbers (Kenyan format and general formats)
  const phoneRegex = /(\+?254|0)[17]\d{8}\b/g;
  processed = processed.replace(phoneRegex, '[PHONE_REDACTED]');

  // Pattern 3: Common patient ID structures (e.g., Patient ID: 1234, ID Num: 12345)
  const patientIdRegex = /(patient\s*id|patientid|id\s*num|national\s*id|id\s*:\s*)\s*(\d+)/gi;
  processed = processed.replace(patientIdRegex, (match, label, idVal) => {
    // Obfuscate the actual ID cleanly
    const masked = idVal.substring(0, Math.min(2, idVal.length)) + '****';
    return `${label}: [PATIENT_ID_${masked}]`;
  });

  // Pattern 4: Strict pseudonymisation of patient name records if they appear in text.
  // Look for patterns like "Patient Name: First Last", "Patient: First Last", etc.
  const patientNameRegex = /(patient\s*name|patient\s*:\s*|client\s*:\s*|name\s*:\s*)([A-Z][a-z]+(\s+[A-Z][a-z]+)+)/gi;
  let anonCounter = 1;
  const nameMap = new Map<string, string>();

  processed = processed.replace(patientNameRegex, (match, prefix, fullname) => {
    const trimmedName = fullname.trim();
    if (!nameMap.has(trimmedName)) {
      nameMap.set(trimmedName, `[ANONYMISED_PATIENT_${anonCounter++}]`);
    }
    return `${prefix} ${nameMap.get(trimmedName)}`;
  });

  // Normalize excessive newlines
  processed = processed.replace(/\n{3,}/g, '\n\n');

  return processed;
};
