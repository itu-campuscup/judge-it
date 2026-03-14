## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2025-05-22 - Missing Authorization on Data Queries
**Vulnerability:** Data-providing queries in `convex/queries.ts` were publicly accessible without authentication or approval checks. This exposed player, team, and competition data to unauthenticated and unapproved users.
**Learning:** While mutations and UI were protected by approval checks, the underlying read queries were missed, leading to a partial authorization implementation.
**Prevention:** Apply authorization checks consistently across all database access points (CRUD). Ensure read queries follow the same security requirements as write mutations.
