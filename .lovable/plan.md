## Pass 3.8.1 — Contract Co-location Closure

Verified in code: both concepts exist and are exported — co-located, not omitted.

| Required contract | Actual export | File |
|---|---|---|
| Blocker DTO | `TenantOnboardingBlockerDTO`, `OnboardingBlockerSeverity` | `types/v1/onboarding-progress.dto.ts` |
| Filter DTO | `OnboardingListFilterDTO` | `types/v1/onboarding-page.dto.ts` |

### Remediation

1. Add a "Contract Co-location Record" to `PHASE3_GATE38_ONBOARDING_MATRIX.md`: blockers co-located with progress contracts; filters with the page contract, mirrored by `onboardingListFilterSchema`.
2. Add `export type TenantOnboardingFilterDTO = OnboardingListFilterDTO;` in `types/v1/onboarding-page.dto.ts`. Type-only — no runtime artifact, no duplicate interface. Verify propagation through `types/v1/index.ts → types/index.ts → src/lib/tenant-onboarding/index.ts`.
3. Add type-level public-import assertions for both spec-named identifiers.
4. Re-run typecheck, full suite, production build; all 481 existing tests stay green.
5. Append to `PHASE3_GATE38_PASS381_COMPLETION_REPORT.md`, leaving the original evidence intact:

```text
## Amendment — Contract Co-location Closure
Date / Reason / Files modified / Type alias added /
Documentation record added / Tests updated / Final test count /
Typecheck / Production build / Net generated-file changes
```

Record `Pass 3.8.1 — COMPLETE AND CLOSED`. Discovery immutable; financial-year trigger deferred to 3.8.5.

## Pass 3.8.2 — Persistence, RLS and Read Models

### Persistence

Only `tenant_onboarding` and `tenant_onboarding_steps`. No readiness, activity, blocker or step-definition tables.

- `tenant_onboarding.tenant_id → tenants.id`, unique per tenant. No organization FK.
- `tenant_onboarding_steps.tenant_onboarding_id → tenant_onboarding.id`; parent-scoped unique `(tenant_onboarding_id, step_key)`.
- **Step-parent tenant integrity** — if `tenant_id` is retained on step rows, enforce it in the database: unique `(id, tenant_id)` on `tenant_onboarding` plus composite FK `(tenant_onboarding_id, tenant_id) → tenant_onboarding(id, tenant_id)`. Trigger only if the repository database standard prefers it. Never application-only. If not retained, scoping and RLS derive through `tenant_onboarding`.
- The step constraint validates the approved `(step_key, sequence)` **pair**.
- State/status CHECKs, optimistic-concurrency version, timestamps, indexes.
- Follow the pre-seed vs. lazy decision already recorded in the onboarding matrix.

Order: tables/constraints → indexes → enable (and force where required) RLS → policies → grants → automated inspection.

### RLS and grant matrix (read-only pass)

| Role | Pass 3.8.2 privileges | RLS expectation |
|---|---|---|
| anon | none | no access |
| authenticated | SELECT only | existing platform permission required |
| authenticated tenant member | no visible rows | denied |
| authenticated non-platform user | no visible rows | denied |
| service_role | SELECT only | trusted operational role |

No `GRANT ALL`; no INSERT/UPDATE/DELETE in this pass. Write privileges land in Pass 3.8.3 with command services, optimistic-concurrency writes, idempotency, command authorization and write-path tests. Migration and integration fixtures use the repository's approved database-owner / test-administration mechanism. If a repository standard already mandates service-role DML on application tables, cite it and justify the exception in both migration and report.

Policies reuse the canonical platform-permission helper — no hard-coded roles, IDs or emails, no second permission function. Inspection asserts table privileges, sequence privileges, RLS enabled, RLS forced where required, policy command/role targets, and absence of anon and write grants.

### Caller-scoped read authorization

```text
queries.functions.ts
  -> authentication
  -> PLATFORM_TENANT_READ (or repository-approved equivalent)
  -> caller-scoped authenticated client (RLS under caller JWT)
  -> RLS permission policy
  -> query-service.server.ts
```

The query facade never uses the service-role client. No new permissions.

### Activity authorization

Queue, detail, steps, progress, blockers and the unevaluated readiness contract require the existing platform tenant-read permission. Audit-derived activity additionally requires the repository's canonical platform audit-view permission (e.g. `PLATFORM_AUDIT_VIEW`) where that is the existing guard on global audit data.

Preferred design — separate query:

```text
getTenantOnboardingDetail   -> PLATFORM_TENANT_READ
getTenantOnboardingActivity -> PLATFORM_TENANT_READ + PLATFORM_AUDIT_VIEW
```

If the repository has no such canonical permission, use the alternative: the detail response carries step-derived activity only, and the DTO explicitly marks audit-derived entries as omitted — never implying the history is complete.

Do not relax `audit_logs` RLS, grant audit access through `PLATFORM_TENANT_READ`, create a duplicate audit permission, query audit logs with the service-role client, or fail the whole detail read when the caller lacks audit-view.

### Queue eligibility

