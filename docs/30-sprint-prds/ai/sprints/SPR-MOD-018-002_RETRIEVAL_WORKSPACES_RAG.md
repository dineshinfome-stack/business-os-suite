---
title: "SPR-MOD-018-002 — Retrieval Workspaces (RAG)"
summary: "Sprint PRD for the retrieval layer of MOD-018 AI Workspace: Retrieval Corpus master data with the standard active/inactive lifecycle; the retrieval build-and-refresh business process; the retrieval-corpora-respect-module-authorization-at-query-time business rule; and the Retrieval refresh cadence configuration. Consumes ERP Core Engines and Accepted ADRs; never redefines them. AI Workspace is governance-mediated relative to source-module transactional truth."
layer: "delivery"
owner: "AI Platform"
status: "Draft"
updated: "2026-07-18"
sprint_id: "SPR-MOD-018-002"
parent_module: "MOD-018"
parent_sprint_plan: "MOD-018_SPRINT_PLAN.md"
iteration: "Sprint 2"
stage: "2"
pass: "23.0.3"
size: "Medium"
related_engines: ["ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-020", "ENG-024", "ENG-013", "ENG-023"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "ai-workspace", "mod-018", "retrieval", "rag", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD018-002-20260718T010000Z-001"
parent_result_id: "GT003-MOD018-001-20260718T000000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-018-002 — Retrieval Workspaces (RAG)

> **Stage 2 deliverable.** Second authored Sprint PRD for **MOD-018 AI Workspace** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. AI Workspace is governance-mediated relative to source-module transactional truth: it never mutates a source-module master or transaction, and provider integration is delivered exclusively through `ENG-028` in later sprints. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-018-002` (permanent) |
| Parent Module | `MOD-018` — AI Workspace |
| Parent Sprint Plan | [`MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) |
| Iteration | Sprint 2 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-018-001` (reference / traceability only) |
| Downstream Sprints | `SPR-MOD-018-003` … `SPR-MOD-018-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish **Retrieval Workspaces (RAG)** for BusinessOS: the **Retrieval Corpus master** (with the standard `Draft → Active → Inactive → Archived` lifecycle), the **retrieval build-and-refresh business process**, the module-level **retrieval-corpora-respect-module-authorization-at-query-time** business rule, and the **Retrieval refresh cadence** configuration. This retrieval layer is the substrate that Tool Calling (`SPR-MOD-018-003`) and Copilot Conversations (`SPR-MOD-018-004`) consume for grounded responses, and it inherits the foundation (Prompt master, versioning-and-audit rule, Enabled surfaces per tenant, numbering series, search-index baseline) established in `SPR-MOD-018-001`.

> **AI Workspace Ownership Convention (unchanged).** MOD-018 AI Workspace owns the business semantics of the Retrieval Corpus master and the retrieval-related configuration authored in this sprint. ERP Core Engines provide shared infrastructure (authorization, permissions, audit, configuration, localization, search, eventing; automation and integration where optionally required). MOD-018 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules and are consumed **read-only** as corpus inputs. Cross-module KPI definitions remain owned by **MOD-017 Analytics** and are out of scope here. AI provider integration is delivered exclusively through `ENG-028` in `SPR-MOD-018-003` / `SPR-MOD-018-004`; MOD-018 does not import provider SDKs directly and does not redefine engine behavior.

#### 1.1.1 Retrieval Corpus Master Authority

The **Retrieval Corpus** master is authoritatively owned by MOD-018 AI Workspace. This sprint establishes:

- **Retrieval Corpus definition** — the business entity representing a named retrieval corpus under a tenant/company, consumed downstream by Tool Calling and Copilot Conversations.
- **Corpus source binding** — the declared read-only bindings to source-module domain events and/or read-model masters that constitute the corpus inputs.
- **Refresh cadence attribute** — the per-corpus cadence value that resolves against the tenant-scoped **Retrieval refresh cadence** configuration key.
- **Lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle for Retrieval Corpus records.

