---
title: "WEB-018 — AI Workspace Web Solution Design Specification"
summary: "Phase 3 Web Solution Design specification for MOD-018 AI Workspace. Derived exclusively from the AI Workspace Module Publication. Defines Web-surface personas, journeys, navigation, screen inventory, forms, workspace collaboration, AI interaction experience, accessibility, and user-facing security expectations. Introduces no new business requirements."
spec_id: "WEB-018"
family: "WEB"
source_module: "MOD-018"
source_module_name: "AI Workspace"
source_publication: "MOD-018_MODULE_PUBLICATION"
source_baseline: "MOD018_AI_WORKSPACE_BASELINE_v1"
source_module_prd: "docs/20-module-prds/ai/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-018-001", "SPR-MOD-018-002", "SPR-MOD-018-003", "SPR-MOD-018-004", "SPR-MOD-018-005"]
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "AI Platform"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "web", "phase-3", "WEB-018", "MOD-018", "ai-workspace", "SD-005"]
document_type: "Web Solution Design Specification"
template: "SD-005"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-011", "ENG-013", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081"]
---

# WEB-018 — AI Workspace Web Solution Design Specification

> **Reference derivation only.** WEB-018 is a Web-surface projection of the AI Workspace Module Publication [`MOD-018_MODULE_PUBLICATION`](../../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and WEB-018 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Web-surface user experience through which authorized business users consume the AI Workspace capabilities published in `MOD-018_MODULE_PUBLICATION` — copilot surfaces, retrieval workspaces, tool-calling on module capabilities, the prompt library, and human-approval / cost / safety governance — over source-module read models, with source-module state changes occurring exclusively through the tool-call-with-approval process.

### A.2 Scope

Web (desktop, tablet, mobile-browser responsive) surface covering:

- Prompt Library authoring, review-and-publish, and version browsing.
- Retrieval Workspace (RAG) corpus registration, build/refresh, and query-time authorization surfaces.
- Tool Definition management and Tool Call transaction lifecycle surfaces.
- Copilot Surfaces and AI Conversation transaction lifecycle.
- Governance surfaces for AI Approval transactions, Approval Policies, Cost Budgets, Safety Governance, and operational reports (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency).

Out of scope for WEB-018: Mobile-native surfaces (belongs to MOB-018), API contracts (belongs to API-018), UI mockups, framework decisions, and any business-rule authoring.

### A.3 Source Published Module

- **Module ID / Name:** MOD-018 AI Workspace
- **Publication:** [`MOD-018_MODULE_PUBLICATION`](../../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD018_AI_WORKSPACE_BASELINE_v1`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-018-001` … `SPR-MOD-018-005`

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-018 v1.0

### A.5 Traceability References

See §K for the complete feature-to-capability-to-sprint traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → WEB-018).

## B. Web Personas

Personas are inherited from the Module PRD §3 and Sprint PRD family; WEB-018 introduces no new roles. Concrete grants remain enforced by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC).

### B.1 Business User (all modules)

- **Responsibilities:** Consume copilot surfaces embedded in source modules; submit prompts; review AI responses; initiate tool-call requests subject to approval; consult retrieval workspaces within scope.
- **Permissions (business-level):** Read access to enabled copilot surfaces within their tenant / company / row-level scope; ability to originate AI Conversations and request AI Tool Calls; may act as approver only where the Approval Policy permits.
- **Primary Web Scenarios:** Open Copilot Surface, Submit Prompt, Review Response, Request Tool Execution, Consult Retrieved Context, Await Approval Outcome.

### B.2 AI Steward

- **Responsibilities:** Curate the Prompt Library and Retrieval Workspaces; register and lifecycle-manage Tool Definitions; classify and publish Prompts and Prompt Versions; oversee Approval Policies, Cost Budgets, and Safety Governance.
- **Permissions (business-level):** Draft / edit / submit-for-approval rights on Prompt, Prompt Version, Retrieval Corpus, and Tool Definition master data within scope; author Approval Policy, Cost Budget, and Safety Governance configuration entries within scope.
- **Primary Web Scenarios:** Author Prompt, Submit Prompt Version for Publication, Register Retrieval Corpus, Schedule Corpus Refresh, Register Tool Definition, Configure Approval Policy, Set Cost Budget, Review Safety Governance.

### B.3 Auditor

- **Responsibilities:** Verify audit-visible history for AI Workspace: Prompt / Prompt Version publication history, Tool Definition lifecycle history, Retrieval Corpus refresh history, AI Conversation history, AI Tool Call history, AI Approval history.
- **Permissions (business-level):** Read-only access to AI Workspace audit-visible surfaces within scope per `ADR-014`; no mutation rights.
- **Primary Web Scenarios:** Inspect Prompt Version History, Review Conversation History, Review Tool-Call and Approval History, Review Retrieval Refresh History.

### B.4 Security Officer

- **Responsibilities:** Verify enforcement of retrieval-authorization-at-query-time; verify the AI-initiated approval-gate rule; verify tenant isolation and sensitive-data handling within AI Workspace surfaces.
- **Permissions (business-level):** Read-only oversight over authorization decisions, Approval Policies, and Safety Governance configuration within scope; no mutation of AI Workspace master data or transactions.
- **Primary Web Scenarios:** Review Approval Policies, Inspect Denied Tool Calls, Review Safety Governance Configuration, Verify Sensitive-Data Redaction.

## C. Web User Journeys

