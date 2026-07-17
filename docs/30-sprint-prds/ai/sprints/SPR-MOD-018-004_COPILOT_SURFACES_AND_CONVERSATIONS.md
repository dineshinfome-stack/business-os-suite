---
title: "SPR-MOD-018-004 — Copilot Surfaces & Conversations"
summary: "Sprint PRD for the in-app copilot surface of MOD-018 AI Workspace: the AI Conversation transaction, the prompt-to-response business process, the AIConversationStarted event publication, and per-tenant copilot-surface enablement consumed read-only from Sprint 001 configuration. Consumes ERP Core Engines and Accepted ADRs; never redefines them. AI Workspace is governance-mediated relative to source-module transactional truth."
layer: "delivery"
owner: "AI Platform"
status: "Draft"
updated: "2026-07-18"
sprint_id: "SPR-MOD-018-004"
parent_module: "MOD-018"
parent_sprint_plan: "MOD-018_SPRINT_PLAN.md"
iteration: "Sprint 4"
stage: "2"
pass: "23.0.5"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-006", "ENG-017", "ENG-024", "ENG-028", "ENG-025", "ENG-007", "ENG-008"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "ai-workspace", "mod-018", "copilot-surfaces", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD018-004-20260718T030000Z-001"
parent_result_id: "GT003-MOD018-003-20260718T020000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-018-004 — Copilot Surfaces & Conversations