No other module MAY create, edit, refresh, archive, or independently maintain a parallel Retrieval Corpus master. Downstream MOD-018 sprints and downstream modules consume the Retrieval Corpus master through AI-Workspace-owned read APIs authored in later sprints; they MUST NOT redefine the entity or its lifecycle.

#### 1.1.2 Retrieval Configuration Authority

The **Retrieval refresh cadence** configuration key is authoritatively owned by MOD-018 AI Workspace, in this sprint. The key is registered under `ENG-005` and resolves deterministically in the tenant → company → context hierarchy. Downstream MOD-018 sprints consume this configuration read-only.

Configuration validation is expressed declaratively and evaluated at capture time via the platform's rules surface; no engine behavior is redefined. Every configuration change is audited via `ENG-004` per `ADR-014`.

#### 1.1.3 Retrieval ↔ Foundation, Platform, Source Modules, Analytics, and Downstream Boundary

- **`SPR-MOD-018-001` Foundation** is a reference-and-traceability dependency only. This sprint does not re-author Prompt / Prompt Version authority, the Prompt review-and-publish process, the versioning-and-audit rule, the Enabled surfaces per tenant configuration, the numbering series registration, or the search-index baseline. Prompts reference retrieval corpora exclusively through published capability contracts authored in later sprints.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. MOD-018 consumes these read-only via `ENG-002`, `ENG-003`.
- **Source modules** (MOD-002 … MOD-017, MOD-019) own their master and transactional data. MOD-018 consumes source-module data strictly **read-only** as corpus inputs via approved read-model mechanisms and via read-only subscription to source-module domain events. **No source-module transaction is mutated by MOD-018 in this sprint or later.**
- **MOD-017 Analytics** owns cross-module KPI definitions. MOD-018 declares no KPI authority.
- **AI provider integration** is delivered exclusively through `ENG-028` in `SPR-MOD-018-003` / `SPR-MOD-018-004`; MOD-018 does not import provider SDKs directly.
- **Approval enforcement** is provided by `ENG-011` and is exercised in `SPR-MOD-018-003` / `SPR-MOD-018-005`; MOD-018 declares no approval mechanics of its own in this sprint.

Ownership boundaries SHALL NOT be redefined in downstream MOD-018 Sprint PRDs.

#### 1.1.4 Retrieval Corpus Lifecycle Boundary

MOD-018 AI Workspace owns the lifecycle of the Retrieval Corpus master and the Retrieval refresh cadence configuration lifecycle authored in this sprint. Downstream MOD-018 sprints (Tool Calling; Copilot Surfaces; Governance) consume Retrieval Corpus records and states without redefining their lifecycles.

### 1.2 In Scope

- **Retrieval Corpus master** — create, edit, activate, deactivate, archive under a tenant/company; per-corpus attributes (name, description, corpus source binding, refresh cadence attribute, owner, classification hint) resolved via `ENG-006` where locale-sensitive.
- **Retrieval Corpus lifecycle** — `Draft → Active → Inactive → Archived`, enforced declaratively at capture time.
- **Retrieval build-and-refresh business process** — the deterministic sequence by which a Retrieval Corpus is (re)built from its declared read-only inputs on its configured cadence; source-module masters and transactions remain unmutated.
- **Retrieval-corpora-respect-module-authorization-at-query-time business rule** — the module-level rule that at query time a Retrieval Corpus enforces the caller's module-level authorization, as defined by the approved Module PRD and allocated architecture decisions (`ADR-032` RBAC + ABAC; `ADR-011` Multi-Tenant Isolation).
- **Retrieval refresh cadence configuration** — the per-tenant configuration key registered under `ENG-005` in the tenant → company → context hierarchy.
- **Structural validation and hierarchy enforcement** — declarative validation of Retrieval Corpus records and Retrieval refresh cadence configuration values at capture time via the platform rules surface.
- **Read-only consumption of source-module domain events and read-model masters** as corpus inputs.
- **Audit** — every state change on a Retrieval Corpus record or the Retrieval refresh cadence configuration key is audited via `ENG-004` per `ADR-014`.
- **Retrieval-layer events published** — `RetrievalCorpusCreated`, `RetrievalCorpusUpdated`, `RetrievalCorpusRefreshed`, emitted via `ENG-024`.
- **Search-index registration for the Retrieval Corpus master** under `ENG-020`, inheriting the module-wide search-index baseline established in `SPR-MOD-018-001`.

