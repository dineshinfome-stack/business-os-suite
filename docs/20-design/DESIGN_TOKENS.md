---
title: "Design Tokens"
summary: "Token architecture (surface, text, border, shadow, spacing, radius, motion) for light and dark themes. Mappable 1:1 to Tailwind v4 @theme inline in UX-1."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "tokens", "tailwind"]
---

# Design Tokens

## Architecture

Three layers:

1. **Primitive tokens** — raw palettes and numeric scales. Not consumed by components.
2. **Semantic tokens** — role-named tokens (`--color-surface-base`, `--color-text-primary`). Consumed by components.
3. **Component tokens** — per-component overrides derived from semantic tokens.

Only **semantic** and **component** tokens are consumed in code.

## Token Categories

| Category | Example Names |
| -------- | ------------- |
| Surface | `surface-base`, `surface-raised`, `surface-overlay`, `surface-sunken` |
| Text | `text-primary`, `text-secondary`, `text-muted`, `text-inverse` |
| Border | `border-subtle`, `border-default`, `border-strong` |
| Brand | `brand-primary`, `brand-primary-hover`, `brand-primary-active` |
| Accent | `accent-info`, `accent-success`, `accent-warning`, `accent-danger` |
| Shadow | `shadow-1` … `shadow-6` |
| Spacing | `space-1` … `space-16` (base 4 px) |
| Radius | `radius-sm`, `radius-md`, `radius-lg`, `radius-full` |
| Motion | `motion-micro`, `motion-small`, `motion-medium`, `motion-large` |

## Theme Mapping

Every semantic token is defined once per theme (light, dark). In UX-1, tokens will map 1:1 to Tailwind v4:

```css
@theme inline {
  --color-surface-base: var(--surface-base);
  --color-text-primary: var(--text-primary);
  /* ... */
}
```

No component in `src/**` may reference a primitive token directly.

## Rules

- No hardcoded hex in components.
- No `text-white` / `bg-black` / arbitrary values in components.
- Dark theme is derived from the same semantic names, not from separate class trees.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`. Anchored by ADR-080.
