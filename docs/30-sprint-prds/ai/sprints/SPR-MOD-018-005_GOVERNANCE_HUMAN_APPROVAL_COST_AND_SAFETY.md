---
title: "SPR-MOD-018-005 — Governance: Human-Approval Gates, Cost & Safety"
summary: "Sprint PRD for the governance layer of MOD-018 AI Workspace: the AI Approval transaction, the AI-initiated-state-change-requires-approval rule, Approval policies and Cost budgets configuration authoring, safety governance, AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency operational reports, and the AIApprovalGranted and AIApprovalDenied event publications. Consumes ERP Core Engines and Accepted ADRs; never redefines them."
layer: "delivery"
owner: "AI Platform"
status: "Draft"
updated: "2026-07-18"
sprint_id: "SPR-MOD-018-005"
parent_module: "MOD-018"
parent_sprint_plan: "MOD-018_SPRINT_PLAN.md"
iteration: "Sprint 5"
stage: "2"
pass: "23.0.6"
size: "Medium"
related_engines: ["ENG-002", "ENG-004", "ENG-005", "ENG-011", "ENG-017", "ENG-021", "ENG-022", "ENG-024", "ENG-025"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032"]
tags: ["sprint", "prd", "ai-workspace", "mod-018", "governance", "approval", "cost", "safety", "stage-2"]
document_type: "Sprint PRD"
governance_specification: "v1.0"
authored_via_template: "GT-003"
authored_via_template_version: "v1.0"
execution_id: "GT003-MOD018-005-20260718T040000Z-001"
parent_result_id: "GT003-MOD018-004-20260718T030000Z-001"
preflight_snapshot_digest: "sha256:<computed at execution; frozen authoritative artifacts snapshotted per FROZEN Wrapper v1.0 Step 2>"
---

# SPR-MOD-018-005 — Governance: Human-Approval Gates, Cost & Safety

> **Stage 2 deliverable.** Fifth and final authored Sprint PRD for **MOD-018 AI Workspace** under the repository-wide [`Module Implementation Workflow`](../../../MODULE_IMPLEMENTATION_WORKFLOW.md), authored via **GT-003 Sprint Authoring** (Governance Framework v1.0) under the **FROZEN GT-003 Execution Wrapper v1.0**. Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. This sprint establishes the governance layer over the AI Conversation, AI Tool Call, and prompt-to-response flows authored in Sprints 003–004: the AI Approval transaction, the approval-gate business rule for AI-initiated state changes, Approval policies and Cost budgets configuration authoring, safety governance derived from the approved Module PRD and Sprint Plan allocations, the AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency operational reports, and the `AIApprovalGranted` and `AIApprovalDenied` event publications. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-018-005` (permanent) |
| Parent Module | `MOD-018` — AI Workspace |
| Parent Sprint Plan | [`MOD-018_SPRINT_PLAN.md`](../MOD-018_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprint Dependencies | `SPR-MOD-018-001`, `SPR-MOD-018-002`, `SPR-MOD-018-003`, `SPR-MOD-018-004` (reference / traceability only) |
| Downstream Sprints | — (final MOD-018 sprint) |
| Authored via | GT-003 v1.0 (Governance Framework v1.0) |

---

## 1. Objective and Scope

### 1.1 Objective

Establish the **Governance** layer for MOD-018 AI Workspace: the **AI Approval transaction** (executed via `ENG-011` and authorized as the invoking user via `ENG-002`), the **AI-initiated-state-change-requires-approval business rule** (Module PRD §7), the **Approval policies** and **Cost budgets** configuration authoring (Module PRD §10), the **safety governance authority** derived from the approved Module PRD and Sprint Plan allocations, the **operational reports** (AI Adoption; Tool-Call Success Rate; Cost per Surface; Approval Latency) rendered via `ENG-021` and surfaced via `ENG-022`, and the **`AIApprovalGranted` / `AIApprovalDenied` event publications** via `ENG-024`. Governance sits atop the Prompt foundation (`SPR-MOD-018-001`), the Retrieval layer (`SPR-MOD-018-002`), the Tool-Calling layer (`SPR-MOD-018-003`), and the Copilot Surfaces & Conversations layer (`SPR-MOD-018-004`); it completes the MOD-018 sprint sequence.

> **AI Workspace Ownership Convention (unchanged).** MOD-018 AI Workspace owns the business semantics of the AI Approval transaction, the AI-initiated-state-change-requires-approval rule, the Approval policies and Cost budgets configuration keys, safety governance, and the operational reports authored in this sprint. ERP Core Engines provide shared infrastructure (authorization, audit, configuration, approval, numbering, reporting, dashboards, eventing, notification). MOD-018 **MUST NOT** redefine engine behavior. Identity, authentication, and permissions remain exclusive to **MOD-001 Platform Administration**. Cross-module KPI definitions remain exclusive to **MOD-017 Analytics**; the reports authored here are MOD-018 operational reports and reference MOD-017 KPIs read-only where applicable. Source-module master and transactional data remain exclusive to their owning modules; approval gates apply to AI-initiated state changes routed through the Sprint 003 tool-call-with-approval process — MOD-018 does not bypass source-module ownership. AI provider integration is delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly.

#### 1.1.1 AI Approval Transaction Authority

The **AI Approval** transaction is authoritatively owned by MOD-018 AI Workspace, as allocated by the approved Module PRD §6 and the approved Sprint Plan §Sprint 005. This sprint establishes:

- **AI Approval transaction lifecycle** — the business lifecycle of an AI Approval, governed by `ENG-011` Approval per `ADR-032` (RBAC + ABAC) and, where a long-running workflow applies, by `ENG-010` Workflow per the approved Module PRD §6. Concrete state names are declarative and enforced at capture time by the platform rules surface; engine behavior is not redefined.
- **Numbering** — document numbers for AI Approval transactions issue through `ENG-017` in the AI Workspace numbering series registered in `SPR-MOD-018-001`; numbering algorithms are not redefined.
- **Audit** — every state change on an AI Approval is audited via `ENG-004` per `ADR-014`.
- **`AIApprovalGranted` / `AIApprovalDenied` publications** — emitted via `ENG-024` at approval resolution.

#### 1.1.2 Human-Approval-Gate Business Process Authority

The **human-approval-gate** business rule and its process realisation are authoritatively owned by MOD-018 AI Workspace in this sprint. This sprint establishes:

- **Rule surface** — Module PRD §7: "AI-initiated state changes must pass an approval gate unless explicitly whitelisted." Enforcement is delegated to `ENG-011` Approval; whitelisting is expressed declaratively via the `Approval policies` configuration key (see §1.1.4).
- **Process realisation** — the approval gate is applied to every AI-initiated state change routed through the Sprint 003 tool-call-with-approval process. Where an `Approval policies` entry deterministically whitelists a Tool Definition or a capability class, the gate is bypassed as a policy decision; the bypass itself is audited via `ENG-004`.
- **Read-only against Sprint 003.** This sprint does not re-author the Sprint 003 AI Tool Call transaction or the tool-call-with-approval process; it authors the rule and the policy surface those artifacts consume.

#### 1.1.3 Cost Governance Authority

MOD-018 AI Workspace authors the **Cost budgets** configuration key (Module PRD §10) in this sprint. This sprint establishes:

- **Configuration surface** — `Cost budgets` is a `ENG-005` Configuration key resolved in the tenant → company → context hierarchy declared by Module PRD §10.
- **Attribution** — every AI call attributes tenant, user, feature, and prompt-ID for cost accounting purposes as declared by the approved Module PRD and Sprint Plan allocations; attribution mechanics are delivered by `ENG-028` and are not redefined here.
- **Operational surfaces** — the **Cost per Surface** operational report renders via `ENG-021` and is surfaced via `ENG-022`; cross-module KPIs referenced from this report are consumed read-only from MOD-017.

#### 1.1.4 Approval Policies Configuration Authority

MOD-018 AI Workspace authors the **Approval policies** configuration key (Module PRD §10) in this sprint. This sprint establishes:

- **Configuration surface** — `Approval policies` is a `ENG-005` Configuration key resolved in the tenant → company → context hierarchy declared by Module PRD §10.
- **Business semantics** — the policy expresses which AI-initiated state changes require an approval gate and which are explicitly whitelisted, per Module PRD §7. Policy authoring, evaluation, and enforcement are governance-neutral and do not redefine `ENG-011` behavior.

#### 1.1.5 Safety Governance Authority

MOD-018 AI Workspace authors the **safety governance** authority in this sprint, derived from the approved Module PRD and Sprint Plan allocations (Module PRD §2 Capabilities: "Cost and safety governance"; Sprint Plan §Sprint 005 Boundaries). This sprint establishes:

- **Boundary declaration** — MOD-018 declares the governance boundary between AI-initiated actions and business controls; enforcement is delegated to `ENG-011` per the approval-gate rule authored in §1.1.2.
- **No provider-specific safety mechanics.** Provider-side safety mechanics are delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly and does not redefine provider behavior.

#### 1.1.6 Operational Reports Authority

MOD-018 AI Workspace authors the following **operational reports** (Module PRD §9) in this sprint. Reports render via `ENG-021` and are surfaced via `ENG-022`; exports are produced via `ENG-027` where applicable. Cross-module KPI definitions remain owned by MOD-017 and are consumed read-only.

- **AI Adoption** — operational adoption metrics per copilot surface, tenant, and company.
- **Tool-Call Success Rate** — operational success/failure attribution across Tool Definitions.
- **Cost per Surface** — operational cost attribution across copilot surfaces.
- **Approval Latency** — operational latency of the human-approval-gate process.

#### 1.1.7 `AIApprovalGranted` and `AIApprovalDenied` Event Publication Authority

MOD-018 AI Workspace authors the `AIApprovalGranted` and `AIApprovalDenied` event publications in this sprint. Events are emitted via `ENG-024` at approval resolution and are traced to their originating audit records in `ENG-004`. No new event contract is introduced beyond the Module PRD §8 declaration. `AIConversationStarted` remains allocated to `SPR-MOD-018-004`; `AIToolCallRequested` remains allocated to `SPR-MOD-018-003`.

#### 1.1.8 Governance ↔ Foundation, Retrieval, Tool Calling, Copilot Surfaces, Platform, Source Modules, Analytics, and Providers

- **`SPR-MOD-018-001` Foundation** is a reference-and-traceability dependency only. AI Approval transactions reuse the AI Workspace numbering series; no re-authoring of the Prompt / Prompt Version master, the review-and-publish process, the versioning-and-audit rule, the `Enabled surfaces per tenant` configuration, the numbering series registration, or the search-index baseline.
- **`SPR-MOD-018-002` Retrieval** is a reference-and-traceability dependency only. Governance does not re-author the Retrieval Corpus master, the build-and-refresh process, the retrieval-authorization-at-query-time rule, or the Retrieval refresh cadence configuration.
- **`SPR-MOD-018-003` Tool Calling** is a reference-and-traceability dependency only. Governance authors the approval-gate rule and the `Approval policies` configuration that the Sprint 003 tool-call-with-approval process consumes; it does not re-author the Tool Definition master, the AI Tool Call transaction, or the `AIToolCallRequested` publication.
- **`SPR-MOD-018-004` Copilot Surfaces & Conversations** is a reference-and-traceability dependency only. Governance authors reports over AI Conversation and prompt-to-response outputs; it does not re-author the AI Conversation transaction, the prompt-to-response process, or the `AIConversationStarted` publication.
- **MOD-001 Platform Administration** owns Identity, Authorization, Permission Management, and the tenant/company/branch hierarchy. MOD-018 consumes these read-only via `ENG-002`.
- **Source modules** (MOD-002 … MOD-017, MOD-019) own their master and transactional data and their published capability contracts. Governance-authored approval gates apply to AI-initiated state changes routed via the Sprint 003 tool-call-with-approval process; MOD-018 does not mutate source-module data directly.
- **MOD-017 Analytics** owns cross-module KPI definitions. MOD-018 operational reports reference MOD-017 KPIs read-only where applicable.
- **AI provider integration** is delivered exclusively through `ENG-028`; MOD-018 does not import provider SDKs directly.

Ownership boundaries are not re-defined by this sprint; MOD-018 has no further sprints after this one.

### 1.2 In Scope

- **AI Approval transaction** — initiation, authorization as the invoking user via `ENG-002`, approval workflow via `ENG-011`, resolution states, numbering via `ENG-017`, and audit via `ENG-004`.
- **AI-initiated-state-change-requires-approval business rule** — the rule surface declared in Module PRD §7; enforcement delegated to `ENG-011`.
- **Approval policies configuration authoring** — the `Approval policies` `ENG-005` configuration key resolved in the tenant → company → context hierarchy.
- **Cost budgets configuration authoring** — the `Cost budgets` `ENG-005` configuration key resolved in the tenant → company → context hierarchy.
- **Safety governance authority** — derived from the approved Module PRD and Sprint Plan allocations (§1.1.5); no provider SDK imported.
- **Operational reports** — AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency rendered via `ENG-021` and surfaced via `ENG-022`; exports via `ENG-027` where applicable.
- **`AIApprovalGranted` and `AIApprovalDenied` event publications** — emitted via `ENG-024` at approval resolution.
- **Notifications (optional)** — approval lifecycle notifications delivered via `ENG-025` where configured.
- **Structural validation** — declarative validation of AI Approval transactions and Approval policies / Cost budgets configuration values at capture time via the platform rules surface.

### 1.3 Out of Scope

- Prompt / Prompt Version master, Prompt review-and-publish process, versioning-and-audit rule, `Enabled surfaces per tenant` configuration authoring, AI Workspace numbering series registration, module-wide search-index baseline — allocated to `SPR-MOD-018-001`.
- Retrieval Corpus master, retrieval build-and-refresh process, retrieval-authorization-at-query-time rule, Retrieval refresh cadence configuration — allocated to `SPR-MOD-018-002`.
- Tool Definition master, AI Tool Call transaction, tool-call-with-approval business process, `AIToolCallRequested` publication — allocated to `SPR-MOD-018-003`.
- AI Conversation transaction, prompt-to-response business process, `AIConversationStarted` publication, per-tenant copilot-surface enablement consumption — allocated to `SPR-MOD-018-004`.
- Identity, authentication, permissions — owned by MOD-001 via `ENG-001`, `ENG-002`, `ENG-003`.
- Cross-module KPI definitions — owned by MOD-017 Analytics.
- AI provider integration mechanics; provider mechanics are delivered exclusively through `ENG-028`.
- Source-module capability contracts and source-module master/transactional data — owned by the source module.
- Any redefinition of ERP Core Engine behavior.
- Physical schema, code, routes, migrations, and UI.

---

## 2. Sprint Deliverables

| # | Deliverable | Kind | Notes |
| --- | --- | --- | --- |
| 1 | AI Approval transaction authority | Transaction | Business lifecycle; authorized as invoking user via `ENG-002`; executed via `ENG-011`; numbered via `ENG-017`; audited via `ENG-004`. |
| 2 | AI-initiated-state-change-requires-approval business rule | Rule | Module PRD §7 rule surface; enforcement delegated to `ENG-011`; whitelist expressed via `Approval policies`. |
| 3 | Approval policies configuration authoring | Configuration | `ENG-005` key; tenant → company → context hierarchy. |
| 4 | Cost budgets configuration authoring | Configuration | `ENG-005` key; tenant → company → context hierarchy; attribution declared per Module PRD. |
| 5 | Safety governance authority | Governance surface | Derived from the approved Module PRD and Sprint Plan allocations; enforcement delegated to `ENG-011`. |
| 6 | AI Adoption report | Report | Rendered via `ENG-021`; surfaced via `ENG-022`; exports via `ENG-027` where applicable. |
| 7 | Tool-Call Success Rate report | Report | Rendered via `ENG-021`; surfaced via `ENG-022`. |
| 8 | Cost per Surface report | Report | Rendered via `ENG-021`; surfaced via `ENG-022`. |
| 9 | Approval Latency report | Report | Rendered via `ENG-021`; surfaced via `ENG-022`. |
| 10 | `AIApprovalGranted` event publication | Event | Emitted via `ENG-024` at approval resolution. |
| 11 | `AIApprovalDenied` event publication | Event | Emitted via `ENG-024` at approval resolution. |
| 12 | Structural validation | Rule surface | Declarative validation of AI Approval transactions and Approval policies / Cost budgets at capture time. |
| 13 | Numbering integration | Integration | AI Approval document numbers issue through `ENG-017` using the AI Workspace numbering series from Sprint 001. |
| 14 | Ownership boundaries recapitulation | Documentation | §1.1.8 — no reassignment. |

---

## 3. Traceability to Module PRD and Sprint Plan

Bidirectional traceability from the [MOD-018 AI Workspace Module PRD](../../../20-module-prds/ai/MODULE_PRD.md) and the approved [MOD-018 Sprint Plan](../MOD-018_SPRINT_PLAN.md) to this Sprint PRD.

### 3.1 Forward Map — Module PRD → Sprint 005

| Module PRD Item | Module PRD § | Sprint Plan Allocation | Realized In This Sprint PRD |
| --- | --- | --- | --- |
| Human-approval gates for AI-initiated actions (capability) | §2 Capabilities | SPR-MOD-018-005 (origin) | §1, §2, §4 |
| Cost and safety governance (capability) | §2 Capabilities | SPR-MOD-018-005 (origin) | §1, §2, §4 |
| Submodule: Governance | §2 Submodules | SPR-MOD-018-005 (origin) | §1, §2 |
| AI Approval (transaction) | §6 Transactions | SPR-MOD-018-005 (origin) | §4.3 |
| AI-initiated-state-change-requires-approval rule | §7 Business Rules | SPR-MOD-018-005 (origin) | §5 Rule 1 |
| `AIApprovalGranted` (event published) | §8 Integration Points | SPR-MOD-018-005 (origin) | §6.1 |
| `AIApprovalDenied` (event published) | §8 Integration Points | SPR-MOD-018-005 (origin) | §6.1 |
| AI Adoption report | §9 Reports & Analytics | SPR-MOD-018-005 (origin) | §2 #6 |
| Tool-Call Success Rate report | §9 Reports & Analytics | SPR-MOD-018-005 (origin) | §2 #7 |
| Cost per Surface report | §9 Reports & Analytics | SPR-MOD-018-005 (origin) | §2 #8 |
| Approval Latency report | §9 Reports & Analytics | SPR-MOD-018-005 (origin) | §2 #9 |
| `Cost budgets` configuration | §10 Configuration | SPR-MOD-018-005 (origin) | §4.4 |
| `Approval policies` configuration | §10 Configuration | SPR-MOD-018-005 (origin) | §4.4 |
| Numbering via `ENG-017` for AI Approval | §6 Transactions — Numbering | SPR-MOD-018-005 (origin) | §7 Integrations |
| Optional `ENG-025` Notification | §12 ERP Core Engine Consumption | SPR-MOD-018-005 (optional) | §7 Integrations |

### 3.2 Reverse Map — Sprint 005 → Module PRD / Sprint Plan

| Sprint 005 Item | Traces To Module PRD | Traces To Sprint Plan |
| --- | --- | --- |
| AI Approval Transaction Authority | §2 Capabilities; §6 Transactions | §2 SPR-MOD-018-005 Objective |
| Human-approval-gate business rule | §7 Business Rules | §2 SPR-MOD-018-005 Boundaries |
| Approval policies configuration | §10 Configuration | §2 SPR-MOD-018-005 Boundaries; Exit Criteria |
| Cost budgets configuration | §10 Configuration | §2 SPR-MOD-018-005 Boundaries; Exit Criteria |
| Safety governance authority | §2 Capabilities (Cost and safety governance) | §2 SPR-MOD-018-005 Boundaries |
| Operational reports (AI Adoption; Tool-Call Success Rate; Cost per Surface; Approval Latency) | §9 Reports & Analytics | §2 SPR-MOD-018-005 Boundaries; Exit Criteria |
| `AIApprovalGranted` / `AIApprovalDenied` publications | §8 Integration Points | §2 SPR-MOD-018-005 Exit Criteria |
| Numbering via `ENG-017`; audit via `ENG-004` | §6 Transactions | §2 SPR-MOD-018-005 Exit Criteria |
| Read-only consumption of upstream sprint authorities | §5 Master Data; §6 Transactions; §13 Dependencies | §2 SPR-MOD-018-005 Boundaries |

### 3.3 Bidirectional Completeness

Every deliverable in §2 traces to at least one Module PRD section and to the approved Sprint Plan's SPR-MOD-018-005 allocation. Every Module PRD item allocated to SPR-MOD-018-005 by the approved Sprint Plan is realized by exactly one deliverable in §2. No orphan requirement. No scope expansion. No re-authoring of Sprint 001, 002, 003, or 004 authorities. AI Workspace remains read-model-only against source-module transactional truth; approval gates apply to AI-initiated state changes routed via the Sprint 003 tool-call-with-approval process.

---

## 4. Data Model Impact

### 4.1 Master Data

**None in this sprint.** All AI Workspace master data (Prompt, Prompt Version, Retrieval Corpus, Tool Definition) is authored in Sprints 001–003 and consumed read-only here.

### 4.2 Business Processes

**Human-approval-gate realisation (MOD-018 authority).**

- **Trigger.** An AI-initiated state change is routed through the Sprint 003 tool-call-with-approval process.
- **Steps (business level).**
  1. Resolve the applicable `Approval policies` configuration via `ENG-005` in the tenant → company → context hierarchy.
  2. Where the policy whitelists the requested Tool Definition or capability class deterministically, bypass the approval gate as a policy decision; the bypass is audited via `ENG-004`.
  3. Otherwise, initiate an AI Approval transaction; authorize the caller via `ENG-002` per `ADR-032`; execute the approval workflow via `ENG-011`.
  4. On resolution, emit `AIApprovalGranted` or `AIApprovalDenied` via `ENG-024`; write audit records via `ENG-004` for every state change per `ADR-014`.
  5. Where notifications are configured, dispatch via `ENG-025`.
  6. Issue the AI Approval document number through `ENG-017` using the AI Workspace numbering series from Sprint 001.
- **Non-mutation invariant.** MOD-018 never writes directly to a source-module master or transaction; source-module state changes occur only via the Sprint 003 tool-call-with-approval process under the invoking user's authorization once the approval gate resolves `Granted`.

### 4.3 Transactions

**AI Approval (business transaction — MOD-018 authority).**

- **Purpose.** Represents a single human-approval decision on an AI-initiated state change routed via the Sprint 003 tool-call-with-approval process.
- **Lifecycle (business level).** Governed by `ENG-011` Approval per `ADR-032`, and by `ENG-010` Workflow where a long-running workflow applies, per the approved Module PRD §6. Concrete state names are declarative and enforced at capture time by the platform rules surface; engine behavior is not redefined.
- **Numbering.** Document numbers issue through `ENG-017` using the AI Workspace numbering series registered in `SPR-MOD-018-001`.
- **Audit.** Every state change is audited via `ENG-004` per `ADR-014`.
- **Posting.** Not applicable — AI Approval is not a ledger transaction; where an approved AI Tool Call causes source-module ledger effects, those effects are produced by that source module's own posting capability under `ENG-016`.

### 4.4 Configuration Keys (registered under `ENG-005`)

| Key | Scope | Resolution | Purpose |
| --- | --- | --- | --- |
| `Approval policies` | Tenant → Company → Context | `ENG-005` | Expresses which AI-initiated state changes require an approval gate and which are explicitly whitelisted, per Module PRD §7. |
| `Cost budgets` | Tenant → Company → Context | `ENG-005` | Expresses per-tenant AI cost budgets and attribution rules, per Module PRD §10. |

The `Enabled surfaces per tenant` configuration key is authored in `SPR-MOD-018-001` and is consumed read-only where applicable. The `Retrieval refresh cadence` configuration key is authored in `SPR-MOD-018-002` and is consumed read-only where applicable.

---

## 5. Business Rules

Module- and sprint-specific business rules only. This section MUST NOT redefine security, audit, workflow, numbering, authorization, permissions, notifications, search, or AI. Those belong to ERP Core Engines and their ADRs.

1. **AI-initiated state changes must pass an approval gate unless explicitly whitelisted.** (Restated verbatim from Module PRD §7.) Enforcement is delegated to `ENG-011` Approval; whitelisting is expressed declaratively via the `Approval policies` configuration key resolved via `ENG-005`.
2. **Approval-policy hierarchy.** `Approval policies` shall resolve in the tenant → company → context hierarchy declared by Module PRD §10; policy resolution shall be deterministic for a given caller, tenant, company, context, and requested Tool Definition or capability class.
3. **Cost-budget hierarchy.** `Cost budgets` shall resolve in the tenant → company → context hierarchy declared by Module PRD §10; per-call attribution shall include tenant, user, feature, and prompt-ID as declared by the approved Module PRD and Sprint Plan allocations.
4. **Read-model-only against source modules.** No Sprint 005 operation shall mutate a source-module master or transaction directly. Where an approved AI Approval releases an AI-initiated state change, that state change shall be executed by the source module's own authorized capability under the invoking user's authorization via the Sprint 003 tool-call-with-approval process.
5. **Provider integration exclusively via `ENG-028`.** No Sprint 005 authority shall bypass the `ENG-028` AI Copilot Engine surface; MOD-018 shall not import provider SDKs directly. (Restated from prior sprints; no redefinition.)
6. **Authorization-as-invoking-user at approval time.** At AI Approval initiation and resolution, the caller's module-level authorization shall be enforced per `ADR-032` (RBAC + ABAC) and `ADR-011` (Multi-Tenant Isolation).
7. **Auditability.** Every state change on an AI Approval transaction, every `AIApprovalGranted` / `AIApprovalDenied` publication, every `Approval policies` and `Cost budgets` configuration change, and every policy-whitelisted bypass shall be auditable via `ENG-004` per `ADR-014`.
8. **Report determinism.** For a given tenant, company, context, and reporting window, the operational reports authored here (AI Adoption; Tool-Call Success Rate; Cost per Surface; Approval Latency) shall render deterministically via `ENG-021`; cross-module KPIs referenced from these reports are consumed read-only from MOD-017.
9. **Configuration validation at capture time.** `Approval policies` and `Cost budgets` values, and AI Approval transactions, shall be validated declaratively at capture time via the platform rules surface.
10. **No re-authoring of upstream authorities.** Sprint 005 shall not re-author Prompt / Prompt Version, Retrieval Corpus, Tool Definition, AI Tool Call, AI Conversation, tool-call-with-approval process, prompt-to-response process, or any Sprint 001–004 configuration or event; consumption is read-only.

---

## 6. Events

### 6.1 Events Published (Sprint 005 governance events)

| Event | Emitted On | Purpose |
| --- | --- | --- |
| `AIApprovalGranted` | An AI Approval transaction resolves in the `Granted` outcome | Signals to downstream consumers and to audit that the approval gate has released an AI-initiated state change. |
| `AIApprovalDenied` | An AI Approval transaction resolves in the `Denied` outcome | Signals to downstream consumers and to audit that the approval gate has blocked an AI-initiated state change. |

Events are emitted via `ENG-024` and traced to their originating audit record in `ENG-004`. `AIConversationStarted` remains allocated to `SPR-MOD-018-004`; `AIToolCallRequested` remains allocated to `SPR-MOD-018-003`.

### 6.2 Events Consumed

The human-approval-gate realisation consumes `AIToolCallRequested` (Sprint 003) as its trigger input, strictly read-only. Source-module domain events remain consumable strictly read-only per Module PRD §8 ("All module domain events (as retrieval or trigger inputs)"). This sprint introduces no new event contract on the consumption side.

---

## 7. Integrations

MOD-018 AI Workspace **consumes** the following platform services in this sprint. None are redefined; ownership remains with the engine owner.

| Engine | Role in Sprint 005 |
| --- | --- |
| `ENG-002` Authorization | Enforce the invoking user's module-level authorization at AI Approval initiation and resolution, per `ADR-032`. |
| `ENG-004` Audit | Persist audit records for every AI Approval state change, every `Approval policies` / `Cost budgets` configuration change, and every policy-whitelisted bypass per `ADR-014`. |
| `ENG-005` Configuration | Resolve `Approval policies` and `Cost budgets` in the tenant → company → context hierarchy. Behavior not redefined. |
| `ENG-011` Approval | Execute the AI Approval workflow; enforce the AI-initiated-state-change approval-gate rule. Behavior not redefined. |
| `ENG-017` Numbering | Issue AI Approval document numbers using the AI Workspace numbering series registered in Sprint 001. |
| `ENG-021` Reporting | Render the AI Adoption, Tool-Call Success Rate, Cost per Surface, and Approval Latency operational reports. |
| `ENG-022` Dashboard | Surface the operational reports authored here. |
| `ENG-024` Event | Publish `AIApprovalGranted` and `AIApprovalDenied`; consume `AIToolCallRequested` (Sprint 003) and source-module domain events strictly read-only. |
| `ENG-025` Notification (optional) | Dispatch approval-lifecycle notifications where configured. Behavior not redefined. |

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
- **Copilot Surfaces Sprint PRD** — [`SPR-MOD-018-004`](./SPR-MOD-018-004_COPILOT_SURFACES_AND_CONVERSATIONS.md) — Draft (reference / traceability dependency only; no re-authoring).
- **Prior repository audit** — `REPOSITORY_AUDIT_20260718T030000Z` — Repository READY.

### 8.2 Engine and ADR Dependencies

- **Engines required (Sprint 005):** `ENG-002`, `ENG-004`, `ENG-005`, `ENG-011`, `ENG-017`, `ENG-021`, `ENG-022`, `ENG-024`.
- **Engines optional (Sprint 005):** `ENG-025` Notification.
- **ADRs consumed:** `ADR-011` Multi-Tenant Isolation, `ADR-014` Audit Strategy, `ADR-032` RBAC + ABAC.

### 8.3 Sprint Dependencies

- **Upstream sprint dependencies.** `SPR-MOD-018-001`, `SPR-MOD-018-002`, `SPR-MOD-018-003`, and `SPR-MOD-018-004` (reference / traceability only; no re-authoring).
- **Downstream sprints.** None — this is the final MOD-018 sprint.

---

## 9. Acceptance Criteria

Each acceptance criterion binds to one or more functional requirements from §2 / §4 or one business rule from §5. Numbering is stable within this document.

1. **AC-001 — AI Approval initiation.** An authorized caller initiates an AI Approval transaction against an AI-initiated state change routed via the Sprint 003 tool-call-with-approval process; authorization is enforced as the invoking user via `ENG-002` per `ADR-032`; a document number is issued via `ENG-017` using the AI Workspace numbering series; an `ENG-004` audit record is written. (Deliverables 1, 13; Rules 6, 7.)
2. **AC-002 — Approval-gate rule enforcement.** Every AI-initiated state change routed via the Sprint 003 tool-call-with-approval process requires an AI Approval unless explicitly whitelisted by the resolved `Approval policies` configuration; whitelist bypasses are audited via `ENG-004`. (Deliverables 2, 3; Rules 1, 2, 7.)
3. **AC-003 — Approval-policy resolution.** `Approval policies` resolves deterministically via `ENG-005` in the tenant → company → context hierarchy declared by Module PRD §10. (Deliverable 3; Rule 2.)
4. **AC-004 — Cost-budget resolution.** `Cost budgets` resolves deterministically via `ENG-005` in the tenant → company → context hierarchy declared by Module PRD §10; per-call attribution includes tenant, user, feature, and prompt-ID. (Deliverable 4; Rule 3.)
5. **AC-005 — Safety governance boundary.** The safety governance authority is declared as a boundary between AI-initiated actions and business controls; enforcement is delegated to `ENG-011`; no provider SDK is imported by MOD-018. (Deliverable 5; Rule 5.)
6. **AC-006 — AI Adoption report.** The AI Adoption operational report renders via `ENG-021` and is surfaced via `ENG-022`. (Deliverable 6; Rule 8.)
7. **AC-007 — Tool-Call Success Rate report.** The Tool-Call Success Rate operational report renders via `ENG-021` and is surfaced via `ENG-022`. (Deliverable 7; Rule 8.)
8. **AC-008 — Cost per Surface report.** The Cost per Surface operational report renders via `ENG-021` and is surfaced via `ENG-022`. (Deliverable 8; Rule 8.)
9. **AC-009 — Approval Latency report.** The Approval Latency operational report renders via `ENG-021` and is surfaced via `ENG-022`. (Deliverable 9; Rule 8.)
10. **AC-010 — `AIApprovalGranted` publication.** `AIApprovalGranted` is emitted via `ENG-024` at approval resolution in the `Granted` outcome and is traced to its originating audit record in `ENG-004`. (Deliverable 10; Rule 7.)
11. **AC-011 — `AIApprovalDenied` publication.** `AIApprovalDenied` is emitted via `ENG-024` at approval resolution in the `Denied` outcome and is traced to its originating audit record in `ENG-004`. (Deliverable 11; Rule 7.)
12. **AC-012 — Read-model-only against source modules.** No Sprint 005 operation writes to a source module's master or transactional data directly; where an approved AI Approval releases a state change, that state change is executed via the Sprint 003 tool-call-with-approval process under the invoking user's authorization. (Deliverables 1, 2; Rule 4.)
13. **AC-013 — Structural validation.** AI Approval transactions and `Approval policies` / `Cost budgets` configuration values are validated declaratively at capture time; invalid inputs are rejected before persistence. (Deliverable 12; Rule 9.)
14. **AC-014 — Numbering.** AI Approval document numbers issue through `ENG-017` using the AI Workspace numbering series registered in Sprint 001; numbering algorithms are not redefined. (Deliverable 13.)
15. **AC-015 — Ownership boundaries preserved.** No MOD-001 / MOD-017 / source-module authority is redefined; MOD-018 claims no engine ownership; no provider SDK is imported; Sprint 001–004 authorities are not re-authored. (Deliverable 14; Rule 10.)

---

## 10. Ownership Boundaries

Recapitulated from §1.1.8 (not evolved):

- **MOD-018 AI Workspace** owns the AI Approval transaction, the AI-initiated-state-change-requires-approval rule, the `Approval policies` and `Cost budgets` configuration keys, the safety governance authority, the AI Adoption / Tool-Call Success Rate / Cost per Surface / Approval Latency operational reports, and the `AIApprovalGranted` / `AIApprovalDenied` event publications (this sprint). Sprint 001–004 authorities remain as authored and are not re-authored here.
- **Source modules** continue to own all transactional and master data and all published capability contracts; MOD-018 effects source-module state changes exclusively through the Sprint 003 tool-call-with-approval process under the invoking user's authorization, subject to the approval-gate rule authored here.
- **MOD-001 Platform Administration** retains ownership of Identity (`ENG-001`), Authorization (`ENG-002`), and Permission Management (`ENG-003`).
- **MOD-017 Analytics** retains ownership of cross-module KPI definitions; MOD-018 operational reports reference MOD-017 KPIs read-only where applicable.
- **Platform engines** retain ownership of Approval (`ENG-011`), Configuration (`ENG-005`), Audit (`ENG-004`), Numbering (`ENG-017`), Reporting (`ENG-021`), Dashboard (`ENG-022`), Event infrastructure (`ENG-024`), Notification (`ENG-025`), and AI Copilot (`ENG-028`).

**No ownership reassignment. No provider SDK imported.**

---

## 11. Non-Goals

- No Sprint 001–004 authority is re-authored.
- No cross-module KPI definitions authored (owned by MOD-017 Analytics).
- No AI provider integration mechanics; provider mechanics are delivered exclusively through `ENG-028`.
- No modification of source-module master or transactional data by MOD-018.
- No redefinition of any ERP Core Engine or ADR.
- No Module PRD modification. No Sprint Plan modification.
- No implementation activity (schema, code, routes, migrations, UI).
- No governance evolution. No GT template evolution. No Wrapper evolution.
- No GT-004 Module Baseline or GT-005 Module Publication activity.

---

## 12. Sprint Exit Criteria (verbatim from Sprint Plan §2 SPR-MOD-018-005)

- AI Approval transactions execute via `ENG-011`; the approval gate is applied to every AI-initiated state change except those explicitly whitelisted via approval policy.
- `Cost budgets` and `Approval policies` are resolvable via `ENG-005` in the tenant → company → context hierarchy.
- `AIApprovalGranted` and `AIApprovalDenied` events publish via `ENG-024`; notifications, where configured, dispatch via `ENG-025`.
- AI Adoption, Tool-Call Success Rate, Cost per Surface, and Approval Latency reports render via `ENG-021`; dashboard surfacing uses `ENG-022`. Cross-module KPIs referenced from these reports are consumed read-only from MOD-017.
- Document numbers for AI Approval transactions issue through `ENG-017`; all state changes are audited via `ENG-004` per `ADR-014`.

---

## 13. Validations

Sprint 005 authoring binds dynamically to the released GT-003 v1.0 validation model. Validation identifiers and counts are resolved at execution time against the released GT-003 lifecycle; no validation identifier or count is hard-coded in this Sprint PRD. Validation outcomes are recorded in the accompanying Repository Audit report emitted for this pass.

---

## 14. References

- [MOD-018 AI Workspace — Module PRD](../../../20-module-prds/ai/MODULE_PRD.md)
- [MOD-018 Sprint Plan (Stage 1 — GT-002)](../MOD-018_SPRINT_PLAN.md)
- [SPR-MOD-018-001 — Prompt Library & AI Workspace Foundation](./SPR-MOD-018-001_PROMPT_LIBRARY_AND_AI_WORKSPACE_FOUNDATION.md)
- [SPR-MOD-018-002 — Retrieval Workspaces (RAG)](./SPR-MOD-018-002_RETRIEVAL_WORKSPACES_RAG.md)
- [SPR-MOD-018-003 — Tool Calling on Module Capabilities](./SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md)
- [SPR-MOD-018-004 — Copilot Surfaces & Conversations](./SPR-MOD-018-004_COPILOT_SURFACES_AND_CONVERSATIONS.md)
- [ERP Core Engine Catalog](../../../10-erp-core/ENGINE_CATALOG.md)
- [ADR Index](../../../11-adrs/ADR_INDEX.md)
- [Governance Framework Release v1.0](../../../15-governance/GOVERNANCE_FRAMEWORK_RELEASE_v1.0.md)
- [GT-003 Sprint Authoring Template v1.0](../../../15-governance/templates/GT-003_SPRINT_AUTHORING.md)
- [Repository Audit — 2026-07-18T03:00:00Z](../../../50-audit-reports/REPOSITORY_AUDIT_20260718T030000Z.md)