### 1.3 Out of Scope

- Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-018-001`.
- Tool Definition master, AI Tool Call transaction, tool-call-with-approval business process, `AIToolCallRequested` publication, and consumption of module domain events as tool trigger inputs — allocated to `SPR-MOD-018-003`.
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
| 1 | Retrieval Corpus master authority | Master Data | Definition, corpus source binding, refresh cadence attribute, standard active/inactive lifecycle, uniqueness. |
| 2 | Retrieval build-and-refresh business process | Business Process | Deterministic corpus (re)build from read-only source inputs; source-module data unmutated. |
| 3 | Retrieval-corpora-respect-module-authorization-at-query-time rule | Business Rule | Module-level rule; enforced via `ENG-002` / `ENG-003` per `ADR-032` and `ADR-011`. |
| 4 | Retrieval refresh cadence configuration key | Configuration | Registered under `ENG-005`; tenant → company → context. |
| 5 | Structural validation | Rule surface | Declarative validation of Retrieval Corpus records and Retrieval refresh cadence values at capture time. |
| 6 | Search-index registration for Retrieval Corpus | Integration | Retrieval Corpus master registered under `ENG-020` (inherits foundation baseline from Sprint 001). |
| 7 | Retrieval-layer events published | Events | `RetrievalCorpusCreated`, `RetrievalCorpusUpdated`, `RetrievalCorpusRefreshed`. |
| 8 | Read-only source-module consumption stance | Integration | Read-only subscription to source-module domain events and read-only read-model consumption as corpus inputs; no source-module writes. |
| 9 | Ownership boundaries recapitulation | Documentation | §1.1.3 — no reassignment. |

---

## 3. Traceability to Module PRD and Sprint Plan

Bidirectional traceability from the [MOD-018 AI Workspace Module PRD](../../../20-module-prds/ai/MODULE_PRD.md) and the approved [MOD-018 Sprint Plan](../MOD-018_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 002

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Retrieval workspaces (RAG) (capability) | §2 Capabilities | SPR-MOD-018-002 (origin) | §1, §2, §4 |
| Submodule: Retrieval | §2 Submodules | SPR-MOD-018-002 (origin) | §1, §2 |
| Retrieval Corpus (master) | §5 Master Data | SPR-MOD-018-002 (origin) | §4.1 Retrieval Corpus |
| Retrieval build/refresh (process) | §4 Business Processes | SPR-MOD-018-002 (origin) | §4.3 |
| Retrieval corpora respect module-level authorization at query time (rule) | §7 Business Rules | SPR-MOD-018-002 (origin) | §5 Rule 1 |
| Retrieval refresh cadence (configuration) | §10 Configuration | SPR-MOD-018-002 (origin) | §4.2 Retrieval refresh cadence |
| Read-only consumption of source-module data | §13 Dependencies | SPR-MOD-018-002 (foundation scaffolding) | §1.1.3 Boundary; §6.2 Events Consumed |
| Optional scheduled refresh via `ENG-013` Automation | §12 ERP Core Engine Consumption | SPR-MOD-018-002 (optional) | §7 Integrations |

### 3.2 Reverse Map — Sprint 002 → Module PRD / Sprint Plan

| Sprint 002 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Retrieval Corpus Master Authority | §2 Capabilities; §5 Master Data | §2 SPR-MOD-018-002 Objective; §4.3 Master Data Forward Map |
| Retrieval build-and-refresh business process | §4 Business Processes | §2 SPR-MOD-018-002 Boundaries |
| Retrieval-corpora-respect-module-authorization-at-query-time rule | §7 Business Rules | §2 SPR-MOD-018-002 Boundaries |
| Retrieval refresh cadence configuration | §10 Configuration | §2 SPR-MOD-018-002 Boundaries |
| Structural validation | §5 Master Data validation; §7 Business Rules | §2 SPR-MOD-018-002 Exit Criteria |
| Search-index registration for Retrieval Corpus | §12 ENG-020 Search | §2 SPR-MOD-018-002 Engines Consumed |
| RetrievalCorpusCreated / RetrievalCorpusUpdated / RetrievalCorpusRefreshed | §8 Events (retrieval-layer events derived from §2 Retrieval capability and §5 Retrieval Corpus lifecycle) | §2 SPR-MOD-018-002 Exit Criteria (auditability + event surface) |
| Read-only source-module consumption stance | §13 Dependencies | §2 SPR-MOD-018-002 Boundaries |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-018-002 allocation. Every Module PRD item allocated to SPR-MOD-018-002 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. No re-authoring of Sprint 001 authorities. AI Workspace remains read-model-only against source-module transactional truth.

---

## 4. Data Model Impact

### 4.1 Master Data

**Retrieval Corpus (business entity — MOD-018 authority).**

- **Purpose.** Represents a named retrieval corpus under a tenant/company. Consumed downstream by Tool Calling (`SPR-MOD-018-003`) and Copilot Conversations (`SPR-MOD-018-004`).
- **Attributes (business level).**
  - Identifier (business-level).
  - Name (locale-sensitive via `ENG-006`).
  - Description (locale-sensitive via `ENG-006`).
  - Owner (business role or team reference — resolved via MOD-001 identities read-only).
  - Classification hint (business classification).
  - Corpus source binding (declared read-only bindings to source-module domain events and/or read-model masters that constitute corpus inputs).
  - Refresh cadence attribute (per-corpus cadence that resolves against the tenant-scoped **Retrieval refresh cadence** configuration key).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Retrieval Corpora are consumable at query time by downstream sprints (see §5 Business Rules).
- **Uniqueness.** Retrieval Corpus definitions are unique within a tenant/company on `name`; the platform rules surface enforces this at capture time.
- **Validation.** Structural validation (required fields, referential integrity, uniqueness, source-binding integrity) is declarative and evaluated at capture time via the platform rules surface.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Search.** Registered under `ENG-020` for read discoverability.

### 4.2 Configuration Keys (registered under `ENG-005`)

| Key (business scope) | Scope | Resolves Via | Consumed By |
| --- | --- | --- | --- |
| Retrieval refresh cadence | Per tenant / company | `ENG-005` tenant → company → context | Retrieval build-and-refresh business process (this sprint); downstream MOD-018 sprints consuming Retrieval Corpora read-only. |

Configuration validation is declarative and evaluated at capture time.

### 4.3 Business Processes

**Retrieval build-and-refresh (MOD-018 authority).**

- **Trigger.** (a) A newly-`Active` Retrieval Corpus enters the schedule; (b) the corpus's configured cadence elapses; or (c) an authorized caller (authorized via `ENG-002`) requests an out-of-band refresh.
- **Steps (business level).**
  1. Resolve the corpus's declared read-only source bindings.
  2. Read source-module domain events and/or read-model masters (read-only) for the declared window.
  3. (Re)build the corpus content deterministically from those read-only inputs; no source-module master or transaction is mutated.
  4. On completion, `RetrievalCorpusRefreshed` is emitted via `ENG-024`; audit records are written via `ENG-004` per `ADR-014`.
- **Determinism.** For a given corpus definition and a given read-only input window, the process is deterministic; two refreshes over identical inputs produce equivalent corpus state.
- **Optional automation.** Where a corpus's cadence requires scheduling, `ENG-013` Automation MAY be consumed to schedule refreshes; `ENG-013` behavior is not redefined.

### 4.4 Transactions

**None in this sprint.** The MOD-018 transactions declared in the Module PRD §6 (AI Tool Call, AI Conversation, AI Approval) are allocated to `SPR-MOD-018-003`, `SPR-MOD-018-004`, and `SPR-MOD-018-005` respectively by the approved Sprint Plan.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Retrieval-corpora-respect-module-authorization-at-query-time.** Retrieval corpora shall respect module-level authorization at query time, as defined by the approved Module PRD and allocated architecture decisions (`ADR-032` RBAC + ABAC; `ADR-011` Multi-Tenant Isolation). A caller shall never receive retrieval context they cannot read in the corresponding source module.
2. **Retrieval Corpus uniqueness.** Every Retrieval Corpus shall have a unique definition within a tenant/company (uniqueness on `name`).
3. **Retrieval Corpus lifecycle enforcement.** Retrieval Corpus lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
4. **Only Active corpora are query-time consumable.** Only Retrieval Corpora in state **Active** shall be resolvable by downstream MOD-018 sprints at query time; corpora in `Draft`, `Inactive`, or `Archived` are not consumable.
5. **Retrieval refresh cadence configurability.** The Retrieval refresh cadence key shall be configurable per tenant/company via `ENG-005` in the tenant → company → context hierarchy.
6. **Deterministic refresh.** The retrieval build-and-refresh process shall run deterministically for a given corpus definition and read-only input window.
7. **Read-model-only against source modules.** No Sprint 002 operation shall mutate source-module master or transactional data. Corpus inputs are consumed strictly read-only.
8. **Auditability.** Every state change on a Retrieval Corpus record, every configuration change to the Retrieval refresh cadence key, and every corpus refresh event shall be auditable via `ENG-004` per `ADR-014`.
9. **Configuration validation at capture time.** Retrieval Corpus records and the Retrieval refresh cadence configuration key shall be validated declaratively at capture time via the platform rules surface.
10. **Inherited versioning-and-audit rule.** The module-level versioning-and-audit rule authored in `SPR-MOD-018-001` continues to apply to any versioned artifact within MOD-018 scope; no redefinition here.

---

## 6. Events

### 6.1 Events Published (Sprint 002 retrieval-layer events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `RetrievalCorpusCreated` | A Retrieval Corpus enters `Active` for the first time | Signals to downstream MOD-018 sprints and search/index consumers that a new corpus is available for query-time consumption. |
| `RetrievalCorpusUpdated` | A Retrieval Corpus's metadata, source binding, cadence attribute, or lifecycle state changes | Signals to downstream consumers that the corpus definition changed. |
| `RetrievalCorpusRefreshed` | The retrieval build-and-refresh process completes for a corpus | Signals to downstream consumers and to audit that corpus contents were (re)built deterministically from read-only inputs. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`.

