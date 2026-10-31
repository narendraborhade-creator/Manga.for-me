## 2026-10-22 - Memoize Heavy Card Components
**Learning:** Re-rendering hundreds of simple child components (`MangaCard`, `AnimeCard`) due to parent updates causes main thread jank, even without complex computation inside them.
**Action:** Use `React.memo` for large-list card components and rely on safe prop identity/shallow comparison semantics to avoid stale UI when card objects or handlers change.

## 2024-10-22 - Optimize N+1 Query in Update Service
**Learning:** Sequential async API requests in loops cause an O(N) network waterfall delay which is easily parallelizable. When refactoring loops with `Promise.all`, separating the async data fetch from the synchronous state manipulation preserves safety against race conditions.
**Action:** Always identify sequential `await` calls in array iterations as a target for parallel execution via `Promise.all` or `Promise.allSettled`, taking care to process UI state changes or database mutations synchronously afterward.

## 2024-03-24 - React Component Inline Array Filtering Anti-pattern
**Learning:** Performing multiple inline `Array.prototype.filter()` calls inside the render function of a large React component is a massive performance bottleneck, especially if the filter functions use string-heavy operations (e.g. `matchesSource()`). The component in this codebase computed the length of the filtered arrays and mapped over the exact same filtered arrays in the render tree separately, effectively doubling the computation time per render cycle. This is problematic for large lists, like search results or feed lists.
**Action:** When working in React components with list rendering and counting, avoid repeating identical filter logic multiple times per render. Memoize derived filtered lists with `useMemo` at the top level and reuse the variable across the JSX.
