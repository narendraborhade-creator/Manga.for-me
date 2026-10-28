## 2024-10-28 - Keyboard accessibility on hover-only items
**Learning:** Some elements like "remove from history" buttons or hero carousel arrows were strictly using `opacity-0 group-hover:opacity-100` pattern, making them completely invisible to keyboard-only users who navigate via `Tab`.
**Action:** Always add `focus-visible:opacity-100` alongside `group-hover:opacity-100` for interactive elements that are hidden by default, ensuring they become visible when receiving keyboard focus.

## 2024-10-28 - Icon-only buttons lacking ARIA labels
**Learning:** Multiple icon-only buttons (like `Trash2`, `ChevronLeft`, `X` for removing filters) were missing `aria-label`s, which means screen readers would just announce them as "button", giving no context.
**Action:** Always add descriptive `aria-label`s to icon-only interactive elements to provide context for screen reader users.
