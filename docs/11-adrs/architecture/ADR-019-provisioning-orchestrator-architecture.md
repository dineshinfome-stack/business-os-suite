---
title: "ADR-019 — Provisioning Orchestrator Architecture"
summary: "Defines how the Provisioning Orchestrator coordinates tenant provisioning: responsibilities, execution model, transaction boundaries, idempotency, concurrency, event flow, provider interaction, failure handling, observability and security. Coordination only — lifecycle, retry, rollback, provider contract and job schema remain owned by ADR-018 and the Gate 3.1 domain foundation."
layer: "architecture"
owner: "Platform Architecture"
status: "accepted"
updated: "2026-07-26"
version: "1.0"
tags: ["adr", "architecture", "provisioning", "orchestration", "multi-tenant", "platform"]
document_type: "ADR"
category: "Architecture / Platform"
supersedes: ""
superseded_by: ""
related_adrs: ["ADR-011", "ADR-014", "ADR-017", "ADR-018", "ADR-051", "ADR-053"]
---

# ADR-019 — Provisioning Orchestrator Architecture

## Status

**Accepted** — ratified by the Architecture Review Board on **2026-07-26**, consistent with the ADR-018 precedent. Authored during Phase 3 after Gate 3.1 (Provisioning Domain Foundation) completed and certified. This ADR is now the authoritative governing document for **Phase 3 — Gate 3.2**; no implementation exists at the time of acceptance.

## Context

**ADR-017** established the dedicated-database-per-tenant model. **ADR-018** established *what* provisioning is: the lifecycle state machine, the job and step model, retry and rollback policy, secrets posture, and the provider abstraction. **Gate 3.1** delivered that model as a pure, side-effect-free domain foundation in `src/lib/provisioning/` together with the platform-side `provisioning_jobs` / `provisioning_steps` tables and the trigger that derives `tenants.provisioning_status` from job state.

What does not yet exist is the component that *runs* a provisioning job. The domain foundation can describe a legal transition, classify an error, and produce a rollback plan, but nothing sequences steps, calls a provider, or persists progress. That coordination role is the subject of this ADR.

Business OS layers provisioning as follows:

```text
Platform (authorization, request intake)
        |
        v
Provisioning Orchestrator      <-- this ADR
        |
        v
Provider Interface (ProvisioningProvider)   <-- ADR-018 / Gate 3.1
        |
        v
Provisioning Provider (concrete, Gate 3.3)
        |
        v
Tenant Database                <-- ADR-017
```

The orchestrator owns **workflow coordination only**. Every layer above and below it is already decided elsewhere; this ADR fixes the contract of the middle layer so Gate 3.2 has no open architectural questions.

## Decision

A single Provisioning Orchestrator component coordinates all tenant provisioning. It is invoked by the Platform layer, consumes the Gate 3.1 domain model, and reaches infrastructure exclusively through the `ProvisioningProvider` interface.

### The orchestrator SHALL

- Validate every provisioning request using the domain validators before any state is created.
- Create the provisioning job and its step records as the durable record of intent.
- Execute lifecycle steps in the canonical order defined by the domain foundation.
- Invoke the Provider interface to perform the work of each step.
- Persist progress — job state, step status, attempt counts, timings, provider resource references — after every step.
- Emit provisioning events using the existing event contracts.
- Update the provisioning job as the single source of truth for job state.
- Detect failures and record them as serialized error records.
- Consult the retry policy and the rollback planner for their decisions, and act on the answers.
- Mark terminal completion, failure, rollback or cancellation.

### The orchestrator SHALL NOT

- Implement provider APIs or contain any vendor-specific behaviour.
- Know Supabase, Postgres provisioning, or any infrastructure detail of a target platform.
- Create dashboards, pages, widgets, or any presentation surface.
- Contain retry logic — it asks the retry policy and obeys the decision.
- Own lifecycle definitions — legal transitions belong to the domain lifecycle module.
- Own the rollback policy — it executes a plan it did not author.
- Define or extend the job schema, the event envelope, or the provider contract.

