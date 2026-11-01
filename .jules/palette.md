## 2024-11-01 - Hover-Revealed Buttons Need Keyboard Support
**Learning:** Elements that use `opacity-0 group-hover:opacity-100` to appear on hover remain completely invisible to keyboard users who tab to them, hiding important functionality (like carousel navigation).
**Action:** Always add `focus-visible:opacity-100` alongside hover classes for such elements to ensure they are visible when they receive keyboard focus, and pair it with focus rings for clarity.
