/**
 * Security-focused input validation helpers.
 * These complement Zod schema validation by providing
 * runtime guards against common injection patterns.
 */

/** Max lengths for common field types */
export const MAX_LENGTHS = {
  email: 254,
  password: 128,
  name: 100,
  description: 1000,
  filename: 255,
  url: 2048,
  general: 500,
} as const;

/**
 * Returns true if the string contains characters commonly used in SQL injection.
 */
export function containsSqlInjectionPatterns(input: string): boolean {
  const patterns = [
    /('|")/,
    /(--|#|;\/\*)/,
    /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/i,
  ];
  return patterns.some(p => p.test(input));
}

/**
 * Returns true if the string contains HTML/script injection patterns.
 */
export function containsXssPatterns(input: string): boolean {
  const patterns = [
    /<script[\s\S]*?>/i,
    /javascript:/i,
    /on\w+\s*=/i,  // onclick=, onerror=, etc.
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /data:/i,
    /vbscript:/i,
  ];
  return patterns.some(p => p.test(input));
}

/**
 * Returns true if the value is a safe string within the given max length.
 */
export function isSafeString(input: unknown, maxLength = MAX_LENGTHS.general): boolean {
  if (typeof input !== 'string') return false;
  if (input.length > maxLength) return false;
  return !containsXssPatterns(input);
}

/**
 * Validates an email address format (basic RFC 5321 check).
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  if (email.length > MAX_LENGTHS.email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Returns true if a URL is safe to open (http/https only, no javascript: etc.).
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Strips path traversal sequences from a filename.
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\.\./g, '')          // remove ..
    .replace(/[\/\\]/g, '')        // remove / and \
    .replace(/[^a-zA-Z0-9._-]/g, '_') // replace unsafe chars
    .slice(0, MAX_LENGTHS.filename);
}