Every journey is derived from a capability in the Module Publication §3 and a transaction lifecycle in Publication §8. WEB-018 defines Web-surface flows only; business rules, state legality, and authorization are owned by the Module Publication and enforced by platform engines.

### C.1 Journey — Open a Copilot Surface and Submit a Prompt

- **Entry Points:** Global AI Workspace area entry; embedded copilot entry from a source-module surface where `Enabled surfaces` is configured for the tenant.
- **Primary Flow:** User opens Copilot Surface → workspace context (tenant / company / active source-module surface) resolves → user composes and submits a prompt → AI Conversation transaction opens → provider integration proceeds exclusively via `ENG-028` → response renders with grounded references to Retrieved Context and any suggested Tool Call → `AIConversationStarted` emits via `ENG-024`.
- **Alternate Flows:** Resume an existing AI Conversation from Conversation History; open a shared conversation link within tenant scope; switch active source-module surface where the copilot supports it.
- **Interruption / Resume:** Conversation state persists per AI Conversation transaction; a user returning to an open conversation resumes context without re-submitting prior prompts.
- **Exception Flows:** Copilot surface not enabled for tenant → access-denied state; permission denied on referenced source-module read model → response omits the restricted grounding; provider unavailable → conversation reflects failure state without mutating source-module transactions.

### C.2 Journey — Request a Tool Call with Approval

- **Entry Points:** Response surface within an AI Conversation offering a Tool Call suggestion; direct action on a registered Tool Definition where permitted.
- **Primary Flow:** User confirms the Tool Call intent → AI Tool Call transaction opens → `AIToolCallRequested` emits via `ENG-024` → tool-call-with-approval process routes via `ENG-011` per the Approval Policy → approver acts → on `Granted` the source-module capability contract is invoked under the invoking user's authorization; on `Denied` no source-module state changes.
- **Alternate Flows:** Whitelisted Tool Definitions bypass the approval gate per configured policy; multi-step approval where the policy requires it; approver delegates via `ENG-011`.
- **Interruption / Resume:** The AI Tool Call transaction persists across sessions; approvers act asynchronously; the originating user is notified via `ENG-025` when approval resolves.
- **Exception Flows:** Approval rejected → state reflects `Denied`; approval times out per policy → policy-defined outcome recorded; source-module invocation rejected under the invoker's authorization → tool call reflects failure state without partial mutation.

### C.3 Journey — Author, Version, and Publish a Prompt

- **Entry Points:** Prompt Library → New Prompt; edit action on an existing Draft Prompt.
- **Primary Flow:** AI Steward captures Prompt Master fields → produces a Prompt Version (immutable once submitted) → submits for approval via the review-and-publish process → approver acts → activation exposes the Prompt Version to Copilot Surfaces; publication signals emit via `ENG-024`.
- **Alternate Flows:** Save Draft without submission; withdraw submission; deactivate an Active Prompt (`Active → Inactive`); archive (`Inactive → Archived`). A new Prompt Version supersedes without mutating prior versions.
- **Interruption / Resume:** Draft state persists per author within scope; submitted versions remain immutable regardless of session lifetime.
- **Exception Flows:** Validation failure at capture; approval rejected → returns to Draft with reviewer notes; attempted mutation of an already-submitted Prompt Version → rejected by the immutability rule.

### C.4 Journey — Register and Refresh a Retrieval Corpus

- **Entry Points:** Retrieval Workspaces → Retrieval Corpora → New Corpus; scheduled or on-demand refresh action.
- **Primary Flow:** AI Steward registers Retrieval Corpus master fields → binds source-module read models → sets `Retrieval refresh cadence` → the retrieval build-and-refresh process runs (scheduled via `ENG-013` where automated) → freshness indicator updates → retrieval-authorization-at-query-time rule applies to all subsequent queries.
- **Alternate Flows:** Manual refresh; deactivate or archive a corpus; adjust cadence at scope; observe read-only ingestion health.
- **Interruption / Resume:** Refresh operations are asynchronous; users see progress and last-refreshed indicators without blocking authoring.
- **Exception Flows:** Read-model authorization denied → the affected content is excluded from the corpus for the querying user; refresh failure → surface reflects failure state without silently returning stale data; retention conflict with cadence → validation feedback surfaced.

### C.5 Journey — Register and Lifecycle-Manage a Tool Definition

- **Entry Points:** Tool Calling → Tool Definitions → New Tool Definition; edit action on an existing Draft Tool Definition.
- **Primary Flow:** AI Steward captures Tool Definition master fields (business-level: bound source-module capability, business purpose, invocation constraints, approval-gate expectation, safety classification) → submits for approval where policy requires → activation exposes the Tool Definition to Copilot Surfaces.
- **Alternate Flows:** Whitelist a Tool Definition for approval-gate bypass per policy; deactivate; archive; version the definition through subsequent Draft → Active cycles.
- **Interruption / Resume:** Draft state persists; Active versioning changes never mutate historical AI Tool Call transactions.
- **Exception Flows:** Approval rejected → returns to Draft; attempted binding to a source-module capability outside authorization scope → rejected; safety classification conflict → validation feedback surfaced.

### C.6 Journey — Review AI Conversation History and Shared Artifacts

- **Entry Points:** AI Workspace → Conversations; shared conversation link within tenant scope.
- **Primary Flow:** User opens Conversation History → filters by tenant / company / source-module surface / participant / time range → opens an AI Conversation → reviews turns, grounded references, and any Tool Call outcomes.
- **Alternate Flows:** Share an AI Conversation within tenant scope; open referenced Prompt Version, Retrieval Corpus, or Tool Definition in read-only mode.
- **Interruption / Resume:** History is durable per audit visibility rules per `ADR-014`.
- **Exception Flows:** Access denied where policy prohibits; artifacts outside retention are surfaced as archived.

