## 2024-10-26 - O(N) Array finds in loops
**Learning:** Found an O(N*M) performance trap inside `LibraryView` where `history.find` was run inside a `.map()` on the filtered library list. Combined with unmemoized synchronous `localStorage` reads on every render, it caused significant UI blocking during text search.
**Action:** Lift `localStorage` reads to `App.jsx` as props, and strictly use `useMemo` to convert O(N) array finds into O(1) map lookups, specifically mapping arrays by ID prior to render loops.
