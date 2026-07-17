---
title: "SPR-MOD-018-003 — Tool Calling on Module Capabilities"
summary: "Sprint PRD for the tool-calling layer of MOD-018 AI Workspace: Tool Definition master with the standard active/inactive lifecycle; the AI Tool Call transaction; the tool-call-with-approval business process; the AIToolCallRequested event publication; and consumption of module domain events as trigger inputs. Consumes ERP Core Engines and Accepted ADRs; never redefines them. AI Workspace is governance-mediated relative to source-module transactional truth."
layer: "delivery"
owner: "AI Platform"
status: "Draft"
updated: "2026-07-18"
sprint_id: "SPR-MOD-018-003"
parent_module: "MOD-018"
parent_sprint_plan: "MOD-018_SPRINT_PLAN.md"
iteration: "Sprint 3"
stage: "2"
pass: "23.0.4"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-011", "ENG-017", "ENG-024", "ENG-028", "ENG-023"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "ai-workspace", "mod-018", "tool-calling", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD018-003-20260718T020000Z-001"
parent_result_id: "GT003-MOD018-002-20260718T010000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-018-003 — Tool Calling on Module Capabilities

> **Stage 2 deliverable.** Third authored Sprint PRD for **MOD-018 AI Workspace** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. AI Workspace is governance-mediated relative to source-module transactional truth: this sprint introduces the AI Tool Call transaction and its approval gate but never mutates a source-module master or transaction directly, and AI provider integration is delivered exclusively through `ENG-028`. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-018-003` (permanent) |
| Parent Module | `MOD-018` — AI Workspace |
| Parent Sprint Plan | [`MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) |
| Iteration | Sprint 3 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-018-001`, `SPR-MOD-018-002` (reference / traceability only) |
| Downstream Sprints | `SPR-MOD-018-004` … `SPR-MOD-018-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish **Tool Calling on Module Capabilities** for BusinessOS: the **Tool Definition master** (with the standard `Draft → Active → Inactive → Archived` lifecycle), the **AI Tool Call transaction** (executed via `ENG-028` and authorized as the invoking user via `ENG-002`), the **tool-call-with-approval business process** (invoking `ENG-011` where an approval gate applies; whitelisted tool calls bypass the gate deterministically per approval policy authored in `SPR-MOD-018-005`), the **`AIToolCallRequested` event publication** via `ENG-024`, and **consumption of all module domain events as trigger inputs**. The tool-calling layer sits atop the Prompt foundation established in `SPR-MOD-018-001` and the Retrieval layer established in `SPR-MOD-018-002`, and it is the substrate that Copilot Conversations (`SPR-MOD-018-004`) consume for grounded, action-capable responses.

> **AI Workspace Ownership Convention (unchanged).** MOD-018 AI Workspace owns the business semantics of the Tool Definition master, the AI Tool Call transaction, and the tool-call-with-approval business process authored in this sprint. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, approval, numbering, eventing, AI copilot; integration where optionally required). MOD-018 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules; where an AI Tool Call effects a state change in a source module, that state change is executed by the source module's own authorized capability under the invoking user's authorization — MOD-018 does not bypass source-module ownership. Approval-policy authoring, cost budgets, and AI reports remain allocated to `SPR-MOD-018-005`. AI provider integration is delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly.

#### 1.1.1 Tool Definition Master Authority

The **Tool Definition** master is authoritatively owned by MOD-018 AI Workspace. This sprint establishes:

- **Tool Definition definition** — the business entity representing a named, versioned tool that an AI Copilot may invoke on behalf of an authorized caller.
- **Capability binding** — the declared binding to the source-module capability that the tool will invoke; source-module capability contracts are owned by the source module and consumed read-only by the Tool Definition.
- **Lifecycle** — the standard `Draft → Active → Inactive → Archived` lifecycle for Tool Definition records.
- **Versioning-and-audit inheritance** — the module-level versioning-and-audit rule authored in `SPR-MOD-018-001` continues to apply; Tool Definitions are versioned and every change is audited via `ENG-004` per `ADR-014`.

