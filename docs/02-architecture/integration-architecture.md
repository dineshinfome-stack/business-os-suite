---
title: "Integration Architecture"
summary: "How BusinessOS integrates internally between services and externally with third parties — styles, resilience, and security."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "integration"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/api-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/event-catalog.md"
  - "docs/02-architecture/multi-tenant-architecture.md"
  - "docs/02-architecture/observability-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
referenced_by: []
document_type: "Architecture"
---

# Integration Architecture

*Part of Pass 4D — the final architecture documentation layer before ERP
Core Engines (shared reusable platform capabilities).*

## Overview

Integration Architecture defines **how BusinessOS communicates** — inside
the platform between bounded contexts, and outside the platform with third-
party systems. It is vendor-neutral: no message broker, integration
platform, iPaaS, or middleware product is prescribed.

Where API Architecture defines *contracts*, this document defines *the
patterns of communication that use them*.

Specific frameworks, runtime versions, vendors, and implementation choices
are intentionally deferred to ADRs and implementation documentation.

## Integration Principles

- **IN-01 · Contracts First.** No integration exists without a versioned,
  documented contract.
- **IN-02 · Loose Coupling.** Producers and consumers evolve
  independently within contract boundaries.
- **IN-03 · Prefer Asynchronous.** Where business semantics permit,
  asynchronous, event-driven integration is preferred.
- **IN-04 · Idempotency is Mandatory.** Every integration point tolerates
  safe retries.
- **IN-05 · Tenant Scope Never Escapes.** No integration leaks tenant
  scope, identity, or Data Classification.
- **IN-06 · Observability is Required.** Every integration is traceable
  end-to-end.
- **IN-07 · Fail Loud, Fail Safe.** Integrations degrade predictably;
  silent failure is the worst outcome.
- **IN-08 · No Hidden Coupling.** Shared databases, shared caches, and
  shared file paths across bounded contexts are prohibited.

## Internal Integration

Between BusinessOS services / bounded contexts:

- **Synchronous** via the API contracts of the producing context.
- **Asynchronous** via events defined in the Event Catalog.
- **No cross-context direct database access.** Every context owns its
  data and exposes it through contracts.
- **Backward compatibility** is governed by API Lifecycle (API
  Architecture).

## External Integration

With third-party systems (payments, tax, banking, messaging, AI providers,
etc.):

- **Anti-Corruption Layer.** External data models are translated at the
  boundary; internal domains are not polluted.
- **Vendor Abstraction.** Where multiple vendors serve one capability, an
  abstraction hides vendor specifics.
- **Explicit Trust Model.** External systems are untrusted by default;
  every response is validated.
- **Region and Residency Respected.** Cross-border integration follows the
  Data Constitution.

## Integration Styles

- **Request/Response** — synchronous, immediate answer expected.
- **Event Notification** — a fact happened; consumers act on their own
  timelines.
- **Event-Carried State Transfer** — event payload carries enough state to
  avoid callbacks.
- **Command** — a request to perform an action asynchronously, with
  correlated outcome.
- **Batch/Bulk** — high-volume periodic exchanges with clear checkpoints.
- **Streaming** — continuous data flow with backpressure semantics.

Style selection is a design decision recorded in the relevant integration
document; mismatched styles are the most common source of integration
pathology.

## Event Choreography

- Independent services react to events without a central conductor.
- Preferred when workflows are naturally decoupled.
- Requires strong observability to reconstruct end-to-end flows.
- Compensation is the responsibility of each participating service.

## Event Orchestration

- A designated orchestrator drives a workflow across services.
- Preferred when workflows are long-lived, have complex compensation, or
  require human approval (see Workflow rules).
- Orchestrators are themselves services with clear contracts and audit
  trails.

## Retry Philosophy

- **Retry Only Idempotent Operations.**
- **Exponential Backoff with Jitter.**
- **Budgeted.** Retries have caps in count, total time, and cost.
- **Classified Errors.** Transient vs permanent errors are distinguished
  at the boundary; permanent errors do not retry.
- **Downstream Aware.** Retries never amplify a struggling downstream.

## Idempotency

- Every command and mutating request accepts an idempotency key aligned
  with API Architecture.
- Event consumers deduplicate by event identity within a declared window.
- Idempotency semantics are documented per endpoint and per event.

## Circuit Breaker Principles

- Circuit breakers protect callers from cascading failure.
- Breakers have declared open/half-open/closed transitions and observable
  state.
- Breaker trips are alerted and correlated with downstream health.
- Fallback behaviour is explicit; silent fallback is prohibited.

## Dead Letter Strategy

- Undeliverable or unprocessable messages are captured to a **dead-letter
  store** with full context.
- Dead letters are inspectable, replayable, and time-bounded.
- Dead-letter growth is a monitored signal and alerts on threshold.
- Dead letters inherit Data Classification and residency.

## Data Synchronization

- **Source of Truth is Singular.** For each dataset, exactly one context
  owns the truth.
- **Downstream Copies are Derived.** Reference and read-model copies
  declare their staleness bounds.
- **Reconciliation is Engineered.** Periodic reconciliation detects and
  reports drift.
- **Two-way sync is Discouraged** and, when required, uses conflict
  resolution documented per case.

## Version Compatibility

- Integrations follow the API Lifecycle Governance (Draft, Preview, GA,
  Deprecated, Sunset, Retired).
- Producers support N and N-1 during deprecation windows.
- Event schemas evolve additively; breaking changes create a new event
  name/version.
- Consumers are resilient to unknown fields.

## Integration Security

- **Authenticated and Authorized.** No anonymous integration; scope is
  least-privilege.
- **Mutually Authenticated** for external partners where feasible.
- **Signed Payloads.** Webhooks and asynchronous callbacks are signed and
  verified (see API Architecture).
- **Encrypted In Transit.** Always.
- **Secrets Rotated.** Rotation cadence is declared.
- **Audit Trail.** Every integration action is auditable and non-
  repudiable.

## Integration Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Internal event transport | Depends on runtime platform and scale envelope | With ADR-DEP-001 | Platform |
| External integration platform (if any) | Depends on partner catalogue evolution | With first non-trivial partner integration | Platform |
| Streaming vs batch defaults per domain | Requires Module PRDs | Rolling, per module | Domain owners |
| Orchestration engine | Depends on workflow-engine scope in Pass 5 | With Pass 5 workflow engine | Platform |

ADR placeholders: **ADR-INT-001 · Internal Event Transport**,
**ADR-INT-002 · External Integration Platform**, **ADR-INT-003 ·
Orchestration Engine**.

## Conforms to Canon

- Tenant isolation is preserved across every integration hop (Canon:
  Tenant Isolation).
- Every action is auditable (Canon: Audit).
- AI-initiated integrations respect scoped-principal rules (Canon: AI).
- Data residency and classification are honored end-to-end (Canon: Data
  Governance).

## References

- `docs/02-architecture/api-architecture.md`
- `docs/02-architecture/event-catalog.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/02-architecture/quality-attributes.md`
