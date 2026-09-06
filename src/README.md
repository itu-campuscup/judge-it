# Judge-It Developer Guide

> **For setup instructions, see [CONTRIBUTING.md](../CONTRIBUTING.md)**

## 📁 Architecture Overview

This is a Next.js application providing real-time judging and statistics for competition events. Built with TypeScript, React, Material-UI, and Supabase.

### Tech Stack

- Next.js 16 (App Router) + TypeScript
- Material-UI for components
- Convex (Real-time database with automatic subscriptions)
- Bun (package manager & runtime - **required**)

### Directory Structure

```txt
src/
├── app/                    # Next.js pages and route components
│   ├── components/         # Shared UI components
│   ├── hooks/              # Custom React hooks
│   ├── judge-it/           # Judging interface
│   └── stats/              # Statistics dashboard
├── observability/          # Logging and error handling
│   ├── logger.ts           # Centralized logging
│   ├── result.ts           # Error propagation types
│   └── telemetry.ts        # OpenTelemetry setup
├── types/                  # TypeScript definitions
├── utils/                  # Utility functions
├── AuthContext.tsx         # Auth state provider
├── SupabaseClient.tsx      # Supabase client
├── ThemeRegistry.tsx       # MUI theme
└── config.ts               # Credential management
```

## 🔑 Key Patterns

### Data Fetching & Real-Time Updates

**⚠️ Important:** Use the existing `useFetchDataConvex` hook - **do NOT create new Convex queries in components**

```tsx
import useFetchDataConvex from "../hooks/useFetchDataConvex";

function MyComponent() {
  const { players, heats, teams, timeTypes, timeLogs, alert } = useFetchDataConvex();
  // Data is automatically synchronized via Convex subscriptions
}
```

The `useFetchDataConvex` hook:

- Fetches all data from 5 tables: `time_logs`, `players`, `heats`, `teams`, `time_types`
- Sets up **automatic real-time subscriptions** via Convex's reactive queries
- Automatically re-renders when database changes occur
- Provides centralized error handling via `alert` object

**Why centralized?** Convex provides efficient real-time updates through reactive queries. The hook consolidates all data fetching in one place for optimal performance.

### Utility Functions

Use existing utility functions instead of duplicating logic:

```typescript
// Getting related data
import { getPlayer, getTeam, getCurrentHeat } from "@/utils/getUtils";
const player = getPlayer(playerId, players);
const team = getTeam(teamId, teams);
const currentHeat = await getCurrentHeat(alert);

// Filtering and sorting
import { filterTimeLogsByPlayerId, sortTimeLogsByTime } from "@/utils/sortFilterUtils";
const playerLogs = filterTimeLogsByPlayerId(timeLogs, playerId);
const sortedLogs = sortTimeLogsByTime(playerLogs);

// Time calculations
import { formatTime, timeToMilli, calcTimeDifference } from "@/utils/timeUtils";
const milliseconds = timeToMilli("01:23.456");
const formatted = formatTime(duration);
```

### Authentication

Authentication is handled via Convex Auth with the Password provider. Key points:

- Users sign up with email/password
- New users have `approved: false` by default
- Admins must approve users in Convex Dashboard (`users` table, set `approved: true`) - see [Admin Approval Guide](./ADMIN_APPROVAL_GUIDE.md) for details
- Unapproved users see "Pending Approval" message and cannot access protected pages or execute mutations

### Logging & Observability

**⚠️ Important:** Use the centralized logging system - **do NOT use `console.log` for production code**

The app uses a structured logging system with JSON output and error chain tracking:

```tsx
import { createLogger, Result, ok, err, AppError } from "@/observability";
import { useAuth } from "@/AuthContext";

function MyComponent() {
  const { user } = useAuth();
  const logger = createLogger("MyComponent", user);

  // Log successful operations
  logger.info("operation_name", {
    recordCount: 42,
    someData: "value"
  });

  // Log errors with full context chain
  logger.error("operation_failed", error, {
    attemptNumber: 1,
    additionalContext: "info"
  });
}
```

**Error Propagation Pattern:**

Child functions return `Result<T, Error>` instead of throwing:

```tsx
// ❌ OLD: Throwing errors (loses context)
async function fetchData() {
  if (error) throw new Error("Failed");
  return data;
}

// ✅ NEW: Returning Result with location tracking
async function fetchData(): Promise<Result<Data[], Error>> {
  try {
    const { data, error } = await supabase.from("table").select();
    if (error) {
      return err(new AppError(
        "Failed to fetch data",
        "FETCH_ERROR",
        { table: "table", error: error.message },
        undefined,
        "fetchData" // Location for error chain
      ));
    }
    return ok(data || []);
  } catch (error) {
    return err(wrapError(
      error,
      "Exception in fetchData",
      "FETCH_EXCEPTION",
      "fetchData",
      { table: "table" }
    ));
  }
}
```

**Endpoint-level logging:**

```tsx
const logger = createLogger("useMyEndpoint", user);
const result = await fetchData();

if (isErr(result)) {
  // Error log includes full chain: endpoint → helper → database
  logger.error("fetch_data", result.error, { timestamp: Date.now() });
} else {
  logger.info("fetch_data", { recordsCount: result.value.length });
}
```

**Log output example:**

```json
{
  "timestamp": "2026-01-05T12:34:56.789Z",
  "level": "error",
  "endpoint": "useFetchData",
  "operation": "initial_fetch",
  "duration": 234,
  "user": { "id": "...", "email": "..." },
  "error": {
    "message": "Failed to fetch time_logs",
    "code": "FETCH_ERROR",
    "location": "fetchTable(time_logs)",
    "errorChain": [
      {
        "message": "Failed to fetch time_logs",
        "code": "FETCH_ERROR",
        "location": "fetchTable(time_logs)"
      },
      {
        "message": "relation does not exist",
        "location": "supabase.query"
      }
    ]
  },
  "errorChainSummary": "fetchTable(time_logs): Failed to fetch time_logs → supabase.query: relation does not exist"
}
```

**For more logging examples and patterns, see the sections above on "Logging & Observability", "Log Output Destinations", and "Debugging Tips"**

### Judge-it Components Logging

Judge-it components use a **centralized logging pattern** via `AlertComponent`:

1. **AlertComponent** automatically logs all errors and warnings when displayed
2. Components pass optional `context` for rich debugging information
3. The `alert` object from `useFetchData` provides the `AlertObject` interface (defined in `types/index.ts`)
4. **No duplicate interface definitions needed** - `AlertObject` is globally defined and imported where needed

**Example:**

```tsx
// In any judge-it component
const handleOperation = async () => {
  try {
    const { error } = await supabase.from('table').insert([data]);
    
    if (error) {
      alert.setOpen(true);
      alert.setSeverity('error');
      alert.setText(`Error: ${error.message}`);
      alert.setContext({
        operation: 'insert_record',
        location: 'MyComponent.handleOperation',
        metadata: {
          step: 'database_insert',
          userId: user.id,
          errorCode: error.code,
        },
      });
      return;
    }

    // Success case
    alert.setOpen(true);
    alert.setSeverity('success');
    alert.setText('Record created successfully');
    alert.setContext({
      operation: 'insert_record',
      location: 'MyComponent.handleOperation',
      metadata: { recordId: data.id },
    });
  } catch (err) {
    // Handle unexpected errors
  }
};
```

**What gets logged:**

```json
{
  "timestamp": "2024-01-10T12:00:00.000Z",
  "level": "error",
  "component": "AlertComponent",
  "user": { "id": "abc123", "email": "judge@example.com" },
  "operation": "insert_record",
  "message": "Error: duplicate key value",
  "userVisible": true,
  "alertText": "Error: duplicate key value",
  "step": "database_insert",
  "userId": "abc123",
  "errorCode": "23505"
}
```

**Benefits:**

- 🎯 **Zero boilerplate**: Components don't need their own loggers
- 🔍 **User-centric**: Every log correlates with what the user saw
- 📍 **Full context**: Operation, location, and metadata for debugging
- 🎨 **Consistent**: All judge-it errors follow same pattern

**For detailed logging documentation**, see the sections below on **Logging & Observability**, **Log Output Destinations**, and **Debugging Tips**.

## 📋 Log Output Destinations

### Localhost

1. **Browser Console**: All logs appear in DevTools Console (press F12)
2. **Terminal**: Logs also appear in your Next.js dev server terminal via the `/api/logs` endpoint
3. **Structured JSON format**: Makes filtering and searching easy

