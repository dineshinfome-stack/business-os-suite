---
title: "Architecture Index"
summary: "Single entry point and navigation guide for the BusinessOS architecture documentation across Passes 4A–4D."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "index"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/domain-driven-design.md"
  - "docs/02-architecture/domain-map.md"
  - "docs/02-architecture/database-architecture.md"
  - "docs/02-architecture/multi-tenant-architecture.md"
  - "docs/02-architecture/api-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/ai-architecture.md"
  - "docs/02-architecture/deployment-architecture.md"
  - "docs/02-architecture/devops-architecture.md"
  - "docs/02-architecture/testing-strategy.md"
  - "docs/02-architecture/observability-architecture.md"
  - "docs/02-architecture/integration-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
referenced_by: []
document_type: "Architecture Guide"
---

# BusinessOS Architecture — Index

This document is the **single entry point** to the BusinessOS architecture. It is
informational and navigational: it introduces no new principles, no new
standards, and no implementation content. Its sole purpose is to help humans
and AI agents find the right architecture document quickly and to make the
relationships between documents visible.

Pass 4D is the **final architecture documentation layer before ERP Core
Engines (shared reusable platform capabilities).** After Pass 4D the
architecture is considered stable; further architectural change occurs only
through ADRs.

---

## Architecture Overview

BusinessOS is a multi-tenant, domain-oriented, AI-native ERP platform. Its
architecture is expressed as **four architectural layers**, authored in
sequence during Pass 4:

- **Enterprise Architecture (Pass 4A)** — the shape of the system: bounded
  contexts, domains, cross-cutting concerns, and the master architectural
  narrative.
- **Data Constitution (Pass 4B)** — how data is modelled, classified,
  governed, versioned, migrated, and reasoned about.
- **Platform Constitution (Pass 4C)** — how the platform *behaves*: API
  contracts, security posture, AI as a first-class citizen.
- **Operational Architecture (Pass 4D)** — how the platform *runs*:
  deployment, DevOps, testing, observability, integration, design,
  engineering standards, and canonical quality attributes.

Everything downstream — ERP Core Engines (Pass 5), Module PRDs, Sprint PRDs,
and ultimately implementation — **consumes** these four layers. It does not
redefine them.

---

## Reading Order

New readers, reviewers, and AI agents should read the architecture in this
order:

1. **Canon** — the non-negotiable rules of BusinessOS.
2. **Business Blueprint** — vision, scope, business model, and roadmap.
3. **Master Architecture** — the enterprise architectural narrative.
4. **Domain-Driven Design** — bounded contexts and modelling rules.
5. **Domain Map** — the enumerated domains and their relationships.
6. **Data Constitution** — data governance, classification, lineage.
7. **Platform Constitution** — API, Security, and AI architecture.
8. **Operational Architecture** — deployment, DevOps, testing, observability,
   integration, design system, UX standards, coding standards, quality
   attributes.
9. **ERP Core Engines (Pass 5)** — reusable platform engines built *on top
   of* the architecture.

---

## Architecture Layers

### Enterprise Architecture

Answers: *How is BusinessOS structured as an enterprise system?*
Owns: master architectural narrative, domain decomposition, cross-cutting
concerns, and the shape of bounded contexts.

### Data Constitution

Answers: *How is data governed?*
Owns: data classification, ownership, lineage, retention, versioning, and
migration philosophy.

### Platform Constitution

Answers: *How does the platform behave contractually?*
Owns: API contracts, security posture, and AI-as-principal semantics.

### Operational Architecture

Answers: *How does the platform run, evolve, and stay healthy?*
Owns: deployment, DevOps, testing, observability, integration, design system,
UX standards, engineering standards, and the canonical quality attribute
targets.

---

## Which Document Answers Which Question?

| Question | Document |
|---|---|
| What are the non-negotiable rules? | Canon |
| What is BusinessOS as a product? | Business Blueprint |
| How is BusinessOS structured? | Master Architecture |
| How is the system decomposed into domains? | Domain-Driven Design · Domain Map |
| How is data governed? | Data Constitution (Database Architecture · Multi-Tenant Architecture · Database Standards · Data Dictionary · Reference Data · Event Catalog) |
| How do APIs behave? | API Architecture |
| How is security handled? | Security Architecture |
| How does AI behave? | AI Architecture |
| How is the platform deployed? | Deployment Architecture |
| How is the platform released? | DevOps Architecture |
| How is software tested? | Testing Strategy |
| How is the platform monitored? | Observability Architecture |
| How are integrations designed? | Integration Architecture |
| What are the quality goals (NFRs)? | Quality Attributes |
| How does the UI look and feel? | UI/UX Design System |
| How do users interact with the ERP? | UX Standards |
| How is code written and structured? | Coding Standards |
| Why was a specific choice made? | ADRs |