### 6.2 Events Consumed

Retrieval Corpora consume source-module domain events strictly **read-only** as declared corpus inputs. This sprint establishes the read-only consumption stance; the concrete set of consumed source-module events is determined by each corpus's declared source binding and does not introduce any new event contract beyond the Module PRD §8 declaration ("All module domain events (as retrieval or trigger inputs)"). No source-module transaction is invoked by MOD-018 consumption.

---

## 7. Integrations

MOD-018 AI Workspace **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 002 |
| --- | --- |
| `ENG-002` Authorization | Enforce caller module-level authorization at retrieval query time and for corpus authoring/refresh, per `ADR-032`. |
| `ENG-003` Permission Management | Resolve role and permission grants for Retrieval Corpus authoring and refresh operations. |
| `ENG-004` Audit | Persist audit records for every corpus state change, configuration change, and refresh completion per `ADR-014`. |
| `ENG-005` Configuration | Register and resolve the Retrieval refresh cadence configuration key. |
| `ENG-006` Localization | Resolve locale-sensitive Retrieval Corpus attributes (name, description). |
| `ENG-020` Search | Register the Retrieval Corpus master for read discoverability (inherits the module-wide search-index baseline from Sprint 001). |
| `ENG-024` Event | Publish `RetrievalCorpusCreated`, `RetrievalCorpusUpdated`, `RetrievalCorpusRefreshed`; consume source-module domain events strictly read-only per each corpus's declared source binding. |
| `ENG-013` Automation (optional) | Schedule corpus refreshes where a corpus's cadence requires scheduling. Behavior not redefined. |
| `ENG-023` Integration (optional) | Where a corpus's declared source binding requires read-only integration surfaces beyond native event/read-model consumption. Behavior not redefined. |

