# ExamGuard Frontend — Security Documentation

## 1. Security Model Overview

ExamGuard implements a defense-in-depth security model with multiple independent layers:

1. **Content Security Policy (CSP)** — HTTP header restricts resource origins and execution context
2. **Input sanitization** — DOMPurify-based HTML sanitization at render time (`src/lib/security/sanitize.ts`)
3. **CSRF protection** — Token-based request validation layer (`src/lib/security/csrf.ts`)
4. **File upload validation** — Client-side UX guardrails (`src/lib/upload-utils.ts`)
5. **JWT session management** — Token-based authentication with expiry checking (`src/contexts/AuthContext.tsx`)
6. **HTTP security headers** — Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, etc.

Each layer adds value; none is sufficient alone. Full security requires backend validation in addition to these frontend controls.

## 2. Content Security Policy — Known Limitation

**Current status**: The CSP includes `unsafe-inline` for scripts and styles because Next.js and Tailwind CSS require it in the current setup.

**Security impact**: `unsafe-inline` weakens XSS defense. If an attacker successfully injects a script tag into the DOM, it can execute.

**Mitigation in place**:
- All user-generated content MUST pass through `sanitizeText()` or `sanitizeRichText()` from `src/lib/security/sanitize.ts` before rendering.
- Components that display student names, course descriptions, exam titles, plan names, room notes, invigilator notes, or any other dynamic content must call these functions.

**Future enhancement (recommended)**:
- Migrate to nonce-based CSP via Next.js middleware (`next/headers` + per-request nonce).
- This removes `unsafe-inline` entirely and is the long-term recommended fix.

**Production deployment note**:
- The CSP `connect-src` and `img-src` directives currently list `localhost:8000`.
- These MUST be updated to the real backend origin before production deployment.

**Full CSP configuration**: See `next.config.js` — `async headers()` function.

## 3. CSRF Protection — Frontend Layer Only

**Current implementation**: `src/lib/security/csrf.ts` generates a random CSRF token, stores it in `sessionStorage`, and injects it as the `X-CSRF-Token` header on all state-changing requests (POST/PUT/PATCH/DELETE).

**Critical limitation**: This is a frontend layer only. The backend does NOT currently validate this token. Without backend validation, this layer provides NO CSRF security.

**Backend requirement (TODO)**:
The backend MUST implement one of:
- **a) SameSite=Strict cookies** (simplest, recommended) — prevents the browser from sending cookies on cross-origin requests
- **b) Backend-issued CSRF tokens** — server generates token on login, stores it server-side, validates on every state-changing request
- **c) Double-submit cookie pattern** — token in an HttpOnly cookie (server-readable) + matching request header (client-sends)

**sessionStorage limitation**:
- `sessionStorage` is readable by JavaScript on the same origin.
- If an XSS vulnerability exists, an attacker can read the CSRF token.
- Primary XSS defense is CSP + input sanitization (see §2 and §4).

**Alternative pattern**:
- Double-submit cookie: token in an HttpOnly cookie (XSS cannot read) + matching header.
- This prevents token exfiltration even if XSS exists.

## 4. Input Sanitization — Integration Required

**Available functions** (`src/lib/security/sanitize.ts`):
- `sanitizeText(input)` — strips ALL HTML tags. Use for plain text fields.
- `sanitizeRichText(input)` — allows a safe subset of HTML tags (`<b>`, `<i>`, `<p>`, `<ul>`, `<li>`, etc.). Use only where HTML formatting is explicitly intended.
- `escapeHtml(input)` — escapes `&`, `<`, `>`, `"`, `'` to HTML entities. Use for dynamic text in attributes.

**Browser-only**:
- These functions use DOMPurify, which requires a browser DOM.
- During SSR (server-side rendering), the functions return input unchanged.
- React server components should not render untrusted user HTML directly.

