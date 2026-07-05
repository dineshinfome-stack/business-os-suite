# Pass 4A — Enterprise Architecture Foundation (v2)

Authors the top of the architecture stack: **Master Architecture**, **Domain-Driven Design**, and **Domain Map**. Every document conforms to the Canon and the Business Blueprint. No database, API, security implementation, deployment, DevOps, engine, ADR, or module content.

## Deliverables

### 1. `docs/02-architecture/master-architecture.md`

`document_type: "Architecture"`. The definitive architectural blueprint. Long-form (25–40 pages equivalent).

Sections:

1. **Executive Summary**
2. **Architectural Vision**
3. **Architectural Drivers** — Business / Technical / Quality Attribute / Regulatory.
4. **Quality Attributes** — Availability, Scalability, Performance, Reliability, Maintainability, Extensibility, Observability, Security, Localization, Offline Capability, Disaster Recovery. Targets anchored to `performance.md` and `quality-attributes.md`, not duplicated.
5. **Constraints** — Business / Technology / Compliance / Performance.
6. **Architectural Style** — Cloud Native, Modular Monolith, Event-Driven, API-First, DDD, Clean Architecture, CQRS (where justified), Plugin Architecture. Each with an explicit **why chosen**.
7. **Architecture Views** — Logical, Application, Domain, Data (high-level), Infrastructure (high-level), Integration, Security (conceptual), Deployment (conceptual). Mermaid diagrams per view.
8. **Cross-Cutting Concerns** — Logging, Auditing, Caching, Notifications, Workflow, Localization, Configuration, Feature Flags, Scheduling, File Storage, Search, AI. Each: purpose, ownership, ERP Core Engine reference (no engine specs).
9. **Architecture Principles Catalog** — canonical section, template per principle:
   - Principle
   - Motivation
   - Implementation Direction
   - Trade-offs
   - Examples
   - Related Canon Chapters
   - Related ADR (placeholder)
   Principles include: PostgreSQL as system of record, Modular Monolith by default, Bounded Contexts strict, Event-Driven Cross-Context, Configuration-as-Data, API-First, Mobile-First, Offline-First, AI-First with human-in-the-loop, Localization-First, Multi-Tenancy at the data-model layer, Plugin extension over core patches, Shared ERP Core Engines, Idempotent side effects, Audit everywhere, Least-Privilege by default.
10. **Technology Overview** — vendor-neutral. Verbatim framing at the top of the section:

    > *Technology capabilities and architectural roles are described. Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.*

    Content is capability/role only (e.g. "relational RDBMS as system of record", "event bus with at-least-once delivery", "object storage for attachments"), never library names or versions.
11. **Risks** — cross-references Risk Register IDs (`R-###`); no duplication.
12. **Future Evolution** — service-extraction trigger conditions per Canon 3.3; multi-region evolution; on-prem readiness path.
13. **Architectural Decisions Pending** — new section. Lists topics that intentionally remain unresolved and MUST be addressed through future ADRs. Each entry has: **topic**, **why deferred**, **rough decision window** (roadmap layer), **owner**. Seed list:
    - Event Bus implementation (in-process vs external broker)
    - Search architecture (embedded vs external engine; per-tenant index policy)
    - Cache strategy (layers, invalidation, tenant scoping)
    - File / object storage (residency, lifecycle, signed access)
    - AI provider abstraction (single vs multi-provider gateway; routing policy)
    - Multi-region deployment (active-passive vs active-active; residency-aware routing)
    - CQRS materialization strategy per high-read domain
    - Analytics store (same OLTP vs separate OLAP)
    - Metering and entitlement subsystem placement (from Business Model §12)
    - Plugin runtime sandboxing model
14. **References**.

### 2. `docs/02-architecture/domain-driven-design.md`

`document_type: "Architecture"`. The DDD strategy. Long-form (20–30 pages equivalent).

Sections:

- **DDD Philosophy** — why DDD, how it interlocks with the Modular Monolith.
- **Bounded Context Strategy** — definition, sizing, ownership.
- **Domain Evolution Rules** — new subsection. Rules for how the domain map is allowed to change over time:
  - When to **split** a bounded context (signals: aggregate contention, divergent lifecycles, distinct ubiquitous language, distinct SLAs).
  - When to **merge** contexts (signals: perpetual cross-context transactions, shared aggregate identity, one team owning both).
  - When to introduce a **new Shared Kernel** (strict criteria — Canon 3.R3 disallows shared entity classes across contexts; Shared Kernel is reserved for genuinely cross-cutting value objects).
  - When to introduce an **Anti-Corruption Layer** (integrating with an external system whose model would corrupt ours; wrapping a legacy or deprecated context during migration).
  - How **domain ownership** changes — governance path, ADR requirement, event/API compatibility obligations, deprecation windows.
  - Change control — every split/merge/ownership change MUST be captured as an ADR before code moves.