---

## Cross-Reference Map

- **Master Architecture** anchors every other architecture document.
- **Data Constitution** documents depend on Master Architecture and Canon.
- **API · Security · AI** (Platform Constitution) depend on Master
  Architecture, Data Constitution, and Canon.
- **Deployment · DevOps · Testing · Observability · Integration** depend on
  Master Architecture, Platform Constitution, and Quality Attributes.
- **UI/UX Design System · UX Standards** depend on Master Architecture,
  Security Architecture (for permission-aware UI), AI Architecture (for
  copilot surfaces), and Quality Attributes (accessibility, localization,
  offline).
- **Coding Standards** depends on Master Architecture, Domain-Driven Design,
  and Quality Attributes.
- **Quality Attributes** is the single source of truth for measurable
  non-functional targets and is referenced by every other architecture
  document that cites an NFR.

```text
                       ┌────────────────────┐
                       │       Canon        │
                       └─────────┬──────────┘
                                 │
                       ┌─────────▼──────────┐
                       │ Master Architecture│
                       └─┬──────┬──────┬────┘
                         │      │      │
        ┌────────────────┘      │      └────────────────┐
        │                       │                       │
┌───────▼─────────┐   ┌─────────▼─────────┐   ┌─────────▼──────────┐
│ Data Constitution│   │ Platform          │   │ Operational        │
│ (Pass 4B)        │   │ Constitution      │   │ Architecture       │
│                  │   │ (Pass 4C)         │   │ (Pass 4D)          │
│ Database · MT ·  │   │ API · Security ·  │   │ Deployment ·       │
│ Standards ·      │   │ AI                │   │ DevOps · Testing · │
│ Dictionary ·     │   │                   │   │ Observability ·    │
│ Reference · Event│   │                   │   │ Integration ·      │
│                  │   │                   │   │ Design · UX ·      │
│                  │   │                   │   │ Coding · Quality   │
└──────────────────┘   └───────────────────┘   └────────────────────┘
                                 │
                       ┌─────────▼──────────┐
                       │ ERP Core Engines   │
                       │ (Pass 5)           │
                       └────────────────────┘
```

---

## Architecture Governance

- **Canon is the highest authority.** No architecture document may contradict
  Canon.
- **ADRs amend architecture.** Architectural changes after Pass 4D are
  introduced only through Architecture Decision Records.
- **ERP Core Engines build upon the architecture.** Engines implement
  reusable platform capabilities that conform to the four architectural
  layers.
- **Module PRDs consume the architecture.** A Module PRD may not redefine
  architecture; it may only apply it.
- **Sprint PRDs implement Module PRDs.** Sprint PRDs never introduce
  architectural change.

---

## Architecture Evolution

Architecture in BusinessOS is intentionally **stable**. The following
disciplines govern evolution:

- **Architecture documents are stable.** Passes 4A–4D form the frozen
  architectural baseline.
- **Architectural changes happen through ADRs.** New decisions, revisions,
  or exceptions are captured as ADRs (Pass 6) and referenced back into the
  affected architecture documents via `depends_on` / `referenced_by`.
- **ERP Core Engines build on architecture.** They realize architectural
  intent as reusable capabilities and never contradict it.
- **Module PRDs must not redefine architecture.** They consume engines and
  architectural contracts as-is; any perceived gap is resolved via an ADR,
  not a local override.
- **Sprint PRDs implement Module PRDs.** Sprints deliver increments of
  approved PRDs and inherit all upstream constraints without exception.

This discipline is what allows the platform to scale from foundation domains
to dozens of ERP modules without architectural drift.

---

## References

- `docs/canon.md`
- `docs/02-architecture/master-architecture.md`
- `docs/02-architecture/domain-driven-design.md`
- `docs/02-architecture/domain-map.md`
- `docs/02-architecture/database-architecture.md`
- `docs/02-architecture/multi-tenant-architecture.md`
- `docs/02-architecture/api-architecture.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/ai-architecture.md`
- `docs/02-architecture/deployment-architecture.md`
- `docs/02-architecture/devops-architecture.md`
- `docs/02-architecture/testing-strategy.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/02-architecture/integration-architecture.md`
- `docs/02-architecture/quality-attributes.md`
- `docs/03-design/ui-ux-design-system.md`
- `docs/03-design/ux-standards.md`
- `docs/03-design/coding-standards.md`
