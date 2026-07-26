---
title: "ADR-018 — Tenant Provisioning Architecture"
summary: "Defines the provisioning contract for dedicated-database-per-tenant: platform vs tenant database responsibilities, provisioning lifecycle, secrets management, migration strategy, failure recovery, deprovisioning, backup/DR, and operational ownership."
layer: "architecture"
owner: "Platform Architecture"
status: "accepted"
updated: "2026-07-26"
version: "1.0"
tags: ["adr", "architecture", "provisioning", "multi-tenant", "infrastructure", "secrets"]
document_type: "ADR"
category: "Data / Architecture"
supersedes: ""
superseded_by: ""
related_adrs: ["ADR-011", "ADR-014", "ADR-017", "ADR-030", "ADR-032"]
---

# ADR-018 — Tenant Provisioning Architecture

## Status

Accepted — Approved by the Architecture Review Board during Phase 3 Gate 3.0. Effective Date: **2026-07-26**.

All Gate 3.0 review comments are resolved or explicitly recorded as future work in `PHASE3_IMPLEMENTATION_PLAN.md`; no High or Critical architecture findings remain open. Implementation of any part of this decision still requires the separate gate authorizations described in `PHASE3_IMPLEMENTATION_PLAN.md`.

## Context

**ADR-017** established that every Tenant owns exactly one dedicated database, that the Platform database stores platform metadata only, and that business data exists only inside Tenant databases. ADR-017 deliberately did **not** author provisioning tooling, connection routing, backup topology, or secrets handling; it deferred those to a later decision.

Phase 2 (SPR-MOD-001-001) delivered and certified the **Tenant Registry** — metadata only. A registry row can be created, edited, searched, and moved through the tenant lifecycle (`created → active → suspended → archived`), but no infrastructure is created for it. The registry therefore describes tenants that do not yet have a database.

Provisioning is the highest-risk capability in the platform because it simultaneously crosses application code, cloud infrastructure, secrets management, database migration, and external provider APIs. Without a ratified contract, the Provisioning Engine risks encoding vendor assumptions, leaking infrastructure credentials into application code, or coupling tenant lifecycle to infrastructure lifecycle in ways that cannot be reversed.

This ADR fixes the contract before any provisioning code is written.

## Decision

### 1. Two Lifecycles, Explicitly Separated

Tenant lifecycle (business state) and provisioning lifecycle (infrastructure state) are **distinct state machines** that reference each other but never merge.

| Concern | State machine | Owner | Source of truth |
| --- | --- | --- | --- |
| Is this tenant a live customer? | `created / active / suspended / archived` | Tenant Registry | `public.tenants.lifecycle_state` |
| Does this tenant have working infrastructure? | Provisioning states (below) | Provisioning Engine | provisioning job table (Platform DB) |

A tenant may be `active` in the registry while its provisioning job is `failed`; the platform must render that discrepancy rather than hide it. Conversely, a `completed` provisioning job does not by itself activate a tenant — activation stays an explicit registry transition.

### 2. Provisioning Lifecycle

```text
pending
  → validating
  → queued
  → provisioning_infrastructure
  → running_migrations
  → seeding
  → creating_admin
  → verifying
  → completed

Failure paths (reachable from any in-flight state):
  → failed        (terminal until retried)
  → retrying      (re-enters the failed step)
  → rolled_back   (terminal; infrastructure destroyed, tenant left unprovisioned)
  → cancelled     (terminal; operator abort before or between steps)
```

Invariants:

1. **Every transition is persisted and audited.** No in-memory-only state. Workers are stateless; a job's state must be fully reconstructible from the Platform database.
2. **Every step is idempotent.** A step re-executed after a crash must converge to the same result rather than duplicate infrastructure.
3. **Forward-only progress.** A job never skips a step; `retrying` re-enters the step that failed, it does not restart the job.
4. **Terminal states are terminal.** `completed`, `rolled_back`, and `cancelled` are not re-enterable; a new attempt is a new job.
5. **Each step records the provider-side identifiers it created**, so rollback has something concrete to destroy.

