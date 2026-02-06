# CLAUDE.md

## Project Overview

Judge IT is a web application for judges at the CampusCup event, providing real-time statistics and tracking.

**Stack:**

- **Convex**: Database + Authentication (Convex Auth with Password provider)
- **Next.js 16**: App Router with Turbopack
- **Bun**: Package manager and runtime
- **MUI**: UI components
- **TypeScript**: Type safety
- **Playwright**: End-to-end testing

**Database Tables:**

- `users` - Auth + custom `approved` field for admin approval
- `players` - Contestant information
- `teams` - Team data with player assignments
- `heats` - Competition rounds
- `time_types` - Activity types (Beer, Sail, Spin)
- `time_logs` - All timing records
- Auth tables - Required by Convex Auth (authAccounts, authSessions, etc.)

**Authentication Flow:**

- Users sign up with email/password via Convex Auth
- New users have `approved: false` by default
- Admins must approve users in Convex Dashboard (`users` table, set `approved: true`)
- Unapproved users see "Pending Approval" message
- All mutations check approval status before executing

## Key Commands

```bash
bun install                    # Install dependencies
bun dev                        # Start dev (Next.js + Convex)
bun run build                  # Build for production
bun run lint                   # Run linter
bunx eslint --fix .            # Lint with auto-fix

# Testing (⚠️ Use "bun run test", NOT "bun test")
bun run test                   # Run E2E tests with Playwright
bun run test:ui                # Interactive test UI
bun run test:headed            # Run with visible browser
bun run test:report            # View test report
bun run test:update-snapshots  # Update visual snapshots

# Secrets
bun cli.ts secrets:view        # View stored credentials
bun cli.ts secrets:clear       # Clear credentials
```

**Important:** Always use `bun run test` for testing, NOT `bun test`. The latter uses Bun's native test runner which is incompatible with Playwright tests.

## Project Preferences

- No inline comments except for complex logic and TSDoc comments
- Prefix or suffix summary documents with either SUMMARY_ or _SUMMARY (gitignored)
- Use detailed error logging with console.error for debugging
- Always check approval status before showing protected UI