Example browser console output:
```json
{
  "timestamp": "2026-01-08T13:34:51.920Z",
  "level": "info",
  "endpoint": "AuthProvider",
  "operation": "get_session",
  "duration": 50,
  "user": {
    "id": "31462f15-01d6-40a7-8c66-706a0eca3013",
    "email": "user@example.com"
  },
  "data": {
    "authenticated": true,
    "userId": "31462f15-01d6-40a7-8c66-706a0eca3013"
  }
}
```

### Vercel (Production)

1. **Server Logs**: All logs are sent to `/api/logs` endpoint from the client
2. **Console output**: The server-side endpoint outputs logs via `console.log()`
3. **Vercel Dashboard**: Logs appear in your Vercel project's Function Logs section
4. **HTTP Status Codes**: Logs return appropriate status codes based on severity:
   - `200` - info/debug logs
   - `206` - warning logs  
   - `400` - error logs

Example Vercel log output:
```
{"timestamp":"2026-01-08T13:34:51.920Z","level":"info","endpoint":"AlertComponent",...}
{"timestamp":"2026-01-08T13:34:52.661Z","level":"error","endpoint":"useFetchData",...}
```

## 🐛 Debugging Logs

### Finding Logs

**Localhost:**
1. Open browser DevTools (F12)
2. Go to Console tab
3. Filter by `"level":"error"` to see only errors
4. Copy JSON and paste into a JSON viewer for clarity

**Vercel:**
1. Go to your Vercel project dashboard
2. Navigate to Deployments → Function Logs
3. Look for JSON log lines mixed with request logs
4. Click on a request to see full details

### Common Log Fields to Search

- `"level":"error"` - Only error logs
- `"endpoint":"AlertComponent"` - Logs from specific component
- `"operation":"record_time"` - Logs for specific operation
- `"user":{"id":"..."` - Logs from specific user

### Example: Finding a User's Errors

```json
// Search for this combination
{
  "level": "error",
  "user": { "id": "abc123" }
}
```

## 📈 Log Monitoring

Set up monitoring for:

1. **Error Rate**: Track `"level":"error"` logs over time
2. **Response Times**: Monitor `"duration"` field
3. **Failed Operations**: Search by `"operation"` + `"level":"error"`
4. **User Issues**: Filter by specific `user.id`

## 📊 Database Schema

### Tables

- **players**: `id`, `name`, `image_url`, `fun_fact`
- **teams**: `id`, `name`, `player_1_id`, `player_2_id`, `player_3_id`, `player_4_id`, `image_url`, `is_out`
- **heats**: `id`, `name`, `heat`, `date`, `is_current`
- **time_types**: `id`, `name`, `time_eng`, `description` (types: BEER, SAIL, SPIN)
- **time_logs**: `id`, `player_id`, `team_id`, `heat_id`, `time_type_id`, `time_seconds`, `time`

### Relationships

- `teams.player_*_id` → `players.id` (4 player references per team)
- `time_logs.player_id` → `players.id`
- `time_logs.team_id` → `teams.id`
- `time_logs.heat_id` → `heats.id`
- `time_logs.time_type_id` → `time_types.id`

## 🎨 Styling

Uses MUI's theming system (`ThemeRegistry.tsx`). Components should use:

- `sx` prop for styling
- MUI components (`Box`, `Typography`, `Button`, etc.)
- Theme colors via `theme.palette`

```tsx
<Box sx={{ p: 2, bgcolor: 'primary.main' }}>
  <Typography variant="h4">Title</Typography>
</Box>
```

## 📝 Development Best Practices

### DO:

- ✅ Use `useFetchDataConvex` for all data needs
- ✅ Use Convex mutations from `convex/mutations.ts` for writes
- ✅ Use existing utility functions from `utils/`
- ✅ Add JSDoc comments to new utility functions
- ✅ Handle errors with the `alert` object from `useFetchDataConvex`
- ✅ Use TypeScript types from `types/index.ts`
- ✅ Keep components focused and single-purpose
- ✅ Use centralized logging (`createLogger`) instead of `console.log`
- ✅ Return `Result<T, Error>` from helper functions for error propagation
- ✅ Include `location` parameter in `AppError` for error chain tracking
- ✅ Use `useMemo` for expensive calculations to prevent re-renders
- ✅ Use `React.memo` for components receiving frequently-updating props