### 3. Retry and Rollback Policy

- **Retry** applies to transient failures (network, provider rate limit, provider 5xx). Bounded attempts with exponential backoff; the attempt count and last error are persisted on the job.
- **Retry does not apply** to validation failures, quota/entitlement rejections, or authorization failures. Those move directly to `failed`.
- **Rollback** is invoked when the retry budget is exhausted or an operator requests it. It destroys provider resources in reverse creation order, using recorded provider identifiers, and lands the job in `rolled_back`.
- **Rollback is best-effort but never silent.** A rollback that cannot destroy a resource records the orphaned resource identifier for operator remediation instead of pretending success.
- **Rollback never deletes the tenant registry row.** The registry row is platform metadata and outlives failed infrastructure attempts.

### 4. Platform Database vs Tenant Database Responsibilities

Extends the ADR-017 table with provisioning concerns.

| Concern | Platform Database | Tenant Database |
| --- | --- | --- |
| Provisioning job records, state, attempt counts, step timings | ✔ | — |
| Provisioning step logs and error payloads | ✔ | — |
| Recorded provider resource identifiers (for rollback) | ✔ | — |
| Tenant → database connection routing metadata (non-secret) | ✔ | — |
| Tenant database credentials | — (reference only) | — (held in the secret store) |
| Applied migration ledger for the tenant schema | — | ✔ |
| Seeded reference and demo data | — | ✔ |
| The tenant's initial administrator identity | — | ✔ |

The provisioning job table stores **metadata about infrastructure**, not tenant business data, and therefore does not violate ADR-017 invariant 6.

### 5. Secrets Management

1. **No infrastructure credential is ever committed to source.** Not provider management tokens, not tenant database passwords, not service-role keys.
2. Provider management credentials live in the platform secret store and are read **inside server handlers only** — never at module scope, never under a `VITE_` name, never returned from a server function.
3. **Per-tenant database credentials are generated at provisioning time**, written directly to the secret store, and referenced from the Platform database by *name only*. The Platform database stores the secret reference, never the secret value.
4. No provisioning credential is ever serialized into loader data, dashboard payloads, event envelopes, audit rows, or error messages surfaced to the browser. Error payloads are redacted before persistence.
5. Credential rotation is an operator-initiated action against the secret store plus a routing-metadata update; it never requires a code change.

### 6. Migration Strategy

- A tenant database is provisioned from a **versioned tenant schema baseline** distinct from the platform schema. Platform-only tables are never created inside a tenant database, and vice versa.
- Migrations are applied in deterministic order and recorded in an applied-migration ledger **inside the tenant database**, so each tenant's schema version is independently observable.
- Per-tenant schema-version drift is permitted during phased upgrades (ADR-017), so the platform must be able to report the schema version of every tenant and must not assume homogeneity.
- Seeding is a separate step from migration. Migration failures roll back the job; seeding failures are retryable without re-running migrations.

### 7. Failure Recovery

- Crash recovery is driven from persisted job state: on resume, an in-flight job is re-entered at its last recorded step (safe because steps are idempotent).
- A job with no progress beyond a defined staleness threshold is marked `failed` with a timeout reason rather than left in-flight indefinitely.
- Partial infrastructure is never left undocumented: either it is recorded on the job for rollback, or it is recorded as an orphaned resource for operator remediation.
- Operators can always act: retry, rollback, and cancel are available from the platform surface for any non-terminal job.

### 8. Deprovisioning Policy

- Deprovisioning is **only** reachable from the `archived` tenant lifecycle state. An `active` or `suspended` tenant cannot have its database destroyed.
- Deprovisioning is a two-phase operation: a **retention window** during which the tenant database is offline but recoverable, followed by **destruction**.
- Destruction requires an explicit, audited platform-administrator action; it is never automatic and never a side effect of an application code path.
- A final backup is taken and its location recorded before destruction.
- The tenant registry row survives deprovisioning as a historical record, with its provisioning state reflecting that infrastructure no longer exists.