The orchestrator is therefore a thin, deterministic coordinator: all *policy* is imported, all *side effects* are delegated, and what remains is sequencing and persistence.

## Execution Model

Happy path:

```text
Provisioning Request
        |
        v
   Validation
        |
        v
   Job Creation
        |
        v
  Step Execution  <-------------+
        |                       |
        v                       |
   Persist State                |
        |                       |
        v                       |
    Emit Event                  |
        |                       |
        v                       |
     Next Step  ----------------+
        |
        v
     Complete
```

Failure path:

```text
Step Failure
        |
        v
  Persist Error
        |
        v
 Retry Decision  --- retry --> Step Execution
        |
    no retry
        |
        v
Rollback Decision
        |
        v
  Final State
```

Each iteration of the loop handles exactly one step. The orchestrator never batches steps, never executes steps out of sequence, and never advances past a step whose result has not been durably persisted.

## Transaction Boundaries

- **One database transaction per orchestration step.** A step's state write, step record write and event emission belong to the same transaction.
- **No transaction is held across a provider call.** The provider call happens outside any open transaction; the transaction opens only to record its outcome.
- **Persist before advancing.** The orchestrator reads the next step only after the previous step's outcome is committed. A crash therefore always leaves a job resumable from committed state, never from in-memory state.
- Event emission follows the platform's transactional outbox posture (ADR-051) so that a committed state change and its event cannot diverge.

## Idempotency

Every orchestration step is idempotent by construction:

- It first reads the current persisted state of the job and the step.
- If the step is already recorded as succeeded, it is skipped without a provider call.
- If the step is partially complete, the recorded provider resource references are used rather than creating new resources.
- Re-running an entire job from any point is therefore safe and converges to the same outcome.

Provider-side idempotency requirements (correlation-scoped request keys) are a provider obligation stated by the provider contract; the orchestrator supplies the correlation identifier that makes it possible.

## Concurrency

- **Exactly one active provisioning job per tenant.** This is a hard invariant, not a convention.
- The invariant is enforced by the Gate 3.1 database constraint on `provisioning_jobs`; the orchestrator relies on that constraint rather than re-implementing the check in application code.
- Multiple orchestrator instances may exist. They must never execute the same tenant simultaneously; a losing instance observes the constraint violation or a non-claimable job state and yields.
- Step execution within a job is strictly sequential. There is no intra-job parallelism.

## Event Flow

The orchestrator reuses the existing provisioning event model without extension. No new event names, no new envelope fields, no new payload schema.

Typical sequence for a successful job:

```text
provisioning.started
provisioning.step_changed   (once per step transition)
...
provisioning.completed
```

Failure sequences terminate with `provisioning.failed`, followed by `provisioning.rolled_back` when a rollback plan is executed, or `provisioning.cancelled` when a job is cancelled. Every event carries the mandatory correlation identifier.

## Provider Interaction

The orchestrator interacts with infrastructure through exactly one seam: the `ProvisioningProvider` interface.

It must never reference, import, or assume:

- a Supabase SDK,
- any vendor SDK,
- an HTTP client,
- an infrastructure or control-plane API,
- credentials, connection strings, or tokens.

Provider selection is data on the job (the provider key); resolution of a key to an implementation happens at the composition boundary, not inside the orchestrator. This preserves dependency inversion: the orchestrator depends on the abstraction, and every concrete provider depends on the same abstraction.

## Failure Handling

```text
Provider Failure
        |
        v
     Persist (error record on step and job)
        |
        v
   Retry Policy (classification + budget + backoff)
        |
        +-- transient, budget remains --> retry the same step
        |
        v
  Rollback Planner (eligibility + reverse-order plan + orphan classification)
        |
        v
   Final State (failed | rolled_back)
```

The orchestrator classifies nothing itself. It hands the error to the retry policy, obeys the returned decision, and — when retry is exhausted or the error is permanent — requests a rollback plan and executes the plan's actions in the order given. Orphaned resources that the plan cannot reverse are recorded, not silently discarded.

## Observability

Every orchestration action must be observable:

