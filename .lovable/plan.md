# Sprint 0.6 — Settings Foundation: Closure & Verification Gate

Read-only verification pass. No feature work, refactors, governance additions, or architecture changes. Only file writes are the verification report and (conditionally) the repository state marker.

## Scope of verification

Ten checklist domains from the closure prompt:
1. Database (migration 009, tables, enums, constraints, indexes, RLS, policies, seeds)
2. Resolution engine (`resolveSetting`, `getSetting`, `getSettings`, `getEffectiveSettings`, `setSetting`, `resetSetting`) and Default → Platform → Org precedence
3. Validation (required, enum, regex, numeric range, JSON) rejected server-side
4. RBAC (`settings.view`, `settings.update`, `settings.security`, `platform.settings.manage`)
5. Sensitive settings (redaction, gated reveal, no plaintext in audit)
6. Feature flags (platform default, org override, effective resolution, cache refresh)
7. React framework (`useSetting`, `useSettings`, `useUpdateSetting`, `useResetSetting`, `useFeatureFlag` — loading/error/invalidation/org switch)
8. Demonstration surface `/settings/platform` framed as temporary
9. Regressions (auth, tenancy, org context, RBAC, audit, navigation, shared components)
10. Build validation (`bunx tsgo --noEmit`, lint, security findings, tests if any)

## Method (read-only)

- Read migration `009_settings_foundation` plus any follow-up migrations touching `setting_definitions`, `setting_values`, `feature_flags`.
- Query live DB (read-only) for: table existence, RLS status, policy list, seed row counts, permission rows, enum types.
- Read `src/lib/settings.functions.ts`, `src/lib/settings-validation.ts`, `src/lib/feature-flags.functions.ts` to confirm the six engine functions, precedence order, validation branches, sensitive-value redaction, and audit call sites.
- Read `src/hooks/settings/*` and `src/components/settings/*` and `src/routes/_authenticated/settings.platform.tsx` for hook surface and demo-surface framing.
- Grep for regressions: `requireSupabaseAuth`, `OrgProvider`, `PermissionsProvider`, `<Can>`, audit_logs writers.
- Run `bunx tsgo --noEmit` and existing test suite; pull current security scan results.

Each item is recorded as PASS / WARN / FAIL with a concrete evidence pointer (file:line, SQL result, or command output). Any spec item that cannot be evidenced is recorded as FAIL, not silently promoted.

## Note on hook naming

The prompt lists `useUpdateSetting` / `useResetSetting`; the codebase currently exports `useSetSetting` / `useDeleteSetting`. This will be recorded as a WARN (naming drift from spec, functionally equivalent) rather than treated as a blocker — no code change in this gate.

## Deliverable

Overwrite `docs/50-audit-reports/SPRINT_0_6_SETTINGS_FOUNDATION_REPORT.md` with the closure report:

- **Metadata**: Sprint, verification date, repo state before/after, reviewer, overall result.
- **Verification Table**: one row per checklist item — Check | Result | Evidence | Action.
- **Summary**: PASS / WARN / FAIL counts; enumerated warnings and failures.
- **Conclusion**: closure statement if clean, otherwise blocker list.
- **Repository State**: advance to `READY_FOR_SPRINT_0_7` only if zero FAILs and zero HIGH/CRITICAL security findings; otherwise keep current state and emit a remediation list.

## Reusable closure template

Note in the report's preamble that this structure (metadata → verification table → PASS/WARN/FAIL summary → conditional state advancement) is the standard Sprint Closure Gate for subsequent engineering sprints (0.7+); only the checklist items change per sprint.

## Chat response

Return: verification summary, PASS/WARN/FAIL counts, resulting repository state, remaining blockers (if any), and a recommendation on whether Sprint 0.6 can be officially closed.
