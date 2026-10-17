/**
 * IMPORTANT — BACKEND COORDINATION REQUIRED
 *
 * This module provides a frontend CSRF token layer only.
 * The X-CSRF-Token header this sends has NO security value unless the backend
 * independently validates it against a server-issued or cookie-bound token.
 *
 * TODO (backend): Implement one of:
 *   a) SameSite=Strict cookies for session management (simplest, recommended)
 *   b) Backend-issued CSRF tokens: server sets token on login, validates on
 *      every state-changing request (POST/PUT/PATCH/DELETE)
 *   c) Double-submit cookie pattern: HttpOnly cookie + matching request header
 *
 * Until the backend validates this token, this layer is a UX convenience, not
 * a security control.
 */

/**
 * CSRF (Cross-Site Request Forgery) protection utilities.
 *
 * Strategy: double-submit cookie pattern.
 * - A CSRF token is generated client-side and stored in sessionStorage.
 * - The token is sent with every state-changing request as the
 *   X-CSRF-Token header so the server can validate it.
 * - The token rotates on every page load and after each use (optional).
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const TOKEN_BYTE_LENGTH = 32;

/**
 * Generates a cryptographically random hex token.
 */
function generateToken(): string {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    // Fallback for environments without Web Crypto (e.g., SSR)
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  const bytes = new Uint8Array(TOKEN_BYTE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Returns the current CSRF token, creating one if it does not exist.
 * Safe to call on the server (returns empty string during SSR).
 */
export function getCsrfToken(): string {
  if (typeof sessionStorage === 'undefined') return '';
  let token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  if (!token) {
    token = generateToken();
    sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  }
  return token;
}

/**
 * Rotates the CSRF token. Call this after a successful login or logout.
 */
export function rotateCsrfToken(): string {
  if (typeof sessionStorage === 'undefined') return '';
  const token = generateToken();
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * Returns headers to include in state-changing API requests.
 */
export function getCsrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  if (!token) return {};
  return { 'X-CSRF-Token': token };
}