### C.7 Journey — Approve or Deny an AI-Initiated Action

- **Entry Points:** Approver inbox surface; direct link from a notification via `ENG-025`; Governance → Approvals.
- **Primary Flow:** Approver reviews the pending AI Approval transaction → inspects requested Tool Definition, invocation context, retrieved grounding, and requester identity → acts `Granted` or `Denied` → decision emits `AIApprovalGranted` or `AIApprovalDenied` via `ENG-024`; audit visibility applies per `ADR-014`.
- **Alternate Flows:** Escalate per policy; delegate to another authorized approver via `ENG-011`; add reviewer notes.
- **Interruption / Resume:** The AI Approval transaction persists across sessions until resolved or timed out per policy.
- **Exception Flows:** Approver lacks scope → action rejected; policy timeout → policy-defined outcome recorded.

### C.8 Journey — Configure Approval Policy and Cost Budget

- **Entry Points:** Governance → Approval Policies; Governance → Cost Budgets.
- **Primary Flow:** AI Steward selects tenant / company / context scope → captures Approval Policy or Cost Budget master fields → validates → publishes for the scope.
- **Alternate Flows:** Inherit from parent scope; override at a lower scope; scope-level enablement of whitelist entries.
- **Interruption / Resume:** Draft state persists per author within scope.
- **Exception Flows:** Scope conflict with parent configuration; validation failure; attempted policy assignment beyond authorization scope → rejected.

### C.9 Journey — Review Safety Governance

- **Entry Points:** Governance → Safety Governance.
- **Primary Flow:** AI Steward or Security Officer opens the Safety Governance surface → reviews the current safety configuration in effect for the tenant / company / context → makes scope-permitted adjustments.
- **Alternate Flows:** Inspect denied Tool Calls attributable to safety governance; review Prompt Versions flagged for safety review.
- **Exception Flows:** Attempted change outside scope → rejected; validation failure.

### C.10 Journey — Consume Operational Reports

- **Entry Points:** Governance → Reports.
- **Primary Flow:** User opens an operational report (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency) rendered via `ENG-021` → applies permitted filters → drills down to underlying AI Conversations, AI Tool Calls, or AI Approvals subject to authorization.
- **Alternate Flows:** Schedule report distribution via published capabilities of MOD-017 where cross-module KPIs apply (cross-module KPI authorship remains with MOD-017).
- **Exception Flows:** Access denied; freshness indicator flags stale data.

### C.11 Journey — Collaborate on Prompts, Corpora, and Tool Definitions

- **Entry Points:** Prompt Library, Retrieval Workspaces, or Tool Definitions detail surface → collaboration actions.
- **Primary Flow:** Multiple AI Stewards collaborate on the same Prompt / Corpus / Tool Definition Draft within tenant scope → submit for review-and-publish → approver acts → activation follows.
- **Alternate Flows:** Concurrent editing indicator; assignment for review; shared review notes.
- **Interruption / Resume:** Draft state persists per author within scope; the review-and-publish process resumes across sessions.
- **Exception Flows:** Concurrent-edit conflict → validation feedback surfaced; reviewer lacks scope → routing re-evaluated.

## D. Navigation Structure

Derived strictly from Publication §3 (Approved Scope), which enumerates the AI Workspace submodules: Copilot Surfaces, Retrieval, Tool Calling, Prompt Library, and Governance.

### D.1 Application Areas

- **AI Workspace Home** — persona-appropriate landing surface with recent AI Conversations, pending approvals, and Prompt Library updates.
- **Copilot Surfaces** — enabled Copilot Surfaces and AI Conversation lifecycle.
- **Prompt Library** — Prompt master, Prompt Version master, review-and-publish surfaces.
- **Retrieval Workspaces** — Retrieval Corpus master, build-and-refresh, cadence configuration.
- **Tool Calling** — Tool Definition master, AI Tool Call transactions, whitelisting.
- **Governance** — AI Approvals, Approval Policies, Cost Budgets, Safety Governance, operational reports.

### D.2 Menu Hierarchy

```text
AI Workspace
├── Home
├── Copilot Surfaces
│   ├── Open Copilot
│   ├── Conversations
│   └── Shared with Me
├── Prompt Library
│   ├── Prompts
│   ├── Prompt Versions
│   └── Review Queue
├── Retrieval Workspaces
│   ├── Retrieval Corpora
│   ├── Refresh Schedules
│   └── Ingestion Health
├── Tool Calling
│   ├── Tool Definitions
│   ├── Tool Calls
│   └── Whitelisted Tools
└── Governance
    ├── Approvals
    ├── Approval Policies
    ├── Cost Budgets
    ├── Safety Governance
    └── Reports
```

### D.3 Deep-Link Entry Points

Direct links resolve to: an AI Conversation detail, a Prompt Version detail, a Retrieval Corpus detail, a Tool Definition detail, an AI Tool Call detail, an AI Approval detail, an Approval Policy detail, a Cost Budget detail, and an operational report. Every deep-link is re-evaluated against the caller's authorization on resolution.

### D.4 Breadcrumbs

Breadcrumbs mirror the menu hierarchy and always root at "AI Workspace". Entity detail surfaces append the entity's business name (for example `AI Workspace / Prompt Library / Prompts / Weekly Sales Summary`).

