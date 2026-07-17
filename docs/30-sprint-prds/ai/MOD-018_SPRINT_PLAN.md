---
title: "MOD-018 AI Workspace — Sprint Plan (Stage 1)"
summary: "Stage 1 sprint planning for MOD-018 AI Workspace. Proposes an ordered sprint sequence with engines, ADRs, dependencies, and exit criteria. Reserves sprint identifiers; authors no Sprint PRDs."
layer: "delivery"
owner: "AI Platform"
status: "Approved"
updated: "2026-07-17"
module_id: "MOD-018"
module_name: "AI Workspace"
sprint_prefix: "SPR-MOD-018-"
stage: "1"
pass: "23.0.1"
parent_module_prd: "docs/20-module-prds/ai/MODULE_PRD.md"
workflow_stage: "Stage 1"
version: "v1"
governance_specification: "v1.0"
template_standard: "v1.4"
authored_by_template: "GT-002"
authored_by_template_version: "v1.0"
execution_id: "GT002-MOD018-20260717T230000Z-001"
tags: ["sprint", "planning", "ai-workspace", "mod-018", "stage-1"]
document_type: "Module Sprint Plan"
---

# MOD-018 AI Workspace — Sprint Plan (Stage 1)

> **Stage 1 deliverable.** This document is the Stage 1 (Sprint Planning) artifact for **MOD-018 AI Workspace** under [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). It defines the sprint sequence, reserves sprint identifiers, and states the objective exit criteria that will govern Stage 2 authoring. **No Sprint PRDs are authored here.**

## Normative Source Precedence

On any conflict, the following order wins:

1. `docs/20-module-prds/ai/MODULE_PRD.md` (Module PRD)
2. This Capability Allocation Matrix (§4)
3. The sprint sections in §2 of this Sprint Plan
4. Any derived artifact

## 1. Purpose & Scope

Plan the implementation of MOD-018 AI Workspace by decomposing its Module PRD into a coherent, dependency-ordered sprint sequence. Every sprint below is a **planning reservation** — the identifier is reserved for later Stage 2 authoring but is **not** an authored Sprint PRD.

This plan introduces no new business requirements beyond the approved [MOD-018 AI Workspace Module PRD](../../20-module-prds/ai/MODULE_PRD.md). It consumes ERP Core Engines and Accepted ADRs; it never redefines them.

**Governance Boundaries (recapitulated).** Per the Module PRD §13:

- **Identity, authentication, and permissions** are owned by **MOD-001 Platform Administration** via `ENG-001`, `ENG-002`, `ENG-003`.
- **Cross-module KPI definitions** are owned by **MOD-017 Analytics**; MOD-018 consumes them read-only.
- **Domain master data and transactional truth** remain owned by their emitting modules; MOD-018 never mutates a source-module master or transaction.
- **AI provider integration** is delivered through `ENG-028` AI Copilot Engine via the provider abstraction; MOD-018 does not redefine engine behavior.
- **Approval enforcement** is provided by `ENG-011` Approval Engine; MOD-018 declares the approval gate as a business rule and does not implement approval mechanics.

**Traceability:**

