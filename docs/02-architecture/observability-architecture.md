---
title: "Observability Architecture"
summary: "Logs, metrics, traces, correlation, health, alerting, and SLOs for BusinessOS — vendor-neutral principles."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "operations"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/api-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/ai-architecture.md"
  - "docs/02-architecture/deployment-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
referenced_by: []
document_type: "Architecture"
---

# Observability Architecture

*Part of Pass 4D — the final architecture documentation layer before ERP
Core Engines (shared reusable platform capabilities).*

## Overview

Observability Architecture defines **how BusinessOS makes its own behaviour
legible** — to operators, developers, auditors, and AI copilots. It is
vendor-neutral: no APM, log, metric, or tracing product is prescribed.

Specific frameworks, runtime versions, vendors, and implementation choices
are intentionally deferred to ADRs and implementation documentation.

## Observability Principles

- **OB-01 · Observability is a First-Class Requirement.** A capability is
  not "done" until it is observable.
- **OB-02 · Three Pillars, One Story.** Logs, metrics, and traces are
  complementary; each is designed to answer questions the others cannot.
- **OB-03 · Correlation is Mandatory.** Every request, event, and job
  carries correlation identifiers propagated end-to-end.
- **OB-04 · Tenant-Aware Everywhere.** Every telemetry record carries the
  tenant, company, and branch scope where applicable, respecting Data
  Classification.
- **OB-05 · No PII in Telemetry.** Personal, financial, and sensitive data
  never leak into logs, metrics, or traces.
- **OB-06 · Observability is Governed Data.** Telemetry retention,
  residency, and access follow the Data Constitution.
- **OB-07 · SLOs Drive Alerting.** Alerts fire on symptoms of user pain,
  not on internal metrics divorced from experience.
- **OB-08 · Cost is a Design Constraint.** Cardinality, sampling, and
  retention are engineered, not accidental.

## Logs

- **Structured.** All logs are structured, machine-parsable, and schema-
  governed.
- **Levelled.** Log levels have consistent semantics across services.
- **Contextual.** Every log line carries correlation, tenant scope, actor
  identity, and capability name.
- **Redaction at Source.** Sensitive fields are redacted before emission,
  not after.
- **Immutable and Non-Repudiable** where used as audit evidence.

## Metrics

- **RED and USE.** Request-Rate/Error/Duration for services; Utilization/
  Saturation/Errors for resources.
- **Dimensioned but Bounded.** High-cardinality dimensions are curated;
  runaway cardinality is an incident.
- **Business Metrics are First-Class** alongside technical metrics.
- **Aggregation-Friendly.** Metrics are additive across replicas by design.

## Traces

- **End-to-End.** Traces span API entry, service hops, event emission, and
  downstream integrations.
- **Sampling is Explicit.** Sampling strategy is declared and observable;
  errors and slow requests are captured deterministically.
- **AI Actions are Traced.** Copilot and agent invocations produce spans
  that link to their tool calls and grounding sources (see AI
  Architecture).
- **Data-Sparse Spans.** Trace attributes never carry payload data of
  higher classification than trace storage permits.

## Correlation Strategy

- A single **correlation identifier** is assigned at the edge and
  propagated through all logs, metrics (as an exemplar), traces, events,
  and jobs.
- **Causation chain** is preserved: parent → child spans, event → handler,
  job → sub-job.
- **Tenant scope** and **actor identity** ride the same envelope.
- Correlation identifiers are opaque and non-guessable.

## Health Model

- **Liveness** — the process is alive.
- **Readiness** — the process can accept traffic.
- **Dependency Health** — declared upstream dependencies are healthy.
- **Business Health** — capability-level indicators reflect user
  experience.
- Health is exposed on stable, well-known contracts consistent with API
  Architecture.

## Telemetry Strategy

- **Instrument at Boundaries.** Public APIs, event boundaries, database
  adapters, and external integrations are instrumented consistently.
- **Semantic Conventions.** A single set of naming and attribute
  conventions applies platform-wide.
- **Backward-Compatible Evolution.** Telemetry schemas evolve
  additively; breaking changes follow the same rigor as API changes.
- **AI Telemetry.** Prompts, tool calls, refusals, groundings, costs, and
  outcomes are captured per AI Architecture, redacting sensitive content.

## Alerting Philosophy

- **Alert on Symptoms, Investigate on Causes.** Alerts fire on user-
  visible or SLO-threatening symptoms.
- **Every Alert has a Runbook.** An alert without a runbook is a bug.
- **Actionable or Silent.** If an alert is not actionable it is deleted or
  demoted.
- **Fatigue is an Incident.** Recurring low-value alerts trigger review.
- **Escalation is Declared.** Ownership and escalation paths are documented
  per capability.

## Diagnostics

- **Reproducible from Telemetry.** An operator or engineer can reconstruct
  what happened without shell access to production.
- **Ad-Hoc Query Support.** Logs, metrics, and traces support post-hoc
  analytical queries.
- **Session Replay is Governed.** Where used, session replay respects Data
  Classification, consent, and retention.
- **Debug Modes are Time-Bounded** and auditable.

## Service Level Objectives

- **SLOs are Contracts.** Each capability declares SLOs consistent with
  its tier in Quality Attributes.
- **Error Budgets Govern Change.** When budgets are exhausted, release
  velocity yields to reliability work.
- **User-Centric.** SLOs are expressed as user-perceptible metrics
  (availability of a flow, latency of a screen, freshness of a report).
- **Reviewed.** SLOs are reviewed on a documented cadence.

## Observability Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Telemetry backend(s) | Vendor selection depends on region and cost envelope | Before Pass 5 kickoff | Platform |
| Sampling strategy defaults | Requires baseline load data | With first production tenant | Platform |
| Semantic-convention profile | Depends on chosen runtime and SDKs | With ADR on runtime | Platform |
| SLO catalogue per capability | Requires Module PRDs | Rolling, per module | Product + Platform |

ADR placeholders: **ADR-OBS-001 · Telemetry Backends**, **ADR-OBS-002 ·
Sampling Strategy**, **ADR-OBS-003 · Semantic Conventions**,
**ADR-OBS-004 · SLO Catalogue**.

## Conforms to Canon

- Data classification is preserved in telemetry (Canon: Data Governance).
- Multi-tenant scoping is present in every telemetry record (Canon: Tenant
  Isolation).
- AI actions are observable and attributable (Canon: AI as Scoped
  Principal).
- Non-repudiable audit is preserved (Canon: Audit).

## References

- `docs/02-architecture/api-architecture.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/ai-architecture.md`
- `docs/02-architecture/deployment-architecture.md`
- `docs/02-architecture/quality-attributes.md`
- `docs/02-architecture/integration-architecture.md`
