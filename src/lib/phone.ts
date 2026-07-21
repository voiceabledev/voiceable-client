/** US/CA phone helpers. Extracted from DemoCallModal so there is one copy. */

/** Progressively formats digits as (555) 123-4567 while the user types. */
export function formatPhoneNumber(value: string): string {
  const limited = value.replace(/\D/g, "").slice(0, 10);

  if (limited.length === 0) return "";
  if (limited.length <= 3) return `(${limited}`;
  if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
  return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
}

/** Returns +1XXXXXXXXXX, or null when it isn't a complete 10-digit number. */
export function toE164(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** Formats an E.164 string for display: +12135551234 -> (213) 555-1234 */
export function formatE164ForDisplay(value: string): string {
  const digits = value.replace(/\D/g, "").replace(/^1/, "");
  if (digits.length !== 10) return value;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
