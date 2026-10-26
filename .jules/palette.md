## 2024-05-14 - Hover-only Icon Buttons Need Focus Visible Styles

**Learning:** Hover-only icon buttons (like "Remove from History" or "Delete Bookmark" buttons that appear only when hovering over a card) are completely invisible to keyboard users and screen readers if they lack both `aria-label`s and focus styles that override the `opacity-0` hover state. This is a common accessibility trap in modern, clean UI designs where secondary actions are hidden by default to reduce visual clutter.

**Action:** Whenever implementing a hover-only button (e.g., using `opacity-0 group-hover:opacity-100`), always include `focus-visible:opacity-100` so the button appears when tabbed to, in addition to standard `focus-visible:ring-2` styles and an `aria-label`.
