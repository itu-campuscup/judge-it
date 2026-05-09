## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2025-05-22 - Missing User Authorization on Data Queries
**Vulnerability:** All 16 query handlers in `convex/queries.ts` were missing authorization checks. This meant any authenticated user, even if not yet approved by an admin, could query all application data (players, teams, heats, time logs) by calling the queries directly, bypassing UI-level restrictions.
**Learning:** While mutations were protected, queries were left open. Secure application design requires authorization checks on both read and write operations ("Defense in Depth").
**Prevention:** Consistently apply `requireApprovedUser` or similar authorization helpers to all sensitive query handlers. Always verify that "read" access is as restricted as "write" access where appropriate.