> **Stage 2 deliverable.** Fourth authored Sprint PRD for **MOD-018 AI Workspace** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. AI Workspace is governance-mediated relative to source-module transactional truth: this sprint introduces the AI Conversation transaction and the prompt-to-response process, consumes published Prompts (Sprint 001), active Retrieval Corpora (Sprint 002), and published Tool Definitions (Sprint 003) read-only, and delivers AI-provider integration exclusively through `ENG-028`. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-018-004` (permanent) |
| Parent Module | `MOD-018` — AI Workspace |
| Parent Sprint Plan | [`MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) |
| Iteration | Sprint 4 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-018-001`, `SPR-MOD-018-002`, `SPR-MOD-018-003` (reference / traceability only) |
| Downstream Sprints | `SPR-MOD-018-005` |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish **Copilot Surfaces & Conversations** for BusinessOS: the **AI Conversation transaction** (executed via `ENG-028` and authorized as the invoking user via `ENG-002`), the **prompt-to-response business process** (deterministic composition of published Prompts, active Retrieval Corpora, and published Tool Definitions), the **`AIConversationStarted` event publication** via `ENG-024`, and **per-tenant copilot-surface enablement** consumed read-only from the `Enabled surfaces per tenant` configuration authored in `SPR-MOD-018-001`. The copilot surface sits atop the Prompt foundation (`SPR-MOD-018-001`), the Retrieval layer (`SPR-MOD-018-002`), and the Tool-Calling layer (`SPR-MOD-018-003`); it is the last MOD-018 sprint before Governance (`SPR-MOD-018-005`).

> **AI Workspace Ownership Convention (unchanged).** MOD-018 AI Workspace owns the business semantics of the AI Conversation transaction and the prompt-to-response business process authored in this sprint. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, localization, numbering, eventing, AI copilot; notification/document/attachment where optionally required). MOD-018 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Source-module master and transactional data remain exclusive to their owning modules; where an AI Conversation triggers an AI Tool Call that effects a source-module state change, that state change is executed by the source module's own authorized capability under the invoking user's authorization via the Sprint 003 tool-call-with-approval process — MOD-018 does not bypass source-module ownership. AI Approval authoring, cost budgets, approval-policy authoring, safety governance, and AI reports remain allocated to `SPR-MOD-018-005`. AI provider integration is delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly.

#### 1.1.1 AI Conversation Transaction Authority

The **AI Conversation** transaction is authoritatively owned by MOD-018 AI Workspace, as allocated by the approved Module PRD §6 and the approved Sprint Plan §Sprint 004. This sprint establishes:

- **AI Conversation transaction lifecycle** — the business lifecycle of an AI Conversation, governed by `ENG-010` Workflow (where a long-running workflow applies) as declared by the approved Module PRD §6. Concrete state names are declarative and enforced at capture time by the platform rules surface; engine behavior is not redefined.
- **Numbering** — document numbers for AI Conversation transactions issue through `ENG-017` in the tenant-configured series registered in `SPR-MOD-018-001`; numbering algorithms are not redefined.
- **Audit** — every state change on an AI Conversation is audited via `ENG-004` per `ADR-014`.
- **`AIConversationStarted` publication** — emitted via `ENG-024` on transaction initiation.
- **Localization** — surface strings and locale-sensitive content packs resolve via `ENG-006` per tenant/company/context; behavior not redefined.

Approval-policy authoring, cost-budget configuration, safety governance, AI Approval, and AI reports remain allocated to `SPR-MOD-018-005`.

#### 1.1.2 Prompt-to-Response Business Process Authority

The **prompt-to-response** business process is authoritatively owned by MOD-018 AI Workspace. This sprint establishes:

- **Process definition** — the deterministic sequence by which an AI Conversation composes a response from a resolved Prompt version, active Retrieval Corpora, and published Tool Definitions, executed via `ENG-028`.
- **Read-only composition surfaces** — the process consumes **only Active** Prompts (Sprint 001), **only Active** Retrieval Corpora (Sprint 002), and **only Active** Tool Definitions (Sprint 003); it does not re-author their masters or lifecycles.
- **Tool-invocation delegation** — where the prompt-to-response process needs to invoke a Tool Definition, it delegates to the Sprint 003 tool-call-with-approval business process; approval gating and provider integration semantics remain owned by that sprint.
- **Read-model-only against source modules** — the process never mutates a source-module master or transaction directly; source-module state changes arise only through the Sprint 003 tool-call-with-approval process under the invoking user's authorization.

#### 1.1.3 `AIConversationStarted` Event Publication Authority

MOD-018 AI Workspace authors the `AIConversationStarted` event publication in this sprint. The event is emitted via `ENG-024` on AI Conversation initiation and is traced to its originating audit record in `ENG-004`. No new event contract is introduced beyond the Module PRD §8 declaration. `AIToolCallRequested` remains allocated to `SPR-MOD-018-003`; `AIApprovalGranted` and `AIApprovalDenied` remain allocated to `SPR-MOD-018-005`.

#### 1.1.4 Per-Tenant Copilot-Surface Enablement (Consumption, Not Authoring)

Per-tenant copilot-surface enablement is consumed **read-only** from the `Enabled surfaces per tenant` configuration authored in `SPR-MOD-018-001` and resolved via `ENG-005` in the tenant → company → context hierarchy. This sprint does not author configuration; it consumes the resolved value at AI Conversation initiation to determine whether the requested copilot surface is enabled for the caller's tenant/company/context.

#### 1.1.5 Copilot Surfaces ↔ Foundation, Retrieval, Tool Calling, Platform, Source Modules, Analytics, Providers, and Downstream Boundary

- **`SPR-MOD-018-001` Foundation** is a reference-and-traceability dependency only. This sprint does not re-author Prompt / Prompt Version authority, the Prompt review-and-publish process, the versioning-and-audit rule, the `Enabled surfaces per tenant` configuration, the AI Workspace numbering series registration, or the module-wide search-index baseline. AI Conversations consume only Active Prompts and reuse the AI Workspace numbering series.
- **`SPR-MOD-018-002` Retrieval** is a reference-and-traceability dependency only. This sprint does not re-author the Retrieval Corpus master, the retrieval build-and-refresh process, the retrieval-authorization-at-query-time rule, or the Retrieval refresh cadence configuration. AI Conversations consume Active Retrieval Corpora as read-only context inputs; the retrieval-authorization-at-query-time invariant continues to hold at conversation time.
- **`SPR-MOD-018-003` Tool Calling** is a reference-and-traceability dependency only. This sprint does not re-author the Tool Definition master, the AI Tool Call transaction, the tool-call-with-approval business process, or the `AIToolCallRequested` publication. AI Conversations invoke Active Tool Definitions exclusively by delegating to the Sprint 003 tool-call-with-approval process.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. MOD-018 consumes these read-only via `ENG-002`.
- **Source modules** (MOD-002 … MOD-017, MOD-019) own their master and transactional data and their published capability contracts. MOD-018 consumes source-module domain events read-only as retrieval inputs and effects source-module state changes exclusively via the Sprint 003 tool-call-with-approval process under the invoking user's authorization.
- **MOD-017 Analytics** owns cross-module KPI definitions. MOD-018 declares no KPI authority.
- **AI provider integration** is delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly.
- **AI Approval transaction, approval-gate rule authoring, approval-policy authoring, cost budgets, safety governance, AI reports, and `AIApprovalGranted` / `AIApprovalDenied` publications** remain allocated to `SPR-MOD-018-005`.

Ownership boundaries SHALL NOT be redefined in downstream MOD-018 Sprint PRDs.

#### 1.1.6 AI Conversation Lifecycle Boundary

MOD-018 AI Workspace owns the AI Conversation transaction lifecycle authored in this sprint. Downstream MOD-018 sprints (Governance) consume AI Conversation states without redefining the lifecycle.

### 1.2 In Scope

- **AI Conversation transaction** — initiation, authorization as the invoking user via `ENG-002`, execution via `ENG-028`, per-turn state transitions, completion, and audit.
- **Prompt-to-response business process** — the deterministic composition sequence described in §1.1.2; consumes published Prompts, active Retrieval Corpora, and published Tool Definitions read-only; delegates tool invocation to the Sprint 003 process.
- **`AIConversationStarted` event publication** — emitted via `ENG-024` on AI Conversation initiation.
- **Per-tenant copilot-surface enablement consumption** — reads `Enabled surfaces per tenant` (owned by Sprint 001) via `ENG-005` at conversation initiation to gate whether the requested copilot surface is enabled.
- **Localization of copilot surfaces** — locale-sensitive content packs resolve via `ENG-006` per tenant/company/context; behavior not redefined.
- **Numbering** — AI Conversation document numbers issue through `ENG-017` using the AI Workspace numbering series registered in `SPR-MOD-018-001`.
- **Audit** — every state change on an AI Conversation is audited via `ENG-004` per `ADR-014`.
- **Structural validation** — declarative validation of AI Conversation transactions at capture time via the platform rules surface.

### 1.3 Out of Scope

- Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, `Enabled surfaces per tenant` configuration authoring, AI Workspace numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-018-001`.
- Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, Retrieval refresh cadence configuration — allocated to `SPR-MOD-018-002`.
- Tool Definition master, AI Tool Call transaction, tool-call-with-approval business process, `AIToolCallRequested` publication — allocated to `SPR-MOD-018-003`.
- AI Approval transaction, AI-initiated-state-change-requires-approval rule authoring, `Cost budgets` configuration, `Approval policies` configuration authoring, safety governance, AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency reports, `AIApprovalGranted` / `AIApprovalDenied` publications — allocated to `SPR-MOD-018-005`.
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
| 1 | AI Conversation transaction authority | Transaction | Business lifecycle; authorized as invoking user via `ENG-002`; executed via `ENG-028`; numbered via `ENG-017`; audited via `ENG-004`. |
| 2 | Prompt-to-response business process | Business Process | Deterministic composition of Active Prompts (Sprint 001), Active Retrieval Corpora (Sprint 002), and Active Tool Definitions (Sprint 003); tool invocation delegated to the Sprint 003 tool-call-with-approval process. |
| 3 | `AIConversationStarted` event publication | Event | Emitted via `ENG-024` on AI Conversation initiation. |
| 4 | Per-tenant copilot-surface enablement consumption | Configuration Consumption | Reads `Enabled surfaces per tenant` (Sprint 001) via `ENG-005` at conversation initiation; no configuration authored here. |
| 5 | Localization of copilot surfaces | Integration | Locale-sensitive content packs resolved via `ENG-006` per tenant/company/context. |
| 6 | Structural validation | Rule surface | Declarative validation of AI Conversation transactions at capture time. |
| 7 | Numbering integration | Integration | AI Conversation document numbers issue through `ENG-017` using the AI Workspace numbering series from Sprint 001. |
| 8 | Ownership boundaries recapitulation | Documentation | §1.1.5 — no reassignment. |

