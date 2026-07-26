## Phase 3 — Provisioning Engine (Gated Structure)

I agree: no monolithic prompt. Adopting your 3.0–3.5 gate structure, with ADR-018 authored **before** 3.0 closes so the discovery plan is written against an approved architectural contract.

Verified current state (read-only): `src/lib/platform/` holds only config/constants/logger/metadata/types; `src/lib/tenants/` holds audit, events, lifecycle, registry, slug, tenants.functions; there is **no** provisioning implementation anywhere in `src/`. The only provisioning references are documentation (ADR-017, SPR-MOD-001-001, SPR-MOD-001-008). ADR-018 does not exist.

### This approval covers ONLY Gate 3.0 (documentation, zero code changes)

Deliverables:

1. `docs/11-adrs/architecture/ADR-018-tenant-provisioning-architecture.md` — Status: Proposed. Sections: Platform DB vs Tenant DB responsibilities · provisioning lifecycle · secrets management (no infrastructure secrets in source; platform-managed secret store, per-tenant connection credentials never in the client bundle) · migration strategy per tenant DB · failure recovery and rollback · deprovisioning policy · backup/DR ownership · operational ownership. Related: ADR-017, ADR-011, ADR-014, ADR-030.
2. `docs/60-engineering/PHASE3_DISCOVERY_REPORT.md` — inventory of tenant lifecycle code, reusable assets (audit writer, event envelope builder, lifecycle state machine, permissions middleware, platform logger, dashboard widget framework), a "no existing provisioning implementation" finding, and the provisioning boundary definition.
3. `docs/60-engineering/PHASE3_IMPLEMENTATION_PLAN.md` — gate-by-gate DoD, reuse matrix, stop rules, and risk register.

Stop rule: nothing under `src/` or `supabase/migrations/` is touched in 3.0.

### Subsequent gates (each needs separate authorization)

| Gate | Scope | Key output |
|---|---|---|
| 3.1 Domain Foundation | Provisioning entity, state machine (Pending → Validating → Queued → Provisioning Infrastructure → Running Migrations → Seeding → Creating Admin → Verifying → Completed; failure paths Failed/Retrying/Rolled Back/Cancelled), retry + rollback policy, validators, event contracts, repository interfaces. Migration for the provisioning job table in the Platform DB. **No infrastructure calls.** | `src/lib/provisioning/` domain + migration |
| 3.2 Orchestrator | Start/advance/status/emit/retry/rollback, depending only on the provider interface | server functions under `src/lib/provisioning/` |
| 3.3 Infrastructure Provider | `ProvisioningProvider` interface (CreateProject, ApplyMigrations, SeedDatabase, CreateAdmin, VerifyHealth, DestroyProject) + `SupabaseProvisioningProvider` behind it | provider module + secrets wiring |
| 3.4 Dashboard | Queue, active/failed jobs, retry/rollback actions, logs, progress, health — reusing the Phase 2 dashboard widget framework | widget + `/platform/provisioning` route |
| 3.5 Verification & Certification | Repository integrity, reuse, dependency, security audits; build/typecheck/tests; certification publication | `PHASE3_FINAL_CERTIFICATION.md`, `PHASE3_IMPLEMENTATION_AUDIT.md` |

### Engineering rules carried forward
Repository-first · reuse before build · documentation-first · dependency inversion · no duplicate services · no silent refactors · no infrastructure secrets in source · explicit stop rule at every gate.

### Technical notes
- Provisioning job state lives in the **Platform database** only (ADR-017 invariant 6); it is provisioning metadata, not tenant business data.
- Reuse `src/lib/tenants/lifecycle.ts` as the shape reference for the provisioning state machine rather than inventing a second pattern; reuse `src/lib/tenants/audit.ts` and `events.ts` writers rather than adding parallel ones.
- Provider credentials resolve from server-side secrets inside handlers only — never module scope, never `VITE_*`.
