1. **Optimize O(N) array search inside `.map` in `LibraryView.jsx`**
   - **File:** `src/components/LibraryView.jsx`
   - **Current State:** Inside the `filteredList.map`, it does `history.find((h) => h.mangaId === item.id)`. Since `filteredList` could have many items, and `history` can have many items, this creates an O(N*M) time complexity during rendering, which is slow and can cause frame drops on large libraries.
   - **Proposed Change:** Memoize a `historyMap` outside of the render map, similar to what `App.jsx` already does.
     ```jsx
     const historyMap = useMemo(() => {
       const map = {};
       history.forEach(h => { map[h.mangaId] = h; });
       return map;
     }, [history]);
     ```
     Then, use `historyMap[item.id]` instead of `history.find(...)`.
     Also change `historyItem` typo to `histEntry` on line 233 and 234 inside the map. Currently it says `if (onOpenReader && historyItem)`, but `historyItem` doesn't exist (`histEntry` was defined instead).
   - **Why:** This changes O(N*M) finding to O(1) map lookup per item, reducing re-render cost drastically when scrolling large libraries.

2. **Run pre-commit steps and submit.**
