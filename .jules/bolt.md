## 2025-05-22 - [Referential Stability in Central Data Hooks]
**Learning:** In this codebase, the central data hook `useFetchDataConvex` was recreating all mapped data arrays on every render. This caused two main issues:
1. It invalidated all `useMemo` hooks in consumer components (like `Stats` and `Judge` sub-components) because their dependencies changed referentially on every parent render.
2. The use of `?? []` on `useQuery` results masked the `undefined` state, which broke the hook's own `loading` logic.

**Action:** Always memoize data transformations in central hooks and handle the loading state (`undefined`) before applying default empty values.

## 2025-05-23 - [Linear Complexity in Data Filtering]
**Learning:** Filtering large data sets (like TimeLogs) against another collection (like Heats) using nested loops or `.find()` inside a `.filter()` leads to O(N*M) complexity. In visualization-heavy pages, this causes noticeable frame drops during real-time updates.
**Action:** Always pre-compute a `Set` of IDs for O(1) lookup when filtering a large array against a criteria collection.
