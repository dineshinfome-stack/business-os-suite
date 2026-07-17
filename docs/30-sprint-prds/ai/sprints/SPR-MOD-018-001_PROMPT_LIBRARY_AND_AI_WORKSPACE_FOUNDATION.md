---
title: "SPR-MOD-018-001 — Prompt Library & AI Workspace Foundation"
summary: "Sprint PRD for the foundational layer of MOD-018 AI Workspace: Prompt and Prompt Version master data with the standard active/inactive lifecycle; the Prompt review-and-publish business process; the versioning-and-audit rule for prompts and tool definitions; the Enabled surfaces per tenant configuration; numbering series registration; and the module-wide search-index baseline. Consumes ERP Core Engines and Accepted ADRs; never redefines them. AI Workspace is governance-mediated relative to source-module transactional truth."
layer: "delivery"
owner: "AI Platform"
status: "Draft"
updated: "2026-07-17"
sprint_id: "SPR-MOD-018-001"
parent_module: "MOD-018"
parent_sprint_plan: "MOD-018_SPRINT_PLAN.md"
iteration: "Sprint 1"
stage: "2"
pass: "23.0.2"
size: "Medium"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-020", "ENG-024"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "ai-workspace", "mod-018", "prompt-library", "foundation", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD018-001-20260718T000000Z-001"
parent_result_id: "GT002-MOD018-20260717T230000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-018-001 — Prompt Library & AI Workspace Foundation

