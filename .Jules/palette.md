## 2024-05-15 - Missing ARIA Labels on Icon-Only Buttons
**Learning:** Icon-only buttons (like hamburger menus, modal close "X"s, or search clear "✕"s) often miss text alternatives, making them completely inaccessible to screen reader users who only hear "button".
**Action:** Always verify icon-only buttons include descriptive `aria-label` attributes (e.g., `aria-label="Close menu"`). Also, add `aria-expanded` when appropriate (e.g. for hamburger menus).
