## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2025-05-23 - Missing Authorization on Data Queries
**Vulnerability:** While mutations in `convex/mutations.ts` were protected by `requireApprovedUser`, all 16 query handlers in `convex/queries.ts` lacked any authorization checks. This allowed any authenticated but unapproved user to read all competition data, including player details, team compositions, and timing logs.
**Learning:** Authorization must be applied consistently across both read and write operations. Protecting only mutations creates a "leaky" system where sensitive data can still be harvested by unapproved actors.
**Prevention:** Apply `requireApprovedUser` (or appropriate role checks) to all Convex queries that return non-public data. Use automated scripts to verify or apply these checks across large numbers of handlers.
