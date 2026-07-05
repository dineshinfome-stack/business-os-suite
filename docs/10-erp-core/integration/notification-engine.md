---
title: "Notification Engine"
summary: "Delivers user- and system-facing notifications across channels with preference and quiet-hour handling."
layer: "platform"
owner: "Platform"
status: "draft"
updated: "2026-07-05"
tags: ["engine", "core", "integration"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/10-erp-core/README.md"
engine_category: "integration"
engine_type: "reusable-platform-capability"
stability: "core"
version: "1.0.0"
document_type: "ERP Core Engine"
---

# Notification Engine

## Overview

The **Notification Engine** is a reusable platform capability in the **Integration** category of BusinessOS ERP Core. Delivers user- and system-facing notifications across channels with preference and quiet-hour handling.

This document specifies the engine as a reusable platform capability. It defines conceptual behavior only; specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.

## Responsibilities

- Own the canonical semantics of its capability across all consuming modules.
- Expose a stable, versioned Capability Interface consumable by other engines and modules.
- Enforce tenant isolation, permission checks (via the Authorization Engine), and audit logging (via the Audit Engine) for every state-changing operation.
- Emit domain events describing state changes so downstream consumers may react asynchronously.
- Remain free of module-specific business logic; consumers layer their own rules on top.

## Capability Interface (conceptual)

The engine exposes a conceptual interface that may be surfaced later as:

- Internal service calls (in-process or cross-service)
- Domain events (via the Event Engine)
- Tool calls (via the AI Copilot Engine)
- REST or RPC endpoints (via the API layer)
- Workflow activities (via the Workflow Engine)

The specific transport(s) are deferred to ADRs. This section defines the *capability contract*, not the wire protocol.

Conceptual operations include:

- **Command operations** — state-changing actions with idempotency keys, tenant scoping, and authorization context.
- **Query operations** — read-only, permission-aware lookups with pagination and consistency guarantees.
- **Lifecycle operations** — administrative actions (enable, disable, deprecate, migrate) reserved to platform administrators.

## Data Model (conceptual)

The engine owns the conceptual entities required to fulfill its capability. Concrete schemas, indexes, partitioning, and storage technology are deferred to the Data Constitution (Pass 4B) and future ADRs. All entities are tenant-scoped by default and follow the classification, retention, and lineage rules in the Data Constitution.

## Events Produced

The engine publishes domain events for every meaningful state transition. Event names follow the naming conventions in the Event Catalog. Payloads include tenant identifier, principal identifier, correlation identifier, and a minimal, forward-compatible schema. Specific events are cataloged during Pass 6+ ADR work.

## Events Consumed

The engine subscribes to events required to keep its own state consistent (for example, tenant lifecycle events, principal lifecycle events, and configuration change events). The exact subscriptions are deferred to ADRs.

## Configuration

Runtime configuration is provided by the **Configuration Engine** and is hierarchical (platform → tenant → context). No configuration is hard-coded. Configuration changes are audited and versioned.

## Capability Rules

- The engine enforces platform-wide invariants for its capability. Module-specific business rules are **not** defined here; they live in the consuming module's PRD.
- Every state-changing operation must be authorized, audited, and idempotent.
- Tenant isolation is absolute; no cross-tenant reads or writes are permitted through this engine.
- Backward compatibility of the Capability Interface is preserved across minor versions.

## Extension Points

- Pluggable strategies for policy evaluation, rule sets, or provider-specific behavior are exposed via well-defined extension seams.
- Extensions are declarative where possible; imperative extensions are sandboxed and versioned.
- No extension may bypass Authorization, Audit, or tenant isolation.

## Dependencies

### Provides To

- AI

### Consumes From

- Foundation

Specific engine-to-engine dependencies are enumerated in the Engine Dependency Matrix in `docs/10-erp-core/README.md` and must remain consistent with the Dependency Rules stated there.

## Non-Functionals

Non-functional targets (availability, latency, throughput, RTO/RPO, accessibility where applicable) inherit from `docs/02-architecture/quality-attributes.md`. Engine-specific refinements are captured as ADRs.

## Failure Modes

- **Dependency unavailable** — the engine degrades gracefully, queues work where safe, and surfaces health signals via the Observability Architecture.
- **Poisoned input** — invalid or malicious inputs are rejected with structured errors; no partial state is persisted.
- **Duplicate delivery** — idempotency keys ensure repeated invocations do not double-apply effects.
- **Data drift** — schema and contract versions are validated at boundaries; incompatible messages are dead-lettered.

## Change History

| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | 2026-07-05 | Initial capability specification (Pass 5). |

Future breaking changes require an approved ADR, a documented migration strategy, and backward-compatibility guidance where applicable.

## Conforms to Canon

- Multi-tenant isolation is non-negotiable.
- Every state-changing operation is authorized and audited.
- Vendor neutrality: no framework, SDK, or product is named in this document.
- Architecture is stable; changes flow through ADRs.
- Engines expose reusable platform capabilities; they do not encode module-specific business logic.

## Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|-------|--------------|--------------|-------|
| Concrete transport for the Capability Interface | Requires cross-engine ADR | Pass 6 | Platform |
| Storage technology and schema | Governed by Data Constitution + ADR | Pass 6 | Platform |
| Event delivery guarantees per topic | Cross-cuts Event Engine and Integration Architecture | Pass 6 | Platform |
| Extension mechanism (declarative vs sandboxed imperative) | Requires prototype evidence | Pass 6+ | Platform |

## References

- `docs/canon.md`
- `docs/02-architecture/README.md`
- `docs/02-architecture/master-architecture.md`
- `docs/02-architecture/quality-attributes.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/02-architecture/integration-architecture.md`
- `docs/10-erp-core/README.md`
