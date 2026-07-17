---
title: "MOD-018 Module Publication — AI Workspace"
summary: "GT-005 Module Publication for MOD-018 AI Workspace. Terminal governance artifact derived exclusively from MOD018_AI_WORKSPACE_BASELINE_v1. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
publication_id: "MOD-018_MODULE_PUBLICATION"
module_id: "MOD-018"
module_name: "AI Workspace"
version: "1.0"
status: "Published"
owner: "AI Platform"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
parent_module_prd: "docs/20-module-prds/ai/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md"
source_sprints: ["SPR-MOD-018-001", "SPR-MOD-018-002", "SPR-MOD-018-003", "SPR-MOD-018-004", "SPR-MOD-018-005"]
layer: "delivery"
updated: "2026-07-18"
tags: ["publication", "module", "MOD-018", "ai-workspace", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD018-20260718T060000Z-001"
parent_execution_id: "GT004-MOD018-20260718T050000Z-001"
previous_audit_report_id: "REPOSITORY_AUDIT_20260718T050000Z"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-011", "ENG-013", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
---

# MOD-018 Module Publication — AI Workspace

> **Reference publication only.** This publication is a faithful representation of [`MOD018_AI_WORKSPACE_BASELINE_v1`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md). It introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-018
- **Module Name:** AI Workspace
- **Owner:** AI Platform
- **Publication ID:** MOD-018_MODULE_PUBLICATION
- **Source Baseline:** `MOD018_AI_WORKSPACE_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-018-001` … `SPR-MOD-018-005`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

Copilot experiences, retrieval workspaces, and tool-calling surfaces that operate on top of business modules. AI Workspace consumes source-module master and transactional data as **read models only** and mutates source-module state exclusively through each source module's published capability contracts, gated by the tool-call-with-approval process. Provider integration occurs exclusively via `ENG-028` — MOD-018 imports no provider SDK.

## 3. Approved Scope

Restates the scope consolidated in `MOD018_AI_WORKSPACE_BASELINE_v1` §2. AI Workspace owns:

- **Prompt Library & AI Workspace Foundation** — Prompt master data, immutable Prompt Version master data, prompt review-and-publish business process, per-tenant `Enabled surfaces` configuration authority, numbering series for AI Workspace documents, and the module-wide search-index baseline for AI Workspace masters.
- **Retrieval Workspaces (RAG)** — Retrieval Corpus master data, retrieval build-and-refresh business process, `Retrieval refresh cadence` configuration authority, and the retrieval-authorization-at-query-time business rule.
- **Tool Calling on Module Capabilities** — Tool Definition master data, AI Tool Call transaction lifecycle, tool-call-with-approval business process, the AI-initiated-state-change approval-gate rule, and publication of `AIToolCallRequested`.
- **Copilot Surfaces & Conversations** — AI Conversation transaction lifecycle, prompt-to-response business process (deterministic composition of published Prompts, active Retrieval Corpora, and published Tool Definitions), and publication of `AIConversationStarted`.
- **Governance: Human-Approval Gates, Cost & Safety** — AI Approval transaction lifecycle, `Approval policies` and `Cost budgets` configuration authorities, safety governance authority, operational reports (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency), and publications `AIApprovalGranted` / `AIApprovalDenied`.

## 4. Consolidated Authorities

Every authority is inherited verbatim from the Module Baseline §7. This publication restates them for consumer convenience; the Module Baseline remains authoritative.

### 4.1 SPR-MOD-018-001 — Prompt Library & AI Workspace Foundation

- **Prompt Master Authority** (lifecycle `Draft → Active → Inactive → Archived`)
- **Prompt Version Master Authority** (immutable versions)
- **Prompt Review-and-Publish Process Authority**
- **Enabled Surfaces Configuration Authority**
- **Foundation Search-Index Baseline**

### 4.2 SPR-MOD-018-002 — Retrieval Workspaces (RAG)

- **Retrieval Corpus Master Authority**
- **Retrieval Build-and-Refresh Process Authority**
- **Retrieval Refresh Cadence Configuration Authority**
- **Retrieval-Authorization-at-Query-Time Rule Authority**
- **Read-Model-Only Ingestion Boundary**

### 4.3 SPR-MOD-018-003 — Tool Calling on Module Capabilities

- **Tool Definition Master Authority** (lifecycle `Draft → Active → Inactive → Archived`)
- **AI Tool Call Transaction Authority**
- **Tool-Call-with-Approval Process Authority**
- **AI-Initiated Approval-Gate Rule Authority**
- **AIToolCallRequested Event Authority** (publishes `AIToolCallRequested`)
- **Provider-Integration Exclusivity** (via `ENG-028`)

### 4.4 SPR-MOD-018-004 — Copilot Surfaces & Conversations

- **AI Conversation Transaction Authority**
- **Prompt-to-Response Process Authority**
- **AIConversationStarted Event Authority** (publishes `AIConversationStarted`)
- **Per-Tenant Copilot Enablement Consumption** (read-only from Sprint 001)
- **Provider-Integration Exclusivity** (via `ENG-028`)
- **Attachment / Document Consumption** (via `ENG-007` / `ENG-008`)

### 4.5 SPR-MOD-018-005 — Governance: Human-Approval Gates, Cost & Safety

- **AI Approval Transaction Authority**
- **Approval Policies Configuration Authority**
- **Cost Budgets Configuration Authority**
- **Safety Governance Authority**
- **Operational Reports Authority** (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency)
- **AIApprovalGranted / AIApprovalDenied Event Authority** (publishes `AIApprovalGranted`, `AIApprovalDenied`)

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-018-001` … `SPR-MOD-018-005`) as consolidated in `MOD018_AI_WORKSPACE_BASELINE_v1`. This publication introduces no new requirements. See the source Sprint PRDs for requirement-level detail.

## 6. Business Rules

Business rules are inherited verbatim from the Sprint PRD family as consolidated in `MOD018_AI_WORKSPACE_BASELINE_v1` §7. Key rule invariants:

- AI-initiated state changes MUST pass an approval gate unless explicitly whitelisted; enforcement runs via `ENG-011` per `ADR-032`.
- Prompts and Tool Definitions are versioned and audited (`ENG-004` per `ADR-014`); Prompt Versions are immutable.
- Retrieval corpora respect module-level authorization at query time via `ENG-002` / `ENG-003` per `ADR-032`; row-level access is enforced at read time.
- Retrieval never mutates source-module masters or transactions; source-module state changes occur exclusively via each source module's published capability contracts under the invoking user's authorization once the approval gate resolves `Granted`.
- Provider integration occurs exclusively via `ENG-028`; MOD-018 imports no provider SDK.

## 7. Master Data Authorities

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §4.3:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Prompt | SPR-MOD-018-001 |
| Prompt Version | SPR-MOD-018-001 |
| Retrieval Corpus | SPR-MOD-018-002 |
| Tool Definition | SPR-MOD-018-003 |

Source-domain master ownership (Customer, Supplier, Employee, Item, Asset, Vehicle, etc.) remains with the originating modules and is consumed by MOD-018 read-only.

## 8. Transaction Authorities

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §4.3:

| Transaction | Originating Sprint |
| --- | --- |
| AI Conversation | SPR-MOD-018-004 |
| AI Tool Call | SPR-MOD-018-003 |
| AI Approval | SPR-MOD-018-005 |

AI Workspace declares no ledger effects. Any ledger effects remain owned by MOD-002 Accounting.

## 9. Published Events

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §8:

- `AIConversationStarted` — SPR-MOD-018-004
- `AIToolCallRequested` — SPR-MOD-018-003
- `AIApprovalGranted` — SPR-MOD-018-005
- `AIApprovalDenied` — SPR-MOD-018-005

All events are published via `ENG-024`.

## 10. Consumed Events

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §8:

- All module domain events consumed read-only as retrieval or trigger inputs. MOD-018 never mutates a source-module transaction outside the tool-call-with-approval process.

## 11. Platform Engine Usage

Platform engines remain platform-owned and are consumed by AI Workspace via their Capability Interfaces. Engine set is inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-018-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-018-001, 002, 003, 004, 005 |
| ENG-003 (Permission Management Engine) | SPR-MOD-018-001, 002 |
| ENG-004 (Audit Engine) | SPR-MOD-018-001, 002, 003, 004, 005 |
| ENG-005 (Configuration Engine) | SPR-MOD-018-001, 002, 003, 004, 005 |
| ENG-006 (Localization Engine) | SPR-MOD-018-001, 002, 004 |
| ENG-007 (Document Engine) | SPR-MOD-018-004 |
| ENG-008 (Attachment Engine) | SPR-MOD-018-004 |
| ENG-011 (Approval Engine) | SPR-MOD-018-003, 005 |
| ENG-013 (Automation Engine) | SPR-MOD-018-002 |
| ENG-017 (Numbering Engine) | SPR-MOD-018-001, 003, 004, 005 |
| ENG-020 (Search Engine) | SPR-MOD-018-001, 002 |
| ENG-021 (Reporting Engine) | SPR-MOD-018-005 |
| ENG-022 (Dashboard Engine) | SPR-MOD-018-005 |
| ENG-023 (Integration Engine) | SPR-MOD-018-002, 003 |
| ENG-024 (Event Engine) | SPR-MOD-018-001, 002, 003, 004, 005 |
| ENG-025 (Notification Engine) | SPR-MOD-018-004, 005 |
| ENG-028 (AI Copilot Engine) | SPR-MOD-018-003, 004 |

`ENG-015` Voucher and `ENG-016` Posting are not consumed by any AI Workspace sprint.

Related ADRs (all `Accepted`, inherited from `MOD018_AI_WORKSPACE_BASELINE_v1` §6): `ADR-011` (Multi-Tenant Isolation), `ADR-014` (Audit Strategy), `ADR-032` (RBAC + ABAC).

## 12. Dependencies

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §9:

**Upstream contracts consumed by AI Workspace:**

- **MOD-001 Platform Administration** — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- **MOD-017 Analytics** — cross-module KPI catalog and analytical read models consumed read-only.
- **All business modules (MOD-002 … MOD-016 and MOD-019)** — domain masters and published capability contracts consumed read-only; source-module state changes occur exclusively through each source module's published capability contracts under the invoking user's authorization once the approval gate resolves `Granted`. All module domain events consumed read-only via `ENG-024`.

**Downstream consumers of AI Workspace:**

- Copilot surfaces embedded within source modules consume MOD-018 read-only APIs and subscribe to published events.

## 13. Ownership Boundaries

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1` §2 and §9:

- MOD-018 owns **only** the authorities enumerated in §4 of this publication.
- Source-domain master ownership remains with originating modules.
- Platform engines remain platform-owned; MOD-018 imports no provider SDK.
- Cross-module KPI authority remains with MOD-017.
- AI Workspace operates as a **read-model-only** consumer for retrieval and as an approval-gated invoker for state changes.
- No downstream module owns MOD-018 master data or redefines MOD-018 transactions.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | [`SPR-MOD-018-001`](../../30-sprint-prds/ai/sprints/SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md) · [`002`](../../30-sprint-prds/ai/sprints/SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md) · [`003`](../../30-sprint-prds/ai/sprints/SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md) · [`004`](../../30-sprint-prds/ai/sprints/SPR-MOD-018-004_COPILOT_SURFACES_AND_CONVERSATIONS.md) · [`005`](../../30-sprint-prds/ai/sprints/SPR-MOD-018-005_GOVERNANCE_HUMAN_APPROVAL_COST_AND_SAFETY.md) |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |
| Preceding Audit | [`REPOSITORY_AUDIT_20260718T050000Z`](../../50-audit-reports/REPOSITORY_AUDIT_20260718T050000Z.md) |

## 15. Non-Goals

Inherited verbatim from `MOD018_AI_WORKSPACE_BASELINE_v1`:

- Multi-modal copilots, long-horizon agent workflows, and fine-tuned domain models (recorded as future enhancements in the Module PRD §14).
- Ledger effects (owned by MOD-002 Accounting via `ENG-015` / `ENG-016`).
- Cross-module KPI authoring (owned by MOD-017 Analytics).
- Redefinition of any ERP Core Engine behavior; provider SDK integration outside `ENG-028`.

## 16. Publication Metadata

- **Publication Template:** `GT-005` v1.0
- **Governance Specification:** v1.0
- **Execution Wrapper:** FROZEN v1.0
- **Execution ID:** `GT005-MOD018-20260718T060000Z-001`
- **Parent Execution ID:** `GT004-MOD018-20260718T050000Z-001`
- **Previous Audit Report:** `REPOSITORY_AUDIT_20260718T050000Z`
- **Emitted Audit Report:** `REPOSITORY_AUDIT_20260718T060000Z`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** COMPLETE
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD018_AI_WORKSPACE_BASELINE_v2`), through a separately approved governance process.

## 17. References

- [`docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md)
- [`docs/15-governance/templates/GT-005_REPOSITORY_AUDIT.md`](../../15-governance/templates/GT-005_REPOSITORY_AUDIT.md)
- [`docs/MODULE_PUBLICATION_CATALOG.md`](../../MODULE_PUBLICATION_CATALOG.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../../MODULE_BASELINE_CATALOG.md)
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
