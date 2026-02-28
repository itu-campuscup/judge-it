# Sentinel Journal 🛡️

## 2025-05-22 - Sentinel Initialized
**Vulnerability:** N/A
**Learning:** Initializing the Sentinel journal.
**Prevention:** N/A

## 2025-05-22 - Missing Admin Authorization on Sensitive Mutations
**Vulnerability:** Administrative functions for user management (list, approve, disapprove) were accessible to any authenticated user.
**Learning:** Relying on a simple `approved` flag for feature access without a separate `isAdmin` role led to a security gap where unprivileged but authenticated users could manipulate other users' access.
**Prevention:** Always implement role-based access control (RBAC) with a dedicated `isAdmin` check for sensitive administrative operations, separate from general application access flags.