### D.5 Back-Navigation Behaviour

Back-navigation returns to the prior surface within the AI Workspace area preserving filter and scope selections. Back-navigation from an embedded copilot surface returns control to the invoking source-module surface without carrying AI Workspace-owned state into that surface.

### D.6 Cross-Module Navigation

Drill-down targets that leave the AI Workspace area (into a source-module transaction or master surface) are surfaced as outbound navigation and remain subject to the target module's own authorization. AI Workspace mutates source-module transactions only through the tool-call-with-approval process, not through navigation.

## E. Screen Inventory

Each entry: purpose, business capability, primary actions, displayed business information, navigation relationships. Derived from the capabilities, master data, and transactions declared in the Module Publication. Visual mockups are out of scope.

### E.1 AI Workspace Home

- **Purpose:** Persona-appropriate landing surface for AI Workspace.
- **Business Capability:** Copilot Surfaces; Governance overview (Publication §3).
- **Primary Actions:** Open Copilot, Resume Conversation, Open Pending Approvals, Open Prompt Library.
- **Displayed Business Information:** Recent AI Conversations, pending AI Approvals within scope, recently published Prompt Versions.
- **Relationships:** Entry point to Copilot Surfaces, Prompt Library, Governance.

### E.2 Copilot Surface

- **Purpose:** Present the copilot conversation surface for an active source-module context.
- **Business Capability:** Copilot Surfaces; prompt-to-response process (Publication §3, §4.4).
- **Primary Actions:** Submit Prompt, Review Response, Request Tool Call, Attach Referenced Document, Save Conversation.
- **Displayed Business Information:** Conversation turns, resolved workspace context, grounded references, suggested Tool Calls, freshness indicator on retrieved context.
- **Relationships:** Opens AI Conversation detail (§E.3); routes to Tool Call detail (§E.11); references Prompt Version detail (§E.6) and Retrieval Corpus detail (§E.8).

### E.3 AI Conversations Catalog

- **Purpose:** Browse AI Conversation transactions within scope.
- **Business Capability:** AI Conversation transaction authority (Publication §8).
- **Primary Actions:** Open, share (within tenant scope), archive.
- **Displayed Business Information:** Conversation identifier, participants, source-module surface, timestamps, resolution state.
- **Relationships:** Opens AI Conversation Detail (§E.4).

### E.4 AI Conversation Detail

- **Purpose:** Read AI Conversation history and grounded references.
- **Business Capability:** AI Conversation transaction authority; audit visibility per `ADR-014`.
- **Primary Actions:** Resume, share, review Tool Calls, open grounded references.
- **Displayed Business Information:** Turn-by-turn history, referenced Prompt Versions, referenced Retrieval Corpora, associated AI Tool Calls and AI Approvals.
- **Relationships:** Prompt Version Detail (§E.6); Retrieval Corpus Detail (§E.8); Tool Call Detail (§E.11); Approval Detail (§E.16).

### E.5 Prompt Library Catalog

- **Purpose:** Browse Prompt master entries.
- **Business Capability:** Prompt master authority (Publication §4.1).
- **Primary Actions:** Open, create, submit for publication, deactivate, archive.
- **Displayed Business Information:** Prompt identifier, ownership, lifecycle state, Active Prompt Version indicator, last-published date.
- **Relationships:** Opens Prompt Detail (§E.6) and Prompt Authoring (§F.1).

### E.6 Prompt / Prompt Version Detail

- **Purpose:** Read Prompt master and browse Prompt Versions (immutable once submitted).
- **Business Capability:** Prompt master and Prompt Version master authorities (Publication §4.1).
- **Primary Actions:** Open Version, Create New Version (returns to authoring), Submit for Publication, Withdraw, Deactivate, Archive.
- **Displayed Business Information:** Prompt definition, version list, current Active version, publication history, review notes.
- **Relationships:** Prompt Authoring (§F.1); Review Queue (§E.7).

### E.7 Prompt Review Queue

- **Purpose:** Present Prompt Versions pending review-and-publish approval.
- **Business Capability:** Review-and-publish process authority (Publication §4.1); approvals via `ENG-011`.
- **Primary Actions:** Open item, Approve, Reject with notes, Reassign.
- **Displayed Business Information:** Pending Prompt Versions, requester, submission time, policy in effect.
- **Relationships:** Prompt Version Detail (§E.6).

### E.8 Retrieval Corpora Catalog and Detail

- **Purpose:** Browse and manage Retrieval Corpus master.
- **Business Capability:** Retrieval Corpus master authority; retrieval build-and-refresh process (Publication §4.2).
- **Primary Actions:** Create, edit, activate, deactivate, archive, refresh now.
- **Displayed Business Information:** Corpus identifier, bound source read models, refresh cadence, last-refreshed indicator, retention, lifecycle state.
- **Relationships:** Refresh Schedules (§E.9); Ingestion Health (§E.10).

### E.9 Refresh Schedules

- **Purpose:** Manage `Retrieval refresh cadence` per corpus and per scope.
- **Business Capability:** Retrieval refresh cadence configuration authority (Publication §4.2).
- **Primary Actions:** Configure cadence, override at scope, validate.
- **Displayed Business Information:** Schedule entries by tenant / company / context; upcoming refresh times; conflicts.
- **Relationships:** Retrieval Corpus Detail (§E.8).

### E.10 Ingestion Health

