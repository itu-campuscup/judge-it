## 2025-05-02 - [Broken Access Control in Convex Queries]
**Vulnerability:** All query handlers in `convex/queries.ts` were completely unprotected, allowing any authenticated but unapproved user to read sensitive competition and player data.
**Learning:** While the application had a robust admin approval workflow for mutations, queries were overlooked, creating a significant data exposure risk. Security-focused reviews must verify BOTH read and write paths for authorization.
**Prevention:** Always implement `requireApprovedUser(ctx)` or similar guards in all Convex query handlers that return non-public information. Maintain a clear separation between public-facing status queries and protected data queries.
