# Security hardening for frontend

Security headers, input sanitization, CSRF protection, file upload validation, and JWT session management added across the frontend codebase. The implementation establishes a defense-in-depth posture with multiple independent layers. SECURITY.md documents the measures and their limits.

**Watch for:** CSP includes `unsafe-inline` for scripts, weakening XSS defense **(confirmed)**. CSRF tokens are sessionStorage-based with no server coordination **(confirmed)**. DOMPurify SSR safety needs isomorphic-dompurify or browser-only guard **(confirmed)**. File upload validation happens client-side only **(confirmed)**.

**Verdict**: CHANGES_REQUESTED

## High-level view

The CSP header allows `unsafe-inline` for both scripts and styles because Next.js and Tailwind CSS require it. This opens the door to stored XSS attacks if user-generated content reaches the DOM without sanitization. The mitigation is DOMPurify-based sanitization functions, but those are not yet integrated into components — the sanitize module is defined but unused. Until sanitization is applied at render points, the CSP bypass remains a live risk.

CSRF protection stores tokens in sessionStorage and injects them into POST/PUT/PATCH/DELETE requests. The backend is expected to validate these tokens, but there's no backend coordination visible in this diff — the token is client-generated, client-stored, and sent as a header. An attacker on the same origin (e.g., via XSS on another subdomain) can read sessionStorage and forge requests. The CSRF defense is partial without SameSite cookies or a backend-issued token.

JWT expiry is checked client-side by decoding the `exp` claim and polling every 60 seconds. A 1-hour inactivity timeout logs users out after no mouse/keyboard/touch/scroll events. The decoding is unverified (no signature check), so a malicious token with a distant `exp` bypasses the client-side guard. The server must validate the token; client-side expiry is UX, not security.

File upload validation enforces a 5MB size cap, a MIME type whitelist, an extension whitelist, and rejects path traversal patterns in filenames. This runs in the browser, so an attacker with control of the request can bypass it entirely. Backend validation is critical. The client-side validation is a guardrail, not a gate.

Security headers include HSTS, X-Frame-Options, X-Content-Type-Options, and Referrer-Policy. These are correctly configured for the dev environment (localhost:8000 in CSP connect-src and img-src). Production deployment will need the CSP updated to the real backend origin. The HSTS preload directive is present, which requires HTTPS in production and submission to the preload list — appropriate for an exam platform handling sensitive data.

<details>
<summary>Issues (7)</summary>

1. **CSP unsafe-inline** — Remove `'unsafe-inline'` from script-src and style-src. Next.js 13+ supports nonce-based CSP via middleware. Use a per-request nonce in a `<meta>` tag and configure Next.js to inject it into inline scripts and styles.

2. **CSRF token has no backend binding** — The CSRF token is generated and validated client-side only. If the backend doesn't verify this token against a server-stored or cookie-bound value, the protection is ineffective. Either implement SameSite=Strict cookies for CSRF defense, or have the backend issue the token on login and validate it on state-changing requests.

3. **DOMPurify called in SSR context** — `sanitize.ts` imports DOMPurify, which requires a browser DOM. If these functions run during SSR (e.g., in a server component or getServerSideProps), the import will fail. Use `isomorphic-dompurify` or wrap calls in `if (typeof window !== 'undefined')` guards.

4. **No integration of sanitization functions** — `sanitize.ts` defines `sanitizeText()`, `sanitizeRichText()`, and `escapeHtml()`, but there's no evidence they're used in components that render user-generated content (student names, course descriptions, plan titles, etc.). The CSP bypass via `unsafe-inline` means XSS is only mitigated if sanitization is applied. Audit all render points for dynamic content and apply sanitization.

5. **File upload validation is client-only** — `secureValidateFile()` in `upload-utils.ts` runs in the browser. An attacker can bypass it by modifying the request. The backend must independently validate file size, MIME type (via magic bytes, not the Content-Type header), extension, and filename. The client-side check is UX, not security.

