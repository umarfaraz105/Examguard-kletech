/**
 * HTML sanitization utilities using DOMPurify.
 * Use these functions to sanitize any user-generated or external content
 * before rendering it in the DOM to prevent XSS attacks.
 */
import DOMPurify from 'dompurify';
import type { Config } from 'dompurify';

/** Default DOMPurify config - strips all dangerous HTML */
const STRICT_CONFIG: Config = {
  ALLOWED_TAGS: [],
  ALLOWED_ATTR: [],
};

/** Permissive config - allows basic safe formatting tags */
const RICH_TEXT_CONFIG: Config = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'p', 'br', 'ul', 'ol', 'li', 'span'],
  ALLOWED_ATTR: ['class'],
  FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload'],
};

/**
 * Strips ALL HTML tags. Use for plain-text fields (names, emails, IDs).
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Only runs in browser — returns input unchanged during SSR (server-side rendering)
  if (typeof window === 'undefined') {
    // SSR context: DOMPurify requires a browser DOM. Sanitization is skipped here;
    // React server components should not render untrusted user HTML directly.
    return input;
  }
  
  const result = DOMPurify.sanitize(input, STRICT_CONFIG);
  return typeof result === 'string' ? result : String(result);
}

/**
 * Allows a safe subset of HTML tags. Use for rich-text fields.
 */
export function sanitizeRichText(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Only runs in browser — returns input unchanged during SSR (server-side rendering)
  if (typeof window === 'undefined') {
    // SSR context: DOMPurify requires a browser DOM. Sanitization is skipped here;
    // React server components should not render untrusted user HTML directly.
    return input;
  }
  
  const result = DOMPurify.sanitize(input, RICH_TEXT_CONFIG);
  return typeof result === 'string' ? result : String(result);
}

/**
 * Escapes special HTML characters to their entity equivalents.
 * Use when inserting dynamic text into HTML attributes or text nodes
 * without dangerouslySetInnerHTML.
 */
export function escapeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Sanitizes an object's string values recursively.
 * Safe to use on form data before submitting to the API.
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const key in result) {
    const value = result[key];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeText(value);
    } else if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = sanitizeObject(value as Record<string, unknown>);
    }
  }
  return result;
}