### DON'T:

- ❌ Create new Convex queries/mutations directly in components
- ❌ Duplicate filtering/sorting logic (use `sortFilterUtils`)
- ❌ Use `any` type (except when interfacing with Convex IDs)
- ❌ Fetch data directly in components (use `useFetchDataConvex`)
- ❌ Hardcode table names (use constants from `utils/constants.ts`)
- ❌ Use `console.log` in production code (use `logger.info/error/debug`)
- ❌ Throw errors from helper functions (return `Result` instead)
- ❌ Log in child functions (only log at endpoint level)
- ❌ Create inline objects/arrays in render (causes unnecessary re-renders)

## 🔄 Real-Time System

The app uses Convex's reactive queries for live updates:

**How it works:**

1. `useFetchDataConvex` creates 5 Convex queries (one per table)
2. Each query automatically subscribes to database changes
3. On any database change, Convex pushes updates to the client
4. React automatically re-renders components with new data

**Connection lifecycle:**

- Established when `useFetchDataConvex` mounts
- Properly cleaned up on unmount
- Handles reconnection automatically
- No manual subscription management needed

**Benefits over traditional WebSockets:**

- ✅ Automatic subscription management
- ✅ Optimistic updates support
- ✅ Built-in caching and deduplication
- ✅ Type-safe queries
- ✅ No connection pool limits

## 🐛 Common Issues

### Real-time not updating

- Check Convex dashboard for deployment status
- Verify queries are properly subscribed (check Network tab for WebSocket)
- Check browser console for connection errors

### Hydration errors

- The `<body>` tag has `suppressHydrationWarning` to handle browser extensions
- Don't use `Date.now()` or `Math.random()` in server components

### Type errors

- Ensure types in `types/index.ts` match database schema
- Run `bunx convex dev` to regenerate Convex types
- Use type assertions only when necessary

## 🔧 Configuration

Credentials are managed via `src/config.ts` using Bun.secrets:

- **Local dev**: Stored in system keychain
- **CI/CD**: Loaded from environment variables  
- **Priority**: Keychain → Environment (CI only) → Interactive prompt

The `--prod` flag allows separate production credentials stored with `_PROD` suffix.

## 📚 Key Files Reference

- **useFetchDataConvex.ts** - Main data hook with Convex subscriptions
- **convex/queries.ts** - All database query functions
- **convex/mutations.ts** - All database mutation functions
- **convex/schema.ts** - Database schema definition
- **observability/logger.ts** - Centralized logging with error chains
- **observability/result.ts** - Result type for error propagation
- **getUtils.ts** - Functions to get related records
- **sortFilterUtils.ts** - Array filtering and sorting
- **timeUtils.ts** - Time parsing and formatting
- **visualizationUtils.ts** - Chart data preparation
- **constants.ts** - App-wide constants and table names
- **types/index.ts** - All TypeScript type definitions

## 💡 Adding New Features

1. **Need data?** Use `useFetchData()`, don't create new listeners
2. **Need related data?** Check `getUtils.ts` first
3. **Need filtering?** Check `sortFilterUtils.ts` first
4. **New utility?** Add to appropriate file in `utils/` with JSDoc
5. **New type?** Add to `types/index.ts`
6. **New component?** Keep it in relevant section (`judge-it/` or `stats/`)
7. **Need logging?** Use `createLogger()` at endpoint level, return `Result` from helpers
8. **Handling errors?** Return `Result<T, Error>` with `AppError` including `location`

## 🎯 Performance Tips

- Use `React.memo` for expensive components that re-render frequently
- Use `useMemo` for expensive calculations (filter, sort, map operations)
- Use `useCallback` for event handlers passed to memoized child components
- Avoid inline object/array creation in render (causes re-renders)
- The real-time system is optimized - don't try to optimize it further
- Logging is structured and efficient - use `logger.debug()` for high-frequency events

---

**Questions?** 
- Setup: [CONTRIBUTING.md](../CONTRIBUTING.md)
- Logging: See sections above on "Logging & Observability", "Log Output Destinations", and "Debugging Logs"
- Or ask the CampusCup team!
