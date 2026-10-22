## 2024-03-24 - Memoize Heavy Card Components
**Learning:** Re-rendering hundreds of simple child components (`MangaCard`, `AnimeCard`) due to parent updates causes main thread jank, even without complex computation inside them.
**Action:** Always consider `React.memo` for components rendered in large lists (e.g., using `.map`). Create custom `areEqual` comparators when parent provides inline function props (`onSelect`) that change on every render but don't actually require the child to update.
