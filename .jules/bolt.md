## 2026-10-22 - Memoize Heavy Card Components
**Learning:** Re-rendering hundreds of simple child components (`MangaCard`, `AnimeCard`) due to parent updates causes main thread jank, even without complex computation inside them.
**Action:** Use `React.memo` for large-list card components and rely on safe prop identity/shallow comparison semantics to avoid stale UI when card objects or handlers change.

## 2024-10-22 - Optimize N+1 Query in Update Service
**Learning:** Sequential async API requests in loops cause an O(N) network waterfall delay which is easily parallelizable. When refactoring loops with `Promise.all`, separating the async data fetch from the synchronous state manipulation preserves safety against race conditions.
**Action:** Always identify sequential `await` calls in array iterations as a target for parallel execution via `Promise.all` or `Promise.allSettled`, taking care to process UI state changes or database mutations synchronously afterward.

## 2024-05-18 - Avoid repeated inline array filtering in renders
**Learning:** In React, applying the same complex array filter like `.filter(item => matchesCondition(item))` inline multiple times per render (e.g. once for displaying a count, and again for mapping elements to the UI) can cause a severe performance bottleneck, especially if the filter function does string manipulation or regex checks.
**Action:** Always memoize derived filtered lists with `useMemo` at the top of the component and reuse that variable across the JSX to avoid redundant O(N) operations.
