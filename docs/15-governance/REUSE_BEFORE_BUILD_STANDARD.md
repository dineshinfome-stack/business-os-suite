---
document: Reuse Before Build Standard
version: 1.0.0
last_reviewed: 2026-07-25
next_review: 2027-01-25
owner: Project Architecture
approval_status: Approved
lifecycle_state: Active
supersedes: none
---

# Reuse Before Build Standard

## Purpose

Prevent duplication of layouts, pages, navigation, components, hooks, services, and utilities during implementation of Business OS sprints. Every unit of engineering work MUST demonstrate — with evidence — that no existing repository asset satisfies the requirement before authoring new code.

## Scope

Applies to every implementation sprint (Wave A onward) across every module. Governance, documentation-only work, and read-only audits are exempt from producing a Reuse Analysis but MUST still respect the restrictions below.

## Priority Order

Decisions MUST be made in this order. Each subsequent step requires justification that the prior step is not viable.

1. **REUSE** — use the existing implementation as-is.
2. **EXTEND** — add functionality without altering existing behavior.
3. **REFACTOR** — improve without changing behavior (justification required).
4. **DEFER** — the asset exists but is not needed for the current sprint; leave untouched (justification required).
5. **CREATE** — no reusable asset exists; author new code (justification required, must explicitly state why REUSE / EXTEND / REFACTOR / DEFER is not viable).

## Mandatory Pre-Implementation Discovery

Before writing any code the sprint owner MUST inspect and record findings in these categories:

- Layouts (app shell, platform shell, dashboard layout)
- Navigation (sidebar, header, breadcrumbs, command palette, secondary nav, search)
- Pages (login, dashboards, tenants, companies, branches, financial years, settings)
- Shared Components (tables, forms, dialogs, cards, buttons, filters, data grid, tabs, modals, notifications, loaders, empty/error states, widgets)
- Dashboard Template (registry, widgets, quick actions)
- Authentication (login, logout, session, refresh, protected routes, RBAC)
- Supabase Integration (client, middleware, admin, migrations)
- Services / Server Functions
- Hooks (navigation, tenants, settings, search, permissions)
- Utilities (date, number, string, storage, theme)
- Styling (tokens, Tailwind config, theme, icons)

## Reuse Analysis Schema

Every sprint MUST publish a Reuse Analysis using this fixed schema:

| Field | Description |
|---|---|
| Component | Item being reviewed |
| Repository Evidence | File path(s) |
| Current Capability | What it already does |
| Gap | What's missing for the current sprint |
| Recommendation | REUSE / EXTEND / REFACTOR / DEFER / CREATE |
| Reuse Confidence | High / Medium / Low |
| Justification | Required for REFACTOR, DEFER, CREATE |
| Suggested Owner | Platform UI / Security / Platform Backend / Infrastructure / Data — advisory only; does not modify repository ownership or governance responsibilities |

## Restrictions

The following actions are prohibited without a documented ADR or Architecture Board exception:

- Creating an additional sidebar, top bar, or app shell.
- Creating an additional dashboard layout.
- Creating an additional authentication system.
- Creating an additional Supabase client, auth middleware, or admin client.
- Creating duplicate services, hooks, or UI primitives.
- Replacing working functionality without an approved refactor plan.

## Definition of Done Addendum

A sprint audit report is not complete until it:

- Cites this standard.
- Publishes the Reuse Analysis table with an entry per affected category.
- Confirms every CREATE decision has been reviewed against existing repository assets.
- References this standard's Restrictions section and records any exceptions.

## Enforcement

Reviewers MUST reject a sprint that:

- Ships without a Reuse Analysis.
- Contains a CREATE decision without justification.
- Introduces a duplicate under Restrictions without an approved exception.

## Related Documents

- EEMP Ch. 03 — Development Workflow
- EEMP Ch. 04 — Coding Standards
- `REPOSITORY_NAVIGATION_STANDARD.md`
- `FINDING_SEVERITY_STANDARD.md`

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-25 | Project Architecture | Initial standard. Codifies Reuse → Extend → Refactor → Defer → Create priority order and Reuse Analysis schema. |
