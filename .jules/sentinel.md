## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2026-07-11 - Broken Access Control in Data Queries
**Vulnerability:** Most query handlers in `convex/queries.ts` were public, allowing any authenticated (but unapproved) user to access all players, teams, heats, and time logs.
**Learning:** While mutations were protected, queries were left unguarded, assuming UI-level filtering or that read access was acceptable. This leaked sensitive competition data and user info.
**Prevention:** Apply `requireApprovedUser` or similar authorization guards to all read queries that handle non-public data. Use a consistent pattern across both mutations and queries.