- Parent Module README — [`../../20-module-prds/ai/README.md`](../../20-module-prds/ai/README.md)
- Parent Module PRD — [`../../20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- Sprint framework — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md), [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md), [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md), [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md).

The **Estimated Sprint Count** for MOD-018 in `SPRINT_ROADMAP.md` is **5**; this plan preserves that estimate.

## 2. Proposed Sprint Sequence

### SPR-MOD-018-001 — Prompt Library & AI Workspace Foundation

- **Objective.** Establish the AI Workspace foundation: Prompt and Prompt Version master data; the prompt review-and-publish process; the versioning-and-audit rule for prompts and tool definitions; per-tenant enablement of AI surfaces; module-wide search-index baseline.
- **Boundaries.**
  - In: Prompt master; Prompt Version master; prompt lifecycle `Draft → Active → Inactive → Archived`; prompt review and publish process; versioning-and-audit rule for prompts and tool definitions; `Enabled surfaces per tenant` configuration; numbering series for AI Workspace transactions.
  - Out: Retrieval Corpus and RAG (SPR-MOD-018-002); Tool Definition and AI Tool Call (SPR-MOD-018-003); AI Conversation and copilot surfaces (SPR-MOD-018-004); AI Approval, cost budgets, approval policies, and AI reports (SPR-MOD-018-005); identity/permissions (owned by MOD-001).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §1 Overview, §2 Business Scope (Prompt library and governance — submodule Prompt Library), §3 Personas, §4 Business Processes (Prompt review and publish), §5 Master Data (Prompt, Prompt Version), §7 Business Rules (Prompts and tool definitions are versioned and audited), §10 Configuration (Enabled surfaces per tenant), §11 Non-functional Considerations (platform latency budget, batch envelope), §13 Dependencies (read-only consumption from MOD-001).
- **Engines consumed.** `ENG-001` Identity, `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-020` Search, `ENG-024` Event.
- **ADRs consumed.** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.
- **Upstream sprint dependencies.** None (MOD-018 sprint 1).
- **Sprint Exit Criteria.**
  - Prompt and Prompt Version records can be authored, reviewed, published, and archived under a tenant/company with the standard `Draft → Active → Inactive → Archived` lifecycle.
  - Every prompt or tool-definition change is versioned and audited via `ENG-004` per `ADR-014`.
  - `Enabled surfaces per tenant` is resolvable via `ENG-005` in the tenant → company → context hierarchy.
  - Structural validation and hierarchy enforcement run deterministically via the platform's declarative rules surface at capture time.
  - Prompt review and publish process runs deterministically; only one active version of a Prompt is exposed at a time.
  - Search over prompt/tool inventory is available via `ENG-020`.

### SPR-MOD-018-002 — Retrieval Workspaces (RAG)

- **Objective.** Deliver retrieval-workspace authority: Retrieval Corpus master; retrieval build-and-refresh process; retrieval refresh cadence configuration; module-authorization-at-query-time rule for retrieval corpora.
- **Boundaries.**
  - In: Retrieval Corpus master; retrieval lifecycle `Draft → Active → Inactive → Archived`; retrieval build/refresh business process; `Retrieval refresh cadence` configuration; retrieval-corpora-respect-module-authorization-at-query-time rule; read-only consumption of source-module domain events and master data for corpus construction.
  - Out: Prompt/Prompt Version master (SPR-MOD-018-001); Tool Definition and AI Tool Call (SPR-MOD-018-003); AI Conversation and copilot surfaces (SPR-MOD-018-004); AI Approval, cost budgets, and AI reports (SPR-MOD-018-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Retrieval workspaces (RAG) — submodule Retrieval), §4 Business Processes (Retrieval build/refresh), §5 Master Data (Retrieval Corpus), §7 Business Rules (Retrieval corpora respect module-level authorization at query time), §10 Configuration (Retrieval refresh cadence), §12 Optional engine `ENG-013` Automation (for scheduled refresh, where required), §13 Dependencies (read-only consumption of source-module data).
- **Engines consumed.** `ENG-002` Authorization, `ENG-003` Permission Management, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-020` Search, `ENG-024` Event, `ENG-013` Automation (optional), `ENG-023` Integration (optional).
- **ADRs consumed.** `ADR-011`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-018-001`.
- **Sprint Exit Criteria.**
  - Retrieval Corpus records can be authored, refreshed, and archived under a tenant/company.
  - Retrieval refresh cadence is resolvable via `ENG-005` in the tenant → company → context hierarchy.
  - At query time, retrieval corpora enforce the caller's module-level authorization via `ENG-002` and `ENG-003` per `ADR-032`; a caller never receives context they cannot read in the source module.
  - Corpus build/refresh executes deterministically; source-module masters and transactions remain unmutated.
  - All corpus state changes are audited via `ENG-004`.

### SPR-MOD-018-003 — Tool Calling on Module Capabilities

- **Objective.** Deliver the tool-calling surface: Tool Definition master; AI Tool Call transaction; tool-call-with-approval process; `AIToolCallRequested` publication; consumption of all module domain events as trigger inputs.
- **Boundaries.**
  - In: Tool Definition master; Tool Definition lifecycle; AI Tool Call transaction lifecycle; tool-call-with-approval business process; `AIToolCallRequested` event publication; consumption of all module domain events (as retrieval or trigger inputs); tool-definition versioning-and-audit inherited from SPR-MOD-018-001.
  - Out: Prompt/Prompt Version master (SPR-MOD-018-001); Retrieval Corpus (SPR-MOD-018-002); AI Conversation (SPR-MOD-018-004); AI Approval transaction, approval policies, cost budgets, and AI reports (SPR-MOD-018-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Tool-calling on module capabilities — submodule Tool Calling), §4 Business Processes (Tool-call-with-approval), §5 Master Data (Tool Definition), §6 Transactions (AI Tool Call), §8 Integration Points (`AIToolCallRequested` — published; all module domain events — consumed).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-011` Approval, `ENG-017` Numbering, `ENG-024` Event, `ENG-028` AI Copilot, `ENG-023` Integration (optional).
- **ADRs consumed.** `ADR-011`, `ADR-032`, `ADR-014`.
- **Upstream sprint dependencies.** `SPR-MOD-018-001`, `SPR-MOD-018-002`.
- **Sprint Exit Criteria.**
  - Tool Definition records can be authored, versioned, published, and archived; every change is audited via `ENG-004` per `ADR-014`.
  - AI Tool Call transactions execute via `ENG-028` and are authorized as the invoking user via `ENG-002` per `ADR-032`.
  - The tool-call-with-approval process invokes `ENG-011` where an approval gate applies; whitelisted tool calls bypass the gate deterministically per approval policy (policy authoring belongs to SPR-MOD-018-005).
  - `AIToolCallRequested` events publish via `ENG-024`.
  - All module domain events are consumable as trigger inputs; no source-module transaction is mutated by this sprint.
  - Document numbers for AI Tool Call transactions issue through `ENG-017`.

### SPR-MOD-018-004 — Copilot Surfaces & Conversations

- **Objective.** Deliver the in-app copilot surface: AI Conversation transaction; prompt-to-response business process; `AIConversationStarted` publication; per-surface enablement.
- **Boundaries.**
  - In: AI Conversation transaction lifecycle; prompt-to-response business process; `AIConversationStarted` event publication; consumption of published Prompts, active Retrieval Corpora, and published Tool Definitions from sprints 001–003; localization for copilot surfaces.
  - Out: Prompt/Prompt Version master (SPR-MOD-018-001); Retrieval Corpus (SPR-MOD-018-002); Tool Definition and AI Tool Call (SPR-MOD-018-003); AI Approval, cost budgets, approval policies, and AI reports (SPR-MOD-018-005).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (In-app copilot surfaces — submodule Copilot Surfaces), §4 Business Processes (Prompt-to-response), §6 Transactions (AI Conversation), §8 Integration Points (`AIConversationStarted` — published; External Systems — AI providers via provider abstraction).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-006` Localization, `ENG-017` Numbering, `ENG-024` Event, `ENG-028` AI Copilot, `ENG-025` Notification (optional), `ENG-007` Document (optional), `ENG-008` Attachment (optional).
- **ADRs consumed.** `ADR-011`, `ADR-032`, `ADR-014`.
- **Upstream sprint dependencies.** `SPR-MOD-018-001`, `SPR-MOD-018-002`, `SPR-MOD-018-003`.
- **Sprint Exit Criteria.**
  - AI Conversation transactions execute via `ENG-028`; the prompt-to-response process runs deterministically using published Prompts (from 001), active Retrieval Corpora (from 002), and published Tool Definitions (from 003).
  - `AIConversationStarted` events publish via `ENG-024`.
  - Per-tenant copilot surfaces respect `Enabled surfaces per tenant` (resolved via `ENG-005`, authored in SPR-MOD-018-001).
  - Document numbers for AI Conversation transactions issue through `ENG-017`; state changes are audited via `ENG-004`.
  - AI-provider integration occurs exclusively through the `ENG-028` provider abstraction; MOD-018 does not import provider SDKs directly.

### SPR-MOD-018-005 — Governance: Human-Approval Gates, Cost & Safety

- **Objective.** Deliver AI governance: AI Approval transaction; the AI-initiated-state-change-requires-approval rule; approval policies and cost-budget configuration; AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency reports; `AIApprovalGranted` and `AIApprovalDenied` publications.
- **Boundaries.**
  - In: AI Approval transaction lifecycle; the rule "AI-initiated state changes must pass an approval gate unless explicitly whitelisted"; `Cost budgets` configuration; `Approval policies` configuration; AI Adoption report; Tool-Call Success Rate report; Cost per Surface report; Approval Latency report; `AIApprovalGranted` and `AIApprovalDenied` event publication; provider-agnostic cost and safety attribution.
  - Out: Prompt/Prompt Version master (SPR-MOD-018-001); Retrieval Corpus (SPR-MOD-018-002); Tool Definition, AI Tool Call, and `AIToolCallRequested` (SPR-MOD-018-003); AI Conversation, prompt-to-response, and `AIConversationStarted` (SPR-MOD-018-004); cross-module KPI definitions (owned by MOD-017).
- **Estimated size.** Medium.
- **Module PRD sections covered.** §2 Business Scope (Human-approval gates for AI-initiated actions; Cost and safety governance — submodule Governance), §6 Transactions (AI Approval), §7 Business Rules (AI-initiated state changes must pass an approval gate unless explicitly whitelisted), §8 Integration Points (`AIApprovalGranted` — published; `AIApprovalDenied` — published), §9 Reports & Analytics (AI Adoption; Tool-Call Success Rate; Cost per Surface; Approval Latency; Exports via `ENG-027`), §10 Configuration (Cost budgets; Approval policies), §11 Non-functional Considerations (Compliance — data-classification and retention).
- **Engines consumed.** `ENG-002` Authorization, `ENG-004` Audit, `ENG-005` Configuration, `ENG-011` Approval, `ENG-017` Numbering, `ENG-021` Reporting, `ENG-022` Dashboard, `ENG-024` Event, `ENG-025` Notification (optional).
- **ADRs consumed.** `ADR-011`, `ADR-014`, `ADR-032`.
- **Upstream sprint dependencies.** `SPR-MOD-018-001`, `SPR-MOD-018-002`, `SPR-MOD-018-003`, `SPR-MOD-018-004`.
- **Sprint Exit Criteria.**
  - AI Approval transactions execute via `ENG-011`; the approval gate is applied to every AI-initiated state change except those explicitly whitelisted via approval policy.
  - `Cost budgets` and `Approval policies` are resolvable via `ENG-005` in the tenant → company → context hierarchy.
  - `AIApprovalGranted` and `AIApprovalDenied` events publish via `ENG-024`; notifications, where configured, dispatch via `ENG-025`.
  - AI Adoption, Tool-Call Success Rate, Cost per Surface, and Approval Latency reports render via `ENG-021`; dashboard surfacing uses `ENG-022`. Cross-module KPIs referenced from these reports are consumed read-only from MOD-017.
  - Document numbers for AI Approval transactions issue through `ENG-017`; all state changes are audited via `ENG-004` per `ADR-014`.

The sprint decomposition documented here represents the approved Stage 1 planning baseline based on the current Module PRD. During Stage 2 authoring, sprint boundaries MAY be refined, merged, or split where this improves cohesion, traceability, or implementation sequencing, provided every Module PRD capability remains fully covered and no capability becomes orphaned or duplicated as an originating allocation. Any such refinement MUST be reflected by updating this Sprint Plan before authoring subsequent Sprint PRDs.

## 3. Sprint Dependency Graph

```text
SPR-MOD-018-001 (Prompt Library & AI Workspace Foundation)
         │
         ▼
SPR-MOD-018-002 (Retrieval Workspaces (RAG))
         │
         ▼
SPR-MOD-018-003 (Tool Calling on Module Capabilities)
         │
         ▼
SPR-MOD-018-004 (Copilot Surfaces & Conversations)
         │
         ▼
SPR-MOD-018-005 (Governance: Human-Approval Gates, Cost & Safety)
```

Each sprint depends on all preceding sprints in the sequence: the Prompt Library and per-tenant enablement anchor every downstream surface; Retrieval Corpora are consumed by tool calls and conversations; Tool Definitions are consumed by conversations; and Governance references AI Conversation / AI Tool Call / AI Approval flows established in sprints 003–004 to enforce approval, cost, and safety policies.

## 4. Capability Allocation & Bidirectional Traceability

Every capability declared in the [MOD-018 AI Workspace Module PRD](../../20-module-prds/ai/MODULE_PRD.md) is allocated to exactly **one originating sprint**. No capability appears as the originating allocation in more than one sprint.

### 4.1 Capability Allocation Matrix (Forward Map)

| # | Module PRD Capability (§2) | Origin Sprint | PRD Section | Exact Quote | Status |
| --- | --- | --- | --- | --- | --- |
| 1 | In-app copilot surfaces | SPR-MOD-018-004 | §2 | "In-app copilot surfaces" | PASS |
| 2 | Retrieval workspaces (RAG) | SPR-MOD-018-002 | §2 | "Retrieval workspaces (RAG)" | PASS |
| 3 | Tool-calling on module capabilities | SPR-MOD-018-003 | §2 | "Tool-calling on module capabilities" | PASS |
| 4 | Prompt library and governance | SPR-MOD-018-001 | §2 | "Prompt library and governance" | PASS |
| 5 | Human-approval gates for AI-initiated actions | SPR-MOD-018-005 | §2 | "Human-approval gates for AI-initiated actions" | PASS |
| 6 | Cost and safety governance | SPR-MOD-018-005 | §2 | "Cost and safety governance" | PASS |

### 4.2 Forward Map — Module PRD Submodule → Originating Sprint

| Module PRD Submodule (§2) | Originating Sprint |
| --- | --- |
| Prompt Library | SPR-MOD-018-001 |
| Retrieval | SPR-MOD-018-002 |
| Tool Calling | SPR-MOD-018-003 |
| Copilot Surfaces | SPR-MOD-018-004 |
| Governance | SPR-MOD-018-005 |

### 4.3 Forward Map — Master Data & Transactions → Originating Sprint

| Module PRD Item | Kind | Originating Sprint |
| --- | --- | --- |
| Prompt | Master Data (§5) | SPR-MOD-018-001 |
| Prompt Version | Master Data (§5) | SPR-MOD-018-001 |
| Retrieval Corpus | Master Data (§5) | SPR-MOD-018-002 |
| Tool Definition | Master Data (§5) | SPR-MOD-018-003 |
| AI Tool Call | Transaction (§6) | SPR-MOD-018-003 |
| AI Conversation | Transaction (§6) | SPR-MOD-018-004 |
| AI Approval | Transaction (§6) | SPR-MOD-018-005 |

### 4.4 Forward Map — Events → Originating Sprint

| Event | Direction | Originating Sprint |
| --- | --- | --- |
| AIConversationStarted | Published (§8) | SPR-MOD-018-004 |
| AIToolCallRequested | Published (§8) | SPR-MOD-018-003 |
| AIApprovalGranted | Published (§8) | SPR-MOD-018-005 |
| AIApprovalDenied | Published (§8) | SPR-MOD-018-005 |
| All module domain events | Consumed (§8) | SPR-MOD-018-003 (as trigger/retrieval inputs; retrieval-side consumption scaffolded in SPR-MOD-018-002) |

### 4.5 Forward Map — Business Rules (§7) → Originating Sprint

| Business Rule | Originating Sprint |
| --- | --- |
| AI-initiated state changes must pass an approval gate unless explicitly whitelisted | SPR-MOD-018-005 |
| Prompts and tool definitions are versioned and audited | SPR-MOD-018-001 |
| Retrieval corpora respect module-level authorization at query time | SPR-MOD-018-002 |

### 4.6 Forward Map — Business Processes (§4) → Originating Sprint

| Business Process | Originating Sprint |
| --- | --- |
| Prompt-to-response | SPR-MOD-018-004 |
| Tool-call-with-approval | SPR-MOD-018-003 |
| Retrieval build/refresh | SPR-MOD-018-002 |
| Prompt review and publish | SPR-MOD-018-001 |

### 4.7 Forward Map — Configuration Keys (§10) → Originating Sprint

| Configuration Key | Originating Sprint |
| --- | --- |
| Enabled surfaces per tenant | SPR-MOD-018-001 |
| Cost budgets | SPR-MOD-018-005 |
| Approval policies | SPR-MOD-018-005 |
| Retrieval refresh cadence | SPR-MOD-018-002 |

### 4.8 Forward Map — Reports (§9) → Originating Sprint

| Report | Originating Sprint |
| --- | --- |
| AI Adoption | SPR-MOD-018-005 |
| Tool-Call Success Rate | SPR-MOD-018-005 |
| Cost per Surface | SPR-MOD-018-005 |
| Approval Latency | SPR-MOD-018-005 |

### 4.9 Reverse Map — Sprint → Module PRD Coverage

| Sprint | Module PRD References Covered |
| --- | --- |
| SPR-MOD-018-001 | §1, §2 (Prompt library and governance; submodule Prompt Library), §3, §4 (Prompt review and publish), §5 (Prompt, Prompt Version), §7 (Prompts and tool definitions are versioned and audited), §10 (Enabled surfaces per tenant), §11 (platform latency, batch envelope), §13 (read-only consumption from MOD-001) |
| SPR-MOD-018-002 | §2 (Retrieval workspaces (RAG); submodule Retrieval), §4 (Retrieval build/refresh), §5 (Retrieval Corpus), §7 (Retrieval corpora respect module-level authorization at query time), §10 (Retrieval refresh cadence), §13 (read-only consumption of source-module data) |
| SPR-MOD-018-003 | §2 (Tool-calling on module capabilities; submodule Tool Calling), §4 (Tool-call-with-approval), §5 (Tool Definition), §6 (AI Tool Call), §8 (`AIToolCallRequested` — published; all module domain events — consumed) |
| SPR-MOD-018-004 | §2 (In-app copilot surfaces; submodule Copilot Surfaces), §4 (Prompt-to-response), §6 (AI Conversation), §8 (`AIConversationStarted` — published; AI providers via provider abstraction — external) |
| SPR-MOD-018-005 | §2 (Human-approval gates for AI-initiated actions; Cost and safety governance; submodule Governance), §6 (AI Approval), §7 (AI-initiated state changes must pass an approval gate unless explicitly whitelisted), §8 (`AIApprovalGranted` — published; `AIApprovalDenied` — published), §9 (AI Adoption; Tool-Call Success Rate; Cost per Surface; Approval Latency), §10 (Cost budgets; Approval policies), §11 (Compliance — data classification and retention) |

No Module PRD capability, submodule, master-data entity, transaction, event, business rule, business process, configuration key, or report sits outside the five sprints above. No capability appears as the originating allocation in more than one sprint. Every capability appears in exactly one originating sprint and in at least one sprint.

## 5. Engine Consumption Map

Derived from AI Workspace Module PRD §12. No engine behavior is redefined. Engine identifiers resolve verbatim against `docs/10-erp-core/ENGINE_CATALOG.md`.

| Sprint | ENG-001 | ENG-002 | ENG-003 | ENG-004 | ENG-005 | ENG-006 | ENG-007 | ENG-008 | ENG-011 | ENG-013 | ENG-017 | ENG-020 | ENG-021 | ENG-022 | ENG-023 | ENG-024 | ENG-025 | ENG-028 |
| --- | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: | :-: |
| SPR-MOD-018-001 | ● | ● | ● | ● | ● | ● |   |   |   |   |   | ● |   |   |   | ● |   |   |
| SPR-MOD-018-002 |   | ● | ● | ● | ● | ● |   |   |   | ● |   | ● |   |   | ● | ● |   |   |
| SPR-MOD-018-003 |   | ● |   | ● | ● |   |   |   | ● |   | ● |   |   |   | ● | ● |   | ● |
| SPR-MOD-018-004 |   | ● |   | ● | ● | ● | ● | ● |   |   | ● |   |   |   |   | ● | ● | ● |
| SPR-MOD-018-005 |   | ● |   | ● | ● |   |   |   | ● |   | ● |   | ● | ● |   | ● | ● |   |

Required engines per Module PRD §12 (`ENG-001`, `ENG-002`, `ENG-003`, `ENG-004`, `ENG-005`, `ENG-006`, `ENG-011`, `ENG-020`, `ENG-021`, `ENG-022`, `ENG-024`, `ENG-028`) are each scheduled to at least one sprint. Optional engines (`ENG-007`, `ENG-008`, `ENG-013`, `ENG-023`, `ENG-025`) are scheduled only where their consumption is required to fulfil a capability in §2.

## 6. ADR Consumption Map

Accepted ADRs consumed by MOD-018 planning: `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC).

