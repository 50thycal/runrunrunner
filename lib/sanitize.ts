/**
 * Utility functions for sanitizing user input to prevent XSS attacks
 */

/**
 * Escapes HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  }
  return str.replace(/[&<>"'`=/]/g, (char) => htmlEscapes[char])
}

/**
 * Escapes a string for safe use in JavaScript string literals
 */
export function escapeJs(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
}

/**
 * Sanitizes a username - removes potentially dangerous characters
 * and limits length
 */
export function sanitizeUsername(username: string, maxLength = 50): string {
  return escapeHtml(username.slice(0, maxLength))
}

/**
 * Sanitizes a numeric string - ensures it only contains digits and decimal point
 */
export function sanitizeNumeric(value: string): string {
  const cleaned = value.replace(/[^\d.]/g, '')
  // Only allow one decimal point
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  return cleaned || '0'
}

/**
 * Validates and sanitizes a URL
 */
export function sanitizeUrl(url: string, allowedProtocols = ['https:', 'http:']): string | null {
  try {
    const parsed = new URL(url)
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}
