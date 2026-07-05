---
title: "ERP Core Engines — Index"
summary: "Navigational index, dependency rules, dependency matrix, and versioning policy for the BusinessOS ERP Core Engines catalogue."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["erp-core", "index"]
document_type: "ERP Core Guide"
---

# BusinessOS ERP Core Engines — Index

This document is the **single entry point** to the BusinessOS ERP Core Engines. It is informational and navigational: it introduces no new architectural principles. Its purpose is to enumerate the reusable platform capabilities that every ERP module will consume, and to make the layering and dependency rules between those capabilities explicit.

For a one-page tabular view of every engine — with stable IDs, versions, status, stability, consumers, and direct dependencies — see the [Engine Catalog](./ENGINE_CATALOG.md). The catalog is a **derived index** of this README and the individual engine specifications; on any conflict, the specs and the Dependency Matrix below win.

ERP Core Engines build **on top of** the architectural baseline frozen in `docs/FOUNDATION_FREEZE_v1.md`. They do not redefine architecture; they realize it as reusable capabilities.

---

## ERP Core Overview

An **engine** is a reusable, vendor-neutral platform capability with a stable Capability Interface. Engines are:

- Owned by the Platform team.
- Versioned independently of business modules (see **Engine Versioning Policy** below).
- Consumed by other engines, by Module PRDs (Pass 7+), and by the AI Copilot.
- Free of module-specific business logic — that lives in Module PRDs.

The ERP Core Engines catalogue contains **27 engines** organized into **8 categories**.

---

## Reading Order

Read the categories in the following order. Within each category, engines may be read in listed order.

### Foundation
- [Identity Engine](./foundation/identity-engine.md)
- [Authorization Engine](./foundation/authorization-engine.md)
- [Permission Management Engine](./foundation/permission-management-engine.md)
- [Audit Engine](./foundation/audit-engine.md)
- [Configuration Engine](./foundation/configuration-engine.md)
- [Localization Engine](./foundation/localization-engine.md)

### Document
- [Document Engine](./document/document-engine.md)
- [Attachment Engine](./document/attachment-engine.md)
- [File Storage Engine](./document/file-storage-engine.md)

### Workflow
- [Workflow Engine](./workflow/workflow-engine.md)
- [Approval Engine](./workflow/approval-engine.md)
- [Rules Engine](./workflow/rules-engine.md)
- [Automation Engine](./workflow/automation-engine.md)
- [Scheduler Engine](./workflow/scheduler-engine.md)

### Financial
- [Voucher Engine](./financial/voucher-engine.md)
- [Posting Engine](./financial/posting-engine.md)
- [Numbering Engine](./financial/numbering-engine.md)
- [Currency Engine](./financial/currency-engine.md)
- [Tax Engine](./financial/tax-engine.md)

### Intelligence
- [Search Engine](./intelligence/search-engine.md)
- [Reporting Engine](./intelligence/reporting-engine.md)
- [Dashboard Engine](./intelligence/dashboard-engine.md)

### Integration
- [Integration Engine](./integration/integration-engine.md)
- [Event Engine](./integration/event-engine.md)
- [Notification Engine](./integration/notification-engine.md)

### Data Exchange
- [Import Engine](./data-exchange/import-engine.md)
- [Export Engine](./data-exchange/export-engine.md)

### AI
- [AI Copilot Engine](./ai/ai-copilot-engine.md)


---

## Engine Categories

| Category | Purpose |
|---|---|
| **Foundation** | Identity, authorization, permissions, audit, configuration, localization — the substrate every other engine builds on. |
| **Document** | Business document lifecycles, attachments, and binary storage. |
| **Workflow** | Long-running processes, approvals, rules, automations, and scheduling. |
| **Financial** | Voucher, posting, numbering, currency, tax — the shared financial substrate. |
| **Intelligence** | Search, reporting, dashboards — read-side capabilities. |
| **Integration** | Internal event routing, external integration, and notifications. |
| **Data Exchange** | Structured import and export flows. |
| **AI** | AI-as-principal capabilities operating under Authorization and Audit. |

---

## Dependency Graph

```text
                      ┌────────────────────┐
                      │     Foundation     │
                      │ Identity · AuthN/Z │
                      │ Permission · Audit │
                      │ Config · Locale    │
                      └─────────┬──────────┘
                                │
        ┌────────────┬──────────┼──────────┬────────────┐
        │            │          │          │            │
    ┌───▼────┐  ┌────▼───┐  ┌───▼────┐ ┌───▼────┐  ┌────▼─────┐
    │Document│  │Workflow│  │Financial│ │Integr. │  │DataExch. │
    └───┬────┘  └────┬───┘  └───┬────┘ └───┬────┘  └────┬─────┘
        │            │          │          │            │
        └────────────┴────┬─────┴──────────┘            │
                          │                             │
                    ┌─────▼──────┐                      │
                    │Intelligence│                      │
                    └─────┬──────┘                      │
                          │                             │
                          └──────────────┬──────────────┘
                                         │
                                    ┌────▼────┐
                                    │   AI    │
                                    └─────────┘
```

Arrows point from consumer → provider. AI consumes any category but must not bypass Authorization, Audit, or Workflow.

---

## Dependency Rules

The following rules are **normative** and must be preserved across all engine specifications and future ADRs:

