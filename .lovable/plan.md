# Sprint 0.7 — Closure & Verification Gate

Execute a formal verification pass against the approved v7 specification and produce `docs/50-audit-reports/SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT.md`. No feature code changes; remediation only if a FAIL surfaces.

## Scope

Verify every v7 exit-gate item with concrete evidence (file:line references, DB introspection, test output, runtime probes). Report PASS / WARN / FAIL per item. Gate passes only with **0 FAIL, 0 HIGH, 0 CRITICAL**.

## Verification Checklist

1. **Registry & Stable ID Contract**
   - `nav_id` format regex, uniqueness, `id_status` enforcement, permission/feature-flag references resolve.
   - Evidence: `registry.test.ts` output + code refs.

2. **Tree & Breadcrumb Resolution**
   - `buildTree`, `matchRoute`, `MAX_BREADCRUMB_DEPTH=20`, cycle guard.
   - Evidence: unit assertions + runtime probe on `/settings/platform`.

3. **RBAC & Feature-Flag Filtering**
   - `filterNavForUser` drops items missing permission / flag / retired / invisible.
   - Evidence: run as `member@demo.test` vs `admin@demo.test`; capture sidebar diff.

4. **Sidebar Behavior**
   - Registry-driven render, active-state, expand/collapse, favorites & recent sections.
   - Evidence: Playwright screenshots at 1280×1800.

5. **Preference Persistence & Reconciliation**
   - `nav_user_preferences` upsert; unauthorized/retired `expanded_groups` pruned on read.
   - Evidence: DB rows before/after; inject stale id → confirm removal.

6. **Favorites**
   - Add/remove/reorder; retired-id read filter + write-time prune via `pruneRetiredNavIds`.
   - Evidence: server-fn invoke + DB inspect.

7. **Recent Pages**
   - Route-keyed, cap=10, drops unresolved routes.
   - Evidence: seed 12 rows → list returns 10; inject bogus route → dropped.

8. **Command Palette**
   - `⌘K` / `Ctrl+K` open, arrow/enter navigation, ESC close, history dedupe (UPSERT), cap=8, no query text stored.
   - Evidence: Playwright key events + `nav_command_history` schema check.

9. **Module Launcher**
   - Grid/list toggle persisted via `nav_user_preferences.module_launcher_view`.

10. **Registry Health**
    - Warn-only checks: `MAX_CHILDREN_PER_MODULE=25`, `MAX_TOTAL_ITEMS=400`.

11. **Regression Suite**
    - Auth (login/logout/session), Tenancy (org switch), RBAC (`<Can>` gates), Settings (resolution + feature flags) — smoke via Playwright + existing vitest.

12. **Build & Type Health**
    - `bunx tsgo --noEmit`, `bunx vitest run`, `supabase--linter`.

## Deliverable

`docs/50-audit-reports/SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT.md` containing:
- Per-item PASS/WARN/FAIL table with evidence links.
- Regression summary.
- Security-finding recheck.
- Final verdict + recommended state transition.

## State Transition

- All PASS (WARN allowed) → advance to **`SPRINT_0_7_VERIFIED`** then **`READY_FOR_SPRINT_0_8`**.
- Any FAIL → remain **`READY_FOR_SPRINT_0_7`**, file remediation tickets in report.