- **Purpose:** Observe read-only ingestion health for Retrieval.
- **Business Capability:** Read-model-only ingestion boundary (Publication §4.2).
- **Primary Actions:** Filter, drill into corpus.
- **Displayed Business Information:** Recent refresh outcomes, failure summaries, freshness indicators.
- **Relationships:** Retrieval Corpus Detail (§E.8).

### E.11 Tool Definitions Catalog and Detail

- **Purpose:** Browse and manage Tool Definition master.
- **Business Capability:** Tool Definition master authority; whitelisting for approval-gate bypass (Publication §4.3).
- **Primary Actions:** Create, edit, submit for approval, activate, deactivate, archive, whitelist per policy.
- **Displayed Business Information:** Tool identifier, bound source-module capability, invocation constraints, approval-gate expectation, safety classification, lifecycle state.
- **Relationships:** Tool Call Catalog (§E.12).

### E.12 Tool Calls Catalog

- **Purpose:** Browse AI Tool Call transactions within scope.
- **Business Capability:** AI Tool Call transaction authority (Publication §8).
- **Primary Actions:** Open detail, filter by state / requester / tool.
- **Displayed Business Information:** Tool Call identifier, tool definition, requester, current lifecycle state, associated Approval, source-module outcome.
- **Relationships:** Tool Call Detail (§E.13); Approval Detail (§E.16).

### E.13 Tool Call Detail

- **Purpose:** Read a single AI Tool Call transaction.
- **Business Capability:** AI Tool Call transaction authority; tool-call-with-approval process (Publication §4.3).
- **Primary Actions:** Open Approval, view invocation context, view source-module outcome.
- **Displayed Business Information:** Requested Tool Definition, invocation context, retrieved grounding reference, Approval outcome, source-module outcome.
- **Relationships:** Approval Detail (§E.16); AI Conversation Detail (§E.4).

### E.14 Whitelisted Tools

- **Purpose:** List Tool Definitions whitelisted for approval-gate bypass under policy.
- **Business Capability:** AI-initiated approval-gate rule authority; Approval Policies configuration authority (Publication §4.3, §4.5).
- **Primary Actions:** View, remove from whitelist (via policy).
- **Displayed Business Information:** Whitelisted tools by scope and policy reference.
- **Relationships:** Approval Policy Detail (§E.17).

### E.15 Approvals Inbox

- **Purpose:** Present pending AI Approval transactions to authorized approvers.
- **Business Capability:** AI Approval transaction authority (Publication §4.5); approvals via `ENG-011`.
- **Primary Actions:** Open detail, act Grant, act Deny, delegate.
- **Displayed Business Information:** Pending approvals, requester, tool, policy in effect, elapsed time.
- **Relationships:** Approval Detail (§E.16).

### E.16 AI Approval Detail

- **Purpose:** Read a single AI Approval transaction and act on it.
- **Business Capability:** AI Approval transaction authority (Publication §4.5, §8).
- **Primary Actions:** Grant, Deny (with notes), Delegate.
- **Displayed Business Information:** Requested Tool Call, invocation context, retrieved grounding reference, requester, policy in effect, decision history.
- **Relationships:** Tool Call Detail (§E.13); Approval Policy Detail (§E.17).

### E.17 Approval Policies

- **Purpose:** Manage Approval Policy master entries by scope.
- **Business Capability:** Approval Policies configuration authority (Publication §4.5).
- **Primary Actions:** Create, edit, validate, publish, deactivate.
- **Displayed Business Information:** Scope, policy body, whitelisted tools, approver roles, timeout behaviour.
- **Relationships:** Whitelisted Tools (§E.14); Approvals Inbox (§E.15).

### E.18 Cost Budgets

- **Purpose:** Manage Cost Budget master entries by scope.
- **Business Capability:** Cost Budgets configuration authority (Publication §4.5).
- **Primary Actions:** Create, edit, validate, publish.
- **Displayed Business Information:** Scope, budget window, alert thresholds, current utilization indicator.
- **Relationships:** Operational Reports (§E.20).

### E.19 Safety Governance

- **Purpose:** Manage Safety Governance configuration.
- **Business Capability:** Safety Governance authority (Publication §4.5).
- **Primary Actions:** Edit, validate, publish scope-level configuration.
- **Displayed Business Information:** Safety configuration by tenant / company / context; recent enforcement outcomes.
- **Relationships:** Tool Call Detail (§E.13); Prompt Version Detail (§E.6).

### E.20 Operational Reports

- **Purpose:** Present the published operational reports: AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency.
- **Business Capability:** Operational reports authority (Publication §4.5).
- **Primary Actions:** Open report, filter, drill down.
- **Displayed Business Information:** Report content rendered via `ENG-021`; freshness indicator.
- **Relationships:** AI Conversations (§E.3), Tool Calls (§E.12), Approvals (§E.15), Cost Budgets (§E.18).

## F. Forms & User Interactions

Every form derives its fields from the Master Data and Transaction Authorities declared in Module Publication §7–§8. Validation is business-level (declarative rules resolved via `ENG-012` where applicable); technical validation is out of scope.

### F.1 Prompt Authoring Form

- **Purpose:** Author / edit a Prompt Master and produce a Prompt Version.
- **Business Fields:** Prompt identifier, name, description, business purpose, safety classification, ownership, lifecycle state; version body (immutable once submitted), version notes.
- **Required vs Optional:** Identifier, body, ownership required; description, version notes optional.
- **Business Validation Rules:** Required identifier unique in scope; single Active Prompt Version invariant; submitted Prompt Versions are immutable.
- **User Actions:** Save Draft, Submit for Publication, Withdraw, Activate, Deactivate, Archive.
- **Submit Outcome:** Prompt Version enters the review-and-publish process; publication signal emits via `ENG-024`.
- **Cancel / Retry Outcome:** Draft state preserved; retry surfaces last validation feedback without duplicating a version.

