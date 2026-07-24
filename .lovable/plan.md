
# ARCH-009 — Workspace Retirement, Tenant Adoption (Rev. B)

**Classification:** Architecture Refactor · **Authority:** Architecture Board · **Mode:** Discovery → Impact → Approval → Implementation

**Rev. B changes:** Permission-key rename removed from scope (deferred to a future RBAC migration per Board recommendation). Success Criteria section added. Redirect strategy explicitly documented as an operational shim with a removal milestone.

Supersedes SPR-PLT-0003 (`/business` direction). Per Board decision, **Tenant** replaces Workspace *and* Business across code, routes, UI, and docs. No compatibility code alias; URL redirects only, time-boxed.

---

## Phase 0 — Repository Verification (complete, no drift)

| Check | Result |
|---|---|
| `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md` | Exists |
| `src/lib/workspace/current-workspace.ts` accessor | Exists (zero consumers) |
| `/workspace` routes | `src/routes/_authenticated/workspace.tsx`, `workspace.accept.tsx` |
| Physical `workspaces` table | None |
| `workspace_id` column references | None |
| `useCurrentWorkspace` / `getCurrentWorkspace` consumers | None outside the accessor file itself |
| Navigation registry Workspace references | Present (`src/lib/navigation/registry.ts`) |
| Documentation Workspace references | Present (~152 files) |

**No drift. Proceeding.**

---

## Phase 1 — Impact Matrix

### 1.1 Code (`src/` — 10 files)

| File | Action |
|---|---|
| `src/lib/workspace/current-workspace.ts` | **Delete** (dead accessor) |
| `src/lib/workspace/types.ts` | **Move** → `src/lib/tenant/business-types.ts` |
| `src/lib/workspace/query-keys.ts` | **Move** → `src/lib/tenant/query-keys.ts`; root key `"workspace"` → `"tenant"` |
| `src/lib/workspace/functions.ts` | **Move** → `src/lib/tenant/business-functions.ts`; server-fn signatures unchanged |
| `src/routes/_authenticated/workspace.tsx` | **Move** → `tenant.tsx`; retitle "Tenant"; relink invitation URL to `/tenant/accept` |
| `src/routes/_authenticated/workspace.accept.tsx` | **Move** → `tenant.accept.tsx` |
| `src/lib/navigation/registry.ts` | **Modify** — group `workspace`→`tenant`, nav_ids `workspace.*`→`tenant.*`, routes `/workspace`→`/tenant`, titles/keywords updated. **Permission strings unchanged** (Rev. B) |
| `src/contexts/org-context.tsx` | Copy: "Couldn't load your workspace" → "Couldn't load your tenant" |
| `src/lib/notifications/registry.ts` | Copy: "workspace security events" → "tenant security events" |
| `src/components/navigation/CommandPalette.tsx` | Placeholder: "Search across your business…" → "Search across your tenant…" |
| `src/routeTree.gen.ts` | Auto-regenerated |

### 1.2 Database — **No migration in ARCH-009 (Rev. B)**

Permission keys, setting keys, and permission catalog manifest retain the `workspace.*` namespace. They are internal identifiers; UI labels change without touching security schema. A dedicated **RBAC-NNN — Permission Namespace Alignment** ticket is filed for later, sequenced independently.

Files intentionally **unchanged in this refactor**:
- `docs/15-governance/permission-catalog.manifest.yaml`
- `src/lib/generated/permission-keys.ts`
- Existing `permissions`, `setting_definitions`, `setting_values` rows

### 1.3 Redirects (operational shim, time-boxed)

Outbound invitation emails contain `/workspace/accept?token=…`. **Required** transient TSS route shims:
- `src/routes/_authenticated/workspace.tsx` → `<Navigate to="/tenant" replace />`
- `src/routes/_authenticated/workspace.accept.tsx` → forwards `?token=…` to `/tenant/accept`