- **Correlation ID** — mandatory, propagated to every job, step, event, audit record and provider call.
- **Structured logging** — one structured record per step transition, carrying job id, tenant id, step key, attempt and outcome.
- **Audit events** — provisioning actions are auditable platform actions under ADR-014.
- **Timing** — step start, completion and duration are persisted on the step record.
- **Metrics** — job duration, step duration, retry counts, failure rates and rollback counts are exposed as counters and histograms.

This ADR states the requirement only. No logging, tracing or metrics implementation is specified or authorized here.

## Security

- The orchestrator holds **no credentials, no secrets, no provider tokens**. It passes secret *references*; resolution happens at the provider boundary.
- Orchestration executes **server-side only**. No orchestration entry point is reachable from a browser client.
- Invocation requires **platform authorization**. Tenant-scoped users cannot start, retry, cancel or roll back a provisioning job.
- Error records persisted on jobs and steps must never contain secret material.

## Non Goals

The orchestrator is not responsible for:

- Provider implementation
- Infrastructure creation or teardown mechanics
- Secret management or secret storage
- UI, dashboards or status pages
- Scheduling
- Background workers
- Queues
- Cron
- Realtime transport
- Billing or quota enforcement

## Alternatives Considered

**Direct provider invocation from the platform layer.**
*Rejected.* No separation of concerns: request handling, workflow state, retry policy and vendor calls collapse into one component. Every new provider or lifecycle change would touch the platform layer, and no part of the workflow would be testable without infrastructure.

**Provider owns orchestration (each provider drives its own workflow).**
*Rejected.* Violates dependency inversion — the abstraction would depend on its implementations. Workflow semantics, event emission and rollback ordering would fork per provider, making behaviour non-uniform and uncertifiable.

**External workflow engine / queue-driven saga.**
*Rejected for Phase 3.* Adds an infrastructure dependency and an operational surface disproportionate to a low-volume, long-running, human-initiated workflow. The persisted job record already provides durability and resumability. Revisit only if provisioning volume or step fan-out changes materially.

**Stateless orchestration recomputed from provider state.**
*Rejected.* Requires querying provider state on every resume, is not uniformly supported across providers, and offers no audit trail. The persisted job remains the source of truth.

## Consequences

**Positive**

- Reusable across every provider.
- Provider independent — a new provider requires no orchestrator change.
- Testable without infrastructure: the provider seam is trivially substitutable.
- Deterministic and resumable: state is committed before advancing.
- Uniform event, audit and observability behaviour for all provisioning.

**Negative**

- An additional layer between platform and provider.
- More persisted state to write, migrate and reason about.
- Step-scoped transactions mean a job is not globally atomic; partial state is a normal, expected condition that rollback must handle.
- Idempotency must be re-verified for every new step added in future gates.

## Dependencies

- **ADR-017** — Dedicated Database per Tenant Architecture (authoritative on the target topology).
- **ADR-018** — Tenant Provisioning Architecture (authoritative on lifecycle, jobs, retry, rollback, secrets, provider contract).
- **Gate 3.1 Domain Foundation** — `src/lib/provisioning/` and the `provisioning_jobs` / `provisioning_steps` schema.
- Supporting: ADR-011 (isolation), ADR-014 (audit), ADR-051 (outbox), ADR-053 (idempotency).

## Future Gates

| Gate | Scope |
|---|---|
| **Gate 3.2** | Implements this ADR — the orchestrator itself. |
| **Gate 3.3** | Implements the first concrete provider behind `ProvisioningProvider`. |
| **Gate 3.4** | Provisioning dashboard and operator surfaces. |
| **Gate 3.5** | Phase 3 certification and freeze. |

## References

- `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`
- `docs/11-adrs/architecture/ADR-018-tenant-provisioning-architecture.md`
- `docs/60-engineering/PHASE3_DISCOVERY_REPORT.md`
- `docs/60-engineering/PHASE3_IMPLEMENTATION_PLAN.md`
- `docs/60-engineering/PHASE3_GATE31_ENGINEERING_SUMMARY.md`
