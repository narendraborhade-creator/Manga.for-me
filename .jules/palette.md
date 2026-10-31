## 2024-10-31 - Keyboard Accessibility for Hover Actions
**Learning:** Actions that are revealed only on hover (`group-hover:opacity-100`) become inaccessible to keyboard users because they remain visually hidden (`opacity-0`) when focused via tabbing.
**Action:** Always add `focus-visible:opacity-100` alongside `group-hover:opacity-100` for interactive elements, ensuring they become visible when navigating via keyboard. Additionally, providing focus rings (`focus-visible:ring-2`) clarifies exactly which action is currently focused.
