## 2026-10-22 - Memoize Heavy Card Components
**Learning:** Re-rendering hundreds of simple child components (`MangaCard`, `AnimeCard`) due to parent updates causes main thread jank, even without complex computation inside them.
**Action:** Use `React.memo` for large-list card components and rely on safe prop identity/shallow comparison semantics to avoid stale UI when card objects or handlers change.

## 2024-10-22 - Optimize N+1 Query in Update Service
**Learning:** Sequential async API requests in loops cause an O(N) network waterfall delay which is easily parallelizable. When refactoring loops with `Promise.all`, separating the async data fetch from the synchronous state manipulation preserves safety against race conditions.
**Action:** Always identify sequential `await` calls in array iterations as a target for parallel execution via `Promise.all` or `Promise.allSettled`, taking care to process UI state changes or database mutations synchronously afterward.
## 2026-10-29 - O(N*M) Render Loop Blocking
**Learning:** Inside map functions in components like `LibraryView`, using `.find()` on arrays (like `history.find()`) creates an O(N*M) time complexity during render, causing severe frame drops on large arrays. The codebase also contained a bug inside the loop (`historyItem` instead of `histEntry`) that was fixed.
**Action:** Pre-compute lookup maps (e.g. `historyMap`) outside of loops using `useMemo` and pass data via props instead of doing synchronous `localStorage` reads inside components during render.