1. **Foundation** engines must not depend on any other ERP Core category.
2. **Document** engines may depend only on Foundation.
3. **Workflow** engines may depend only on Foundation.
4. **Financial** engines may depend on Foundation and Workflow.
5. **Intelligence** engines may consume Foundation, Financial, and Document; they must not own business logic.
6. **Integration** engines communicate across boundaries; they must not own business logic. They may depend on Foundation.
7. **Data Exchange** engines may depend on Foundation and Document only.
8. **AI** engines may consume any engine but must not bypass Authorization, Audit, or Workflow.
9. No circular dependencies between engines. Any perceived cycle must be resolved via an event-driven (event-only) edge or by extracting a Foundation-level capability.
10. Event-only dependencies (subscribing to another engine's events without direct invocation) are marked `▲` in the matrix and are always permitted where they preserve layering.

---

## Engine Dependency Matrix

Rows are **consumer** engines. Columns are **provider** categories.

- `✓` — Allowed direct dependency (Capability Interface invocation).
- `▲` — Event-only dependency (subscribe to events, no direct invocation).
- `—` — No dependency permitted.

The matrix is architectural guidance and **must remain synchronized with the Dependency Rules above**.

| Consumer \ Provider | Foundation | Document | Workflow | Financial | Intelligence | Integration | Data Exchange | AI |
|---|---|---|---|---|---|---|---|---|
| **Identity Engine** | ✓ | — | — | — | — | — | — | — |
| **Authorization Engine** | ✓ | — | — | — | — | — | — | — |
| **Permission Management Engine** | ✓ | — | — | — | — | — | — | — |
| **Audit Engine** | ✓ | — | — | — | — | — | — | — |
| **Configuration Engine** | ✓ | — | — | — | — | — | — | — |
| **Localization Engine** | ✓ | — | — | — | — | — | — | — |
| **Document Engine** | ✓ | ✓ | — | — | — | ▲ | — | — |
| **Attachment Engine** | ✓ | ✓ | — | — | — | ▲ | — | — |
| **File Storage Engine** | ✓ | ✓ | — | — | — | ▲ | — | — |
| **Workflow Engine** | ✓ | — | ✓ | — | — | ▲ | — | — |
| **Approval Engine** | ✓ | — | ✓ | — | — | ▲ | — | — |
| **Rules Engine** | ✓ | — | ✓ | — | — | ▲ | — | — |
| **Automation Engine** | ✓ | — | ✓ | — | — | ▲ | — | — |
| **Scheduler Engine** | ✓ | — | ✓ | — | — | ▲ | — | — |
| **Voucher Engine** | ✓ | — | ✓ | ✓ | — | ▲ | — | — |
| **Posting Engine** | ✓ | — | ✓ | ✓ | — | ▲ | — | — |
| **Numbering Engine** | ✓ | — | ✓ | ✓ | — | ▲ | — | — |
| **Currency Engine** | ✓ | — | ✓ | ✓ | — | ▲ | — | — |
| **Tax Engine** | ✓ | — | ✓ | ✓ | — | ▲ | — | — |
| **Search Engine** | ✓ | ✓ | — | ✓ | ✓ | ▲ | — | — |
| **Reporting Engine** | ✓ | ✓ | — | ✓ | ✓ | ▲ | — | — |
| **Dashboard Engine** | ✓ | ✓ | — | ✓ | ✓ | ▲ | — | — |
| **Integration Engine** | ✓ | — | — | — | — | ✓ | — | — |
| **Event Engine** | ✓ | — | — | — | — | ✓ | — | — |
| **Notification Engine** | ✓ | — | — | — | — | ✓ | — | — |
| **Import Engine** | ✓ | ✓ | — | — | — | ▲ | ✓ | — |
| **Export Engine** | ✓ | ✓ | — | — | — | ▲ | ✓ | — |
| **AI Copilot Engine** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | — | ✓ |

---

## Engine Versioning Policy

ERP Core Engines are versioned **independently of business modules** using semantic versioning (`MAJOR.MINOR.PATCH`).

- **Breaking changes** (MAJOR) require:
  - an approved ADR,
  - a documented migration strategy,
  - backward-compatibility guidance where applicable (deprecation window, adapter, or shim).
- **Additive changes** (MINOR) preserve backward compatibility of the Capability Interface.
- **Fixes** (PATCH) alter no observable contract.

Every engine document exposes:

- `version` (frontmatter)
- `status` — `draft` · `stable` · `deprecated`
- `stability` — `core` · `preview` · `experimental`
- **Change History** section in the document body.

Business modules **must reference engine versions** rather than assume the latest behavior. Sprint PRDs cite the engine version they build against.

---

## Engine Ownership

All ERP Core Engines are owned by the **Platform** team. Consuming modules may propose changes via ADR but do not own engine internals. Ownership is exposed in each engine's `owner` frontmatter field.

---

## Engine Lifecycle

```text
draft  ──►  stable  ──►  deprecated  ──►  removed
```

- **draft** — specification in progress; not yet consumed by modules.
- **stable** — Capability Interface frozen; safe to consume; changes governed by the Versioning Policy.
- **deprecated** — scheduled for removal; consumers must migrate within the deprecation window.
- **removed** — no longer part of ERP Core.

Transitions require an ADR.

---

## How Modules Consume Engines

- Module PRDs (Pass 7+) reference engines by name and version.
- Modules **must not** re-implement capabilities already provided by an engine.
- Modules **must not** bypass Authorization, Audit, or tenant isolation guarantees provided by engines.
- Modules interact with engines via the Capability Interface — never by reaching into engine internals.

---

## How ADRs Affect Engines

- Any change to an engine's Capability Interface, dependency edges, or stability requires an ADR.
- ADRs are recorded in `docs/05-adr/` and referenced from the affected engine document's `depends_on` list and Change History.
- The Dependency Rules and the Engine Dependency Matrix are amended together whenever an ADR alters allowed edges.

---

## References

- `docs/canon.md`
- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/02-architecture/README.md`
- `docs/02-architecture/master-architecture.md`
- `docs/02-architecture/quality-attributes.md`
- `docs/02-architecture/integration-architecture.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/decision-register.md`