The queue begins from the tenant population approved in the onboarding/readiness matrices. The query service explicitly defines treatment of every lifecycle state — created, active, suspended, maintenance, archived, pending deletion, deleted — none silently omitted. Deleted tenants produce no synthetic workflow unless an approved operational requirement demands historical visibility. Archived and pending-deletion tenants are included, excluded or marked non-actionable per the approved lifecycle policy, decided in the query service, never inferred by mapper or UI.

### Synthetic (unpersisted) reads

- No row ⇒ synthetic, non-persisted `not_started` DTO; the query path never inserts.
- Detail reads return canonical steps in `not_started` from the TypeScript registry.
- No database error for a legitimate `not_started` tenant.

**Workflow identity:** no fabricated onboarding UUID (never zero/random), version, timestamps or persisted-source claim. Real tenant ID; onboarding ID null/absent; state `not_started`; version null or a documented non-persisted value; `persisted: false` only if the DTO supports or formally adds it; timestamps null.

**Step identity:** no fabricated step-row IDs, onboarding IDs, versions, correlation IDs, timestamps or persisted-source claims. Allowed: canonical step key, canonical sequence, approved display label, `not_started` status, required/conditional classification, null/absent persistence metadata.

Where v1 cannot express either case, apply the smallest backward-compatible amendment, document it in the onboarding matrix, and test it before writing the mapper.

### Queue projection and pagination

```text
authorized tenants
  LEFT JOIN tenant_onboarding
  -> derive persisted state or not_started
  -> filter -> count -> sort -> paginate -> map to v1 DTO
```

Search, filtering, sorting, totals and pagination apply to the combined projection. Never paginate persisted rows first and append synthetic tenants, compute totals from `tenant_onboarding` alone, or synthesize in the browser.

### Read layer

```text
queries.functions.ts -> query-service.server.ts -> database projection
  -> mappers.server.ts -> types/v1
```

Add `query-service.server.ts`, `mappers.server.ts`, `queries.functions.ts`. No command service, no repository file. Capabilities: queue, filters, pagination, detail, steps, progress, derived blockers, composed activity, readiness. The mapper — not SQL — owns DTO conversion.

**Activity timeline** from step fields (`started_at`, `blocked_at`, `completed_at`, and `updated_at` only where it is an approved event) plus allow-listed audit actions limited to tenant onboarding, provisioning, tenant lifecycle, organization bootstrap, branch bootstrap and administrator invitation. Every audit record correlates to the requested tenant via an authoritative tenant identifier — never an unrestricted audit browser. Stable source discriminator and source ID, deterministic ordering, de-duplication by `(source, sourceId, eventType)`, sanitized summaries, no raw `audit_logs.metadata`, documented as not a complete retry history.

**Readiness** always `{ evaluationStatus: 'not_evaluated', overallStatus: null, evaluatedAt: null, checks: [], blockingCount: 0, warningCount: 0 }` (or the exact v1 equivalent).

### Architecture boundary evolution

Update `architecture.test.ts` to allow-list exactly `query-service.server.ts`, `mappers.server.ts`, `queries.functions.ts`, while continuing to enforce that `contracts.ts`, `state-machine.ts`, `schemas.ts`, `query-keys.ts`, `required-settings.registry.ts` and `types/v1/**` import no server, database, Supabase, env, route or UI module. Pure contracts never import the read layer; direction as diagrammed; no command-service or repository file.

Mapper boundary: `mappers.server.ts` must not export raw database-row types or return raw rows from any public function; every public mapper result is a v1 DTO or an explicit internal mapping result that is not barrel-exported. Importing private projection types is permitted.

### Authorization-scope tests

- Platform administrator with the approved global permission reads all tenants the platform authorization model permits.
- Authenticated non-platform user cannot list or read onboarding data.
- Tenant organization member receives no rows merely by membership.
- Detail request outside the caller's authorized platform scope returns the repository-standard denied or not-found result.
- Queries never broaden scope beyond the authorized tenant projection.
- Tenant-read without audit-view: core onboarding data allowed; audit-derived entries denied or omitted.
- Tenant-read plus audit-view: allow-listed, tenant-correlated audit events included.
- Audit-view without tenant-read: onboarding detail denied. Neither: denied.
- No service-role client in either normal read path.

No tenant-scoped platform administrator is invented if the repository lacks that concept.

### Other tests

Migration validation and repeatability; grant/RLS/policy/sequence inspection including absence of write grants; step-parent integrity rejects mismatch; step-key parity (every TS key in SQL, no extra SQL key, matching sequences, unique, contiguous where required); synthetic workflow and step identity; queue eligibility per lifecycle state; pagination across mixed persisted/synthetic pages; activity allow-list and tenant correlation; DTO sanitization; readiness pinned; typecheck, build, full regression.

### Completion evidence

Author `docs/60-engineering/PHASE3_GATE38_PASS382_COMPLETION_REPORT.md` covering: migration and repeatability evidence; final table, constraint and index inventory; exact grants and RLS policies; authorization test matrix; any synthetic-identity DTO amendments; files created and modified; final build, typecheck and test results; protected-path review; known limitations; confirmation Pass 3.8.3 was not started.

### Excluded

Start/resume commands, bootstrap and invitation mutations, readiness evaluation, activation, audit writes, notification writes, routes, UI, tenant-member access, new permissions, readiness/activity/blocker tables, any write grant, any `audit_logs` RLS change. Hard stop before Pass 3.8.3.
