## 2025-05-22 - [Referential Stability in Central Data Hooks]
**Learning:** In this codebase, the central data hook `useFetchDataConvex` was recreating all mapped data arrays on every render. This caused two main issues:
1. It invalidated all `useMemo` hooks in consumer components (like `Stats` and `Judge` sub-components) because their dependencies changed referentially on every parent render.
2. The use of `?? []` on `useQuery` results masked the `undefined` state, which broke the hook's own `loading` logic.

**Action:** Always memoize data transformations in central hooks and handle the loading state (`undefined`) before applying default empty values.

## 2025-05-23 - [O(N^2) to O(N) Pairing Logic]
**Learning:** Pairing start/end events in a chronologically sorted list was implemented as O(N^2) using a nested search (`getEndTime`). This is a common performance bottleneck in event-driven UIs.

**Action:** Use a Map with composite keys (e.g., `playerId-heatId`) to store pending start events and pair them with incoming end events in a single O(N) pass. Always ensure the original sorting and behavior are preserved during such refactors.

## 2025-05-24 - [Avoid Shadowing Memoized Values]
**Learning:** Shadowing memoized values with locally scoped variables (e.g., re-filtering data within a component body that was already memoized at the top level) bypasses performance benefits and causes redundant calculations on every render. This was specifically found in `CurrentHeat.tsx` where a timer-driven re-render was triggering heavy O(N) filtering logic.

**Action:** Always prefer memoized variables over local re-computations. In components with active timers, ensure ALL heavy derived state is memoized to keep the 1s render loop lightweight.

## 2025-05-25 - [Optimize String ID Sorting]
**Learning:** For sorting non-locale-sensitive string IDs (like Convex `Id` or UUIDs), `localeCompare` introduces significant overhead due to internationalization logic. Benchmarking showed that direct comparison operators (`<`, `>`) are approximately 1.15x to 1.20x faster (15-20% speedup) for large datasets (e.g., 100k items).
**Action:** Always use direct comparison operators for technical identifier sorting instead of `localeCompare`.

## 2025-05-25 - [Convex URL Validation in Tests]
**Learning:** The application (or Convex client) performs validation on `NEXT_PUBLIC_CONVEX_URL`. Using a short dummy name like `https://dummy.convex.cloud` causes a fatal parsing error ("Couldn't parse deployment name dummy").
**Action:** When providing dummy environment variables for tests, use a sufficiently long deployment name (e.g., `https://happy-animal-123.convex.cloud`).

## 2026-05-16 - [O(1) Map-based Lookups for Entity Relationships]
**Learning:** Functions that traverse arrays to find related entities (e.g., finding a player's team) become (N^2)$ when used inside component loops or frequently triggered render cycles.
**Action:** Enhance core utility functions to optionally accept pre-computed Maps. In components, use `useMemo` to build these Maps once per data update, transforming (N)$ searches into (1)$ lookups.