No engine ownership is established by this sprint.

---

## 8. Dependencies

### 8.1 Upstream Dependencies

- **Governance Framework v1.0** — Released.
- **GT-003 v1.0** — Active.
- **FROZEN Execution Wrapper v1.0** — FROZEN.
- **Module PRD** — [`docs/20-module-prds/ai/MODULE_PRD.md`](../../../20-module-prds/ai/MODULE_PRD.md) — Approved.
- **Sprint Plan** — [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) — Approved.
- **Foundation Sprint PRD** — [`SPR-MOD-018-001`](./SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md) — Draft (reference / traceability dependency only; no re-authoring).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260718T000000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 002):** `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-020`, `ENG-024`.
- **Engines optional (Sprint 002):** `ENG-013` Automation, `ENG-023` Integration.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-018-001` (reference / traceability only; no re-authoring of Sprint 001 authorities).
- **Downstream sprints.** `SPR-MOD-018-003` … `SPR-MOD-018-005` depend on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Retrieval Corpus creation.** A caller with appropriate `ENG-002` / `ENG-003` grants can create a Retrieval Corpus record under a tenant/company; the record persists with all required attributes (including declared source binding and refresh cadence attribute); `RetrievalCorpusCreated` is emitted via `ENG-024` upon transition to `Active`; an `ENG-004` audit record is written. (Deliverable 1; Rule 2, 8.)
2. **AC-002 — Retrieval Corpus uniqueness.** Attempting to create a Retrieval Corpus whose `name` collides with an existing corpus under the same tenant/company is rejected at capture time by the platform rules surface. (Deliverable 1; Rule 2.)
3. **AC-003 — Retrieval Corpus edit.** A caller with appropriate grants can edit a Retrieval Corpus's metadata, source binding, or cadence attribute; `RetrievalCorpusUpdated` is emitted via `ENG-024`; an `ENG-004` audit record is written. (Deliverable 1; Rule 8.)
4. **AC-004 — Retrieval Corpus lifecycle.** Retrieval Corpus records follow the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited. (Deliverable 1; Rule 3, 8.)
5. **AC-005 — Only Active corpora are query-time consumable.** A downstream caller resolving a Retrieval Corpus at query time receives only corpora in state `Active`; corpora in `Draft`, `Inactive`, or `Archived` are not resolvable. (Deliverable 1; Rule 4.)
6. **AC-006 — Retrieval build-and-refresh.** The retrieval build-and-refresh process (re)builds a corpus deterministically from its declared read-only inputs; source-module masters and transactions remain unmutated; `RetrievalCorpusRefreshed` is emitted via `ENG-024`; audit records are written. (Deliverable 2; Rule 6, 7, 8.)
7. **AC-007 — Query-time authorization enforcement.** At query time, a Retrieval Corpus enforces the caller's module-level authorization; a caller never receives retrieval context they cannot read in the corresponding source module. Enforcement is realized via `ENG-002` / `ENG-003` per `ADR-032` and `ADR-011`. (Deliverable 3; Rule 1.)
8. **AC-008 — Retrieval refresh cadence configuration.** The Retrieval refresh cadence key is registered under `ENG-005` and resolves deterministically in the tenant → company → context hierarchy; every change is audited. (Deliverable 4; Rule 5, 8.)
9. **AC-009 — Structural validation.** Retrieval Corpus records and Retrieval refresh cadence configuration values are validated declaratively at capture time; invalid inputs (including malformed source bindings) are rejected before persistence. (Deliverable 5; Rule 3, 9.)
10. **AC-010 — Search-index registration.** The Retrieval Corpus master is registered under `ENG-020` and is discoverable via read-only search. (Deliverable 6.)
11. **AC-011 — Retrieval-layer events published.** `RetrievalCorpusCreated`, `RetrievalCorpusUpdated`, and `RetrievalCorpusRefreshed` are emitted via `ENG-024` on their respective triggers and traced to their originating audit records. (Deliverable 7; Rule 8.)
12. **AC-012 — Read-model-only against source modules.** No Sprint 002 operation writes to a source module's master or transactional data. Corpus inputs are consumed strictly read-only via source-module domain events and read-model masters. (Deliverable 8; Rule 7.)
13. **AC-013 — Audit trail.** Every state-changing operation in §2 (Retrieval Corpus create/edit/lifecycle; corpus refresh completion; Retrieval refresh cadence configuration change) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–4, 7; Rule 8.)
14. **AC-014 — Ownership boundaries preserved.** No MOD-001 / MOD-017 / source-module authority is redefined; MOD-018 does not claim ownership of any platform engine; no provider integration is exercised in this sprint; the versioning-and-audit rule and the Enabled surfaces per tenant configuration from `SPR-MOD-018-001` are not re-authored. (Deliverable 9.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.3 (not evolved):

- **MOD-018 AI Workspace** owns the Retrieval Corpus master, the retrieval build-and-refresh business process, the retrieval-corpora-respect-module-authorization-at-query-time rule, and the Retrieval refresh cadence configuration (this sprint). Sprint 001 authorities (Prompt master, Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, module-wide search-index baseline) remain as authored in `SPR-MOD-018-001` and are not re-authored here.
- **Source modules** continue to own all transactional and master data; MOD-018 consumes strictly read-only through approved read-model mechanisms and read-only domain event subscription.
- **MOD-001 Platform Administration** retains ownership of Identity (`ENG-001`), Authorization (`ENG-002`), and Permission Management (`ENG-003`).
- **MOD-017 Analytics** retains ownership of cross-module KPI definitions.
- **Platform engines** retain ownership of Configuration (`ENG-005`), Audit (`ENG-004`), Search (`ENG-020`), Event infrastructure (`ENG-024`), Localization (`ENG-006`), Automation (`ENG-013`; optional), Integration (`ENG-023`; optional), Approval (`ENG-011`; exercised in later sprints), and AI Copilot (`ENG-028`; exercised in later sprints).

**No ownership reassignment. No transactional authority introduced.**

---

## 11. Non-Goals

- No Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, or module-wide search-index baseline (allocated to `SPR-MOD-018-001`).
- No Tool Definition master, AI Tool Call transaction, tool-call-with-approval process, `AIToolCallRequested` publication, or consumption of module domain events as tool trigger inputs (allocated to `SPR-MOD-018-003`).
- No AI Conversation transaction, prompt-to-response process, or `AIConversationStarted` publication (allocated to `SPR-MOD-018-004`).
- No AI Approval transaction, approval-gate rule, cost budgets, approval policies, AI reports, or `AIApprovalGranted` / `AIApprovalDenied` publications (allocated to `SPR-MOD-018-005`).
- No AI provider integration; provider mechanics are delivered exclusively through `ENG-028` in later sprints.
- No transactional authority. No modification of source-module master or transactional data.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.

---

## 12. Sprint Exit Criteria (verbatim from Sprint Plan §2 SPR-MOD-018-002)

- Retrieval Corpus records can be authored, refreshed, and archived under a tenant/company.
- Retrieval refresh cadence is resolvable via `ENG-005` in the tenant → company → context hierarchy.
- At query time, retrieval corpora enforce the caller's module-level authorization via `ENG-002` and `ENG-003` per `ADR-032`; a caller never receives context they cannot read in the source module.
- Corpus build/refresh executes deterministically; source-module masters and transactions remain unmutated.
- All corpus state changes are audited via `ENG-004`.

---

## 13. References

- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../../20-module-prds/ai/MODULE_PRD.md) — Parent Module PRD (authoritative).
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) — Parent Sprint Plan (Stage 1).
- [`docs/30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md`](./SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md) — Foundation Sprint PRD (reference / traceability dependency only).
- [`docs/30-sprint-prds/ai/README.md`](../README.md) — Sprint container.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md) — Sprint sizing.
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md) — Sprint dependency rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260718T000000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260718T000000Z.md) — Preceding audit (Repository READY).