### F.2 Retrieval Corpus Form

- **Purpose:** Register / maintain a Retrieval Corpus.
- **Business Fields:** Corpus identifier, name, description, bound source read-model references, refresh cadence, retention, sensitivity classification, lifecycle state.
- **Required vs Optional:** Identifier, bound source references, cadence required; description, sensitivity classification optional at Draft.
- **Business Validation Rules:** Bound source references must reference permitted read models; cadence consistent with retention; retrieval never mutates source-module state.
- **User Actions:** Save Draft, Validate, Activate, Deactivate, Archive, Refresh Now.
- **Submit Outcome:** Corpus persisted; build-and-refresh process available on scope.
- **Cancel / Retry Outcome:** Draft preserved; retry surfaces validation feedback.

### F.3 Tool Definition Form

- **Purpose:** Author / edit a Tool Definition.
- **Business Fields:** Tool identifier, name, business purpose, bound source-module capability, invocation constraints, approval-gate expectation, safety classification, ownership, lifecycle state.
- **Required vs Optional:** Identifier, bound capability, approval-gate expectation required; description, safety classification recommended.
- **Business Validation Rules:** Bound capability must be within ownership authorization; approval-gate expectation aligns with `AI-initiated state changes must pass an approval gate unless explicitly whitelisted`; safety classification honours Safety Governance.
- **User Actions:** Save Draft, Submit for Approval, Activate, Deactivate, Archive.
- **Submit Outcome:** Tool Definition persisted / transitioned; catalog change signal emits via `ENG-024`.
- **Cancel / Retry Outcome:** Draft preserved; approval rejection returns to Draft with reviewer notes.

### F.4 Prompt Submission Form

- **Purpose:** Submit a prompt within a Copilot Surface.
- **Business Fields:** Prompt text, referenced Prompt Version (optional), attached documents (via `ENG-007` / `ENG-008` where the surface permits).
- **Required vs Optional:** Prompt text required; references optional.
- **Business Validation Rules:** Referenced Prompt Version must be Active; attached documents must be within scope.
- **User Actions:** Submit, Save Draft, Cancel.
- **Submit Outcome:** AI Conversation transaction opens (`AIConversationStarted` emits via `ENG-024`); response renders.
- **Cancel / Retry Outcome:** Draft preserved; retry re-submits without duplicating a transaction.

### F.5 Tool Call Request Form

- **Purpose:** Request a Tool Call from within an AI Conversation or a Tool Definition surface.
- **Business Fields:** Tool Definition reference, invocation context, business justification (where policy requires).
- **Required vs Optional:** Tool Definition and invocation context required; justification required only where policy mandates it.
- **Business Validation Rules:** Tool Definition must be Active; invocation context must be within the requester's authorization; approval-gate expectation resolves against Approval Policies.
- **User Actions:** Request, Save Draft, Cancel.
- **Submit Outcome:** AI Tool Call transaction opens; `AIToolCallRequested` emits via `ENG-024`.
- **Cancel / Retry Outcome:** Draft preserved; retry does not duplicate a transaction.

### F.6 AI Approval Decision Form

- **Purpose:** Approver acts on a pending AI Approval.
- **Business Fields:** Decision (Grant / Deny), reviewer notes, delegation target (where applicable).
- **Required vs Optional:** Decision required; notes required on Deny.
- **Business Validation Rules:** Decision maker must be within scope and policy; delegation target must be authorized.
- **User Actions:** Grant, Deny, Delegate, Cancel.
- **Submit Outcome:** `AIApprovalGranted` or `AIApprovalDenied` emits via `ENG-024`; downstream Tool Call resolves accordingly.
- **Cancel / Retry Outcome:** Pending state preserved.

### F.7 Approval Policy Form

- **Purpose:** Author / edit an Approval Policy.
- **Business Fields:** Scope, approver roles, whitelisted tools, timeout behaviour, escalation path.
- **Required vs Optional:** Scope, approver roles, timeout required; whitelisted tools optional.
- **Business Validation Rules:** Scope must exist; approver roles must be within RBAC/ABAC boundaries per `ADR-032`; whitelisted tools must be Active and within scope.
- **User Actions:** Save Draft, Validate, Publish, Deactivate.
- **Submit Outcome:** Policy published for scope; effect applies to subsequent AI Approvals.
- **Cancel / Retry Outcome:** Draft preserved.

### F.8 Cost Budget Form

- **Purpose:** Author / edit a Cost Budget.
- **Business Fields:** Scope, budget window, thresholds, alert channels (via `ENG-025`).
- **Required vs Optional:** Scope, window, thresholds required; alert channels optional.
- **Business Validation Rules:** Scope must exist; child scope may not exceed parent budget unless override permitted.
- **User Actions:** Save Draft, Validate, Publish.
- **Submit Outcome:** Budget published for scope; alerts route via `ENG-025`.
- **Cancel / Retry Outcome:** Draft preserved.

### F.9 Safety Governance Form