No other module MAY create, edit, publish, archive, or independently maintain a parallel Tool Definition master. Downstream MOD-018 sprints and downstream modules consume the Tool Definition master through AI-Workspace-owned read APIs authored in later sprints; they MUST NOT redefine the entity or its lifecycle.

#### 1.1.2 AI Tool Call Transaction Authority

The **AI Tool Call** transaction is authoritatively owned by MOD-018 AI Workspace, as allocated by the approved Module PRD §6. This sprint establishes:

- **AI Tool Call transaction lifecycle** — the business lifecycle of an AI Tool Call, governed by `ENG-010` Workflow (where a long-running workflow applies) and `ENG-011` Approval (where an approval gate applies) as declared by the approved Module PRD §6.
- **Numbering** — document numbers for AI Tool Call transactions issue through `ENG-017` in the tenant-configured series registered in `SPR-MOD-018-001`; numbering algorithms are not redefined.
- **Audit** — every state change on an AI Tool Call is audited via `ENG-004` per `ADR-014`.
- **`AIToolCallRequested` publication** — emitted via `ENG-024` on transaction initiation.

The approval-policy configuration (`Approval policies`) that determines when the approval gate applies remains allocated to `SPR-MOD-018-005`; this sprint consumes the approval gate mechanism, not its policy authoring.

#### 1.1.3 Tool-Call-with-Approval Business Process Authority

The **tool-call-with-approval** business process is authoritatively owned by MOD-018 AI Workspace. This sprint establishes:

- **Process definition** — the deterministic sequence by which an AI Tool Call is authorized, gated by approval where required, executed via `ENG-028`, and audited.
- **Approval delegation** — the process invokes `ENG-011` for approval where the resolved approval policy declares a gate; `ENG-011` behavior is not redefined.
- **Whitelisted-tool bypass** — where an approval policy explicitly whitelists a tool, the tool-call-with-approval process bypasses the approval gate deterministically; whitelist authoring is a `SPR-MOD-018-005` configuration concern and is not authored here.
- **Read-model-only against source modules** — the process invokes source-module capabilities through their published authorization surface as the invoking user; MOD-018 never bypasses source-module ownership.

#### 1.1.4 Tool Calling ↔ Foundation, Retrieval, Platform, Source Modules, Analytics, and Downstream Boundary

- **`SPR-MOD-018-001` Foundation** is a reference-and-traceability dependency only. This sprint does not re-author Prompt / Prompt Version authority, the Prompt review-and-publish process, the versioning-and-audit rule, the Enabled surfaces per tenant configuration, the numbering series registration, or the search-index baseline. Tool Definitions inherit the versioning-and-audit rule and reuse the AI Workspace numbering series.
- **`SPR-MOD-018-002` Retrieval** is a reference-and-traceability dependency only. This sprint does not re-author the Retrieval Corpus master, the retrieval build-and-refresh process, the retrieval-authorization-at-query-time rule, or the Retrieval refresh cadence configuration. AI Tool Calls may consume Active Retrieval Corpora as read-only context inputs through published capability contracts authored in later sprints.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. MOD-018 consumes these read-only via `ENG-002`.
- **Source modules** (MOD-002 … MOD-017, MOD-019) own their master and transactional data and their published capability contracts. MOD-018 consumes source-module domain events read-only as tool trigger inputs and invokes source-module capabilities exclusively through their published authorization surface as the invoking user.
- **MOD-017 Analytics** owns cross-module KPI definitions. MOD-018 declares no KPI authority.
- **AI provider integration** is delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly.
- **Approval policy authoring, cost budgets, and AI reports** remain allocated to `SPR-MOD-018-005`.
- **AI Conversation transaction and prompt-to-response process** remain allocated to `SPR-MOD-018-004`.

Ownership boundaries SHALL NOT be redefined in downstream MOD-018 Sprint PRDs.

#### 1.1.5 Tool Definition and AI Tool Call Lifecycle Boundary

MOD-018 AI Workspace owns the lifecycle of the Tool Definition master and the AI Tool Call transaction lifecycle authored in this sprint. Downstream MOD-018 sprints (Copilot Surfaces; Governance) consume Tool Definition records and AI Tool Call states without redefining their lifecycles.

