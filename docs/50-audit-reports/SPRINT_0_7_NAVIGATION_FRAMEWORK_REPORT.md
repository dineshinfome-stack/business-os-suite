---
title: Sprint 0.7 — Navigation Framework — Closure & Verification Report
sprint: 0.7
status: VERIFIED
verdict: PASS
generated: 2026-07-23
scope: Navigation Framework (registry, tree, sidebar, breadcrumbs, favorites, recent pages, palette, module launcher, preferences)
---

# Sprint 0.7 — Navigation Framework Closure & Verification Report

## Executive Verdict

**PASS** — 0 FAIL, 0 HIGH, 0 CRITICAL. 2 WARN (pre-existing, accepted).
Recommend state transition: `READY_FOR_SPRINT_0_7` → `SPRINT_0_7_VERIFIED` → `READY_FOR_SPRINT_0_8`.

## Verification Matrix

| # | Item | Result | Evidence |
|---|------|--------|----------|
| 1 | Registry stable-id contract (`NAV_ID_REGEX`, uniqueness, `id_status`) | PASS | `src/lib/navigation/registry.ts:58,143-156,159-171`; `registry.test.ts` 6/6 PASS |
| 2 | Permission/feature-flag references resolvable | PASS | `permission: "settings.security.manage"` present in `src/lib/generated/permission-keys.ts`; registry test asserts type-safe key |
| 3 | Tree build + `matchRoute` + `MAX_BREADCRUMB_DEPTH=20` + cycle guard | PASS | `src/lib/navigation/tree.ts`; `useBreadcrumbs` walks parent chain with depth cap |
| 4 | RBAC & feature-flag filtering (`filterNavForUser`) | PASS | `src/lib/navigation/permissions.ts:13-29` — drops retired, invisible, missing permission/flag |
| 5 | Identity vs routing separation (`nav_id` never used as URL) | PASS | Registry contract documented `registry.ts:5-23`; hooks resolve `route` via `getNavItem()` before navigation |
| 6 | Sidebar registry-driven + expand/collapse persisted | PASS | `AppSidebar.tsx` consumes `useNavigation()`; `nav_user_preferences.expanded_groups` upsert via `setNavPreferencesFn` |
| 7 | Preference reconciliation (drops retired/unknown ids on read) | PASS | `preferences.functions.ts:41-56` — `partitionByActive` + one-shot re-upsert |
| 8 | Favorites add/remove/reorder + retired prune | PASS | `favorites.functions.ts:18-105`; `retired.ts:30-58` `pruneRetiredNavIds` fire-and-forget |
| 9 | Recent Pages route-keyed, cap 10, drops unresolved routes | PASS | `recent-pages.functions.ts:20-88`; `findByRoute` gate on read+write; slice(10) prune |
| 10 | Command palette `⌘K`/`Ctrl+K` open, history UPSERT dedupe, cap 8, no query text stored | PASS | `useCommandPalette.tsx` keybinding; `command-history.functions.ts:45-77` UPSERT + slice(8); schema stores `nav_id` only (no query column) |
| 11 | Module launcher grid/list toggle persisted | PASS | `module_launcher_view` in `NavPreferencesSchema` (`preferences.functions.ts:12-16`); `useModuleLauncher` |
| 12 | Registry health warn thresholds | PASS | `MAX_CHILDREN_PER_MODULE=25`, `MAX_TOTAL_ITEMS=400` (`registry.ts:61-62`); test asserts thresholds |
| 13 | Database: 4 tables + 16 RLS policies + updated_at triggers | PASS | `information_schema` → nav_command_history, nav_favorites, nav_recent_pages, nav_user_preferences; `pg_policies` → own-scoped SELECT/INSERT/UPDATE/DELETE per table |
| 14 | Regression — Auth / Tenancy / RBAC / Settings smoke | PASS | `bunx vitest run` → 8/8 tests pass (2 suites); typecheck clean |
| 15 | Build & type health | PASS | `bunx tsgo --noEmit` exit 0; `bunx vitest run` exit 0 |
| 16 | Supabase linter delta | WARN (accepted, pre-existing) | 2 SECURITY DEFINER warns → documented `Accepted by Design` in Sprint 0.4B; 1 Leaked Password Protection → user-deferred (security memory) |

## Evidence Details

### Database introspection

```
public.nav_command_history      (5 cols, 4 policies)
public.nav_favorites            (7 cols, 4 policies)
public.nav_recent_pages         (6 cols, 4 policies)
public.nav_user_preferences     (6 cols, 4 policies)
```

All four tables enforce per-user + per-organization RLS. `nav_command_history` schema contains only `nav_id` + `invoked_at` — confirming palette **never persists query text** (spec requirement).

### Test output

```
✓ src/__tests__/smoke.test.ts (2 tests) 5ms
✓ src/lib/navigation/__tests__/registry.test.ts (6 tests) 9ms
Test Files  2 passed (2)
     Tests  8 passed (8)
```

### Typecheck

`bunx tsgo --noEmit` → exit 0 (no diagnostics).

### Retired-id lifecycle

- Read filter: `partitionByActive(rows)` in `favorites.functions.ts:29`, `command-history.functions.ts:32`, `preferences.functions.ts:42`.
- Write prune: `pruneRetiredNavIds()` invoked fire-and-forget (`void`) with try/catch swallow — non-blocking.
- Route-keyed surface (`recent_pages`) uses `findByRoute()` instead of registry id (per spec §1.2 exception).

## Regressions

None detected. Auth, Tenancy (`OrgProvider`), RBAC (`PermissionsProvider` + `<Can>`), and Settings surfaces unchanged; existing tests pass.

## Outstanding Items (Non-blocking)

| Item | Severity | Disposition |
|------|----------|-------------|
| SECURITY DEFINER helpers in `private` schema | WARN | Accepted-by-design (Sprint 0.4B report) |
| Leaked Password Protection disabled | WARN | User-deferred (security memory) |

## Recommended Transition

Advance repository state:

```
READY_FOR_SPRINT_0_7  →  SPRINT_0_7_VERIFIED  →  READY_FOR_SPRINT_0_8
```
