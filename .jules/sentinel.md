## 2025-05-22 - Missing Admin Authorization on Sensitive Endpoints
**Vulnerability:** The administrative endpoints (`listUsers`, `approveUser`, `disapproveUser`) in `convex/admin.ts` were accessible to any authenticated user. This allowed any registered user to view other users' emails and approve their own or others' accounts.
**Learning:** Initial implementation relied on UI-level checks and comments (`// In production, verify the current user is an admin`) without enforcing backend authorization. This is a classic "Broken Access Control" pattern.
**Prevention:** Always enforce authorization at the database/API layer using dedicated helpers (`requireAdminUser`). Never rely solely on UI-level hiding of features.

## 2025-05-23 - Missing User Authorization on Data Queries
**Vulnerability:** All 16 application data queries in `convex/queries.ts` lacked authorization checks. Any authenticated user, including those pending admin approval, could fetch sensitive competition data.
**Learning:** UI-level route protection (e.g., `RequireApproval` component) only secures the visual interface. APIs and database queries must independently verify user permissions to prevent direct data extraction.
**Prevention:** Implement mandatory authorization helpers (e.g., `requireApprovedUser`) at the start of every query and mutation handler that deals with non-public data.
