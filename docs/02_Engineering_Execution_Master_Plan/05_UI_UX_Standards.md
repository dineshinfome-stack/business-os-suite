---
document: EEMP Chapter 05 — UI/UX Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 05 — UI/UX Standards

## Purpose

Establish the visual, interaction, and accessibility baseline for Business OS. Governs the App Shell, Navigation Framework, and every module surface.

## Scope

All web surfaces under `src/routes/**` and all shared UI in `src/components/**`. Mobile-specific standards are governed by MOB Solution Design artifacts.

## Audience

Frontend engineers · Designers · Accessibility reviewers · AI collaborators authoring UI.

## Responsibilities

- Frontend engineers: comply with tokens, primitives, and layout rules.
- Designers: author variations through the design system, not ad-hoc.
- Accessibility reviewers: enforce WCAG 2.1 AA at minimum.

## Design System

- All color, gradient, and shadow values are semantic tokens in `src/styles.css` and themed via shadcn variants.
- **Never** hardcode Tailwind color utilities (`text-white`, `bg-black`, `bg-[#...]`) in components — bypasses theming.
- Reject generic AI aesthetics (default Inter/Poppins, purple/indigo on white, interchangeable hero/nav/footer) unless the user explicitly requests them. Commit to one distinctive direction per project.

## Component Library

- Primary: shadcn/ui + Radix primitives.
- Data-heavy surfaces use the shared `DataGrid` (`src/components/data-grid/`).
- Command surfaces use `CommandPalette` (`src/components/command-palette/`).
- Notifications use `NotificationCenter` (`src/components/notifications/`).
- All authorization-sensitive UI wraps in `<Can>`.

## Navigation

- Governed by Navigation Framework (Sprint 0.7) and REPOSITORY_NAVIGATION_STANDARD (v2.0).
- Sidebar and top nav consume the central navigation registry (`src/lib/navigation/registry.ts`).
- Command Palette exposes two tabs: **Commands** and **Search**.

## Accessibility

- Target WCAG 2.1 AA.
- Every interactive element has an accessible name.
- Keyboard navigation for all workflows.
- Contrast ratios verified through tokens, not per-component overrides.
- Focus states are visible and consistent.

## Head Metadata (SEO baseline)

- Unique `title < 60 chars` with keyword.
- `meta description < 160 chars`.
- Single `H1` per page.
- Semantic HTML.
- Alt text on images.
- JSON-LD where applicable.
- Responsive viewport.

Route-specific: `og:image` only at leaf routes with a meaningful absolute hero image.

## Motion and Interaction

- Animations are purposeful, respect `prefers-reduced-motion`.
- No blocking splash animations on route change.
- Loading states use the shared skeleton components; never blank white flashes.

## Empty, Loading, Error States

Every data surface defines all three. Copy uses the module's canonical terminology from its Publication.

## Localization

Follows `docs/14-localization/` and platform localization scaffolds. All user-facing strings are keyed; no bare literals in components.

## Design Constraints Discipline

The WEB Solution Design of each module carries a **Design Constraints** section. UI implementations may not violate those constraints without an ADR + Solution Design revision.

## Dependencies

- REPOSITORY_NAVIGATION_STANDARD (`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`)
- PERFORMANCE_BUDGETS_STANDARD (`docs/15-governance/PERFORMANCE_BUDGETS_STANDARD.md`)
- Navigation Framework Report (`docs/50-audit-reports/SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT.md`)

## Related Documents

- [04_Coding_Standards](04_Coding_Standards.md)
- [09_Module_Development_Framework](09_Module_Development_Framework.md) *(Phase 2)*
- [17_Documentation_Standards](17_Documentation_Standards.md) *(Phase 4)*

## Cross References

- **Related Documents:** 04_Coding_Standards
- **Referenced Standards:** REPOSITORY_NAVIGATION_STANDARD, PERFORMANCE_BUDGETS_STANDARD, GOVERNANCE_TEMPLATE_STANDARD
- **Referenced ADRs:** UI-related entries in `docs/11-adrs/ui/`
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** Sprint 0.1 UI Foundation, Sprint 0.7 Navigation, Sprint 0.8 Notifications, Sprint 0.9 Search
- **Referenced Solution Designs:** All WEB-### specs

## Open Questions

- Final theme direction and font pairing for Business OS are pending Wave UX execution (currently frozen at planning stage).

## Approval Status

Draft — pending Design and Architecture Board sign-off.

## Evidence

```
Source:             docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md
Authority:          Governance Standards
Reference:          Navigation v2.0 rules
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/50-audit-reports/SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT.md
Authority:          Sprint Audit Report
Reference:          Navigation framework verification
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Referenced files: REPOSITORY_NAVIGATION_STANDARD, PERFORMANCE_BUDGETS_STANDARD, SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT, `docs/11-adrs/ui/` index.
- Referenced standards: as above.
- Referenced ADRs: `docs/11-adrs/ui/` entries.
- Referenced PRDs: Sprints 0.1, 0.7, 0.8, 0.9, 1.0.
- Referenced Solution Designs: All WEB-### and MOB-###.
- Referenced Module Publications: All.
- Referenced Sprint Plans: All Wave 0.

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — tokens, shadcn, navigation, a11y, SEO. |