### 1.2 In Scope

- **Tool Definition master** — create, edit, publish, deactivate, archive under a tenant/company; per-tool attributes (name, description, capability binding to the source-module capability the tool invokes, owner, classification hint, version reference) resolved via `ENG-005` where configuration-sensitive.
- **Tool Definition lifecycle** — `Draft → Active → Inactive → Archived`, enforced declaratively at capture time.
- **Tool Definition versioning-and-audit inheritance** — every Tool Definition change produces a new version and an `ENG-004` audit record per the module-level versioning-and-audit rule authored in `SPR-MOD-018-001`.
- **AI Tool Call transaction** — initiation, authorization as the invoking user via `ENG-002`, optional approval gate via `ENG-011`, execution via `ENG-028`, completion, and audit.
- **Tool-call-with-approval business process** — the deterministic sequence described in §1.1.3; approval gating is applied where the resolved approval policy declares a gate; whitelisted tools bypass the gate deterministically per policy.
- **`AIToolCallRequested` event publication** — emitted via `ENG-024` on AI Tool Call initiation.
- **Consumption of all module domain events as trigger inputs** — read-only subscription; the concrete set of consumed events is per-tool and per-tenant and does not introduce any new event contract beyond the Module PRD §8 declaration.
- **Numbering** — AI Tool Call document numbers issue through `ENG-017` using the AI Workspace numbering series registered in `SPR-MOD-018-001`.
- **Audit** — every state change on a Tool Definition or AI Tool Call is audited via `ENG-004` per `ADR-014`.
- **Structural validation and hierarchy enforcement** — declarative validation of Tool Definition records and AI Tool Call transactions at capture time via the platform rules surface.

### 1.3 Out of Scope

- Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-018-001`.
- Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, Retrieval refresh cadence configuration — allocated to `SPR-MOD-018-002`.
- AI Conversation transaction, prompt-to-response business process, `AIConversationStarted` publication, per-surface enablement of copilot rendering — allocated to `SPR-MOD-018-004`.
- AI Approval transaction, AI-initiated-state-change-requires-approval rule, `Cost budgets` configuration, `Approval policies` configuration authoring, AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency reports, `AIApprovalGranted` / `AIApprovalDenied` publications — allocated to `SPR-MOD-018-005`.
- Identity, authentication, permissions — owned by MOD-001 via `ENG-001`, `ENG-002`, `ENG-003`.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- AI provider integration mechanics — delivered exclusively through `ENG-028`; provider SDKs are not imported by MOD-018.
- Source-module capability contracts and source-module master/transactional data — owned by the source module.
- Any redefinition of ERP Core Engine behavior.
- Physical schema, code, routes, migrations, and UI.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | Tool Definition master authority | Master Data | Definition, capability binding, standard active/inactive lifecycle, uniqueness, versioning-and-audit inheritance. |
| 2 | AI Tool Call transaction authority | Transaction | Business lifecycle; authorized as invoking user via `ENG-002`; executed via `ENG-028`; numbered via `ENG-017`; audited via `ENG-004`. |
| 3 | Tool-call-with-approval business process | Business Process | Deterministic sequence; invokes `ENG-011` where the resolved approval policy declares a gate; whitelisted tools bypass the gate deterministically. |
| 4 | `AIToolCallRequested` event publication | Event | Emitted via `ENG-024` on AI Tool Call initiation. |
| 5 | Consumption of module domain events as trigger inputs | Integration | Read-only subscription per each tool's declared trigger binding; no source-module transaction mutated. |
| 6 | Structural validation | Rule surface | Declarative validation of Tool Definition records and AI Tool Call transactions at capture time. |
| 7 | Numbering integration | Integration | AI Tool Call document numbers issue through `ENG-017` using the AI Workspace numbering series from Sprint 001. |
| 8 | Ownership boundaries recapitulation | Documentation | §1.1.4 — no reassignment. |

---

## 3. Traceability to Module PRD and Sprint Plan

Bidirectional traceability from the [MOD-018 AI Workspace Module PRD](../../../20-module-prds/ai/MODULE_PRD.md) and the approved [MOD-018 Sprint Plan](../MOD-018_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 003

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Tool-calling on module capabilities (capability) | §2 Capabilities | SPR-MOD-018-003 (origin) | §1, §2, §4 |
| Submodule: Tool Calling | §2 Submodules | SPR-MOD-018-003 (origin) | §1, §2 |
| Tool Definition (master) | §5 Master Data | SPR-MOD-018-003 (origin) | §4.1 Tool Definition |
| AI Tool Call (transaction) | §6 Transactions | SPR-MOD-018-003 (origin) | §4.4 AI Tool Call |
| Tool-call-with-approval (process) | §4 Business Processes | SPR-MOD-018-003 (origin) | §4.3 |
| `AIToolCallRequested` (event published) | §8 Integration Points | SPR-MOD-018-003 (origin) | §6.1 |
| All module domain events (consumed as trigger inputs) | §8 Integration Points | SPR-MOD-018-003 (foundation scaffolding) | §1.1.4 Boundary; §6.2 Events Consumed |
| Numbering via `ENG-017` for AI Tool Call | §6 Transactions — Numbering | SPR-MOD-018-003 (origin) | §7 Integrations |
| Optional integration via `ENG-023` | §12 ERP Core Engine Consumption | SPR-MOD-018-003 (optional) | §7 Integrations |

### 3.2 Reverse Map — Sprint 003 → Module PRD / Sprint Plan

| Sprint 003 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| Tool Definition Master Authority | §2 Capabilities; §5 Master Data | §2 SPR-MOD-018-003 Objective; §4.3 Master Data Forward Map |
| AI Tool Call Transaction Authority | §2 Capabilities; §6 Transactions | §2 SPR-MOD-018-003 Boundaries |
| Tool-call-with-approval business process | §4 Business Processes | §2 SPR-MOD-018-003 Boundaries |
| `AIToolCallRequested` publication | §8 Integration Points | §2 SPR-MOD-018-003 Exit Criteria |
| Consumption of module domain events as trigger inputs | §8 Integration Points | §2 SPR-MOD-018-003 Boundaries |
| Structural validation | §5 Master Data validation; §6 Transactions validation | §2 SPR-MOD-018-003 Exit Criteria |
| Numbering via `ENG-017` | §6 Transactions | §2 SPR-MOD-018-003 Exit Criteria |
| Versioning-and-audit inheritance | §7 Business Rules (inherited from SPR-MOD-018-001) | §2 SPR-MOD-018-003 Boundaries |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-018-003 allocation. Every Module PRD item allocated to SPR-MOD-018-003 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. No re-authoring of Sprint 001 or Sprint 002 authorities. AI Workspace remains read-model-only against source-module transactional truth; source-module capability invocation is exercised through each source module's published authorization surface as the invoking user.

---

## 4. Data Model Impact

### 4.1 Master Data

**Tool Definition (business entity — MOD-018 authority).**

- **Purpose.** Represents a named, versioned tool that an AI Copilot may invoke on behalf of an authorized caller under a tenant/company. Consumed downstream by Copilot Conversations (`SPR-MOD-018-004`).
- **Attributes (business level).**
  - Identifier (business-level).
  - Name.
  - Description.
  - Owner (business role or team reference — resolved via MOD-001 identities read-only).
  - Classification hint (business classification).
  - Capability binding (declared read-only binding to the source-module capability the tool invokes; the source-module capability contract is owned by the source module).
  - Version reference (inherited versioning-and-audit rule from Sprint 001).
  - Lifecycle state.
- **Lifecycle.** `Draft → Active → Inactive → Archived`. Only **Active** Tool Definitions are invokable at runtime by downstream sprints (see §5 Business Rules).
- **Uniqueness.** Tool Definitions are unique within a tenant/company on `name`; the platform rules surface enforces this at capture time.
- **Validation.** Structural validation (required fields, referential integrity, uniqueness, capability-binding integrity) is declarative and evaluated at capture time via the platform rules surface.
- **Audit.** All state changes audited via `ENG-004` per `ADR-014`.
- **Versioning.** Every change to a Tool Definition produces a new version per the module-level versioning-and-audit rule authored in `SPR-MOD-018-001`.

### 4.2 Configuration Keys (registered under `ENG-005`)

**None in this sprint.** The `Approval policies` and `Cost budgets` configuration keys declared in Module PRD §10 are allocated to `SPR-MOD-018-005` by the approved Sprint Plan. This sprint consumes the approval gate mechanism (`ENG-011`) but does not author approval-policy configuration.

### 4.3 Business Processes

**Tool-call-with-approval (MOD-018 authority).**

- **Trigger.** (a) An authorized caller (authorized via `ENG-002`) requests an AI Tool Call through a Copilot Surface (surface rendering allocated to `SPR-MOD-018-004`); or (b) a consumed module domain event fulfils a Tool Definition's declared trigger binding.
- **Steps (business level).**
  1. Resolve the target Tool Definition and confirm its lifecycle state is `Active`.
  2. Authorize the invoking user against the target source-module capability via `ENG-002` (per `ADR-032`); reject on failure.
  3. Resolve the applicable approval policy (policy authoring lives in `SPR-MOD-018-005`). Where the policy declares an approval gate, invoke `ENG-011`; where the policy whitelists the tool, bypass the gate deterministically.
  4. On approval (or on whitelist bypass), execute the AI Tool Call via `ENG-028`, which invokes the source-module capability through its published authorization surface as the invoking user.
  5. Emit `AIToolCallRequested` via `ENG-024` on initiation; write audit records via `ENG-004` for every state change per `ADR-014`.
  6. Issue the AI Tool Call document number through `ENG-017` using the AI Workspace numbering series from Sprint 001.
- **Determinism.** For a given Tool Definition version, invoking user, resolved approval policy, and input payload, the process is deterministic with respect to the approval decision it seeks and the source-module capability it invokes.
- **Non-mutation invariant.** MOD-018 never writes directly to a source-module master or transaction; all effects on source-module data occur through the source module's own authorized capability under the invoking user's authorization.

### 4.4 Transactions

**AI Tool Call (business transaction — MOD-018 authority).**

- **Purpose.** Represents a single invocation of a Tool Definition on behalf of an authorized caller, gated by approval where required.
- **Lifecycle (business level).** Governed by `ENG-010` Workflow (where a long-running workflow applies) and `ENG-011` Approval (where an approval gate applies), per the approved Module PRD §6. Concrete state names are declarative and enforced at capture time by the platform rules surface; engine behavior is not redefined.
- **Numbering.** Document numbers issue through `ENG-017` using the AI Workspace numbering series registered in `SPR-MOD-018-001`.
- **Audit.** Every state change is audited via `ENG-004` per `ADR-014`.
- **Posting.** Not applicable — AI Tool Call is not a ledger transaction; where an invoked source-module capability produces ledger effects, those effects are produced by that source module's own posting capability under `ENG-016`.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **AI-initiated state changes must pass an approval gate unless explicitly whitelisted.** (Restated verbatim from Module PRD §7.) AI Tool Calls that would cause a state change in a source module shall pass an approval gate unless the resolved approval policy explicitly whitelists the tool. Policy authoring is out of scope for this sprint (allocated to `SPR-MOD-018-005`); the enforcement of the gate at tool-call time is in scope.
2. **Tool Definitions are versioned and audited.** (Restated verbatim from Module PRD §7; inherited from `SPR-MOD-018-001`.) Every change to a Tool Definition shall produce a new version and an `ENG-004` audit record per `ADR-014`.
3. **Tool Definition uniqueness.** Every Tool Definition shall have a unique definition within a tenant/company (uniqueness on `name`).
4. **Tool Definition lifecycle enforcement.** Tool Definition lifecycle transitions (`Draft → Active → Inactive → Archived`) shall be enforced declaratively; transitions that would violate this ordering shall be rejected at capture time.
5. **Only Active Tool Definitions are runtime-invokable.** Only Tool Definitions in state **Active** shall be resolvable by downstream MOD-018 sprints at tool-invocation time; Tool Definitions in `Draft`, `Inactive`, or `Archived` are not invokable.
6. **Authorization-as-invoking-user at tool-invocation time.** At tool-invocation time, an AI Tool Call shall enforce the invoking user's module-level authorization against the target source-module capability, as defined by the approved Module PRD and allocated architecture decisions (`ADR-032` RBAC + ABAC; `ADR-011` Multi-Tenant Isolation). A caller shall never effect a source-module state change they could not effect directly under their own authorization.
7. **Read-model-only against source modules.** No Sprint 003 operation shall mutate a source-module master or transaction directly. Where a state change in a source module results from an AI Tool Call, that state change shall be executed by the source module's own authorized capability under the invoking user's authorization.
8. **Deterministic whitelist bypass.** Where the resolved approval policy explicitly whitelists a tool, the tool-call-with-approval process shall bypass the approval gate deterministically. Policy authoring is out of scope for this sprint.
9. **Provider integration exclusively via `ENG-028`.** AI Tool Call execution shall invoke the source-module capability through the `ENG-028` AI Copilot Engine surface; MOD-018 shall not import provider SDKs directly.
10. **Auditability.** Every state change on a Tool Definition record, every state change on an AI Tool Call transaction, and every published `AIToolCallRequested` event shall be auditable via `ENG-004` per `ADR-014`.
11. **Configuration validation at capture time.** Tool Definition records and AI Tool Call transactions shall be validated declaratively at capture time via the platform rules surface.
12. **Inherited versioning-and-audit rule.** The module-level versioning-and-audit rule authored in `SPR-MOD-018-001` continues to apply to Tool Definitions; no redefinition here.

---

## 6. Events

### 6.1 Events Published (Sprint 003 tool-calling-layer events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `AIToolCallRequested` | An AI Tool Call transaction is initiated | Signals to `ENG-011` (where an approval gate applies), to downstream consumers, and to audit that a tool call has entered the tool-call-with-approval process. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`. `AIApprovalGranted` and `AIApprovalDenied` remain allocated to `SPR-MOD-018-005`. `AIConversationStarted` remains allocated to `SPR-MOD-018-004`.

