
# SPR-PLT-0003 — Workspace Retirement: Impact Analysis

**Status:** Analysis for review. No implementation until approved.
**Decision recorded:** Workspace is removed from the domain model. New hierarchy: `Platform → Tenant → Company → Branch → Financial Year`. Tenant becomes both the isolation boundary and the business container. Existing functionality on `/workspace` (Business Profile, Branding, Team, Invitations) is preserved but relocated under a Tenant-scoped route.

---

## 1. Scope Summary

- **In scope:** ADR-008 retirement, removal of `src/lib/workspace/*`, rename of `/workspace*` routes, refactor of the navigation registry, rename of `workspace.*` permission keys, docs/glossary/diagram updates, notification-registry copy.
- **Out of scope (per user directive):** Tenant isolation model, Company/Branch/Financial-Year hierarchy, RLS policies, DB restructuring beyond permission-key rename. **MOD-018 "AI Workspace"** remains a product-module name (not part of the domain hierarchy); this refactor does **not** rename it. Flagging for confirmation in §11.

---

## 2. Decision Points Requiring Approval Before Implementation

| # | Question | Recommendation |
|---|---|---|
| D1 | New route path for `/workspace`? | `/business` (user-facing, non-jargon). Alternatives: `/tenant`, or merge into `/settings/business`. |
| D2 | Rename `workspace.*` permission keys? | Yes — rename to `business.*` (matches new route) via a DB migration + regeneration of `permission-keys.ts`. Alternative: keep DB keys as internal identifiers and only rename UI. |
| D3 | Keep `/workspace` as a redirect for a deprecation window? | Yes — 1 sprint redirect to `/business`, then delete. Invitation acceptance URL (`/workspace/accept?token=…`) must redirect since links are already in outbound emails. |
| D4 | MOD-018 "AI Workspace" module name — retain or rename? | Retain. It's a product feature name, not the domain concept. Confirm. |
| D5 | Historical audit reports, superseded ADRs, baselines — edit or preserve? | Preserve verbatim (historical record); only add supersession banners where already-live ADRs reference Workspace as current architecture. |

---

## 3. Governance / Documentation Impact

### 3.1 ADRs
- **Supersede:** `docs/11-adrs/architecture/ADR-008-platform-tenant-workspace-hierarchy.md` → mark `status: superseded`, add pointer to ADR-009.
- **New:** `docs/11-adrs/architecture/ADR-009-workspace-retirement.md` — declares Tenant as isolation + business container; removes Workspace from vocabulary; supersedes ADR-008.

### 3.2 Architecture & Governance docs (edit to remove Workspace from live model)
- `docs/02-architecture/multi-tenant-architecture.md` — remove Workspace tier from the hierarchy diagram (mermaid), remove "Workspace" bullets.
- `docs/15-governance/TENANCY_STANDARD.md` — remove Workspace section.
- `docs/glossary.md`, `docs/GLOSSARY_INDEX.md` — remove/redirect Workspace entry.
- `docs/_meta.json` — remove sidebar entries pointing to Workspace-specific docs where they refer to the retired concept (keep MOD-018 "AI Workspace" entries).

### 3.3 Publications, baselines, PRDs (~50 files matched)
For each `docs/45-module-publications/**/MOD-*.md`, `docs/40-module-baselines/**/*.md`, `docs/60-solution-design/**/*.md`, `docs/30-sprint-prds/**/*.md`, `docs/02_Engineering_Execution_Master_Plan/**`: replace "Workspace" (as domain concept) with "Tenant" or "Business" per context. Do **not** touch:
- MOD-018 "AI Workspace" occurrences (module name).
- `google-workspace.md` (external product name).
- Historical audit reports under `docs/50-audit-reports/` dated before this sprint.

Estimated file edits: **~90 markdown files** (grep-inventoried; full list attached to the sprint report on execution).

---

## 4. Code Impact

### 4.1 Files to delete
- `src/lib/workspace/current-workspace.ts`
- `src/lib/workspace/types.ts`
- `src/lib/workspace/query-keys.ts`
- `src/lib/workspace/functions.ts`  ← **contains all server functions** for Business Profile, Branding, Team, Invitations. Must be relocated, not deleted outright.

