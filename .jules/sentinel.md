## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2025-05-23 - PII Leakage via Incomplete Masking Regex
**Vulnerability:** The email masking regex `/(..)(.*)(@.*)/` in the logging API failed for emails with single-character prefixes (e.g., `a@example.com`). These emails were logged in plaintext, exposing PII.
**Learning:** Masking logic must be tested against all valid input formats, including edge cases like minimal length identifiers. String.replace returns the original string if the pattern doesn't match.
**Prevention:** Use inclusive patterns like `/(.)(.*)(@.*)/` that match the minimum valid input, or use robust, well-tested sanitization libraries for PII handling.