Explicit classification: these are **URL redirects for bookmarked links and in-flight invitation emails**, not a domain-model alias. **Removal milestone:** T + longest active `organization_invitations.expires_at` (read at execution), targeted for the next platform sprint. Removal tracked as ARCH-009-CLEANUP.

### 1.4 Documentation (`docs/` — ~152 files, tiered)

**Tier A — Live governance/architecture (~10 files, Phase 2)**
- ADR-008 → mark `status: superseded`, `superseded_by: ADR-009`
- **New** ADR-009-workspace-retirement.md
- `docs/02-architecture/multi-tenant-architecture.md` — remove Workspace tier from Mermaid + prose
- `docs/15-governance/TENANCY_STANDARD.md` — remove Workspace section
- `docs/glossary.md`, `docs/GLOSSARY_INDEX.md` — remove/redirect Workspace entry
- `docs/_meta.json` — sidebar labels
- `docs/11-adrs/ADR_INDEX.md` — add ADR-009

**Tier B — Live module/sprint docs (~110 files, Phase 6)**
Domain-concept "Workspace" → "Tenant" across `docs/40-module-baselines/`, `docs/45-module-publications/`, `docs/60-solution-design/`, `docs/30-sprint-prds/`, `docs/02_Engineering_Execution_Master_Plan/`, catalogs.

**Skip list (never touch):**
- MOD-018 "AI Workspace" — product feature name
- `docs/06-integrations/google-workspace.md` — external product
- `docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md`

**Tier C — Historical (~30 files, preserved verbatim)**
- Dated files under `docs/50-audit-reports/`
- Superseded ADRs (only frontmatter status changes)

### 1.5 APIs

No external APIs. Server-function signatures unchanged; only import paths shift `@/lib/workspace/*` → `@/lib/tenant/*`. No consumer outside the two workspace route files.

### 1.6 Tests

No workspace refs in `src/__tests__/`. Navigation-registry schema tests pick up new IDs automatically. Add validation script: workspace-reference sweep against exit criteria.

---

## Phase 2 — Architecture Refactor

1. Author `ADR-009-workspace-retirement.md` — Tenant as isolation + business container; new hierarchy diagram; supersedes ADR-008. **Explicitly notes** that permission namespace remains `workspace.*` pending RBAC-NNN.
2. Frontmatter-mark ADR-008 superseded.
3. Edit Tier A docs.
4. Update `docs/_meta.json`.

Deliverable → `docs/50-audit-reports/ARCH_009_ARCHITECTURE_REFACTOR_REPORT_<TS>.md`.

---

## Phase 3 — Code Refactor

1. Move `src/lib/workspace/*` → `src/lib/tenant/*` (business-functions, business-types, query-keys). Delete `current-workspace.ts`.
2. Rewrite imports in the two route files.
3. Update copy strings in `org-context.tsx`, `notifications/registry.ts`, `CommandPalette.tsx`.

Deliverable: **Code Refactor Summary**.

---

## Phase 4 — Route Refactor

1. Rename route files (`workspace.tsx` → `tenant.tsx`, `workspace.accept.tsx` → `tenant.accept.tsx`); update `createFileRoute` strings, `useSearch({ from: ... })`, invitation URL builder.
2. Create redirect shim files at original names.
3. `routeTree.gen.ts` auto-regenerates.

Deliverable: **Route Migration Summary** with redirect removal milestone.

---

## Phase 5 — Navigation & UI Refactor

`src/lib/navigation/registry.ts`:
- Group `workspace` → `tenant` (title "Tenant")
- `workspace.hub` → `tenant.hub` ("Tenant Profile"), route `/tenant`
- `workspace.team` → `tenant.team` ("Tenant Team")
- `workspace.invitations` → `tenant.invitations` ("Tenant Invitations")
- `workspace.dashboard` → `tenant.dashboard`
- **Permission strings unchanged** — nav entries continue to reference `workspace.workspace.read`, `workspace.member.read`, etc.