6. **JWT expiry check is unverified decode** — `decodeJwtPayload()` in `AuthContext.tsx` decodes the token without checking the signature. A malicious token with `exp` set to 2099 will pass the client-side check. The server must validate the token's signature and expiry; the client-side check is a UX convenience to avoid sending expired tokens.

7. **sessionStorage CSRF tokens not HttpOnly** — sessionStorage is accessible to any script on the page. If an XSS vulnerability exists (e.g., via the CSP bypass), an attacker can read the CSRF token and forge requests. Consider moving to a double-submit cookie pattern where the token is in an HttpOnly cookie (read by the server) and a readable cookie or header (sent by the client), so XSS cannot exfiltrate the server-side value.

</details>

<details>
<summary>Details</summary>

## CSP unsafe-inline undermines XSS defense

The Content-Security-Policy header in `next.config.js` includes `script-src 'self' 'unsafe-eval' 'unsafe-inline'` and `style-src 'self' 'unsafe-inline'`. The `unsafe-inline` directive allows inline `<script>` tags and `style` attributes, which defeats the primary XSS mitigation that CSP provides. If an attacker injects `<script>alert(1)</script>` into a field that's rendered without sanitization, the script will execute.

SECURITY.md acknowledges this: "The Content-Security-Policy includes `unsafe-inline` for scripts and styles because Next.js currently requires it for server components and Tailwind CSS." This is not accurate for Next.js 13+. Next.js supports nonce-based CSP via middleware: generate a random nonce per request, inject it into a `<meta name="csp-nonce" content="...">` tag, configure Next.js to use it for inline scripts and styles, and emit a CSP header with `script-src 'self' 'nonce-{value}'` (no `unsafe-inline`).

The mitigation for the current CSP is the `sanitize.ts` module, which defines `sanitizeText()` (strips all HTML), `sanitizeRichText()` (allows a safe subset), and `escapeHtml()` (encodes `<>&"'`). These functions use DOMPurify, a battle-tested XSS sanitizer. However, there's no evidence in the diff that these functions are called anywhere. The module is defined but unused. Until sanitization is integrated into every component that renders user input (plan names, course descriptions, student names, exam instructions, etc.), the CSP bypass remains a live XSS risk.

Recommendation: migrate to nonce-based CSP and audit all render points for user-controlled content. Apply `sanitizeText()` for plain-text fields and `sanitizeRichText()` for formatted content. If rich text is not needed, prefer `sanitizeText()` everywhere.

## CSRF token lifecycle and backend coordination

The CSRF implementation in `csrf.ts` generates a 32-byte hex token using `crypto.getRandomValues()`, stores it in sessionStorage, and provides `getCsrfHeaders()` to inject it into requests as `X-CSRF-Token`. The token is rotated on login and logout (called in `AuthContext.tsx`). The request interceptor in `api.ts` adds the header to POST/PUT/PATCH/DELETE requests.

The gap: there's no backend coordination. The token is client-generated, client-stored, and sent to the server, but the diff shows no backend change to validate it. sessionStorage is origin-bound, but it's readable by any script on the page. If an XSS vulnerability exists (which the CSP bypass makes possible), the attacker can `sessionStorage.getItem('csrf_token')` and forge requests. The CSRF defense collapses into the XSS defense.

A stronger pattern is the double-submit cookie: the server sets a random CSRF token in an HttpOnly cookie (unreadable by JavaScript) and also returns it in the response body or a readable cookie. The client sends both the cookie (automatically) and the token in a header. The server verifies they match. An XSS attacker can send the header but can't read the HttpOnly cookie to match it.

Alternatively, use SameSite=Strict or SameSite=Lax cookies for session management, which prevents the browser from sending cookies on cross-site requests. This is the simplest CSRF defense and is already standard in modern frameworks.

