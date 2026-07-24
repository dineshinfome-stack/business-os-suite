# SPR-PLT-0002 — Hide "Workspace" from the User Experience

Presentation-only sprint. Preserve ADR-008, the logical accessor, all nav_ids, routes, permissions, RLS, APIs, and schema. Only user-visible labels and copy change.

## Repository verification (pre-flight)

Confirm before editing:
- ADR-008 unchanged; no `workspaces` table; no `workspace_id` columns.
- `useCurrentWorkspace` / `getCurrentWorkspace` untouched.
- Navigation, breadcrumbs, and command palette remain registry-driven.

If any drift, stop and report.

## Changes (labels/copy only)

### 1. Navigation registry (`src/lib/navigation/registry.ts`)
Rename user-visible `title` fields only. Do NOT change `id`, `module`, `route`, `parent`, `permission`, or `display_order`.

- `id: "workspace"` → title `"Business"` (top group label).
- `id: "workspace.hub"` → title `"Business Profile"` (was "Workspace").
- Remove `"workspace"` from `keywords` on `super_admin.platform` and `admin.organizations` entries; keep other keywords.
- `workspace.dashboard`, `workspace.team`, `workspace.invitations` titles already user-friendly — leave.

### 2. Page titles & copy
- `src/routes/_authenticated/workspace.tsx`:
  - Head title: `"Business Profile — {APP_NAME}"`.
  - Page heading fallback `"Workspace"` → `"Business Profile"`; `` `${name} · Workspace` `` → `` `${name} · Business Profile` ``.
  - Empty-state description: "Select an organization from the top bar to manage business settings."
  - Tab/section label "Workspace settings" → "Business settings".
- `src/routes/_authenticated/workspace.accept.tsx`:
  - Head description: "Accept your team invitation."
  - Button "Go to workspace" → "Go to business profile".
- `src/routes/_authenticated/settings.tsx`: description "Configure your workspace preferences." → "Configure your business preferences."
- `src/routes/_authenticated/dashboard.tsx`: head description and hero "Your workspace foundation is ready." → use "business" phrasing.

### 3. Command palette (`src/components/navigation/CommandPalette.tsx`)
- Search input placeholder "Search across your workspace…" → "Search across your business…".
- No structural changes; results still come from the registry (auto-updated by step 1).

### 4. Breadcrumbs
No code change needed — `useBreadcrumbs` derives labels from registry `title`, so renaming the group in step 1 cascades automatically.

### 5. User-facing docs
Scope limited to non-authoritative user docs. Do NOT touch ADR-008, `TENANCY_STANDARD.md`, `multi-tenant-architecture.md`, or `glossary.md`. Sweep `docs/12-ui-components/`, dashboards, and any onboarding copy for user-facing "workspace" wording and replace with "business" / "organization" per context. Skip design/architecture docs.

## Out of scope
Routes, nav_ids, permissions, RLS, schema, APIs, `useCurrentWorkspace`, ADR-008, glossary, architecture docs, `workspaceKeys` query-key namespace (internal), `src/lib/workspace/*` module paths (internal).

## Validation
- `tsgo --noEmit` clean.
- Existing vitest suite passes.
- `rg -n "workspace_id|create table.*workspaces"` returns nothing new.
- Manual: sidebar shows "Business" group; `/workspace` page renders as "Business Profile"; palette placeholder updated; breadcrumbs read "Home › Business › …".

## Deliverable
Completion report at `docs/50-audit-reports/SPR_PLT_0002_PRESENTATION_SIMPLIFICATION_REPORT.md` listing reused components, modified files with rationale, and validation results.