- **Ubiquitous Language** — per-context glossaries; deprecation and reuse policy (glossary governance itself is a deferred document).
- **Context Mapping** — Shared Kernel, Anti-Corruption Layer, Open Host Service, Published Language, Separate Ways, Customer/Supplier, Conformist. When to use each.
- **Building Blocks** — Aggregate Rules, Entity Rules, Value Objects, Repositories, Factories, Domain Services, Application Services, Policies, Specifications.
- **Domain Events** — event kinds, versioning, contract stability, ordering guarantees at conceptual level.
- **Commands vs Queries** — write model vs read model; when CQRS is justified.
- **Consistency** — Transaction Boundaries, Aggregate Consistency, Eventual Consistency, Saga vs Process Manager (conceptual).
- **Module and Domain Ownership** — how bounded contexts map to modules and teams.
- **Naming Conventions** — for aggregates, events (past tense), commands (imperative), services; casing, suffixes.
- **When NOT to use DDD** — simple reporting-only surfaces, integration adapters, throwaway automations.
- **Cross-references**.

Mermaid diagrams: aggregate-inside-context, context-map legend, event-driven cross-context write flow.

### 3. `docs/02-architecture/domain-map.md`

`document_type: "Architecture"`. Long-form (15–20 pages equivalent).

Section per domain (18 domains): Foundation, Accounting, Inventory, Sales, Purchase, Manufacturing, CRM, Projects, AMC, Field Service, HRMS, Payroll, Assets, Fleet, POS, Service Desk, Analytics, AI.

Each domain declares:

- Purpose
- Responsibilities
- Owned aggregates (names only, no schemas)
- Published events (names + trigger)
- Consumed events (names + reason)
- External integrations (categories, not vendors)
- Upstream dependencies
- Downstream dependencies

Diagrams (Mermaid):

- **Context map** — all 18 domains with typed relationships (Customer/Supplier, ACL, Shared Kernel, Published Language).
- **Dependency diagram** — DAG of upstream/downstream at the domain level.
- **Event flow diagram** — cross-context events for order-to-cash, procure-to-pay, hire-to-payslip.
- **Ownership diagram** — capability-layer to domain mapping.

Explicitly **not** included: tables, columns, APIs, endpoint paths, wire formats.

## Cross-document integrity

Each document opens with **Conforms to Canon** (specific chapter numbers) and ends with **References** to Canon, Vision, Master PRD, Roadmap, Business Model, Scope, Success Metrics, Assumptions, Risk Register (plus the sibling architecture docs in this pass). Frontmatter uses the extended metadata block, with `depends_on` and `referenced_by` populated.

## Portal updates

`docs/_meta.json` — under `02 Architecture`, confirm the first three entries are, in order:

1. Master Architecture (`02-architecture/master-architecture`)
2. Domain-Driven Design (`02-architecture/domain-driven-design`)
3. Domain Map (`02-architecture/domain-map`)

Existing entries for these paths are already stubs registered in the meta. No new entries added in this pass.

No routing, package, or UI changes.

## Files touched

- Replace stubs: `docs/02-architecture/master-architecture.md`, `docs/02-architecture/domain-driven-design.md`, `docs/02-architecture/domain-map.md`.
- Confirm order in `docs/_meta.json` (edit only if the three are not already first in the `02 Architecture` group).

## Explicit non-goals for Pass 4A

- No Database Architecture, Multi-Tenant Architecture, Database Standards, Data Dictionary.
- No API, Security, AI, Deployment, DevOps, Testing architecture docs.
- No ERP Core Engine specs.
- No ADRs authored (placeholders only — "Related ADR: TBD" is allowed).
- No module PRDs, database schemas, API contracts, entities, tables, wireframes, or code.
- No back-fill of frontmatter into unrelated skeleton docs.

## Review checklist

- Consistent with the Canon (every principle cites chapter numbers).
- Consistent with the Business Blueprint (Vision, PRD, Roadmap, Scope, Business Model).
- Domain boundaries are clear and non-overlapping.
- Every domain has explicit responsibilities, published events, consumed events, and dependencies.
- Mermaid diagrams render correctly.
- Technology Overview is vendor-neutral end to end.
- Architectural Decisions Pending explicitly lists every intentionally-deferred topic with an owner.
- Domain Evolution Rules cover split, merge, Shared Kernel, ACL, and ownership change.
- No implementation details leaked (no table names, no endpoint paths, no library names, no versions).

Approve to author Master Architecture, Domain-Driven Design, and Domain Map.