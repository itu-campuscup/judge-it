## 2025-05-22 - [Referential Stability in Central Data Hooks]
**Learning:** In this codebase, the central data hook `useFetchDataConvex` was recreating all mapped data arrays on every render. This caused two main issues:
1. It invalidated all `useMemo` hooks in consumer components (like `Stats` and `Judge` sub-components) because their dependencies changed referentially on every parent render.
2. The use of `?? []` on `useQuery` results masked the `undefined` state, which broke the hook's own `loading` logic.

**Action:** Always memoize data transformations in central hooks and handle the loading state (`undefined`) before applying default empty values.

## 2025-05-23 - [O(N^2) to O(N) Pairing Logic]
**Learning:** Pairing start/end events in a chronologically sorted list was implemented as O(N^2) using a nested search (`getEndTime`). This is a common performance bottleneck in event-driven UIs.

**Action:** Use a Map with composite keys (e.g., `playerId-heatId`) to store pending start events and pair them with incoming end events in a single O(N) pass. Always ensure the original sorting and behavior are preserved during such refactors.
