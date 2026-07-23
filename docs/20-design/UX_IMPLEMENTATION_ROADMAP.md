---
title: "UX Implementation Roadmap"
summary: "Sequencing for UX-1 through UX-5 with entry, exit, and dependencies on Wave 0 and Wave 0.5."
document_type: "Wave Guide"
layer: "design"
owner: "Design / Platform"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "ux", "implementation", "roadmap"]
---

# UX Implementation Roadmap

## Position in the Program

```text
Wave 0    Platform Foundation
   ↓
Wave 0.5  Platform Validation
   ↓
Wave UX   UX-1 → UX-2 → UX-3 → UX-4 → UX-5   ◀── this roadmap
   ↓
Wave 1    MOD-001 Platform Administration
```

Wave UX begins **only after** Wave 0.5 exits.

## UX-1 — Theme Token Implementation

- **Goal:** Land the token architecture from `DESIGN_TOKENS.md` into `src/styles.css` via Tailwind v4 `@theme inline` and remove hardcoded colors from `src/**`.
- **Entry:** `DESIGN_TOKENS.md` approved; Wave 0.5 exit.
- **Exit:** Light + dark themes render across every existing route with zero component-level hex values.

## UX-2 — Component Library Refresh

- **Goal:** Refresh every component in `COMPONENT_GUIDELINES.md` against the new tokens; add missing preview examples.
- **Entry:** UX-1 exit.
- **Exit:** Every component documented, keyboard-tested, and dark-theme parity confirmed.

## UX-3 — Navigation & Layout Modernization

- **Goal:** Apply `LAYOUT_STANDARD.md` and `RESPONSIVE_STANDARD.md` to the app shell, sidebar, header, and page skeletons.
- **Entry:** UX-2 exit.
- **Exit:** Every shipped route conforms to the layout system across `md` → `2xl`.

## UX-4 — Dashboard & Workspace Redesign

- **Goal:** Rebuild the dashboard against `DASHBOARD_EXPERIENCE.md`.
- **Entry:** UX-3 exit.
- **Exit:** Dashboard delivers persona-tuned KPI + chart + activity composition.

## UX-5 — Module-by-Module Visual Refresh

- **Goal:** Apply the new system to each functional module as it is authored in Wave 1 and beyond. This wave is a rolling apply, not a fixed sprint.
- **Entry:** UX-4 exit.
- **Exit:** Never; UX-5 is a standing conformance gate.

## Dependencies

- Wave 0 shared services (auth, RBAC, tenancy) MUST be `Available` in `CROSS_CUTTING_SERVICES_CATALOG.md`.
- Wave 0.5 `PERFORMANCE_BUDGETS_STANDARD.md` and `ACCESSIBILITY_STANDARD.md` MUST be `Approved`.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
