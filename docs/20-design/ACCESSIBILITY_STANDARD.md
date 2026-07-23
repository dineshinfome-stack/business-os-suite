---
title: "Accessibility Standard"
summary: "WCAG 2.2 AA operational rules for Business OS. Cross-links ADR-081."
document_type: "Design Standard"
layer: "design"
owner: "Accessibility Lead"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "accessibility", "wcag"]
---

# Accessibility Standard

## Bar

WCAG 2.2 Level AA across all shipped surfaces. Anchored by ADR-081.

## Operating Rules

1. **Contrast** — text meets 4.5:1; large text 3:1; UI components 3:1.
2. **Keyboard** — every interactive element reachable and operable from the keyboard; visible focus ring using `focus-ring` token; no keyboard traps.
3. **Semantics** — use native elements first; add ARIA only when the native semantics do not suffice.
4. **Names & labels** — every interactive element has an accessible name; form fields have visible labels.
5. **Reduced motion** — respect `prefers-reduced-motion`; motion-only feedback has a non-motion equivalent.
6. **Zoom & reflow** — usable at 200% zoom and 400px width without loss of content or function.
7. **Errors** — errors are announced to assistive tech, linked to fields, and non-color-coded alone.
8. **Icons** — decorative icons are `aria-hidden`; meaningful icons have text alternatives.
9. **Live regions** — asynchronous state changes announce politely; destructive completions assertively.

## Testing

- Automated: axe-core across every route in CI.
- Manual: keyboard traversal and screen reader spot-checks per Wave 0.5 exit and each Architecture Review Gate.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`. Anchored by ADR-081.
