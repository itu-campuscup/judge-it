## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2026-03-02 - Unprotected OS Keychain Access & Missing Fallbacks
**Vulnerability:** Access to `Bun.secrets` was unguarded and prioritized over standard environment variables. This caused fatal crashes and hangs in environments where OS keychain APIs are unavailable, disabled, or non-interactive (e.g., Docker, Playwright, headless servers).
**Learning:** Hard-dependencies on OS-level native integration modules without fallbacks or presence-checking introduces system-level Denial of Service (DoS) and execution fragility.
**Prevention:** Always check if native system integration modules (like `secrets`) are defined (`typeof secrets !== "undefined"`) before calling their methods. Prioritize standard, secure environment variables (`Bun.env`) over keychain storage to allow headless/non-interactive environments to bypass keychain interaction entirely.