| Sprint | ADR-011 | ADR-014 | ADR-032 |
| --- | :-: | :-: | :-: |
| SPR-MOD-018-001 | ● | ● | ● |
| SPR-MOD-018-002 | ● |   | ● |
| SPR-MOD-018-003 | ● | ● | ● |
| SPR-MOD-018-004 | ● | ● | ● |
| SPR-MOD-018-005 | ● | ● | ● |

Any additional ADR that becomes required during Stage 2 authoring MUST be `Accepted` before its consuming sprint enters `In Progress`; no `Proposed` ADR is scheduled by this plan.

## 7. Cross-Sprint & Cross-Module Dependency Matrix

> **Platform Dependency.** MOD-018 consumes Tenant, Company, Branch, and User master read-only from MOD-001 Platform Administration.
>
> **Analytics Dependency.** MOD-018 consumes cross-module KPI definitions read-only from MOD-017 Analytics; MOD-018 never redefines a KPI.
>
> **Cross-Module Consumption.** MOD-018 consumes domain masters and domain events read-only from every published module baseline for retrieval and trigger inputs. AI Workspace never mutates a source-module transaction.
>
> **AI Provider Boundary.** All AI provider integration occurs through `ENG-028` AI Copilot Engine via the provider abstraction; MOD-018 does not import provider SDKs directly.