SECURITY.md states: "CSRF protection is a frontend convenience layer. The backend must independently validate requests using its own CSRF or same-site cookie strategy." If the backend doesn't validate the token, the protection is theater.

## DOMPurify SSR safety and usage gaps

`sanitize.ts` imports DOMPurify directly: `import DOMPurify from 'dompurify'`. DOMPurify requires a browser DOM (it uses `document.createElement()` internally). If this module is imported in a server context (Next.js SSR, server components, API routes), the import will fail with "document is not defined" or similar. Next.js 13+ with the app directory uses server components by default, so any component importing `@/lib/security` will attempt to load DOMPurify on the server. Use `isomorphic-dompurify` or wrap the DOMPurify calls in `if (typeof window !== 'undefined')`.

The second gap: there's no evidence these functions are used. The diff adds `sanitize.ts` and exports it from `@/lib/security/index.ts`, but no components import or call it. If they're unused, the sanitization layer is not active, and the CSP bypass is unmitigated.

## File upload validation scope and bypass potential

`upload-utils.ts` defines `secureValidateFile()`, which checks file size ≤ 5MB, MIME type in whitelist (CSV, XLSX, XLS, PDF, JPEG, PNG, WebP), extension in whitelist, and filename has no `..`, `/`, `\`, or null bytes.

An attacker controlling the browser can modify the File object's `type` property before calling `secureValidateFile()`, bypass the function entirely and send a raw HTTP POST with a 100MB executable, spoof the MIME type in the HTTP `Content-Type` header, or name a PHP shell `image.png` to pass the extension check.

The server must independently validate file size (read the request body length, reject if > 5MB), MIME type via magic bytes (read the first few bytes of the file, check against known signatures; don't trust the `Content-Type` header), extension (check the filename extension server-side; reject anything not in the whitelist), filename safety (reject path traversal, null bytes, Unicode homoglyphs, etc.), and content inspection (e.g., for images, decode them to verify they're valid images, not polyglot files that can execute as scripts).

SECURITY.md does not mention server-side upload validation, which is a gap in the documentation if not the implementation.

## JWT expiry and session timeout mechanics

`AuthContext.tsx` decodes the JWT payload on the client to extract the `exp` claim. The decode function splits the token on `.`, base64-decodes the middle segment, and parses it as JSON. No signature verification. A malicious token with `{"sub":"admin","exp":9999999999}` will pass the client-side check if not caught by the server first.

The session timeout is a separate mechanism: after 1 hour of no user activity (mousedown, keydown, touchstart, scroll), the user is logged out. The timer is reset on each activity event.

One edge case: the expiry polling interval is 60 seconds. If a token expires at 10:00:00 and the last poll was at 09:59:30, the user might interact with the UI for up to 30 seconds with an expired token before the next poll detects it. The 30-second clock skew buffer makes this a 60-second window. In practice, the first API call after expiry will return 401, triggering the logout in the response interceptor. The polling is a backup, not the primary detection.

## Security headers and CSP environment bindings

The CSP header lists `connect-src 'self' http://localhost:8000 ws://localhost:8000` and `img-src 'self' data: blob: http://localhost:8000`. The localhost:8000 references are the backend API URL. In production, these must be updated to the real backend origin (e.g., `https://api.examguard.com`). If not updated, the frontend will be unable to call the backend because CSP blocks it.

## Test coverage and security edge cases

The diff does not include tests for the security modules. Test gaps:

- **CSRF rotation**: verify that `rotateCsrfToken()` is called on login and logout. Mock `sessionStorage` and confirm the token changes.
- **CSRF header injection**: verify that POST/PUT/PATCH/DELETE requests include `X-CSRF-Token`, but GET requests do not.
- **JWT expiry**: test `isTokenExpired()` with tokens that are (1) expired, (2) valid, (3) expiring in 20 seconds (should be considered expired due to the 30-second buffer), (4) malformed (missing exp claim, non-numeric exp, only 2 segments).
- **Session timeout**: mock timers and verify that after 1 hour of no activity, the user is logged out. Verify that user activity resets the timer.
- **File validation**: test `secureValidateFile()` with files that are (1) too large, (2) wrong MIME type, (3) wrong extension, (4) filename with `..`, `/`, `\`, null byte. Verify each case returns the correct error message.
- **Sanitization**: test `sanitizeText()` with XSS payloads (`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, etc.) and verify they're stripped. Test `sanitizeRichText()` and confirm only allowed tags remain. Test `escapeHtml()` and verify `<>&"'` are encoded.

Not tested: integration of sanitization into components, backend validation of CSRF tokens, backend validation of file uploads, server-side JWT validation. These are beyond the scope of a frontend-only PR but are necessary for the security posture described in SECURITY.md.

## Dependency vulnerabilities and disclosure policy

SECURITY.md includes a dependency audit section listing known vulnerabilities:

- **dompurify (moderate)**: XSS vulnerabilities in ≤3.4.15. Installed version 3.1.6 is vulnerable. This is a high-priority fix because DOMPurify is the XSS mitigation layer. If DOMPurify itself is bypassable, the defense collapses.

- **Next.js (critical)**: DoS and XSS vulnerabilities. The project uses Next.js 15.x, which is current. If the advisory affects 15.x, check if a patch version is available.

- **xlsx (high)**: Prototype pollution and ReDoS. Used for spreadsheet processing. Prototype pollution can lead to RCE in some contexts (e.g., if user-controlled properties overwrite critical objects). ReDoS can cause denial of service via malicious input. If `xlsx` is used to process user-uploaded spreadsheets, this is a live risk. Alternatives: `exceljs` (actively maintained, no known high-severity issues as of recent audits).

The disclosure policy email address (security@examguard.internal) is a placeholder (`.internal` is not a valid TLD) and should be updated to a real address before production.

## Documentation accuracy and completeness

SECURITY.md accurately describes the implemented measures but has gaps:

- No mention of server-side validation requirements (CSRF, file uploads, JWT). The doc states "the backend must validate" but doesn't document what the backend should do.

- The CSP limitation ("Next.js requires unsafe-inline") is not fully accurate. Next.js 13+ supports nonce-based CSP. The doc should either document the nonce setup process or state that the current implementation is a temporary measure pending migration.

- No mention of the sanitization module or its intended use. A developer adding a new feature that renders user input wouldn't know to call `sanitizeText()` unless they read the code.

- The session timeout (1 hour inactivity) is documented, but the JWT expiry check interval (60 seconds) and clock skew buffer (30 seconds) are not. These affect the security posture (e.g., a token might be used for up to 60 seconds after expiry if the polling hasn't detected it yet).

</details>

<details>
<summary>File map</summary>

**New files:**
- `frontend/next.config.js` — Added security headers (HSTS, CSP, X-Frame-Options, etc.)
- `frontend/src/lib/security/csrf.ts` — CSRF token generation, rotation, header injection
- `frontend/src/lib/security/sanitize.ts` — DOMPurify-based HTML sanitization (unused in this diff)
- `frontend/src/lib/security/validation.ts` — XSS/SQLi pattern detection, safe string checks
- `frontend/src/lib/security/index.ts` — Barrel export for security modules
- `frontend/SECURITY.md` — Security documentation and vulnerability disclosure policy

**Modified files:**
- `frontend/src/lib/api.ts` — Added CSRF token to request interceptor for POST/PUT/PATCH/DELETE
- `frontend/src/contexts/AuthContext.tsx` — Added JWT expiry check, 1-hour session timeout, CSRF rotation on login/logout
- `frontend/src/lib/upload-utils.ts` — Added `secureValidateFile()` with size/MIME/extension whitelist (client-side only)

Full diff: `git diff 91cb3f3 ee9f640`

</details>