**IMPORTANT — Integration requirement**:
- These functions must be called at every render point that displays user-generated content:
  - Student names, emails, IDs
  - Course names, descriptions, codes
  - Exam titles, instructions
  - Plan names, descriptions
  - Room names, notes, locations
  - Invigilator names, notes
  - Any other dynamic content from the database or API

**Current status**:
- Full integration across all components is ongoing.
- Until complete, `unsafe-inline` CSP remains a risk for unguarded render points.

**Usage example**:
```tsx
import { sanitizeText, sanitizeRichText } from '@/lib/security/sanitize';

// Plain text
<h1>{sanitizeText(course.name)}</h1>

// Rich text (only if HTML formatting is intended)
<div dangerouslySetInnerHTML={{ __html: sanitizeRichText(course.description) }} />
```

## 5. File Upload Validation — Client-Side UX Only

**Current implementation** (`src/lib/upload-utils.ts`):
- `secureValidateFile(file)` enforces:
  - 5 MB size cap
  - MIME type whitelist: CSV, XLSX, XLS, PDF, JPEG, PNG, WebP
  - Extension whitelist (cross-checked against MIME type)
  - Filename safety: rejects `..`, `/`, `\`, null bytes

**Critical limitation**: This runs in the browser only. An attacker can bypass it by crafting a direct HTTP request with `curl`, Postman, or a custom script.

**Backend requirement (TODO)**:
The backend MUST independently validate:
- **File size** — read `Content-Length` header or stream body length; reject if > 5 MB
- **MIME type via magic bytes** — do NOT trust the `Content-Type` header (trivially spoofed). Inspect the first few bytes of the file to determine the real type.
- **File extension whitelist** — cross-check against magic-byte-detected MIME type
- **Filename safety** — check for path traversal (`..`), null bytes (`\x00`), Unicode homoglyphs
- **Content inspection** — for images, decode to verify they are valid images (not polyglot files with embedded scripts)

**Client-side validation purpose**:
- UX guardrail to catch obvious mistakes early (e.g., user selects a 50 MB video file).
- It is NOT a security gate.

## 6. JWT Session Management — UX Convenience

**Current implementation** (`src/contexts/AuthContext.tsx`):
- JWT token is stored in `localStorage` with key `access_token`.
- The `exp` claim is decoded client-side (WITHOUT signature verification) to detect expired tokens.
- Token expiry is polled every 60 seconds while the user is active.
- **Session timeout**: 1 hour of inactivity triggers automatic logout.
- User activity events (mouse, keyboard, touch, scroll) reset the inactivity timer.
- CSRF token is rotated on every login and logout.

**Critical limitation**: The client-side decode does NOT verify the JWT signature. A malicious token with a forged `exp` claim (e.g., `exp: 9999999999`) will pass the client-side check.

**Backend requirement (TODO)**:
- The server MUST validate the token's signature and expiry on EVERY authenticated API request.
- Do NOT trust the `Authorization: Bearer` header without verification.

**Client-side expiry checking purpose**:
- UX convenience to avoid sending obviously expired tokens.
- Logs out inactive users promptly.
- There is a ~60-second window between expiry polling cycles during which an expired token may be used; the first 401 response triggers immediate logout via the API interceptor.

## 7. sessionStorage CSRF Tokens — Known Limitation

**Current implementation**: CSRF tokens are stored in `sessionStorage`, which is readable by JavaScript (unlike HttpOnly cookies).

**Security impact**: If an XSS vulnerability exists (e.g., via unguarded render points + `unsafe-inline` CSP), an attacker can:
- Read the CSRF token from `sessionStorage`
- Exfiltrate it to their own server
- Forge state-changing requests with the stolen token

**Primary defense**: Eliminate XSS via:
1. CSP nonce (future enhancement, see §2)
2. Input sanitization (current, see §4)

**Alternative pattern** (recommended for production):
- **Double-submit cookie**: token in an HttpOnly cookie (server-readable, XSS cannot read) + matching request header (client-sends).
- The server validates that the cookie value matches the header value.
- XSS cannot read the HttpOnly cookie value, so it cannot forge the header.

## 8. Production Deployment Checklist

Before deploying to production, complete ALL of the following:

- [ ] **Update CSP origins**: In `next.config.js`, replace `localhost:8000` in `connect-src` and `img-src` with the real backend origin.
- [ ] **Backend CSRF validation**: Implement SameSite=Strict cookies, backend-issued CSRF tokens, or double-submit cookie pattern (see §3).
- [ ] **Backend file upload validation**: Validate file size, MIME type via magic bytes, extension, filename safety, and content inspection (see §5).
- [ ] **Backend JWT validation**: Validate token signature and expiry on every authenticated request (see §6).
- [ ] **Complete sanitization integration**: Apply `sanitizeText()`/`sanitizeRichText()` to all components rendering user-generated content (see §4).
- [ ] **Update DOMPurify**: Upgrade from 3.1.6 to latest (3.4.15+ patches known XSS bypass). Run `npm install dompurify@latest` and test.
- [ ] **Update security contact**: Replace `security@examguard.internal` with a real email address in this file.
- [ ] **Migrate to nonce-based CSP** (future enhancement): Remove `unsafe-inline` from CSP via Next.js middleware (see §2).

## 9. HTTP Security Headers

Configured in `next.config.js` via the `headers()` async function:

| Header | Value | Purpose |
|---|---|---|
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload | Enforces HTTPS |
| X-Frame-Options | SAMEORIGIN | Prevents clickjacking |
| X-Content-Type-Options | nosniff | Prevents MIME sniffing |
| X-XSS-Protection | 1; mode=block | Legacy XSS filter |
| Referrer-Policy | strict-origin-when-cross-origin | Controls referrer info |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Restricts browser features |
| Content-Security-Policy | (see next.config.js) | Restricts resource origins |

## 10. Dependency Audit

Run `npm audit` from the `frontend/` directory to check for known vulnerabilities.
Safe fixes are applied with `npm audit fix`. Any remaining issues are documented
here after each audit run.

### Audit Status (Last Run: Task #20)

After running `npm audit fix`, the following vulnerabilities remain:

- **dompurify (moderate)**: Multiple XSS vulnerabilities in versions ≤3.4.15. The installed version (3.1.6) is vulnerable. Upgrading to the latest version may introduce breaking changes. This is acceptable for development but should be addressed before production deployment.

- **Next.js (critical)**: Multiple DoS and XSS vulnerabilities. The project uses Next.js 15.x, which is current as of implementation. These advisories affect a range of versions including the current one. Upgrading requires major version changes and careful testing.

- **braces/micromatch/fast-glob (high)**: Denial of service vulnerabilities via regex patterns. These are dev dependencies used by Tailwind CSS and Jest. Low risk in production builds.

- **postcss (high)**: XSS and path traversal vulnerabilities. Required by Next.js and Tailwind CSS. Upgrading requires breaking changes.

- **xlsx (high)**: Prototype pollution and ReDoS vulnerabilities. No fix available. Used for spreadsheet processing. Consider alternative libraries before production deployment.

- **jest/testing libraries (high)**: Multiple vulnerabilities in test dependencies. These do not affect production builds.

**Recommendation**: Before production deployment, evaluate upgrading Next.js, dompurify, and replacing xlsx with a more secure alternative. All vulnerabilities in dev-only dependencies (jest, eslint plugins) pose minimal risk to production users.

## 11. Vulnerability Reporting

To report a security vulnerability in ExamGuard:

1. **Do not open a public GitHub issue.**
2. Email the development team at: security@examguard.internal
3. Include: description of the vulnerability, reproduction steps, and potential impact.
4. Allow 5 business days for an initial response.
5. We will work with you to understand and remediate the issue before any public disclosure.
