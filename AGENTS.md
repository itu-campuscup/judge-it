# AGENTS.md — concise agent playbook

Purpose: actionable rules for automation agents and contributors (see `CONTRIBUTING.md` for full details).

Stack: Convex (DB + Auth), Next.js 16, Bun, MUI, TypeScript, Playwright

Allowed

- Fix build/lint/type errors, failing tests, small bugfixes and focused refactors with tests.
- Add/update E2E tests and snapshots only when UI intentionally changes.
- Update types (`Id<...>`) and docs that match code changes.

Forbidden without approval

- Change production secrets, deploy credentials, or Convex/Vercel envs.
- Large `convex/` schema or migration changes.
- Add new dependencies, change auth/approval flows, or auto‑grant admin.
- Merge to `main`/`production` (PR → `develop`).

Commit & branch style (short)

- Commit messages: imperative present tense (e.g. `Fix login redirect`).
- Branch: `<type>/<task id>-<short-desc>`; types: Feat, Fix, Docs, Style, Refactor, Perf, Test.
  Example: `Fix/123-fix-timer-bug`.

Quick PR checklist

1. Build: `bun run build`
2. Lint: `bun lint` (auto-fix where safe)
3. Tests: `bun run test` (add tests for behavior changes)
4. E2E snapshots: update only when intended (`bun run test:update-snapshots`)
5. Types: use `Id<...>` where required
6. PR: short summary, why, test plan; branch & commit follow style

Convex & secrets

- Use `bun auth:run` for local Convex; never commit secrets.
- Do not bypass `approved` checks; admin approval is enforced server-side.

When to ask a human

- Adding deps or infra changes
- Convex schema/auth/admin workflow changes
- Large refactors or public API changes

Useful commands

- bun install · bun dev · bun run build · bun lint · bun run test · bun auth:run · bun secrets:view

Contact / flow

- Create PR to `develop`, include testing steps, request review.

Short, explicit and linked to `CONTRIBUTING.md` for full rules.

Project setup in src can be seen in `src/README.md`.