### 6.2 Events Consumed

Tool Definitions consume source-module domain events strictly **read-only** as declared trigger inputs. This sprint establishes the read-only consumption stance; the concrete set of consumed source-module events is determined by each Tool Definition's declared trigger binding and does not introduce any new event contract beyond the Module PRD §8 declaration ("All module domain events (as retrieval or trigger inputs)"). No source-module transaction is invoked by MOD-018 consumption of these events; source-module capability invocation is exercised exclusively through each source module's published authorization surface as the invoking user, per Rule 7.

---

## 7. Integrations

MOD-018 AI Workspace **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 003 |
| --- | --- |
| `ENG-002` Authorization | Enforce the invoking user's module-level authorization at Tool Definition authoring time and at AI Tool Call initiation and execution, per `ADR-032`. |
| `ENG-004` Audit | Persist audit records for every Tool Definition state change and every AI Tool Call state change per `ADR-014`. |
| `ENG-005` Configuration | Resolve tenant → company → context configuration where Tool Definition attributes are configuration-sensitive; approval-policy authoring is out of scope (allocated to Sprint 005). |
| `ENG-011` Approval | Provide the approval gate mechanism invoked by the tool-call-with-approval business process where the resolved approval policy declares a gate. Behavior not redefined. |
| `ENG-017` Numbering | Issue AI Tool Call document numbers using the AI Workspace numbering series registered in Sprint 001. |
| `ENG-024` Event | Publish `AIToolCallRequested`; consume source-module domain events strictly read-only per each Tool Definition's declared trigger binding. |
| `ENG-028` AI Copilot | Execute the AI Tool Call; provider integration is delivered exclusively through this engine. Behavior not redefined. |
| `ENG-023` Integration (optional) | Where a Tool Definition's declared capability binding requires read-only integration surfaces beyond native source-module capability invocation. Behavior not redefined. |

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
- **Retrieval Sprint PRD** — [`SPR-MOD-018-002`](./SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md) — Draft (reference / traceability dependency only; no re-authoring).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260718T010000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 003):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-011`, `ENG-017`, `ENG-024`, `ENG-028`.
- **Engines optional (Sprint 003):** `ENG-023` Integration.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-018-001` and `SPR-MOD-018-002` (reference / traceability only; no re-authoring).
- **Downstream sprints.** `SPR-MOD-018-004` … `SPR-MOD-018-005` depend on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Tool Definition creation.** A caller with appropriate `ENG-002` grants can create a Tool Definition record under a tenant/company; the record persists with all required attributes (including capability binding); an `ENG-004` audit record is written; the Tool Definition follows the module-level versioning-and-audit rule inherited from Sprint 001. (Deliverable 1; Rule 2, 3, 10.)
2. **AC-002 — Tool Definition uniqueness.** Attempting to create a Tool Definition whose `name` collides with an existing Tool Definition under the same tenant/company is rejected at capture time by the platform rules surface. (Deliverable 1; Rule 3.)
3. **AC-003 — Tool Definition edit produces a new version.** Editing a Tool Definition produces a new version per the inherited versioning-and-audit rule; an `ENG-004` audit record is written. (Deliverable 1; Rule 2, 10, 12.)
4. **AC-004 — Tool Definition lifecycle.** Tool Definition records follow the `Draft → Active → Inactive → Archived` lifecycle; transitions that would violate this ordering are rejected at capture time; every transition is audited. (Deliverable 1; Rule 4, 10.)
5. **AC-005 — Only Active Tool Definitions are invokable.** A downstream caller resolving a Tool Definition at tool-invocation time receives only Tool Definitions in state `Active`; Tool Definitions in `Draft`, `Inactive`, or `Archived` are not invokable. (Deliverable 1; Rule 5.)
6. **AC-006 — AI Tool Call initiation.** An authorized caller initiates an AI Tool Call against an `Active` Tool Definition; authorization is enforced against the target source-module capability as the invoking user via `ENG-002` per `ADR-032`; `AIToolCallRequested` is emitted via `ENG-024`; an AI Tool Call document number is issued via `ENG-017` using the AI Workspace numbering series from Sprint 001; an `ENG-004` audit record is written. (Deliverables 2, 4, 7; Rule 6, 10.)
7. **AC-007 — Approval gate enforcement.** Where the resolved approval policy declares an approval gate for an AI Tool Call that would cause a source-module state change, the tool-call-with-approval process invokes `ENG-011`; the tool call does not execute until the gate is satisfied. Policy authoring itself is out of scope for this sprint. (Deliverables 2, 3; Rule 1.)
8. **AC-008 — Deterministic whitelist bypass.** Where the resolved approval policy explicitly whitelists a tool, the tool-call-with-approval process bypasses the approval gate deterministically. (Deliverable 3; Rule 8.)
9. **AC-009 — Tool call execution via `ENG-028`.** On approval or on whitelist bypass, the AI Tool Call executes via `ENG-028`, which invokes the source-module capability through its published authorization surface as the invoking user; MOD-018 does not import provider SDKs directly. (Deliverable 2; Rule 9.)
10. **AC-010 — Read-model-only against source modules.** No Sprint 003 operation writes to a source module's master or transactional data directly; where a state change in a source module results from an AI Tool Call, that state change is executed by the source module's own authorized capability under the invoking user's authorization. (Deliverable 2; Rule 7.)
11. **AC-011 — Consumption of module domain events as trigger inputs.** Module domain events are consumable as trigger inputs per each Tool Definition's declared trigger binding; no new event contract is introduced beyond the Module PRD §8 declaration; no source-module transaction is invoked by MOD-018 consumption. (Deliverable 5; Rule 7.)
12. **AC-012 — Numbering.** AI Tool Call document numbers issue through `ENG-017` using the AI Workspace numbering series registered in Sprint 001; numbering algorithms are not redefined. (Deliverable 7.)
13. **AC-013 — Structural validation.** Tool Definition records and AI Tool Call transactions are validated declaratively at capture time; invalid inputs (including malformed capability bindings) are rejected before persistence. (Deliverable 6; Rule 4, 11.)
14. **AC-014 — Audit trail.** Every state-changing operation in §2 (Tool Definition create/edit/lifecycle; AI Tool Call state changes; `AIToolCallRequested` emission) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1–4; Rule 10.)
15. **AC-015 — Ownership boundaries preserved.** No MOD-001 / MOD-017 / source-module authority is redefined; MOD-018 does not claim ownership of any platform engine; approval-policy authoring, cost budgets, and AI reports remain allocated to Sprint 005; AI Conversation and the prompt-to-response process remain allocated to Sprint 004; the Retrieval Corpus master and its configuration from Sprint 002 and the Prompt/Prompt Version authorities and the versioning-and-audit rule from Sprint 001 are not re-authored. (Deliverable 8.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.4 (not evolved):

- **MOD-018 AI Workspace** owns the Tool Definition master, the AI Tool Call transaction, the tool-call-with-approval business process, and the `AIToolCallRequested` event publication (this sprint). Sprint 001 authorities (Prompt master, Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, module-wide search-index baseline) and Sprint 002 authorities (Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, Retrieval refresh cadence configuration) remain as authored and are not re-authored here.
- **Source modules** continue to own all transactional and master data and all published capability contracts; MOD-018 invokes source-module capabilities exclusively through their published authorization surface as the invoking user and consumes source-module domain events strictly read-only.
- **MOD-001 Platform Administration** retains ownership of Identity (`ENG-001`), Authorization (`ENG-002`), and Permission Management (`ENG-003`).
- **MOD-017 Analytics** retains ownership of cross-module KPI definitions.
- **Platform engines** retain ownership of Configuration (`ENG-005`), Audit (`ENG-004`), Approval (`ENG-011`), Numbering (`ENG-017`), Event infrastructure (`ENG-024`), AI Copilot (`ENG-028`), and Integration (`ENG-023`; optional). Reporting (`ENG-021`), Dashboard (`ENG-022`), and Notification (`ENG-025`) remain exercised in later sprints as allocated.

**No ownership reassignment. No approval-policy authoring introduced. No provider SDK imported.**

---

## 11. Non-Goals

- No Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, or module-wide search-index baseline (allocated to `SPR-MOD-018-001`).
- No Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, or Retrieval refresh cadence configuration (allocated to `SPR-MOD-018-002`).
- No AI Conversation transaction, prompt-to-response process, or `AIConversationStarted` publication (allocated to `SPR-MOD-018-004`).
- No AI Approval transaction, approval-gate rule authoring, approval-policy authoring, cost budgets, AI reports, or `AIApprovalGranted` / `AIApprovalDenied` publications (allocated to `SPR-MOD-018-005`).
- No AI provider integration mechanics; provider mechanics are delivered exclusively through `ENG-028`.
- No modification of source-module master or transactional data by MOD-018; source-module state changes occur only through the source module's own authorized capability under the invoking user's authorization.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.

---

## 12. Sprint Exit Criteria (verbatim from Sprint Plan §2 SPR-MOD-018-003)

- Tool Definition records can be authored, versioned, published, and archived; every change is audited via `ENG-004` per `ADR-014`.
- AI Tool Call transactions execute via `ENG-028` and are authorized as the invoking user via `ENG-002` per `ADR-032`.
- The tool-call-with-approval process invokes `ENG-011` where an approval gate applies; whitelisted tool calls bypass the gate deterministically per approval policy (policy authoring belongs to SPR-MOD-018-005).
- `AIToolCallRequested` events publish via `ENG-024`.
- All module domain events are consumable as trigger inputs; no source-module transaction is mutated by this sprint.
- Document numbers for AI Tool Call transactions issue through `ENG-017`.

---

## 13. References

- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../../20-module-prds/ai/MODULE_PRD.md) — Parent Module PRD (authoritative).
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) — Parent Sprint Plan (Stage 1).
- [`docs/30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md`](./SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md) — Foundation Sprint PRD (reference / traceability dependency only).
- [`docs/30-sprint-prds/ai/sprints/SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md`](./SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md) — Retrieval Sprint PRD (reference / traceability dependency only).
- [`docs/30-sprint-prds/ai/README.md`](../README.md) — Sprint container.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md) — Sprint sizing.
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md) — Sprint dependency rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260718T010000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260718T010000Z.md) — Preceding audit (Repository READY).