| Concern | Introduced in | Consumed by | Notes |
| --- | --- | --- | --- |
| Prompt / Prompt Version Master | SPR-MOD-018-001 | 002, 003, 004, 005 | Foundational; conversations, tool calls, and governance reference published prompts. |
| Enabled surfaces per tenant configuration | SPR-MOD-018-001 | 002, 003, 004, 005 | Resolved via `ENG-005`. |
| Retrieval Corpus Master | SPR-MOD-018-002 | 003 (tool-call context), 004 (conversation context), 005 (governance reports) | RAG surface. |
| Retrieval refresh cadence configuration | SPR-MOD-018-002 | 003, 004 | Resolved via `ENG-005`. |
| Tool Definition Master / AI Tool Call | SPR-MOD-018-003 | 004 (conversations invoke tools), 005 (governance reports and approvals) | Tool-calling authority. |
| AI Conversation | SPR-MOD-018-004 | 005 | Governance measures adoption and cost across conversations. |
| Cost budgets / Approval policies | SPR-MOD-018-005 | 003 (approval gate), 004 (cost attribution) | Resolved via `ENG-005`. |
| AI Approval / Approval Gate | SPR-MOD-018-005 | 003 (gates tool calls) | Enforced via `ENG-011`. |
| Tenant / Company / Branch / User Master | External (MOD-001) | 001–005 | Consumed via read-only APIs; never redefined. |
| Cross-module KPI definitions | External (MOD-017) | 005 | Consumed read-only; MOD-018 never authors KPIs. |
| All module domain events | External (source modules) | SPR-MOD-018-002 (retrieval inputs), SPR-MOD-018-003 (trigger inputs) | Read-only consumption; MOD-018 remains non-mutating. |
| `AIConversationStarted` event | SPR-MOD-018-004 | Downstream consumers, audit trails | Published via `ENG-024`. |
| `AIToolCallRequested` event | SPR-MOD-018-003 | Downstream consumers, audit trails | Published via `ENG-024`. |
| `AIApprovalGranted` / `AIApprovalDenied` events | SPR-MOD-018-005 | Downstream consumers, audit trails | Published via `ENG-024`. |

