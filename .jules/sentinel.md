## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2026-03-05 - Incomplete PII Masking of Email Addresses in Server Logs
**Vulnerability:** The email masking regex in `src/app/api/logs/route.ts` was `/(..)(.*)(@.*)/`, which failed to match and mask email addresses with single-character prefixes (e.g., `a@b.com`), logging them completely in the clear. It also exposed the prefix too much for two-character emails (e.g., `ab***@b.com`).
**Learning:** Standardizing prefix capture requirements too rigidly (e.g., expecting at least 2 characters) creates edge cases where shorter valid inputs fall back to unmasked forms.
**Prevention:** Use a more generic matcher `/(.)(.*)(@.*)/` that requires only a single character, ensuring all email prefixes are safely redacted to `p***@domain.com` regardless of length.
