# Sentinel's Security Journal

## 2025-05-22 - Missing Admin Authorization in Convex Functions
**Vulnerability:** Admin-only mutations (`approveUser`, `disapproveUser`) and queries (`listUsers`) were accessible to any authenticated user, regardless of their approval status or role.
**Learning:** The initial implementation relied on authentication as a proxy for authorization for administrative tasks, which is insufficient for multi-user applications where users should have different privilege levels.
**Prevention:** Always implement explicit role-based access control (RBAC) for administrative operations. In Convex, use helper functions like `requireAdminUser(ctx)` at the beginning of every administrative function.
