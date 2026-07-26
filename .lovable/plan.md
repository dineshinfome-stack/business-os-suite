## Gate 3.2.1 Pre-Flight Review — Findings

Every item on the checklist was verified against the code and the live database. Result: **PASS (5/5), one observation.**

### 1. Interface-only dependencies — PASS
`orchestrator/context.ts` accepts `ProvisioningProvider` as a **type-only** import. `JobRepository`, `JobWriter`, `EventSink`, `Clock` and `OrchestratorLogger` are declared as ports in `types.ts` and injected through `createContext`. No concrete implementation is constructed anywhere in the core.

### 2. No infrastructure imports — PASS
A full scan of `src/lib/provisioning/orchestrator/` found zero imports of Supabase clients, `@/integrations/*`, `fetch`, HTTP clients, `createServerFn`, or any provider SDK. The only imports are sibling orchestrator modules and the Gate 3.1 domain foundation.

### 3. Optimistic concurrency tested — PASS
`__tests__/concurrency.test.ts` covers: expected-state mismatch aborting the transition, `expectedState` being sent on every transition, a step already claimed by another worker, a vanished job, and a job belonging to a different tenant.

### 4. `tenants.provisioning_status` never written — PASS
No write path references the column; the only occurrences are invariant comments and the guard test in `idempotency.test.ts`. The database confirms the trigger `trg_provisioning_jobs_sync_tenant_status` (running `private.fn_sync_tenant_provisioning_status`) is live on `provisioning_jobs`, so the column remains derived.

### 5. Retry and rollback delegated — PASS
`executor.ts` calls `shouldRetry` from `../retry`; `orchestrator.ts` calls `evaluateRollbackEligibility` and `buildRollbackPlan` from `../rollback`. No backoff arithmetic, no jitter computation and no plan-ordering logic is duplicated inside the orchestrator.

### Observation (non-blocking)
`orchestrator/logger.ts` imports the concrete `platformLogger`. This is an adapter, not core — no core module imports it, and the core depends only on the `OrchestratorLogger` port. It is correct as designed, but nothing currently *prevents* a future edit from importing a Supabase client into the core the same way.

---

## Proposed Work (small, closes the one gap)

### A. Automated architecture boundary test
Add `src/lib/provisioning/orchestrator/__tests__/boundaries.test.ts` that reads every non-test file in the orchestrator directory and asserts:
- no import matching `supabase`, `@/integrations`, `axios`, `node-fetch`, `createServerFn`, or a provider SDK
- no bare `fetch(` call
- no write payload key or string referencing `tenants.provisioning_status`
- `logger.ts` is the only file permitted to import outside `src/lib/provisioning/`

This turns four of the five checklist items into a permanent regression guard rather than a one-off manual review.

### B. Certification record
Add a short "Gate 3.2.1 Pre-Gate-3.2.2 Compliance Review" section to `docs/60-engineering/PHASE3_GATE321_ENGINEERING_SUMMARY.md` recording the five checks, the evidence for each, the observation above, and the boundary test as the standing control.

### Out of scope
No changes to orchestrator behaviour, no database changes, no provider or persistence adapters, no UI. Gate 3.2.2 remains unauthorised until you say so.

### Technical detail
The boundary test uses `fs.readdirSync`/`readFileSync` over `__dirname/..` under Vitest's Node environment — no new dependency. Expected result: 173 tests passing, typecheck and build clean.