- **Purpose:** Configure Safety Governance for a scope.
- **Business Fields:** Scope, safety configuration entries.
- **Required vs Optional:** Scope required; configuration entries optional pending scope inheritance.
- **Business Validation Rules:** Scope must exist; overrides respect parent-scope invariants.
- **User Actions:** Edit, Validate, Publish.
- **Submit Outcome:** Configuration active for the scope.
- **Cancel / Retry Outcome:** Draft preserved.

## G. Workspace Collaboration

Collaboration is supported only where the Module Publication permits it. WEB-018 introduces no new collaboration surfaces beyond those authorized by Publication §3–§4.

- **Shared Workspaces:** Prompt Library, Retrieval Workspaces, and Tool Definitions are tenant-scoped shared workspaces for AI Stewards. Copilot Surfaces are per-user by default but expose sharing within tenant scope for AI Conversations.
- **AI Session Continuity:** AI Conversation transactions persist across sessions; users resume prior conversations without re-establishing context.
- **Conversation History:** All AI Conversation transactions are retained per audit visibility rules per `ADR-014`; auditors read history via the Auditor persona.
- **Shared Artifacts:** Prompt, Prompt Version, Retrieval Corpus, and Tool Definition master data are the sharable artefacts. Only Active versions are consumed by Copilot Surfaces; Draft and Inactive versions are visible only to authorized stewards.
- **Review-and-Publish Flows:** The Prompt review-and-publish and the Tool Definition approval flow route via `ENG-011` per `ADR-032`; concurrent editing is surfaced as a validation-time conflict indicator.
- **Notification and Handoff:** Collaboration events (submission, approval, denial) notify affected users via `ENG-025`.

## H. AI Interaction Experience

Documents only the AI capabilities published by MOD-018. No model implementation details.

### H.1 Prompt Submission

- Users submit prompts within a Copilot Surface bound to a resolved workspace context. Prompt Version references default to the tenant-active Prompt Version where the surface publishes one.

### H.2 Response Presentation

- Responses render with grounded references to Retrieved Context and referenced Prompt Version; freshness indicators apply to any retrieved content. Sensitive-data redaction applies where the user lacks row-level access.

### H.3 Workspace Context

- Workspace context is resolved from tenant / company / context / source-module surface and is displayed alongside the conversation surface. Users can inspect resolved context but cannot mutate it from within the copilot surface.

### H.4 Task Execution Requests

- Suggested Tool Calls appear inline in the response surface. Users initiate an AI Tool Call transaction from the suggestion; execution never occurs without user confirmation (except for whitelisted Tool Definitions per policy).

### H.5 Generated Artifact Review

- Where responses reference generated artefacts (documents attached via `ENG-007` / `ENG-008`, structured suggestions), users review the artefact before invoking any Tool Call. Artefacts remain within tenant and scope boundaries.

### H.6 User Confirmation Points

- All AI-initiated state changes traverse the approval gate unless explicitly whitelisted. The Web surface displays the pending Approval state and the currently applicable Approval Policy until the transaction resolves.

## I. Accessibility

Aligned to `ADR-081` (Accessibility Standard). No implementation guidance; objectives only.

- **Keyboard Navigation:** Every action reachable via keyboard alone. Escape returns focus predictably from Copilot Surfaces, Review Queues, and Approval Detail surfaces.
- **Focus Management:** Focus lands on the response after a prompt submission; focus lands on the pending decision after opening an AI Approval; focus indicators are always visible.
- **Screen Reader Compatibility:** All interactive elements have accessible names; conversation turns, approval state changes, retrieval freshness, and Tool Call outcomes are announced.
- **Color-Independent Communication:** Lifecycle state (Draft / Active / Inactive / Archived), approval outcome (Granted / Denied / Pending), retrieval freshness, sensitive-data redaction, and error states are communicated by more than color alone (icon + text label).
- **Responsive Behaviour:** Copilot Surfaces, Conversations catalog, Prompt Library, and Approvals Inbox reflow across desktop, tablet, and mobile browser widths without loss of content or actions. Authoring surfaces for Prompts, Retrieval Corpora, Tool Definitions, and Approval Policies remain reachable on smaller widths in a compact single-column layout; complex authoring may be deferred to larger widths.
- **Localization:** All labels resolvable via `ENG-006`; layout tolerates text expansion.

Mobile-native experiences (offline, push, camera, device capabilities) are out of scope for WEB-018 and belong to MOB-018.

## J. Security Considerations

User-facing security expectations derived from Module Publication §4 authorities and §11 engine / ADR consumption. No implementation mechanisms.

### J.1 Authentication Entry Points

- Access to AI Workspace requires authenticated identity per `ENG-001`. Unauthenticated navigation is redirected to the platform-level sign-in surface owned by MOD-001; WEB-018 does not define authentication mechanics.

### J.2 Authorization Visibility

- Menus, actions, and detail fields are gated by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC). Users see only entities within their tenant, company, and row-level scope.
- Copilot Surfaces render only when the tenant has `Enabled surfaces` configured for the surface.

### J.3 Workspace Visibility

- Prompt, Prompt Version, Retrieval Corpus, and Tool Definition catalogues honour tenant isolation per `ADR-011`. Cross-tenant navigation and sharing are not offered.
- AI Conversation sharing operates only within tenant scope.

### J.4 AI Usage Permissions

- Retrieval-authorization-at-query-time applies per Publication §4.2: retrieved content excludes anything the querying user is not permitted to read.
- AI-initiated state changes traverse the approval gate per Publication §4.3 and §4.5 unless the Tool Definition is explicitly whitelisted by policy.
- Cost Budget thresholds influence allowed AI usage per scope; users see a policy-informed indicator when approaching a threshold.

