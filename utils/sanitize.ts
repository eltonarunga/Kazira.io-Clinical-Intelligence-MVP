/**
 * Input sanitization & security helpers (anti-XSS & input trimming)
 * KDPA 2019 Sovereign Standards
 */

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (tag) => (tag === '<' ? '&lt;' : '&gt;'))
    .trim();
}

export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  // Clean phone to E.164 Kenyan format or standard digits
  return phone.replace(/[^0-9+]/g, '');
}

export function validateKesAmount(val: number | string): number {
  const num = typeof val === 'string' ? parseFloat(val.replace(/,/g, '')) : val;
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}
