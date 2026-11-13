/**
 * Normalizes WhatsApp and Egyptian/international phone inputs into clean international digits.
 * - Strips spaces, dashes, parentheses, and leading `+`
 * - Strips leading `00` international dialing prefix
 * - Converts local 11-digit Egyptian mobile numbers (`010/011/012/015...`) to `201...`
 */
export const normalizeWhatsAppPhone = (raw: string): string => {
  let digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (/^01[0125]\d{8}$/.test(digits)) digits = `2${digits}`
  return digits
}

/**
 * Validates that a phone number normalizes to E.164 digits without `+` (8-15 digits, non-zero start).
 */
export const isValidWhatsAppPhone = (raw: string): boolean =>
  /^[1-9]\d{7,14}$/.test(normalizeWhatsAppPhone(raw))
