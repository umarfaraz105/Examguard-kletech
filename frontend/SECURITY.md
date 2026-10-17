# ExamGuard Frontend — Security Documentation

## Overview

ExamGuard handles sensitive examination data and implements multiple layers of
security on the frontend. This document describes all security measures, best
practices followed, and the process for reporting vulnerabilities.

## Implemented Security Measures

### 1. HTTP Security Headers (Task #20)

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

### 2. Input Sanitization (`src/lib/security/sanitize.ts`)

- `sanitizeText()` — strips all HTML tags using DOMPurify. Use for plain text fields.
- `sanitizeRichText()` — allows a safe subset of HTML tags.
- `escapeHtml()` — escapes `& < > " '` to HTML entities.
- `sanitizeObject()` — recursively sanitizes string values in an object.

### 3. CSRF Protection (`src/lib/security/csrf.ts`)

Implements the double-submit pattern:
- A random 32-byte hex token is generated on page load and stored in `sessionStorage`.
- The token is sent as the `X-CSRF-Token` header on all POST/PUT/PATCH/DELETE requests.
- The token is rotated on login and logout.

### 4. File Upload Security (`src/lib/upload-utils.ts`)

- Hard file size cap: **5 MB**.
- MIME type whitelist: CSV, XLSX, XLS, PDF, JPEG, PNG, WebP.
- Extension whitelist cross-checked against MIME type to detect spoofing.
- Filename sanitization rejects `..`, `/`, `\`, and null bytes.

### 5. Authentication Security (`src/contexts/AuthContext.tsx`)

- JWT tokens are decoded client-side to check the `exp` claim before use.
- A 30-second clock-skew buffer prevents premature expiry.
- Token expiry is polled every 60 seconds while the user is active.
- **Session timeout**: 1 hour of inactivity triggers automatic logout.
- User activity events (mouse, keyboard, touch, scroll) reset the inactivity timer.
- CSRF token is rotated on every login and logout.

### 6. API Client Security (`src/lib/api.ts`)

- All state-changing requests automatically include the `X-CSRF-Token` header.
- 401 responses clear the token and redirect to `/login`.
- Error messages never expose token values or internal details.
- A 30-second request timeout prevents indefinite hangs.

## Security Best Practices

1. **Defense in Depth** — Multiple independent layers: headers, CSP, sanitization, CSRF, auth.
2. **Least Privilege** — CSP restricts all resource origins to known endpoints.
3. **Fail Secure** — Expired or missing tokens redirect to login; upload validation rejects by default.
4. **Input Validation** — All user input passes through sanitization before display or submission.
5. **Output Encoding** — `escapeHtml()` is available for dynamic content outside DOMPurify contexts.
6. **Secure Defaults** — Security headers and CSRF protection are active for every request.

## Known Limitations

- The Content-Security-Policy includes `unsafe-inline` for scripts and styles because
  Next.js currently requires it for server components and Tailwind CSS. A nonce-based
  CSP is the recommended future improvement once Next.js has better nonce support.
- CSRF protection is a frontend convenience layer. The backend must independently
  validate requests using its own CSRF or same-site cookie strategy.
- Client-side JWT expiry checks do NOT replace server-side token validation.

## Dependency Audit

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

## Vulnerability Reporting

To report a security vulnerability in ExamGuard:

1. **Do not open a public GitHub issue.**
2. Email the development team at: security@examguard.internal
3. Include: description of the vulnerability, reproduction steps, and potential impact.
4. Allow 5 business days for an initial response.
5. We will work with you to understand and remediate the issue before any public disclosure.
