/**
 * Normalizes Nepal phone numbers to standard format (+977 98XXXXXXXX)
 */
export function normalizePhone(rawPhone: string): string {
  if (!rawPhone) return "";
  let digits = rawPhone.replace(/\D/g, "");

  // If starts with 977 and length is 12
  if (digits.startsWith("977") && digits.length === 12) {
    return `+${digits}`;
  }

  // If 10 digits starting with 98 or 97 or 01
  if (digits.length === 10) {
    return `+977${digits}`;
  }

  return `+${digits}`;
}

export function isValidNepalPhone(phone: string): boolean {
  const norm = normalizePhone(phone);
  return /^\+977[0-9]{9,10}$/.test(norm);
}
