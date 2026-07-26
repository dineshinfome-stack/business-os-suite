# Phase 3 — Gate 3.2.0: Orchestrator Readiness & Repository Discovery

Documentation-only gate. One new file; no runtime, schema, or route changes.

## Deliverable

`docs/60-engineering/PHASE3_GATE32_READINESS_REPORT.md`

## Discovery to perform (read-only)

1. **Architecture** — verify ADR-017, ADR-018, ADR-019 are all `Accepted` in the ADR files and `docs/11-adrs/ADR_INDEX.md`.
2. **Prior reports** — confirm Gate 3.1 closure via `PHASE3_DISCOVERY_REPORT.md`, `PHASE3_IMPLEMENTATION_PLAN.md`, `PHASE3_GATE31_ENGINEERING_SUMMARY.md`.
3. **Provisioning module** — read all files in `src/lib/provisioning/` (constants, types, lifecycle, retry, rollback, validators, provider, events, errors, status, index) and confirm purity: no provider SDK, no HTTP, no Supabase/IO imports, no infrastructure.
   Note: `index.ts` exists; confirm its export surface is complete and leak-free.
4. **Database** — query the live schema for `provisioning_jobs` / `provisioning_steps`: columns, indexes, partial unique index (one active job per tenant), RLS policies, triggers (derived `tenants.provisioning_status`, step duration), constraints. Record whether any schema change is required for 3.2.1 (expected: none).
5. **Reuse survey** — read `src/lib/tenants/` (lifecycle, events, audit, registry, slug, tenants.functions), `src/lib/platform/` (config, constants, logger, metadata, types), `src/lib/navigation/`. Note: there is no `src/lib/events/` directory — events live in `src/lib/tenants/events.ts` and `src/lib/provisioning/events.ts`; the report will document this correction.
6. **Dependency review** — trace import graphs to confirm no cycles, no forbidden imports (provisioning must not import server functions or Supabase clients), and no duplicated lifecycle / retry / rollback / status-mapping / validator logic between `tenants` and `provisioning`.
7. **Test baseline** — record current Vitest count and pass state as the Gate 3.2 starting line.

## Report contents

- Repository discovery findings (per section above, with file paths)
- **Reuse matrix**: asset → reuse directly / adapter required / must not modify, with rationale
- **Dependency graph** (ASCII): provisioning domain → provider interface → (no implementation)
- **Orchestrator ownership boundary**: owns job loading, validation, step coordination, state persistence, event emission, retry/rollback coordination, completion; does NOT own provider impl, infrastructure, secrets, dashboard, routes, server functions, workers, queues, cron, realtime
- **Risk register**: Critical / High / Medium / Low with mitigations (expected themes: derived-status invariant D1, transaction boundary vs. provider calls, idempotency keys, resume-after-crash, correlation ID propagation, concurrency single-active-job enforcement)
- **Implementation checklist** for Gates 3.2.1–3.2.4
- **Testing checklist**: happy path, provider failure, retry, rollback, resume, idempotency, correlation IDs, event ordering, concurrency, duplicate-execution prevention
- **Definition of Done** for Gate 3.2
- **Authorization recommendation**: GO / GO WITH OBSERVATIONS / STOP

## Stop rule

Publish the report, then stop. No orchestrator, provider, execution engine, or dashboard work until you authorize Gate 3.2.1.