## 8. Risks & Assumptions

- **R1 — Platform baseline dependency.** MOD-018 assumes `MOD001_PLATFORM_BASELINE_v1` is frozen. Any regression against that baseline blocks Stage 2 authoring.
- **R2 — Analytics baseline dependency.** MOD-018 assumes `MOD017_ANALYTICS_BASELINE_v1` is published for cross-module KPI consumption in SPR-MOD-018-005. Any regression against that baseline blocks the governance-and-reports sprint.
- **R3 — Read-only cross-module consumption.** MOD-018 never mutates a source-module master or transaction. Any observed mutation is a defect against this plan.
- **R4 — Approval-gate single-authority.** The AI-initiated-state-change approval rule is owned exclusively in SPR-MOD-018-005. Any downstream redefinition is out of scope.
- **R5 — Provider abstraction.** All AI provider integration goes through `ENG-028`. Direct provider SDK usage in module code is a defect against `ADR-040` (referenced through `ENG-028`).
- **R6 — Optional-engine scope creep.** Optional engines (`ENG-007`, `ENG-008`, `ENG-013`, `ENG-023`, `ENG-025`) MUST NOT introduce capabilities absent from the Module PRD. If a Stage 2 sprint requires new capability, the Module PRD is amended first, not the Sprint PRD.
- **R7 — Roadmap alignment.** `SPRINT_ROADMAP.md` estimates 5 sprints for MOD-018; this plan preserves that estimate. No PRD capability is added, orphaned, or duplicated.
- **R8 — Future-enhancement scope.** §14 items (multi-modal copilots, long-horizon agent workflows, fine-tuned domain models) are deferred and NOT allocated to any sprint in this plan.

