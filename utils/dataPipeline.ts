export interface ProcessingOptions {
  removePII?: boolean;
  normalizeWhitespace?: boolean;
  maxLength?: number;
}

/**
 * A data processing pipeline to clean and transform raw clinic data
 * before feeding it into the Gemini AI model.
 */
export const processClinicData = (
  rawInput: string,
  options: ProcessingOptions = { removePII: true, normalizeWhitespace: true, maxLength: 50000 }
): string => {
  if (!rawInput) return '';

  let processedText = rawInput;

  // 1. Truncate excessive length to prevent token overflow
  if (options.maxLength && processedText.length > options.maxLength) {
    processedText = processedText.substring(0, options.maxLength) + '\n\n[DATA TRUNCATED DUE TO LENGTH]';
  }

  // 2. Normalize whitespace (remove excessive blank lines and trailing spaces)
  if (options.normalizeWhitespace) {
    processedText = processedText
      .replace(/[ \t]+$/gm, '') // Remove trailing spaces on each line
      .replace(/\n{3,}/g, '\n\n') // Replace 3+ newlines with exactly 2
      .trim();
  }

  // 3. Remove/Redact common PII (Personally Identifiable Information)
  if (options.removePII) {
    // Redact Email Addresses
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    processedText = processedText.replace(emailRegex, '[EMAIL REDACTED]');

    // Redact Phone Numbers (US format approximation)
    const phoneRegex = /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
    processedText = processedText.replace(phoneRegex, '[PHONE REDACTED]');

    // Redact SSN (Social Security Numbers)
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g;
    processedText = processedText.replace(ssnRegex, '[SSN REDACTED]');
    
    // Note: Patient names are harder to redact reliably with simple regex without NLP,
    // but the above handles the most critical structured PII.
  }

  return processedText;
};