### 4.2 Files to relocate
- `src/lib/workspace/functions.ts` → `src/lib/business/functions.ts` (or `src/lib/tenant/business-functions.ts`). Server functions (`createServerFn`) keep their signatures; only import paths change.
- `src/lib/workspace/query-keys.ts` → `src/lib/business/query-keys.ts`, top-level key changes from `"workspace"` to `"business"` (invalidates in-memory cache on deploy — acceptable).
- `src/lib/workspace/types.ts` → `src/lib/business/types.ts`.

### 4.3 Files to modify
- `src/routes/_authenticated/workspace.tsx` → move to `src/routes/_authenticated/business.tsx`, update `createFileRoute("/_authenticated/business")`, update `useSearch` paths, update all imports and the invitation link (`/workspace/accept` → `/business/accept`), replace remaining "workspace" copy strings.
- `src/routes/_authenticated/workspace.accept.tsx` → `business.accept.tsx`, same transforms.
- `src/lib/navigation/registry.ts` — rename group `workspace` → `business`, nav_ids `workspace.*` → `business.*`, routes `/workspace` → `/business`, permissions per D2.
- `src/contexts/org-context.tsx` — copy string ("Couldn't load your workspace" → "Couldn't load your business").
- `src/lib/notifications/registry.ts` — copy string.
- `src/lib/generated/permission-keys.ts` — **regenerated** from DB via `scripts/generate-permissions.ts` after the migration in §5; do not hand-edit.
- `src/routeTree.gen.ts` — regenerated by Vite plugin; do not hand-edit.

### 4.4 Optional deprecation shims (per D3)
- `src/routes/_authenticated/workspace.tsx` (thin) → `<Navigate to="/business" replace />`.
- `src/routes/_authenticated/workspace.accept.tsx` → forward `?token=…` to `/business/accept`.

---

## 5. Database Impact (only if D2 = rename)

Single migration:
```text
UPDATE public.permissions SET key = replace(key,'workspace.','business.') WHERE key LIKE 'workspace.%';
UPDATE public.role_permissions ... (via key FK if applicable)
```
Then re-run `scripts/generate-permissions.ts` to regenerate `permission-keys.ts`. No table renames, no RLS changes, no data loss. Existing role grants are preserved (rows updated in place).

If D2 = keep keys → no DB migration; only rename the TS constant symbols (`WORKSPACE_*` → `BUSINESS_*`) in the generator's mapping.

---

## 6. Routes Affected

| Old | New | Notes |
|---|---|---|
| `/workspace` | `/business` | Primary UI |
| `/workspace/accept?token=…` | `/business/accept?token=…` | Invitation email URLs in `workspace.tsx` line 444 must be updated *before* removing the redirect |
| `/workspace/*` (any deep link) | 302 → `/business/*` for one sprint | Then removed |

Outbound email invitations already sent contain `/workspace/accept?token=…` links → **redirect is mandatory**, not optional, until token TTL expires.

---

## 7. APIs Affected

No external APIs. Server functions in `src/lib/workspace/functions.ts` (`listMembers`, `listInvitations`, `getOrgProfile`, `updateOrgProfile`, `getBranding`, `updateBranding`, `getMyProfile`, `updateMyProfile`, `inviteMember`, `revokeInvitation`, `acceptInvitation`, `removeMember`) keep identical signatures; only their module path changes. No consumer outside `src/routes/_authenticated/workspace*.tsx` imports them (verified by grep).

---

## 8. Migration Strategy (2 sprints)

**Sprint 1 — Architecture refactor (behind redirects)**
1. Author ADR-009; mark ADR-008 superseded.
2. DB migration for permission-key rename (if D2=yes).
3. Regenerate `permission-keys.ts`.
4. Create `src/lib/business/*` (moved from `src/lib/workspace/*`); update imports in the two route files.
5. Create `src/routes/_authenticated/business.tsx` and `business.accept.tsx`; update navigation registry to `/business` and `business.*` nav_ids.
6. Convert old `workspace.tsx` and `workspace.accept.tsx` into redirect shims.
7. Update invitation-email URL builder to emit `/business/accept`.
8. Update primary architecture docs (multi-tenant, tenancy standard, glossary, ADR index, `_meta.json`).
9. Sprint acceptance report to `docs/50-audit-reports/`.