Route-file copy sweep: page titles, `head()` meta, breadcrumbs, empty states, notifications in `tenant.tsx` and `tenant.accept.tsx`.

---

## Phase 6 — Documentation Refactor (Tier B)

Automated find-and-replace with explicit skip list. Per-tier review before commit.

Deliverable: **Documentation Migration Summary** with per-file line counts.

---

## Explicitly Out of Scope

- Tenant isolation model, RLS, Company/Branch/Financial-Year hierarchy
- DB restructuring
- Licensing
- **Permission namespace rename** (deferred to RBAC-NNN)
- New business concepts

---

## Success Criteria (Board addition)

- Business OS no longer contains Workspace as a domain concept.
- Tenant is the only business container in vocabulary, code, routes, UI, and live docs.
- All functionality previously under `/workspace` is available under `/tenant`, unchanged in behavior.
- Existing customer data remains unaffected.
- No security model changes.
- No tenant isolation changes.
- No functional regressions in Business Profile, Branding, Team, Invitations flows.
- Historical audit reports and superseded ADRs preserved intact.

---

## Validation / Exit Criteria (technical)

- `rg -n "workspace" src/ -g '!routeTree.gen.ts' -g '!generated/**'` returns only: redirect-shim files, MOD-018 product-name references, or permission-key strings (retained per Rev. B).
- `rg -n "useCurrentWorkspace|getCurrentWorkspace|WorkspaceContext|WorkspaceProvider|workspaceKey|workspace_id" .` returns **empty**.
- `rg -n "/workspace" src/routes/` returns only redirect-shim files.
- `tsgo` typecheck green; `bun run test` green; navigation-registry schema tests green.
- Manual smoke: sign in → `/tenant` → invite → accept via `/tenant/accept?token=…` → verify `/workspace/accept?token=…` also redirects successfully.
- Docs: ADR-008 marked superseded; ADR-009 present and linked; `multi-tenant-architecture.md` diagram has no Workspace tier.

---

## Regression Risks

| Risk | Mitigation |
|---|---|
| In-flight invitation emails 404 after shim removal | Retain shim through longest active `organization_invitations.expires_at`; documented removal milestone (ARCH-009-CLEANUP) |
| Bookmarks/favorites store `/workspace` route | Redirect shim; optional `nav_favorites.route` rewrite migration (deferred, low priority) |
| Query-cache mismatch on deploy (open tabs, stale keys) | Root key `"workspace"`→`"tenant"`; auto-refetch on next mount. Acceptable |
| ADR-007 cross-references ADR-008 | ADR-009 explicitly cross-links; no ADR-007 edit needed |
| Tier B doc sweep accidentally touches "AI Workspace" / "google-workspace" | Explicit skip list; per-file review |
| Reviewers confused why permission keys still say `workspace.*` | ADR-009 documents the deferral; RBAC-NNN ticket referenced in ADR |

---

## Rollback Plan

- **Code:** Each phase = independent commit. Reverting Phase 4 restores routes; Phase 3 restores `src/lib/workspace/`; Phase 2 restores ADR-008 authoritative.
- **DB:** N/A (no migration in Rev. B).
- **Docs:** Git history; Tier C untouched by design.

---

## Deliverables

1. Repository Discovery Report (this document, expanded on execution)
2. Impact Analysis (§1)
3. Architecture Refactor Report (Phase 2)
4. Code Refactor Summary (Phase 3 + 5)
5. Route Migration Summary (Phase 4)
6. Documentation Migration Summary (Phase 6)
7. Validation Report
8. Final Completion Report → `docs/50-audit-reports/ARCH_009_COMPLETION_REPORT_<TS>.md`
9. **RBAC-NNN ticket stub** — Permission Namespace Alignment (workspace.* → tenant.*), filed but not executed

---

## Stop Condition

Halt after validation passes. No unrelated feature work until Board validates completion report.

---

**Rev. B ready for Phase 2 execution on Board approval.**
