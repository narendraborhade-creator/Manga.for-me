## 2026-10-22 - Memoize Heavy Card Components
**Learning:** Re-rendering hundreds of simple child components (`MangaCard`, `AnimeCard`) due to parent updates causes main thread jank, even without complex computation inside them.
**Action:** Use `React.memo` for large-list card components and rely on safe prop identity/shallow comparison semantics to avoid stale UI when card objects or handlers change.

## 2024-10-22 - Optimize N+1 Query in Update Service
**Learning:** Sequential async API requests in loops cause an O(N) network waterfall delay which is easily parallelizable. When refactoring loops with `Promise.all`, separating the async data fetch from the synchronous state manipulation preserves safety against race conditions.
**Action:** Always identify sequential `await` calls in array iterations as a target for parallel execution via `Promise.all` or `Promise.allSettled`, taking care to process UI state changes or database mutations synchronously afterward.
## 2026-10-27 - Avoid Lifting State Storage Reads Unnecessarily
**Learning:** Moving synchronous state storage reads (like `getHistory()` or `getUpdates()`) into a parent component (like `App.jsx`) and passing them as props to avoid continuous reads in child components can lead to runtime crashes and stale data if the parent isn't actively watching for those storage changes to trigger re-renders. A variable like `history` in `App.jsx` wasn't actually fully accessible globally without causing a scope conflict or resolving to `window.history` unexpectedly.
**Action:** Keep isolated storage reads inside the specific component that needs them. Instead of lifting state, heavily memoize (`useMemo`) the data transformations *inside* the component based on the local storage reads to prevent expensive repeated $O(N)$ and $O(N^2)$ calculations on every render.
