---
title: "UI/UX Design System"
summary: "Design philosophy, tokens, component principles, forms, tables, navigation, dashboards, accessibility, dark mode, localization, and offline UX for BusinessOS."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["design", "ui", "ux"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/ai-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
  - "docs/03-design/ux-standards.md"
referenced_by: []
document_type: "Design Standard"
---

# UI/UX Design System

*Part of Pass 4D — the final architecture documentation layer before ERP
Core Engines (shared reusable platform capabilities).*

## Overview

The Design System defines **how BusinessOS looks and feels**, and the
governed vocabulary from which every screen is composed. It is vendor-
neutral: no CSS framework, component library, or design tool is
prescribed.

The Design System governs **visual consistency**. Behavioural consistency
lives in UX Standards.

Specific frameworks, runtime versions, vendors, and implementation choices
are intentionally deferred to ADRs and implementation documentation.

## Design Philosophy

- **DS-01 · ERP-Grade Density with Human Comfort.** Enterprise workflows
  demand information density; the design system delivers density without
  visual noise.
- **DS-02 · Consistency Over Novelty.** Predictable patterns reduce
  cognitive load; local originality is discouraged.
- **DS-03 · Accessible by Default.** Accessibility is designed in, not
  patched on.
- **DS-04 · Localizable at the Foundation.** Language, direction,
  currency, and number formatting are properties of the system, not
  afterthoughts.
- **DS-05 · Copilot-Aware.** AI surfaces are first-class citizens with
  consistent affordances (see AI Architecture).
- **DS-06 · Permission-Aware.** The UI never shows actions the user
  cannot perform; RBAC/ABAC informs visibility.

## Design Tokens

Tokens are the **atomic, semantically-named, machine-readable design
decisions**. They exist for color, typography, spacing, radius,
elevation, motion, and iconography.

- Tokens are **semantic** (e.g., `surface`, `on-surface`,
  `emphasis-primary`) rather than literal (e.g., "blue-500").
- Tokens are **layered**: primitive → semantic → component.
- Tokens are **theme-aware** (light, dark, high-contrast).
- Tokens are **versioned** and follow additive evolution.

## Color Principles

- Color communicates **meaning**, not decoration: state, severity,
  emphasis, and category.
- Contrast ratios meet accessibility standards for every text/background
  pair.
- Semantic colors (success, warning, danger, information) are stable
  across themes.
- Brand accents are constrained; they do not carry state semantics.
- Dark mode is not a color inversion; it is an independently designed
  palette.

## Typography

- One primary type system, chosen for legibility at ERP densities and
  for multi-script support.
- A limited, semantically named type scale (display, heading, body,
  caption, code).
- Line lengths and vertical rhythm optimized for scanning tables and
  forms.
- Numeric glyphs are tabular by default in data-dense contexts.

## Spacing System

- A single base unit produces a bounded scale (e.g., 4/8-based).
- Spacing is applied semantically (inset, stack, inline) rather than as
  arbitrary pixel values.
- Density variants (comfortable, compact) share the same scale, applied
  consistently.

## Elevation

- Elevation communicates hierarchy, not decoration.
- A limited elevation ladder (surface, raised, overlay, modal, toast)
  is used platform-wide.
- Shadows in dark mode are tuned; not simply the same tokens as light
  mode.

## Responsive Grid

- A responsive grid supports desktop-first ERP workflows while remaining
  usable on tablets and phones.
- Breakpoints are semantic (`compact`, `medium`, `expanded`, `wide`),
  not device-named.
- Data-dense surfaces degrade gracefully; primary actions remain
  reachable at every breakpoint.

## Component Library Principles

- Components are **composable, accessible, themable, and localizable**.
- Each component declares its states (default, hover, focus, active,
  disabled, loading, error, empty) and accessible name.
- Components respect Data Classification: sensitive fields have
  masking-capable primitives.
- Components are permission-aware: disabled states carry an explanation.
- Every component is documented with anatomy, states, do/don't, and a11y
  notes.

## Forms

- Forms follow a consistent anatomy: label, control, helper, error.
- Validation is progressive: on-blur where safe, on-submit for
  correlated fields.
- Errors are specific, actionable, and localized.
- Required fields are visually indicated and announced to assistive
  technology.
- Long forms use progressive disclosure; long transactional forms use
  the ERP voucher-entry pattern from UX Standards.
- Autosave and draft semantics are explicit; the user always knows
  whether their work is safe.

## Tables

- Tables are the canonical ERP surface; the system provides governed
  patterns for sorting, filtering, grouping, pagination, and column
  management.
- Density modes are supported.
- Row selection, bulk actions, and inline actions follow UX Standards.
- Empty, loading, error, and permission-denied states are first-class.
- Large tables support virtualization without breaking accessibility.

## Navigation

- A stable top-level navigation reflects the domain map.
- Contextual navigation (breadcrumbs, back paths, tabs) is consistent
  across modules.
- Keyboard navigation follows UX Standards.
- Multi-company / multi-branch scope switching is a visible, governed
  affordance.

## Dashboard Standards

- Dashboards compose from a governed catalogue of cards, charts, and
  KPIs.
- Every dashboard tile declares its data source, freshness, and
  drill-down target.
- Drill-downs preserve scope (tenant, company, branch, date range).
- AI copilot summaries, when present, are clearly labelled and
  attributable.

## Mobile Standards

- Mobile is optimized for **field operations** (approvals, inspections,
  captures) rather than full ERP entry.
- Touch targets meet accessibility minimums.
- Offline flows follow UX Standards; sync state is always visible.
- Camera, barcode/QR, and location surfaces follow governed patterns.

## Accessibility

- Meets the accessibility conformance level declared in Quality
  Attributes.
- Focus is always visible and follows a logical order.
- Color is never the sole information carrier.
- All interactive elements have accessible names, roles, and states.
- Motion respects reduced-motion preferences.

## Dark Mode

- Dark mode is a fully designed theme with its own tokens.
- Contrast, elevation, and iconography are re-tuned for dark surfaces.
- User preference and system preference are both honored.

## Localization

- Every string is externalized and translatable.
- Layouts tolerate text expansion and contraction.
- Right-to-left languages flip layout and iconography where
  semantically correct.
- Number, currency, date, time, and calendar formats follow locale.

## Offline UX

- Offline-capable screens declare their offline capability visibly.
- Local edits are marked; sync outcomes are communicated.
- Conflicts are surfaced with clear, actionable resolution UI.
- Sensitive data offline is masked and encrypted per Security
  Architecture.

## Design Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Component-library realization | Depends on chosen frontend stack | With ADR on frontend stack | Platform |
| Iconography set | Depends on brand direction and multi-script needs | Before first module GA | Design |
| Chart primitives catalogue | Depends on analytics scope in Pass 5 | With Pass 5 analytics engine | Design + Platform |
| Motion tokens | Depends on accessibility posture and platform capability | With first module GA | Design |

ADR placeholders: **ADR-DS-001 · Component Library**, **ADR-DS-002 ·
Iconography**, **ADR-DS-003 · Chart Primitives**, **ADR-DS-004 · Motion
Tokens**.

## Conforms to Canon

- Accessibility is a requirement, not an aspiration (Canon:
  Accessibility).
- Permission-aware UI reinforces least privilege (Canon: Security).
- Localization respects jurisdictional obligations (Canon: Data
  Governance).
- AI surfaces reveal AI identity and constraints (Canon: AI as Scoped
  Principal).

## References

- `docs/03-design/ux-standards.md`
- `docs/02-architecture/ai-architecture.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/quality-attributes.md`