## 9. Module Completion Criteria (Input to Stage 3 Baseline)

MOD-018 is baseline-ready when all of the following are objectively true:

1. Every reserved AI Workspace Sprint PRD has status `Done` per the Sprint Lifecycle Clarification in `MODULE_IMPLEMENTATION_WORKFLOW.md`.
2. `MOD018_AI_WORKSPACE_BASELINE_v1` is authored under `docs/40-module-baselines/`.
3. Repository verification is complete: `DOCUMENT_INDEX.md`, `_meta.json`, `MODULE_BASELINE_CATALOG.md`, and `SPRINT_CATALOG.md` reference the baseline and every included Sprint PRD exactly once.
4. Every Module PRD capability in §2 traces to at least one included Sprint PRD, and every Sprint allocation traces back to an approved Module PRD capability; no AI Workspace capability sits outside the baseline and no capability is originating-allocated in more than one sprint.
5. All engines and ADRs listed in §5 and §6 are `Accepted` at baseline time.

Failure to meet any criterion blocks the Stage 3 pass.

## 10. Non-Goals

- No Sprint PRDs are authored in this document; identifiers are **reservations**, not documentation.
- No changes to ERP Core Engines, ADRs, the Module PRD, the Sprint framework, or `SPRINT_CATALOG.md` beyond additive registration.
- No cross-module ownership reassignment; no redefinition of source-module masters or transactions; no redefinition of MOD-017 KPIs.
- No code, routes, packages, schemas, APIs, migrations, or UI changes.
- Estimated sizes remain planning estimates, not implementation commitments.

## 11. References

- [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`../../20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- [`../../10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`../../11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`../../15-governance/templates/GT-002_STAGE1_AUTHORING.md`](../../15-governance/templates/GT-002_STAGE1_AUTHORING.md)