### 9. Backup and Disaster Recovery

- Backup operates at **tenant-database granularity** (ADR-017 consequence). There is no platform-wide backup that spans tenant business data.
- Every provisioned tenant database has a backup policy attached at provisioning time; a tenant is not `completed` until its backup policy is verified.
- The Platform database is backed up independently, on its own schedule, because losing it loses the routing and provisioning ledger for every tenant.
- Restore is per-tenant and must not require touching any other tenant's database.

### 10. Operational Ownership

| Responsibility | Owner |
| --- | --- |
| Provisioning Engine code and state machine | Platform Engineering |
| Provider abstraction and provider implementations | Platform Engineering |
| Secret store contents, rotation, access policy | Platform Operations |
| Backup policy definition and restore drills | Platform Operations |
| Deprovisioning authorization | Platform Administration (audited) |
| Cross-tenant cost, quota, and capacity accounting | Platform Operations |
| Architectural change to this contract | Architecture Board (new ADR) |

### 11. Dependency Inversion Requirement

The orchestration layer depends on a **provider interface**, never on a concrete vendor SDK:

```text
ProvisioningProvider
  createProject()
  applyMigrations()
  seedDatabase()
  createAdmin()
  verifyHealth()
  destroyProject()
```

The first and currently only implementation targets Supabase. No orchestration code, domain code, UI code, or audit code may import a vendor SDK directly. This keeps the vendor decision reversible without redesigning the engine.

## Non-Goals

- This ADR names no cloud region, no provider API version, no replication topology, and no pricing tier.
- This ADR authorizes no schema migration, no code change, and no infrastructure creation.
- This ADR does not change the tenant lifecycle state machine ratified in Phase 2.
- This ADR does not introduce cross-tenant querying of business data; ADR-017 invariant 7 stands.

## Consequences

**Positive**

- Provisioning has a stable contract before implementation, reducing redesign risk on the highest-risk capability in the platform.
- Vendor lock-in is bounded to one implementation module by the dependency-inversion requirement.
- Secrets have an explicit, auditable handling rule that precedes the code that will need them.
- Failure is a first-class modelled outcome rather than an exception path discovered in production.

**Neutral**

- The two-lifecycle separation means the platform must render both states; a single "tenant status" column in the UI is no longer sufficient.
- Idempotency requirements make each provisioning step more expensive to implement than a naive imperative script.

**Negative**

- Per-tenant backup, monitoring, and cost accounting increase operational surface area proportionally to tenant count.
- The retention window before destruction carries ongoing storage cost for archived tenants.

## Alternatives Considered

1. **Implement provisioning directly against the Supabase management API with no abstraction.** Rejected — makes the vendor decision irreversible and puts vendor error semantics into the domain layer.
2. **Fold provisioning state into the existing tenant lifecycle state machine.** Rejected — conflates business state with infrastructure state; a suspended-for-nonpayment tenant and a tenant whose migration failed are operationally unrelated situations.
3. **Fire-and-forget provisioning with no persisted job record.** Rejected — stateless workers cannot recover in-flight work, and partial infrastructure would become invisible.
4. **Store tenant database credentials in the Platform database.** Rejected — creates a single high-value target whose compromise defeats the isolation ADR-017 exists to provide.
5. **Automatic destruction on archive.** Rejected — irreversible data loss triggered by a routine business-state change.

## References

- `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`
- `docs/11-adrs/data/ADR-011-multi-tenant-isolation.md`
- `docs/11-adrs/data/ADR-014-audit-strategy.md`
- `docs/11-adrs/security/ADR-030-authentication-model.md`
- `docs/11-adrs/security/ADR-032-rbac-abac.md`
- `docs/60-engineering/PHASE3_DISCOVERY_REPORT.md`
- `docs/60-engineering/PHASE3_IMPLEMENTATION_PLAN.md`
- `docs/60-engineering/PHASE2_FINAL_CERTIFICATION.md`
- `docs/15-governance/TENANCY_STANDARD.md`