> **Stage 2 deliverable.** First authored Sprint PRD for **MOD-018 AI Workspace** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. AI Workspace is governance-mediated relative to source-module transactional truth: it never mutates a source-module master or transaction, and provider integration is delivered exclusively through `ENG-028` in later sprints. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-018-001` (permanent) |
| Parent Module | `MOD-018` — AI Workspace |
| Parent Sprint Plan | [`MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) |
| Iteration | Sprint 1 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | None (first sprint) |
| Downstream Sprints | `SPR-MOD-018-002` … `SPR-MOD-018-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **AI Workspace Foundation** for BusinessOS: the **Prompt master** and **Prompt Version master** (with the standard `Draft → Active → Inactive → Archived` lifecycle), the **Prompt review-and-publish business process**, the **versioning-and-audit rule for prompts and tool definitions**, the **Enabled surfaces per tenant** configuration, numbering series registration, and the **module-wide search-index baseline**. This foundation is the substrate on which every subsequent MOD-018 sprint — Retrieval Workspaces (RAG), Tool Calling on Module Capabilities, Copilot Surfaces & Conversations, and Governance (Human-Approval Gates, Cost & Safety) — depends.

> **AI Workspace Ownership Convention.** MOD-018 AI Workspace owns the business semantics of the Prompt master, the Prompt Version master, and the AI Workspace foundation configuration authored in this sprint. ERP Core Engines provide shared infrastructure (identity, authorization, permissions, audit, configuration, localization, numbering, search, eventing). MOD-018 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only**. Cross-module KPI definitions remain owned by **MOD-017 Analytics** and are out of scope here. AI provider integration is delivered exclusively through `ENG-028` in `SPR-MOD-018-003` / `SPR-MOD-018-004`; MOD-018 does not import provider SDKs directly and does not redefine engine behavior.

#### 1.1.1 Prompt Master and Prompt Version Master Authority

The **Prompt** master and the **Prompt Version** master are authoritatively owned by MOD-018 AI Workspace. This sprint establishes:

- **Prompt definition** — the business entity representing a named prompt under a tenant/company, consumed downstream by Retrieval, Tool Calling, and Copilot Conversations.
- **Prompt Version definition** — an immutable versioned revision of a Prompt; each Prompt has exactly one active Prompt Version at a time.
- **Prompt metadata** — descriptive attributes (name, description, owner, classification hint) consumed downstream.
- **Lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle for Prompts and for Prompt Versions.

No other module MAY create, edit, archive, or independently maintain a parallel Prompt or Prompt Version master. Downstream MOD-018 sprints and downstream modules consume the Prompt and Prompt Version masters through AI-Workspace-owned read APIs authored in later sprints; they MUST NOT redefine those entities or their lifecycles.

#### 1.1.2 AI Workspace Foundation Configuration Authority

**AI Workspace foundation configuration** — the **Enabled surfaces per tenant** key, **AI Workspace numbering series registration**, and the **structural validation and hierarchy enforcement** for Prompts and Prompt Versions — is authoritatively owned by MOD-018 AI Workspace, in this sprint. The Enabled surfaces per tenant key is registered under a tenant/company through this sprint and resolves deterministically via `ENG-005` in the tenant → company → context hierarchy. Downstream MOD-018 sprints consume this configuration read-only.

Structural validation is expressed declaratively and evaluated at capture time via the platform's rules surface; no engine behavior is redefined. Every configuration change is audited via `ENG-004` per `ADR-014`.

#### 1.1.3 AI Workspace ↔ Platform, Source Modules, Analytics, and Downstream Boundary

- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. MOD-018 consumes these read-only via `ENG-001`, `ENG-002`, `ENG-003`.
- **Source modules** (MOD-002 … MOD-017, MOD-019) own their master and transactional data. MOD-018 consumes source-module data strictly **read-only** via approved read-model mechanisms; consumption of source-module domain events at scale is exercised in later sprints. No source-module transaction is mutated by MOD-018 in this sprint or later.
- **MOD-017 Analytics** owns cross-module KPI definitions. MOD-018 declares no KPI authority.
- **AI provider integration** is delivered exclusively through `ENG-028` AI Copilot Engine via the provider abstraction in `SPR-MOD-018-003` / `SPR-MOD-018-004`; MOD-018 does not import provider SDKs directly and does not redefine engine behavior.
- **Approval enforcement** is provided by `ENG-011` Approval Engine and is exercised in `SPR-MOD-018-003` / `SPR-MOD-018-005`; MOD-018 declares no approval mechanics of its own.

Ownership boundaries SHALL NOT be redefined in downstream MOD-018 Sprint PRDs.

#### 1.1.4 Foundation Master Lifecycle Boundary

MOD-018 AI Workspace owns the lifecycle of the Prompt and Prompt Version masters and the AI Workspace foundation configuration lifecycle authored in this sprint. Downstream MOD-018 sprints (Retrieval; Tool Calling; Copilot Surfaces; Governance) consume these entities and states without redefining their lifecycles.

### 1.2 In Scope

- **Prompt master** — create, edit, activate, deactivate, archive under a tenant/company; per-Prompt attributes (name, description, owner, classification hint) resolved via `ENG-006` where locale-sensitive.
- **Prompt Version master** — immutable versioned revision authored under a Prompt; version metadata; only one active Prompt Version per Prompt at a time (see §5 Business Rules).
- **Prompt lifecycle** — `Draft → Active → Inactive → Archived` for Prompt and for Prompt Version records, enforced declaratively at capture time.
- **Prompt review-and-publish business process** — the deterministic sequence by which a Prompt (via its authored Prompt Version) is reviewed and transitioned to Active; only one active Prompt Version is exposed at a time.
- **Versioning-and-audit rule for prompts and tool definitions** — the module-level rule that every change to a Prompt, a Prompt Version, or a tool definition is versioned (via the Prompt Version master here for prompts; via the Tool Definition versioning surface in `SPR-MOD-018-003` for tools) and audited via `ENG-004` per `ADR-014`.
- **Enabled surfaces per tenant configuration** — the per-tenant enablement key registered under `ENG-005` in the tenant → company → context hierarchy.
- **Numbering series for AI Workspace transactions** — registration of numbering series under `ENG-005` for allocation via `ENG-017` at document issuance in downstream sprints (AI Tool Call, AI Conversation, AI Approval).
- **Structural validation and hierarchy enforcement** — declarative validation of Prompt and Prompt Version records at capture time via the platform rules surface.
- **Module-wide search-index baseline** — registration of the Prompt master and Prompt Version master under `ENG-020` for read discoverability.
- **Audit** — every state change on a Prompt record, a Prompt Version record, or the Enabled surfaces per tenant key is audited via `ENG-004` per `ADR-014`.

### 1.3 Out of Scope

- Retrieval Corpus master, retrieval build/refresh business process, retrieval refresh cadence configuration, and retrieval-corpora-respect-module-authorization-at-query-time rule — allocated to `SPR-MOD-018-002`.
- Tool Definition master, AI Tool Call transaction, tool-call-with-approval business process, `AIToolCallRequested` publication, and consumption of module domain events as trigger inputs — allocated to `SPR-MOD-018-003`.
- AI Conversation transaction, prompt-to-response business process, `AIConversationStarted` publication, per-surface enablement of copilot rendering — allocated to `SPR-MOD-018-004`.
- AI Approval transaction, AI-initiated-state-change-requires-approval rule, `Cost budgets` configuration, `Approval policies` configuration, AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency reports, `AIApprovalGranted` / `AIApprovalDenied` publications — allocated to `SPR-MOD-018-005`.
- Identity, authentication, permissions — owned by MOD-001 via `ENG-001`, `ENG-002`, `ENG-003`.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- AI provider integration mechanics — delivered through `ENG-028` in `SPR-MOD-018-003` / `SPR-MOD-018-004`.
- Any redefinition of ERP Core Engine behavior.
- Physical schema, code, routes, migrations, and UI.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | Prompt master authority | Master Data | Definition, metadata, active/inactive lifecycle, uniqueness. |
| 2 | Prompt Version master authority | Master Data | Immutable versioned revision; exactly one active version per Prompt. |
| 3 | Prompt review-and-publish business process | Business Process | Deterministic Draft → Active transition of a Prompt Version. |
| 4 | Versioning-and-audit rule for prompts and tool definitions | Business Rule | Module-wide rule; audit via `ENG-004` per `ADR-014`. |
| 5 | Enabled surfaces per tenant configuration key | Configuration | Registered under `ENG-005`; tenant → company → context. |
| 6 | Numbering series registration | Configuration | AI Workspace document series registered under `ENG-005` for allocation via `ENG-017` in downstream sprints. |
| 7 | Structural validation | Rule surface | Declarative validation of Prompt and Prompt Version records at capture time. |
| 8 | Search-index baseline | Integration | Prompt and Prompt Version masters registered under `ENG-020`. |
| 9 | Foundation-layer events published | Events | `PromptCreated`, `PromptUpdated`, `PromptVersionPublished`. |
| 10 | Ownership boundaries recapitulation | Documentation | §1.1.3 — no reassignment. |

---

## 3. Traceability to Module PRD

Bidirectional traceability from the [MOD-018 AI Workspace Module PRD](../../../20-module-prds/ai/MODULE_PRD.md) and the approved [MOD-018 Sprint Plan](../MOD-018_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 001

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Prompt library and governance (capability) | §2 Capabilities | SPR-MOD-018-001 (origin) | §1, §2, §4 (Prompt / Prompt Version masters) |
| Submodule: Prompt Library | §2 Submodules | SPR-MOD-018-001 (origin) | §1, §2 |
| Prompt (master) | §5 Master Data | SPR-MOD-018-001 (origin) | §4.1 Prompt |
| Prompt Version (master) | §5 Master Data | SPR-MOD-018-001 (origin) | §4.1 Prompt Version |
| Prompt review and publish (process) | §4 Business Processes | SPR-MOD-018-001 (origin) | §4.3 / §5 |
| Prompts and tool definitions are versioned and audited (rule) | §7 Business Rules | SPR-MOD-018-001 (origin) | §5 Rule 1 |
| Enabled surfaces per tenant (configuration) | §10 Configuration | SPR-MOD-018-001 (origin) | §4.2 Enabled surfaces per tenant |
| Platform latency budget / batch envelope (foundation scaffolding) | §11 Non-functional | SPR-MOD-018-001 (foundation scaffolding) | §4.2 Environment-level defaults consumed read-only |
| Depends On Modules — read-only consumption from MOD-001 | §13 Dependencies | SPR-MOD-018-001 (foundation scaffolding) | §1.1.3 Boundary |

### 3.2 Reverse Map — Sprint 001 → Module PRD / Sprint Plan

| Sprint 001 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Prompt Master Authority | §2 Capabilities; §5 Master Data | §2 SPR-MOD-018-001 Objective; §4.3 Master Data Forward Map |
| Prompt Version Master Authority | §5 Master Data | §2 SPR-MOD-018-001 Objective; §4.3 Master Data Forward Map |
| Prompt review-and-publish business process | §4 Business Processes | §2 SPR-MOD-018-001 Boundaries |
| Versioning-and-audit rule for prompts and tool definitions | §7 Business Rules | §2 SPR-MOD-018-001 Boundaries |
| Enabled surfaces per tenant configuration | §10 Configuration | §2 SPR-MOD-018-001 Boundaries |
| Numbering series registration | §6 Transactions numbering scaffolding | §2 SPR-MOD-018-001 Objective / Exit Criteria |
| Structural validation | §5 Master Data validation; §7 Business Rules | §2 SPR-MOD-018-001 Exit Criteria (structural validation) |
| Search-index baseline | §12 ENG-020 Search | §2 SPR-MOD-018-001 Engines Consumed |
| PromptCreated / PromptUpdated / PromptVersionPublished | §8 Events (foundation events derived from §2 Prompt library capability and §5 Prompt / Prompt Version lifecycle) | §2 SPR-MOD-018-001 Exit Criteria (auditability + event surface) |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-018-001 allocation. Every Module PRD item allocated to SPR-MOD-018-001 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. AI Workspace remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**Prompt (business entity — MOD-018 authority).**

- **Purpose.** Represents a named prompt under a tenant/company. Consumed downstream by Retrieval, Tool Calling, and Copilot Conversations.
- **Attributes (business level).**
  - Identifier (allocated via `ENG-017` in downstream document contexts; the master identifier is business-level here).
  - Name (locale-sensitive via `ENG-006`).
  - Description (locale-sensitive via `ENG-006`).
  - Owner (business role or team reference — resolved via MOD-001 identities read-only).
  - Classification hint (business classification).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Prompts (with an active Prompt Version) are consumable by downstream sprints (see §5 Business Rules).
- **Uniqueness.** Prompt definitions are unique within a tenant/company on `name`; the platform rules surface enforces this at capture time.
- **Validation.** Structural validation (required fields, referential integrity, uniqueness) is declarative and evaluated at capture time via the platform rules surface.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Search.** Registered under `ENG-020` for read discoverability.

**Prompt Version (business entity — MOD-018 authority).**

- **Purpose.** Represents an immutable versioned revision of a Prompt.
- **Attributes (business level).**
  - Parent Prompt reference.
  - Version identifier (monotonically increasing within a Prompt).
  - Body (locale-sensitive via `ENG-006` where applicable).
  - Reviewer reference (resolved via MOD-001 identities read-only).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only one Prompt Version per parent Prompt may be in state **Active** at any time.
- **Immutability.** Once a Prompt Version leaves `Draft`, its body is immutable; further changes require authoring a new Prompt Version.
- **Validation.** Declarative at capture time.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Search.** Registered under `ENG-020` for read discoverability.

### 4.2 Configuration Keys (registered under `ENG-005`)

| Key (business scope) | Scope | Resolves Via | Consumed By |
| --- | --- | --- | --- |
| Enabled surfaces per tenant | Per tenant / company | `ENG-005` tenant → company → context | All downstream MOD-018 sprints (Copilot surfaces enforcement in `SPR-MOD-018-004`). |
| Numbering series for AI Workspace transactions | Per AI Workspace document type | `ENG-005` registration; `ENG-017` allocation at issuance | Downstream MOD-018 transactions (AI Tool Call, AI Conversation, AI Approval). |

Configuration validation is declarative and evaluated at capture time.

### 4.3 Business Processes

**Prompt review and publish (MOD-018 authority).**

- **Trigger.** A Prompt author submits a Prompt Version currently in state `Draft`.
- **Steps (business level).**
  1. Author submits the Prompt Version for review.
  2. Reviewer (resolved via MOD-001 identities read-only, authorized via `ENG-002`) reviews the Prompt Version.
  3. On approval, the Prompt Version transitions `Draft → Active`; any previously active Prompt Version for the same parent Prompt transitions `Active → Inactive` in the same deterministic step.
  4. `PromptVersionPublished` is emitted via `ENG-024`; audit records are written via `ENG-004` per `ADR-014`.
- **Determinism.** The process runs deterministically; only one active Prompt Version per parent Prompt is exposed at any time.

### 4.4 Transactions

**None in this sprint.** The MOD-018 transactions declared in the Module PRD §6 (AI Tool Call, AI Conversation, AI Approval) are allocated to `SPR-MOD-018-003`, `SPR-MOD-018-004`, and `SPR-MOD-018-005` respectively by the approved Sprint Plan.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Versioning-and-audit rule for prompts and tool definitions.** Every change to a Prompt, a Prompt Version, or a tool definition shall be versioned and audited via `ENG-004` per `ADR-014`. For prompts, versioning is realized through the Prompt Version master authored here; for tool definitions, versioning is realized through the Tool Definition versioning surface authored in `SPR-MOD-018-003` and inherits this rule.
2. **Prompt uniqueness.** Every Prompt shall have a unique definition within a tenant/company (uniqueness on `name`).
3. **Prompt Version immutability.** Once a Prompt Version leaves state `Draft`, its body shall not be modified; further changes require authoring a new Prompt Version.
4. **Single active Prompt Version.** For any given Prompt, at most one Prompt Version shall be in state **Active** at any time. Transitioning a Prompt Version to `Active` shall deterministically transition any previously active Prompt Version for the same parent Prompt to `Inactive` in the same step.
5. **Lifecycle enforcement.** Prompt and Prompt Version lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
6. **Enabled surfaces per tenant configurability.** The Enabled surfaces per tenant key shall be configurable per tenant/company via `ENG-005` in the tenant → company → context hierarchy.
7. **Auditability.** Every configuration change to the Enabled surfaces per tenant key or to a Prompt / Prompt Version record shall be auditable via `ENG-004` per `ADR-014`.
8. **Read-model-only against source modules.** No Sprint 001 operation shall mutate source-module master or transactional data.
9. **Configuration validation at capture time.** AI Workspace foundation configuration keys and Prompt / Prompt Version records shall be validated declaratively at capture time via the platform rules surface.

---

## 6. Events

### 6.1 Events Published (Sprint 001 foundation events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `PromptCreated` | Prompt record enters `Active` for the first time (or `Draft → Active` transition, per lifecycle) | Signals to downstream MOD-018 sprints and search/index consumers that a new Prompt is available. |
| `PromptUpdated` | Prompt metadata or lifecycle state changes (excluding Prompt Version publish, which emits its own event) | Signals to downstream consumers that a Prompt's definition changed. |
| `PromptVersionPublished` | A Prompt Version transitions `Draft → Active` through the review-and-publish process | Signals to downstream consumers that a new active Prompt Version is available for the parent Prompt. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Only upstream platform events explicitly allocated by the Module PRD's §13 read-only consumption boundary. In Sprint 001, the ingestion surface is scaffolding only — the actual consumption of source-module domain events as retrieval inputs or trigger inputs is exercised in `SPR-MOD-018-002` and `SPR-MOD-018-003`; here we register the read-only consumption stance without invoking source-module business logic.

No new event contract is defined outside the Sprint Plan and Module PRD allocation.

---

## 7. Integrations

MOD-018 AI Workspace **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 001 |
| --- | --- |
| `ENG-001` Identity | Resolve caller identity for Prompt / Prompt Version authoring and configuration edits (read-only). |
| `ENG-002` Authorization | Authorize Prompt / Prompt Version authoring, review, and configuration edits per `ADR-032`. |
| `ENG-003` Permission Management | Resolve role and permission grants for AI Workspace authoring. |
| `ENG-004` Audit | Persist audit records for every state change per `ADR-014`. |
| `ENG-005` Configuration | Register and resolve the Enabled surfaces per tenant key and numbering series. |
| `ENG-006` Localization | Resolve locale-sensitive Prompt / Prompt Version attributes (name, description, body). |
| `ENG-017` Numbering | Allocate numbering for AI Workspace documents (issued in downstream sprints; series registered here). |
| `ENG-020` Search | Register the Prompt and Prompt Version masters for read discoverability. |
| `ENG-024` Event | Publish `PromptCreated`, `PromptUpdated`, `PromptVersionPublished`; scaffold read-only consumption of upstream module events. |

No engine ownership is established by this sprint.

---

## 8. Dependencies

### 8.1 Upstream Dependencies

- **Governance Framework v1.0** — Released.
- **GT-003 v1.0** — Active.
- **FROZEN Execution Wrapper v1.0** — FROZEN.
- **Module PRD** — [`docs/20-module-prds/ai/MODULE_PRD.md`](../../../20-module-prds/ai/MODULE_PRD.md) — Approved.
- **Sprint Plan** — [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) — Approved.
- **Prior repository audit** — `REPOSITORY_AUDIT_20260717T230000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 001):** `ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-017`, `ENG-020`, `ENG-024`.
- **Engines optional (Sprint 001):** none.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** None (first MOD-018 sprint).
- **Downstream sprints.** `SPR-MOD-018-002` … `SPR-MOD-018-005` depend on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Prompt creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create a Prompt record under a tenant/company; the record persists with all required attributes; `PromptCreated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1; Rule 2, 7.)
2. **AC-002 — Prompt uniqueness.** Attempting to create a Prompt whose `name` collides with an existing Prompt under the same tenant/company is rejected at capture time by the platform rules surface. (Deliverable 1; Rule 2.)
3. **AC-003 — Prompt edit and metadata update.** A caller with appropriate grants can edit a Prompt's metadata (name, description, owner, classification hint); `PromptUpdated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1; Rule 7.)
4. **AC-004 — Prompt Version authoring.** A caller with appropriate grants can author a Prompt Version under an existing Prompt in state `Draft`; the record persists with all required attributes; an `ENG-004` audit record is written. (Deliverable 2; Rule 7.)
5. **AC-005 — Prompt Version immutability.** Once a Prompt Version leaves `Draft`, its body cannot be modified; edits are rejected at capture time. (Deliverable 2; Rule 3.)
6. **AC-006 — Prompt review-and-publish process.** The review-and-publish process transitions a `Draft` Prompt Version to `Active` deterministically; any previously active Prompt Version for the same parent Prompt transitions to `Inactive` in the same deterministic step; `PromptVersionPublished` is emitted via `ENG-024`; audit records are written. (Deliverable 3; Rule 4, 5, 7.)
7. **AC-007 — Single active Prompt Version.** At most one Prompt Version per parent Prompt is in state `Active` at any time; violating transitions are rejected. (Deliverable 2, 3; Rule 4.)
8. **AC-008 — Prompt and Prompt Version lifecycle.** Prompt and Prompt Version records follow the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited. (Deliverables 1, 2; Rule 5, 7.)
9. **AC-009 — Versioning-and-audit rule.** Every change to a Prompt or Prompt Version is versioned (via the Prompt Version master) and audited via `ENG-004`; the same rule is declared to apply to tool definitions authored in `SPR-MOD-018-003`. (Deliverable 4; Rule 1, 7.)
10. **AC-010 — Enabled surfaces per tenant configuration.** The Enabled surfaces per tenant key is registered under `ENG-005` and resolves deterministically in the tenant → company → context hierarchy; every change is audited. (Deliverable 5; Rule 6, 7.)
11. **AC-011 — Numbering series registration.** Numbering series for AI Workspace document types are registered under `ENG-005` for allocation via `ENG-017` at document issuance in downstream sprints. (Deliverable 6.)
12. **AC-012 — Structural validation.** Prompt and Prompt Version records are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverable 7; Rule 5, 9.)
13. **AC-013 — Search-index baseline.** The Prompt and Prompt Version masters are registered under `ENG-020` and are discoverable via read-only search. (Deliverable 8.)
14. **AC-014 — Read-model-only against source modules.** No Sprint 001 operation writes to a source module's master or transactional data. Automated evidence: no Sprint 001 authority extends outside MOD-018-owned entities and configuration keys. (Deliverable 10; Rule 8.)
15. **AC-015 — Audit trail.** Every state-changing operation in §2 (Prompt create/edit/lifecycle; Prompt Version author/publish/lifecycle; Enabled surfaces per tenant configuration change) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–5; Rule 7.)
16. **AC-016 — Ownership boundaries preserved.** No MOD-001 / MOD-017 / source-module authority is redefined; MOD-018 does not claim ownership of any platform engine; provider integration is not exercised in this sprint. (Deliverable 10.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.3 (not evolved):

- **MOD-018 AI Workspace** owns the Prompt and Prompt Version masters, the Prompt review-and-publish business process, the versioning-and-audit rule for prompts and tool definitions, the Enabled surfaces per tenant configuration, and the AI Workspace numbering series registration (this sprint).
- **Source modules** continue to own all transactional and master data; MOD-018 consumes strictly read-only through approved read-model mechanisms.
- **MOD-001 Platform Administration** retains ownership of Identity (`ENG-001`), Authorization (`ENG-002`), and Permission Management (`ENG-003`).
- **MOD-017 Analytics** retains ownership of cross-module KPI definitions.
- **Platform engines** retain ownership of Configuration (`ENG-005`), Audit (`ENG-004`), Search (`ENG-020`), Event infrastructure (`ENG-024`), Numbering (`ENG-017`), Localization (`ENG-006`), Approval (`ENG-011`; exercised in later sprints), and AI Copilot (`ENG-028`; exercised in later sprints).

**No ownership reassignment. No transactional authority introduced.**

---

## 11. Non-Goals

- No Retrieval Corpus master, retrieval build/refresh process, retrieval refresh cadence configuration, or query-time authorization rule (allocated to `SPR-MOD-018-002`).
- No Tool Definition master, AI Tool Call transaction, tool-call-with-approval process, `AIToolCallRequested` publication, or consumption of module domain events as trigger inputs (allocated to `SPR-MOD-018-003`).
- No AI Conversation transaction, prompt-to-response process, or `AIConversationStarted` publication (allocated to `SPR-MOD-018-004`).
- No AI Approval transaction, approval-gate rule, cost budgets, approval policies, AI reports, or `AIApprovalGranted` / `AIApprovalDenied` publications (allocated to `SPR-MOD-018-005`).
- No AI provider integration; provider mechanics are delivered exclusively through `ENG-028` in later sprints.
- No transactional authority. No modification of source-module master or transactional data.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.

---

## 12. References

- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../../20-module-prds/ai/MODULE_PRD.md) — Parent Module PRD (authoritative).
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) — Parent Sprint Plan (Stage 1).
- [`docs/30-sprint-prds/ai/README.md`](../README.md) — Sprint container.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md) — Sprint sizing.
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md) — Sprint dependency rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260717T230000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260717T230000Z.md) — Preceding audit (Repository READY).