---

## 3. Traceability to Module PRD and Sprint Plan

Bidirectional traceability from the [MOD-018 AI Workspace Module PRD](../../../20-module-prds/ai/MODULE_PRD.md) and the approved [MOD-018 Sprint Plan](../MOD-018_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 004

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| In-app copilot surfaces (capability) | §2 Capabilities | SPR-MOD-018-004 (origin) | §1, §2, §4 |
| Submodule: Copilot Surfaces | §2 Submodules | SPR-MOD-018-004 (origin) | §1, §2 |
| AI Conversation (transaction) | §6 Transactions | SPR-MOD-018-004 (origin) | §4.3 AI Conversation |
| Prompt-to-response (process) | §4 Business Processes | SPR-MOD-018-004 (origin) | §4.2 |
| `AIConversationStarted` (event published) | §8 Integration Points | SPR-MOD-018-004 (origin) | §6.1 |
| AI providers via provider abstraction (external system) | §8 Integration Points | SPR-MOD-018-004 (consumption via `ENG-028`) | §1.1.5; §7 Integrations |
| Numbering via `ENG-017` for AI Conversation | §6 Transactions — Numbering | SPR-MOD-018-004 (origin) | §7 Integrations |
| Optional `ENG-025` Notification | §12 ERP Core Engine Consumption | SPR-MOD-018-004 (optional) | §7 Integrations |
| Optional `ENG-007` Document | §12 ERP Core Engine Consumption | SPR-MOD-018-004 (optional) | §7 Integrations |
| Optional `ENG-008` Attachment | §12 ERP Core Engine Consumption | SPR-MOD-018-004 (optional) | §7 Integrations |

### 3.2 Reverse Map — Sprint 004 → Module PRD / Sprint Plan

| Sprint 004 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| AI Conversation Transaction Authority | §2 Capabilities; §6 Transactions | §2 SPR-MOD-018-004 Objective; §4.3 Forward Map |
| Prompt-to-response business process | §4 Business Processes | §2 SPR-MOD-018-004 Boundaries |
| `AIConversationStarted` publication | §8 Integration Points | §2 SPR-MOD-018-004 Exit Criteria |
| Per-tenant copilot-surface enablement consumption | §10 Configuration (Enabled surfaces per tenant) | §2 SPR-MOD-018-004 Exit Criteria |
| Localization of copilot surfaces | §10 Configuration — Localization options; §12 Required — `ENG-006` | §2 SPR-MOD-018-004 Engines |
| Structural validation | §6 Transactions validation | §2 SPR-MOD-018-004 Exit Criteria |
| Numbering via `ENG-017` | §6 Transactions | §2 SPR-MOD-018-004 Exit Criteria |
| Read-only consumption of Prompts, Corpora, Tool Definitions | §5 Master Data; §13 Dependencies | §2 SPR-MOD-018-004 Boundaries |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-018-004 allocation. Every Module PRD item allocated to SPR-MOD-018-004 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. No re-authoring of Sprint 001, 002, or 003 authorities. AI Workspace remains read-model-only against source-module transactional truth; source-module state changes arise only through the Sprint 003 tool-call-with-approval process under the invoking user's authorization.

---

## 4. Data Model Impact

### 4.1 Master Data

**None in this sprint.** All AI Workspace master data (Prompt, Prompt Version, Retrieval Corpus, Tool Definition) is authored in Sprints 001–003 and consumed read-only here.

### 4.2 Business Processes

**Prompt-to-response (MOD-018 authority).**

- **Trigger.** An authorized caller (authorized via `ENG-002`) initiates an AI Conversation through an enabled copilot surface under a tenant/company/context.
- **Steps (business level).**
  1. Resolve the applicable `Enabled surfaces per tenant` configuration via `ENG-005` and confirm the requested surface is enabled; reject deterministically where the surface is not enabled.
  2. Authorize the invoking user via `ENG-002` per `ADR-032`; reject on failure.
  3. Resolve the target Prompt and pin the Active Prompt Version at conversation start; only Active Prompt Versions are usable.
  4. Resolve Active Retrieval Corpora bound to the surface/prompt; the retrieval-authorization-at-query-time invariant from Sprint 002 continues to hold at conversation time — the caller receives only context they can read in the source module.
  5. Resolve Active Tool Definitions bound to the surface/prompt; only Active Tool Definitions are runtime-invokable.
  6. Compose the response via `ENG-028`; where tool invocation is required, delegate to the Sprint 003 tool-call-with-approval business process (approval gating and provider integration semantics remain owned by that sprint).
  7. Emit `AIConversationStarted` via `ENG-024` on initiation; write audit records via `ENG-004` for every state change per `ADR-014`.
  8. Issue the AI Conversation document number through `ENG-017` using the AI Workspace numbering series from Sprint 001.
  9. Localize surface strings and locale-sensitive content packs via `ENG-006` per tenant/company/context.
- **Determinism.** For a given surface, pinned Prompt Version, resolved Retrieval Corpora set, resolved Tool Definitions set, invoking user, and input payload, the process is deterministic with respect to the composition sequence it follows; provider non-determinism is delivered inside `ENG-028` and is not redefined here.
- **Non-mutation invariant.** MOD-018 never writes directly to a source-module master or transaction; all effects on source-module data occur through the Sprint 003 tool-call-with-approval process under the invoking user's authorization.

### 4.3 Transactions

**AI Conversation (business transaction — MOD-018 authority).**

- **Purpose.** Represents a single copilot conversation initiated by an authorized caller against an enabled copilot surface under a tenant/company/context.
- **Lifecycle (business level).** Governed by `ENG-010` Workflow (where a long-running workflow applies), per the approved Module PRD §6. Concrete state names are declarative and enforced at capture time by the platform rules surface; engine behavior is not redefined.
- **Numbering.** Document numbers issue through `ENG-017` using the AI Workspace numbering series registered in `SPR-MOD-018-001`.
- **Audit.** Every state change is audited via `ENG-004` per `ADR-014`.
- **Posting.** Not applicable — AI Conversation is not a ledger transaction; where an AI Conversation triggers an AI Tool Call whose invoked source-module capability produces ledger effects, those effects are produced by that source module's own posting capability under `ENG-016`.

### 4.4 Configuration Keys (registered under `ENG-005`)

**None authored in this sprint.** The `Enabled surfaces per tenant` configuration key declared in Module PRD §10 is authored in `SPR-MOD-018-001`; Sprint 004 consumes it read-only at conversation initiation. The `Cost budgets` and `Approval policies` configuration keys declared in Module PRD §10 are allocated to `SPR-MOD-018-005`.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **Per-tenant surface enablement is a precondition.** An AI Conversation shall be initiated only where the requested copilot surface is enabled for the caller's tenant/company/context per the `Enabled surfaces per tenant` configuration resolved via `ENG-005` (authored in Sprint 001).
2. **Active Prompt Version pinning.** An AI Conversation shall pin exactly one Active Prompt Version at conversation start; Prompt Versions in `Draft`, `Inactive`, or `Archived` shall not be usable.
3. **Active Retrieval Corpora consumption.** An AI Conversation shall consume only Retrieval Corpora in state `Active`; the retrieval-authorization-at-query-time invariant from Sprint 002 continues to hold — a caller shall never receive context they cannot read in the source module.
4. **Active Tool Definitions invocation.** An AI Conversation shall invoke only Tool Definitions in state `Active`, and shall invoke them exclusively by delegating to the Sprint 003 tool-call-with-approval business process; the approval gate and provider integration semantics of that process are not redefined here.
5. **Provider integration exclusively via `ENG-028`.** AI Conversation execution shall be delivered exclusively through the `ENG-028` AI Copilot Engine surface; MOD-018 shall not import provider SDKs directly. (Restated verbatim from the analogous Sprint 003 rule; no redefinition.)
6. **Read-model-only against source modules.** No Sprint 004 operation shall mutate a source-module master or transaction directly. Where a state change in a source module results from an AI Conversation, that state change shall be executed by the source module's own authorized capability under the invoking user's authorization via the Sprint 003 tool-call-with-approval process.
7. **Authorization-as-invoking-user at conversation-initiation time.** At AI Conversation initiation, the invoking user's module-level authorization shall be enforced against the requested copilot surface as defined by the approved Module PRD and allocated architecture decisions (`ADR-032` RBAC + ABAC; `ADR-011` Multi-Tenant Isolation).
8. **Auditability.** Every state change on an AI Conversation transaction and every published `AIConversationStarted` event shall be auditable via `ENG-004` per `ADR-014`.
9. **Configuration validation at capture time.** AI Conversation transactions shall be validated declaratively at capture time via the platform rules surface.
10. **No re-authoring of upstream authorities.** Sprint 004 shall not re-author Prompt / Prompt Version, Retrieval Corpus, or Tool Definition masters, nor their lifecycles, nor the `Enabled surfaces per tenant` configuration; consumption is read-only.

---

## 6. Events

### 6.1 Events Published (Sprint 004 copilot-surface events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `AIConversationStarted` | An AI Conversation transaction is initiated | Signals to downstream consumers and to audit that a copilot conversation has entered the prompt-to-response process. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`. `AIToolCallRequested` remains allocated to `SPR-MOD-018-003`. `AIApprovalGranted` and `AIApprovalDenied` remain allocated to `SPR-MOD-018-005`.

### 6.2 Events Consumed

AI Conversations consume source-module domain events strictly **read-only** as retrieval inputs per the Module PRD §8 declaration ("All module domain events (as retrieval or trigger inputs)"). This sprint introduces no new event contract; source-module capability invocation is exercised exclusively through the Sprint 003 tool-call-with-approval process under the invoking user's authorization, per Rule 6.

---

## 7. Integrations

MOD-018 AI Workspace **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 004 |
| --- | --- |
| `ENG-002` Authorization | Enforce the invoking user's module-level authorization at AI Conversation initiation, per `ADR-032`. |
| `ENG-004` Audit | Persist audit records for every AI Conversation state change per `ADR-014`. |
| `ENG-005` Configuration | Resolve `Enabled surfaces per tenant` (owned by Sprint 001) at AI Conversation initiation; no configuration authored here. |
| `ENG-006` Localization | Resolve locale-sensitive surface strings and content packs per tenant/company/context. Behavior not redefined. |
| `ENG-017` Numbering | Issue AI Conversation document numbers using the AI Workspace numbering series registered in Sprint 001. |
| `ENG-024` Event | Publish `AIConversationStarted`; consume source-module domain events strictly read-only as retrieval inputs. |
| `ENG-028` AI Copilot | Execute the AI Conversation; provider integration is delivered exclusively through this engine. Behavior not redefined. |
| `ENG-025` Notification (optional) | Where notifications on conversation lifecycle transitions are configured. Behavior not redefined. |
| `ENG-007` Document (optional) | Where a copilot surface renders or emits documents. Behavior not redefined. |
| `ENG-008` Attachment (optional) | Where a copilot conversation attaches supporting content. Behavior not redefined. |

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
- **Tool Calling Sprint PRD** — [`SPR-MOD-018-003`](./SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md) — Draft (reference / traceability dependency only; no re-authoring).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260718T020000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 004):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-017`, `ENG-024`, `ENG-028`.
- **Engines optional (Sprint 004):** `ENG-025` Notification, `ENG-007` Document, `ENG-008` Attachment.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-018-001`, `SPR-MOD-018-002`, and `SPR-MOD-018-003` (reference / traceability only; no re-authoring).
- **Downstream sprints.** `SPR-MOD-018-005` depends on this sprint per the approved Sprint Plan §3 dependency graph.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — Surface enablement gate.** An AI Conversation initiation against a copilot surface that is not enabled for the caller's tenant/company/context under the `Enabled surfaces per tenant` configuration (Sprint 001) is rejected deterministically at initiation; the rejection is audited. (Deliverables 1, 4; Rule 1, 8.)
2. **AC-002 — AI Conversation initiation.** An authorized caller initiates an AI Conversation against an enabled copilot surface; authorization is enforced as the invoking user via `ENG-002` per `ADR-032`; `AIConversationStarted` is emitted via `ENG-024`; an AI Conversation document number is issued via `ENG-017` using the AI Workspace numbering series from Sprint 001; an `ENG-004` audit record is written. (Deliverables 1, 3, 7; Rule 7, 8.)
3. **AC-003 — Active Prompt Version pinning.** An AI Conversation pins exactly one Active Prompt Version at conversation start; Prompt Versions in `Draft`, `Inactive`, or `Archived` are not usable. (Deliverable 2; Rule 2, 10.)
4. **AC-004 — Active Retrieval Corpora consumption.** An AI Conversation consumes only Retrieval Corpora in state `Active`; the retrieval-authorization-at-query-time invariant from Sprint 002 continues to hold — a caller never receives context they cannot read in the source module. (Deliverable 2; Rule 3, 10.)
5. **AC-005 — Active Tool Definitions invocation via Sprint 003 delegation.** An AI Conversation invokes only Tool Definitions in state `Active`, and only by delegating to the Sprint 003 tool-call-with-approval business process; approval gating and provider integration remain owned by Sprint 003. (Deliverable 2; Rule 4, 6, 10.)
6. **AC-006 — Prompt-to-response determinism.** For a given surface, pinned Prompt Version, resolved Retrieval Corpora set, resolved Tool Definitions set, invoking user, and input payload, the prompt-to-response process follows a deterministic composition sequence; provider non-determinism is delivered inside `ENG-028`. (Deliverable 2; Rule 5.)
7. **AC-007 — `AIConversationStarted` publication.** `AIConversationStarted` is emitted via `ENG-024` on AI Conversation initiation and is traced to its originating audit record in `ENG-004`. (Deliverable 3; Rule 8.)
8. **AC-008 — Localization.** Locale-sensitive surface strings and content packs resolve via `ENG-006` per tenant/company/context. (Deliverable 5.)
9. **AC-009 — Read-model-only against source modules.** No Sprint 004 operation writes to a source module's master or transactional data directly; where a state change in a source module results from an AI Conversation, that state change is executed via the Sprint 003 tool-call-with-approval process under the invoking user's authorization. (Deliverable 2; Rule 6.)
10. **AC-010 — Provider integration exclusivity.** AI Conversation execution occurs exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly. (Deliverable 1; Rule 5.)
11. **AC-011 — Numbering.** AI Conversation document numbers issue through `ENG-017` using the AI Workspace numbering series registered in Sprint 001; numbering algorithms are not redefined. (Deliverable 7.)
12. **AC-012 — Structural validation.** AI Conversation transactions are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverable 6; Rule 9.)
13. **AC-013 — Audit trail.** Every state-changing operation in §2 (AI Conversation state changes; `AIConversationStarted` emission) emits an `ENG-004` audit record per `ADR-014`. (Deliverables 1, 3; Rule 8.)
14. **AC-014 — Ownership boundaries preserved.** No MOD-001 / MOD-017 / source-module authority is redefined; MOD-018 does not claim ownership of any platform engine; approval-policy authoring, cost budgets, safety governance, AI Approval, and AI reports remain allocated to Sprint 005; Sprint 001 (Prompt/Version, versioning-and-audit rule, `Enabled surfaces per tenant`, numbering series, search-index baseline), Sprint 002 (Retrieval Corpus, refresh cadence, retrieval-authorization-at-query-time rule), and Sprint 003 (Tool Definition, AI Tool Call, tool-call-with-approval process, `AIToolCallRequested`) authorities are not re-authored. (Deliverable 8.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.5 (not evolved):

- **MOD-018 AI Workspace** owns the AI Conversation transaction, the prompt-to-response business process, and the `AIConversationStarted` event publication (this sprint). Sprint 001 authorities (Prompt master, Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, Enabled surfaces per tenant configuration, AI Workspace numbering series registration, module-wide search-index baseline), Sprint 002 authorities (Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, Retrieval refresh cadence configuration), and Sprint 003 authorities (Tool Definition master, AI Tool Call transaction, tool-call-with-approval business process, `AIToolCallRequested` publication) remain as authored and are not re-authored here.
- **Source modules** continue to own all transactional and master data and all published capability contracts; MOD-018 effects source-module state changes exclusively through the Sprint 003 tool-call-with-approval process under the invoking user's authorization, and consumes source-module domain events strictly read-only.
- **MOD-001 Platform Administration** retains ownership of Identity (`ENG-001`), Authorization (`ENG-002`), and Permission Management (`ENG-003`).
- **MOD-017 Analytics** retains ownership of cross-module KPI definitions.
- **Platform engines** retain ownership of Configuration (`ENG-005`), Audit (`ENG-004`), Localization (`ENG-006`), Numbering (`ENG-017`), Event infrastructure (`ENG-024`), AI Copilot (`ENG-028`), Notification (`ENG-025`), Document (`ENG-007`), and Attachment (`ENG-008`). Approval (`ENG-011`), Reporting (`ENG-021`), and Dashboard (`ENG-022`) remain exercised in earlier or later sprints as allocated.

**No ownership reassignment. No approval-policy authoring introduced. No cost-budget configuration introduced. No safety governance introduced. No provider SDK imported.**

---

## 11. Non-Goals

- No Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, `Enabled surfaces per tenant` configuration authoring, AI Workspace numbering series registration, or module-wide search-index baseline (allocated to `SPR-MOD-018-001`).
- No Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, or Retrieval refresh cadence configuration (allocated to `SPR-MOD-018-002`).
- No Tool Definition master, AI Tool Call transaction, tool-call-with-approval process, or `AIToolCallRequested` publication (allocated to `SPR-MOD-018-003`).
- No AI Approval transaction, approval-gate rule authoring, approval-policy authoring, cost budgets, safety governance, AI reports, or `AIApprovalGranted` / `AIApprovalDenied` publications (allocated to `SPR-MOD-018-005`).
- No AI provider integration mechanics; provider mechanics are delivered exclusively through `ENG-028`.
- No modification of source-module master or transactional data by MOD-018; source-module state changes occur only through the Sprint 003 tool-call-with-approval process under the invoking user's authorization.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.

---

## 12. Sprint Exit Criteria (verbatim from Sprint Plan §2 SPR-MOD-018-004)

- AI Conversation transactions execute via `ENG-028`; the prompt-to-response process runs deterministically using published Prompts (from 001), active Retrieval Corpora (from 002), and published Tool Definitions (from 003).
- `AIConversationStarted` events publish via `ENG-024`.
- Per-tenant copilot surfaces respect `Enabled surfaces per tenant` (resolved via `ENG-005`, authored in SPR-MOD-018-001).
- Document numbers for AI Conversation transactions issue through `ENG-017`; state changes are audited via `ENG-004`.
- AI-provider integration occurs exclusively through the `ENG-028` provider abstraction; MOD-018 does not import provider SDKs directly.

---

## 13. References

- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../../20-module-prds/ai/MODULE_PRD.md) — Parent Module PRD (authoritative).
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) — Parent Sprint Plan (Stage 1).
- [`docs/30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md`](./SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md) — Foundation Sprint PRD (reference / traceability dependency only).
- [`docs/30-sprint-prds/ai/sprints/SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md`](./SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md) — Retrieval Sprint PRD (reference / traceability dependency only).
- [`docs/30-sprint-prds/ai/sprints/SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md`](./SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md) — Tool Calling Sprint PRD (reference / traceability dependency only).
- [`docs/30-sprint-prds/ai/README.md`](../README.md) — Sprint container.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md) — Module lifecycle workflow.
- [`docs/SPRINT_AUTHORING_GUIDE.md`](../../../SPRINT_AUTHORING_GUIDE.md) — Sprint authoring rules.
- [`docs/SPRINT_ESTIMATION_GUIDE.md`](../../../SPRINT_ESTIMATION_GUIDE.md) — Sprint sizing.
- [`docs/SPRINT_DEPENDENCY_MATRIX.md`](../../../SPRINT_DEPENDENCY_MATRIX.md) — Sprint dependency rules.
- [`docs/SPRINT_CATALOG.md`](../../../SPRINT_CATALOG.md) — Sprint catalog projection.
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../../10-erp-core/ENGINE_CATALOG.md) — ERP Core Engines (authoritative).
- [`docs/11-adrs/ADR_INDEX.md`](../../../11-adrs/ADR_INDEX.md) — Accepted ADRs.
- [`docs/50-audit-reports/REPOSITORY_AUDIT_20260718T020000Z.md`](../../../50-audit-reports/REPOSITORY_AUDIT_20260718T020000Z.md) — Preceding audit (Repository READY).