### J.5 Audit Visibility

- Prompt / Prompt Version publication events, Tool Definition lifecycle events, AI Conversation lifecycle, AI Tool Call lifecycle, and AI Approval decisions (`AIApprovalGranted` / `AIApprovalDenied`) are audit-visible per `ADR-014` via `ENG-004`.
- Audit-visible history is exposed to the Auditor persona via read-only surfaces on Prompts, Tool Definitions, Retrieval Corpora, AI Conversations, AI Tool Calls, and AI Approvals.

### J.6 Secure Handling of Business Information

- The Web surface never offers actions that mutate source-module transactions outside the tool-call-with-approval process. Drill-down into a source-module surface surrenders control to that module's own surface and its own authorization.
- Provider integration occurs exclusively via `ENG-028`; the Web surface never surfaces provider identity or provider-native controls.
- Sensitive-data redaction applies to retrieved content and to referenced source-module reads within Copilot Surfaces.

## K. Traceability Matrix

Every WEB-018 feature maps to a Module Publication capability and one or more originating Sprints. Capability rows are derived from `MOD-018_MODULE_PUBLICATION` §3, §4, §7, §8, §9.

| WEB-018 Feature | Business Capability (Publication §) | Originating Sprint(s) |
| --- | --- | --- |
| AI Workspace Home (§E.1) | Copilot Surfaces; Governance overview (§3) | SPR-MOD-018-004, 005 |
| Copilot Surface / Prompt Submission (§E.2, §F.4); prompt-to-response journey (§C.1) | Prompt-to-response process; AI Conversation transaction; `AIConversationStarted` (§4.4, §8, §9) | SPR-MOD-018-004 |
| AI Conversations Catalog / Detail (§E.3–§E.4); Conversation review journey (§C.6) | AI Conversation transaction authority; audit visibility per ADR-014 (§8, §11) | SPR-MOD-018-004 |
| Prompt Library Catalog / Detail (§E.5–§E.6); Prompt authoring (§F.1); Prompt journey (§C.3) | Prompt Master and Prompt Version Master authorities; review-and-publish process (§4.1) | SPR-MOD-018-001 |
| Prompt Review Queue (§E.7); review-and-publish journey (§C.3, §C.11) | Prompt review-and-publish process authority; approvals via ENG-011 (§4.1) | SPR-MOD-018-001 |
| Retrieval Corpora Catalog / Detail (§E.8) and Corpus form (§F.2); Corpus journey (§C.4) | Retrieval Corpus Master Authority; build-and-refresh process (§4.2) | SPR-MOD-018-002 |
| Refresh Schedules (§E.9) | Retrieval refresh cadence configuration authority (§4.2) | SPR-MOD-018-002 |
| Ingestion Health (§E.10) | Read-model-only ingestion boundary (§4.2) | SPR-MOD-018-002 |
| Tool Definitions Catalog / Detail (§E.11) and Tool Definition form (§F.3); Tool journey (§C.5) | Tool Definition Master Authority (§4.3) | SPR-MOD-018-003 |
| Tool Calls Catalog / Detail (§E.12–§E.13) and Tool Call request form (§F.5); Tool-call journey (§C.2) | AI Tool Call transaction authority; tool-call-with-approval; `AIToolCallRequested` (§4.3, §8, §9) | SPR-MOD-018-003 |
| Whitelisted Tools (§E.14) | AI-initiated approval-gate rule authority; Approval Policies configuration authority (§4.3, §4.5) | SPR-MOD-018-003, 005 |
| Approvals Inbox / AI Approval Detail (§E.15–§E.16) and Approval decision form (§F.6); Approval journey (§C.7) | AI Approval transaction authority; `AIApprovalGranted` / `AIApprovalDenied` (§4.5, §8, §9) | SPR-MOD-018-005 |
| Approval Policies (§E.17) and Approval Policy form (§F.7); Policy journey (§C.8) | Approval Policies configuration authority (§4.5) | SPR-MOD-018-005 |
| Cost Budgets (§E.18) and Cost Budget form (§F.8); Cost journey (§C.8) | Cost Budgets configuration authority (§4.5) | SPR-MOD-018-005 |
| Safety Governance (§E.19) and Safety Governance form (§F.9); Safety journey (§C.9) | Safety Governance authority (§4.5) | SPR-MOD-018-005 |
| Operational Reports (§E.20); Reports journey (§C.10) | Operational Reports authority (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency) (§4.5) | SPR-MOD-018-005 |
| Workspace Collaboration (§G) | Prompt review-and-publish; Tool-call-with-approval; audit visibility (§4.1, §4.3, §11) | SPR-MOD-018-001, 003, 005 |
| AI Interaction Experience (§H) | Prompt-to-response process; retrieval grounding; tool-call-with-approval; provider integration via ENG-028 (§4.3, §4.4) | SPR-MOD-018-002, 003, 004 |
| Accessibility (§I) | ADR-081 Accessibility Standard (§11) | SPR-MOD-018-001, 004 |
| Security Considerations (§J) | ADR-011, ADR-014, ADR-032 (§11); Retrieval-authorization-at-query-time; AI-initiated approval-gate rule (§4.2, §4.3) | SPR-MOD-018-001, 002, 003, 004, 005 |

No WEB-018 feature is absent from the traceability matrix. No feature in the matrix lacks an originating Sprint. WEB-018 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-018_MODULE_PUBLICATION`.

## References

- [`docs/45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md`](../../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md)
- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md)
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
