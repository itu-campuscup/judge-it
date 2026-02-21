# Bolt's Journal - Judge IT Performance

## 2025-05-22 - Data Hook Reference Stability
**Learning:** In a Convex-based SPA, centralizing data fetching in a single hook (like `useFetchDataConvex`) is great for real-time updates, but failing to memoize the transformed data results in a "reference instability waterfall." Every time the hook re-runs (even if data is unchanged), it returns new array references, which invalidates downstream `useMemo` and `useEffect` hooks in all consuming components, causing the entire app to re-render.

**Action:** Always memoize transformations of raw database data in central hooks. Ensure the hook's return object is also memoized to provide stable references to consumers.
