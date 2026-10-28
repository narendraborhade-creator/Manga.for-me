## 2026-10-22 - Memoize Heavy Card Components
**Learning:** Re-rendering hundreds of simple child components (`MangaCard`, `AnimeCard`) due to parent updates causes main thread jank, even without complex computation inside them.
**Action:** Use `React.memo` for large-list card components and rely on safe prop identity/shallow comparison semantics to avoid stale UI when card objects or handlers change.

## 2024-10-22 - Optimize N+1 Query in Update Service
**Learning:** Sequential async API requests in loops cause an O(N) network waterfall delay which is easily parallelizable. When refactoring loops with `Promise.all`, separating the async data fetch from the synchronous state manipulation preserves safety against race conditions.
**Action:** Always identify sequential `await` calls in array iterations as a target for parallel execution via `Promise.all` or `Promise.allSettled`, taking care to process UI state changes or database mutations synchronously afterward.

## 2025-02-28 - Synchronous Storage Reads in React Render Loop
**Learning:** Found a severe performance anti-pattern where components (like `LibraryView`) synchronously hit `localStorage` via helper methods (`getHistory`, `getUpdates`) directly in the main render body on every state update (e.g., when a user types in a search input). This blocks the main thread on every re-render and can cause cascading performance issues.
**Action:** Always wrap these expensive storage reads inside `useMemo`. Since the app manages storage primarily without contexts, we can use global top-level states passed as props (like `bookmarks`) as a proxy dependency in the `useMemo` array, so the memoized value only re-evaluates when relevant overarching data updates rather than on unrelated re-renders.