**Sprint 2 — Cleanup**
1. Delete `src/lib/workspace/` entirely.
2. Delete `workspace.tsx` and `workspace.accept.tsx` redirect shims (after monitoring window for stale invitation-link hits).
3. Sweep remaining ~90 docs (publications, baselines, PRDs, EEMP, catalogs) for domain-concept "Workspace" → "Tenant"/"Business". Skip MOD-018, google-workspace, historical audits.
4. Final verification (§10) and completion report.

---

## 9. Regression Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| In-flight invitation emails 404 after `/workspace/accept` removed | High if shim skipped | Keep redirect shim through longest invitation token TTL (verify TTL from `organization_invitations`); document removal date. |
| Broken bookmarks / sidebar favorites for `/workspace` | Medium | Redirect shim + `nav_favorites` migration to rewrite stored routes. |
| RBAC breaks if permission-key rename migration fails partway | Medium | Wrap rename in a single transaction; add post-migration assertion that no `workspace.*` keys remain. |
| Query-cache mismatch on deploy (users with open tabs see stale keys) | Low | Query keys change from `"workspace"` to `"business"`; on first refetch new keys populate. Acceptable. |
| `scripts/generate-permissions.ts` regenerates constants with different casing than call sites expect | Medium | Update the generator's key-to-symbol mapping in the same PR as the DB migration; run typecheck as gate. |
| Doc supersession loop (ADR-008 referenced by ADR-007) | Low | ADR-009 declares supersession; cross-link both. |
| Untouched historical audit reports still show old model | Accepted | Historical, not misleading — dated in filename. |

---

## 10. Validation / Exit Criteria

- `rg -n "workspace" src/ -g '!routeTree.gen.ts'` returns **only** MOD-018 references or empty.
- `rg -n "/workspace" src/` returns empty (or only redirect shims during Sprint 1).
- Typecheck (`tsgo`) and full test suite green.
- Navigation registry passes existing schema tests.
- DB assertion: `SELECT count(*) FROM permissions WHERE key LIKE 'workspace.%'` = 0.
- Manual: sign in, open `/business`, invite member, accept invite via new URL, remove member, update branding, update profile.
- Docs: `ADR-008` marked superseded; `ADR-009` present; `multi-tenant-architecture.md` diagram no longer shows Workspace tier.

---

## 11. Open Questions (Blocking Approval)

1. **D1** — Confirm new route: `/business` (recommended) vs `/tenant` vs merge into `/settings/business`.
2. **D2** — Confirm permission-key rename (`workspace.*` → `business.*`) with DB migration, vs keep DB keys as-is.
3. **D3** — Confirm redirect duration for `/workspace` and `/workspace/accept` (recommend: through longest active invitation-token TTL, minimum one sprint).
4. **D4** — Confirm MOD-018 "AI Workspace" module name is **retained** (it's a product feature, not domain hierarchy).
5. **D5** — Confirm historical audit reports and superseded ADRs are preserved unedited (add banners only where currently live).

---

## 12. Rollback Plan

- **Code:** Sprint 1 is fully reversible via a single revert commit — old files remain (as redirect shims) throughout Sprint 1; Sprint 2 deletion is a separate commit that can be reverted independently.
- **DB (permission-key rename):** Down-migration `UPDATE permissions SET key = replace(key,'business.','workspace.') WHERE key LIKE 'business.%'`. Included in the same migration file as an explicit rollback SQL block.
- **Docs:** Superseded ADR-008 remains in the repo; reversal is un-superseding it and reverting ADR-009. All doc edits are in git history.
- **Nav favorites migration:** Include a down-migration to rewrite `/business*` favorites back to `/workspace*` if rollback occurs before shim removal.

---

**Awaiting answers to §11 D1–D5 before I begin Sprint 1 implementation.**
