---
title: "SPR-PLT-0002 — Presentation Simplification Completion Report"
sprint: "SPR-PLT-0002"
classification: "Platform Experience Sprint"
owner: "Platform Experience"
status: "complete"
updated: "2026-07-24"
version: "1.0"
---

# SPR-PLT-0002 — Presentation Simplification: Hide "Workspace" from UX

## 1. Repository Verification (pre-flight)

- ADR-008 unchanged: `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md` intact.
- No `workspaces` table; no `workspace_id` columns (repo-wide grep clean).
- `src/lib/workspace/current-workspace.ts` (`useCurrentWorkspace`, `getCurrentWorkspace`) untouched.
- Navigation registry, breadcrumbs (`useBreadcrumbs`), and command palette remain registry-driven.
- No drift detected. Sprint proceeded.

## 2. Repository Reuse

Reused without duplication:

- Navigation Registry (`src/lib/navigation/registry.ts`) — single source of truth for sidebar, breadcrumbs, and palette labels.
- Breadcrumb system (`src/hooks/navigation/useBreadcrumbs.ts`) — auto-cascades registry `title` changes; no code change required.
- Command Palette (`src/components/navigation/CommandPalette.tsx`) — only the placeholder string changed; results still derive from the registry.
- Page layout framework (`PageContainer`, `EmptyState`, `Card` primitives) — reused as-is.

## 3. Files Modified

| File | Change | Rationale |
| --- | --- | --- |
| `src/lib/navigation/registry.ts` | `workspace` group `title`: "Workspace" → "Business"; `workspace.hub` `title`: "Workspace" → "Business Profile"; removed `"workspace"` from `keywords` of `administration.platform.tenants` and `administration.platform.companies` (added `"business"` to Companies). `id`, `route`, `parent`, `permission`, `display_order` untouched. | Cascades to sidebar, breadcrumbs, and palette in one edit. |
| `src/routes/_authenticated/workspace.tsx` | Head title, page title fallback, org-scoped title, empty-state description, and "Workspace settings" quick-link relabeled to "Business Profile" / "Business settings". | User-visible copy only; route path `/workspace` retained. |
| `src/routes/_authenticated/workspace.accept.tsx` | Meta description → "Accept your team invitation."; button "Go to workspace" → "Go to business profile". | Invite acceptance UX. |
| `src/routes/_authenticated/settings.tsx` | Meta description and page description use "business" instead of "workspace". | Settings copy. |
| `src/routes/_authenticated/dashboard.tsx` | Meta description and hero subtitle use "business" instead of "workspace". | Dashboard copy. |
| `src/components/navigation/CommandPalette.tsx` | Search input placeholder → "Search across your business…". | Palette copy; behavior unchanged. |

Docs sweep: `docs/12-ui-components/`, dashboards, and onboarding copy contained no user-facing "workspace" strings requiring change. Architecture/governance docs (ADR-008, TENANCY_STANDARD, multi-tenant-architecture, glossary) intentionally untouched.

## 4. Validation

- **TypeScript:** `bunx tsgo --noEmit` — clean, exit 0.
- **Navigation:** sidebar renders "Business" group → Dashboard / Business Profile / Team / Invitations.
- **Breadcrumbs:** derived from registry; now read "Home › Business › …". No hook changes.
- **Command palette:** placeholder updated; nav results reflect new titles via registry.
- **Routes:** `/dashboard`, `/workspace`, `/workspace/accept`, `/settings`, `/platform/*` unchanged.
- **Permissions:** unchanged (`workspace.workspace.read`, `workspace.member.read`, etc.).
- **nav_ids:** unchanged (`workspace`, `workspace.hub`, `workspace.team`, `workspace.invitations`).
- **APIs / RLS / schema:** no changes; no migration files added.
- **Persistence sweep:** `rg -n "workspace_id|create table.*workspaces"` returns no new matches.

## 5. Repository Deviations

No repository deviations detected.

## 6. Stop Condition

- "Workspace" no longer appears as a user-visible navigation label, page title, or copy string.
- Sidebar, breadcrumbs, palette, and page headings reflect "Business" / "Business Profile".
- Validation passes.
- ADR-008 and the internal logical accessor remain authoritative and intact.

Awaiting Architecture Board validation before any future decision to reintroduce Workspace as a visible concept.
