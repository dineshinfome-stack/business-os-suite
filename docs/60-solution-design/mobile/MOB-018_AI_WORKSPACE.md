---
title: "MOB-018 — AI Workspace Mobile Solution Design Specification"
summary: "Phase 3 Mobile Solution Design specification for MOD-018 AI Workspace. Derived exclusively from the AI Workspace Module Publication (with WEB-018 referenced only for terminology, workflow, and navigation consistency). Defines mobile personas, journeys, navigation, screen inventory, forms, collaboration, AI interaction experience, accessibility, and user-facing security expectations. Introduces no new business requirements."
spec_id: "MOB-018"
family: "MOB"
source_module: "MOD-018"
source_module_name: "AI Workspace"
source_publication: "MOD-018_MODULE_PUBLICATION"
source_baseline: "MOD018_AI_WORKSPACE_BASELINE_v1"
source_module_prd: "docs/20-module-prds/ai/MODULE_PRD.md"
source_sprint_plan: "docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md"
source_sprints: ["SPR-MOD-018-001", "SPR-MOD-018-002", "SPR-MOD-018-003", "SPR-MOD-018-004", "SPR-MOD-018-005"]
related_web_spec: "WEB-018"
version: "1.0"
status: "Active"
lifecycle_state: "Active"
owner: "AI Platform"
layer: "platform"
updated: "2026-07-18"
tags: ["solution-design", "mobile", "phase-3", "MOB-018", "MOD-018", "ai-workspace", "SD-006"]
document_type: "Mobile Solution Design Specification"
template: "SD-006"
template_version: "v1.0"
governance_specification: "v1.0"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-008", "ENG-011", "ENG-013", "ENG-017", "ENG-020", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-028"]
related_adrs: ["ADR-011", "ADR-014", "ADR-032", "ADR-081"]
---

# MOB-018 — AI Workspace Mobile Solution Design Specification

> **Reference derivation only.** MOB-018 is a Mobile-surface projection of the AI Workspace Module Publication [`MOD-018_MODULE_PUBLICATION`](../../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md). It introduces no new business requirements, authorities, master data, transactions, events, engines, or ADRs. [`WEB-018`](../web/WEB-018_AI_WORKSPACE.md) is referenced only to maintain consistency of journeys, terminology, and navigation; it is not a business source. On any conflict with the Module Publication or its parent Module Baseline, the upstream artifact wins and MOB-018 is corrected in the same change.

## A. Overview

### A.1 Purpose

Define the Mobile-surface user experience through which authorized business users consume the AI Workspace capabilities published in `MOD-018_MODULE_PUBLICATION` — copilot surfaces, retrieval workspaces (RAG), tool-calling on module capabilities, the prompt library, and human-approval / cost / safety governance — over source-module read models, with source-module state changes occurring exclusively through the tool-call-with-approval process, on mobile-native devices.

### A.2 Scope

Mobile-native surface (phone and tablet form factors) covering:

- Copilot conversation consumption and prompt submission on the go.
- Review and continuation of AI Conversation transactions.
- Approval of AI-initiated Tool Calls where the user is an authorized approver.
- Read-only inspection of the Prompt Library, Retrieval Corpora, Tool Definitions, and audit-visible histories.
- Prompt review-and-publish decisions where the user is an authorized reviewer.
- Monitoring of retrieval refresh outcomes, cost budget indicators, and safety governance status within scope.
- Notification handling for `AIConversationStarted`, `AIToolCallRequested`, `AIApprovalGranted`, and `AIApprovalDenied` per Publication §9 and `ENG-025`.
- Offline availability limited strictly to what the Published Module supports (cached read-only viewing and queued read-only preference edits).

Out of scope for MOB-018: Web surfaces (belongs to WEB-018), API contracts (belongs to API-018), UI mockups, framework decisions, and any business-rule authoring. Complex authoring of Prompt Master, Retrieval Corpus, Tool Definition, Approval Policy, Cost Budget, and Safety Governance remains Web-primary.

### A.3 Source Published Module

- **Module ID / Name:** MOD-018 AI Workspace
- **Publication:** [`MOD-018_MODULE_PUBLICATION`](../../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md)
- **Baseline:** [`MOD018_AI_WORKSPACE_BASELINE_v1`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md)
- **Module PRD:** [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- **Sprint Plan:** [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md)
- **Sprint PRDs:** `SPR-MOD-018-001` … `SPR-MOD-018-005`
- **Related Web Specification:** [`WEB-018`](../web/WEB-018_AI_WORKSPACE.md) — consistency reference only.

### A.4 Version

- **Specification Version:** 1.0
- **Aligned to Publication Version:** MOD-018 v1.0

### A.5 Traceability References

See §K for the complete feature-to-capability-to-sprint-to-WEB-018 traceability matrix. Frontmatter records the full chain (Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → Module Publication → MOB-018; WEB-018 referenced for consistency).

## B. Mobile Personas

Personas are inherited from the Module PRD, the Module Publication, and the Sprint PRD family; MOB-018 introduces no new roles. Concrete grants remain enforced by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC). This section describes mobile-specific responsibilities, permissions, and scenarios only.

### B.1 Business User (all modules)

- **Mobile Responsibilities:** Consume enabled copilot surfaces on the go; submit prompts; review AI responses; initiate tool-call requests subject to approval; consult retrieved context within scope; act on approval notifications where the Approval Policy permits.
- **Permissions (business-level):** Same read scope as web surface (tenant, company, row-scoped). Copilot surfaces render only when `Enabled surfaces` is configured for the tenant. Sensitive-data redaction applies identically.
- **Primary Mobile Scenarios:** Open a copilot from a source-module notification; ask a question between meetings; review a suggested Tool Call; act on an approval notification; resume an earlier conversation.

### B.2 AI Steward

- **Mobile Responsibilities:** Read-first monitoring of the Prompt Library, Retrieval Corpora, and Tool Definitions; act on the review-and-publish queue where authorized; monitor retrieval refresh outcomes and cost budget indicators. Complex authoring remains Web-primary.
- **Permissions (business-level):** Read access across AI Workspace masters within scope; act on Prompt Version publication reviews and Tool Definition approvals when routed; view Approval Policies, Cost Budgets, and Safety Governance read-only on mobile.
- **Primary Mobile Scenarios:** Open a Prompt Review Queue notification and approve or reject a Prompt Version; inspect a Retrieval Corpus refresh outcome; check a Tool Definition lifecycle state; review a cost budget indicator while away from a workstation.

### B.3 Auditor

- **Mobile Responsibilities:** Read-only inspection of AI Workspace audit-visible history within retention: Prompt Version publication history, Tool Definition lifecycle history, Retrieval Corpus refresh history, AI Conversation history, AI Tool Call history, AI Approval history.
- **Permissions (business-level):** Read access to audit-visible surfaces within tenant scope per `ADR-014`; no mutation rights.
- **Primary Mobile Scenarios:** Review a Prompt Version's publication history from a mobile device; inspect an AI Tool Call and its resolved Approval history; verify a Retrieval Corpus refresh outcome within the retention window.

### B.4 Security Officer

- **Mobile Responsibilities:** Verify enforcement of retrieval-authorization-at-query-time; verify the AI-initiated approval-gate rule; verify tenant isolation and sensitive-data handling on mobile surfaces.
- **Permissions (business-level):** Read-only oversight over authorization decisions, Approval Policies, and Safety Governance configuration within scope; no mutation of AI Workspace master data or transactions.
- **Primary Mobile Scenarios:** Open a Denied Tool Call from a notification and inspect the reason; review Safety Governance configuration in effect; verify that a sensitive read model was excluded from retrieved grounding.

## C. Mobile User Journeys

Every journey is derived from a capability in Module Publication §3 and the transaction lifecycles in Publication §8. MOB-018 defines Mobile-surface flows only; business rules, state legality, and authorization are owned by the Module Publication and enforced by platform engines. The corresponding WEB-018 journey is noted parenthetically for consistency only.

### C.1 Journey — Submit a Prompt and Review the Response (WEB-018 §C.1)

- **Entry Points:** Mobile AI Workspace home; embedded copilot entry from a source-module mobile surface where `Enabled surfaces` is configured; deep link into an AI Conversation.
- **Primary Flow:** User opens Copilot Surface → workspace context resolves (tenant / company / active source-module surface) → user composes and submits a prompt → AI Conversation transaction opens → provider integration proceeds exclusively via `ENG-028` → response renders with grounded references to Retrieved Context and any suggested Tool Call → `AIConversationStarted` emits via `ENG-024`.
- **Alternate Flows:** Resume an existing conversation; open a shared conversation link within tenant scope; reference an Active Prompt Version.
- **Interruption / Resume:** Application backgrounded during a turn resumes at the conversation without re-submitting; unresolved provider requests are indicated as pending until completion.
- **Offline / Online Transitions:** Prompt submission requires connectivity; drafts are preserved locally and re-presented on reconnect; recently viewed conversations render read-only from cache with a "cached at" indicator; drill-down to grounded references may require connectivity.
- **Exception Flows:** Copilot surface not enabled for tenant → access-denied state; sensitive-data redaction applies where the user lacks row-level access; provider unavailable → conversation reflects failure state without mutating source-module transactions.

### C.2 Journey — Request a Tool Call (WEB-018 §C.2)

- **Entry Points:** Response surface within an AI Conversation offering a Tool Call suggestion; direct action on a registered Tool Definition where permitted.
- **Primary Flow:** User confirms the Tool Call intent → AI Tool Call transaction opens → `AIToolCallRequested` emits via `ENG-024` → the tool-call-with-approval process routes via `ENG-011` per the Approval Policy → notification of resolution is delivered via `ENG-025`.
- **Alternate Flows:** Whitelisted Tool Definitions bypass the approval gate per policy; multi-step approval where the policy requires it.
- **Interruption / Resume:** The AI Tool Call transaction persists across sessions; the originating user is notified via `ENG-025` when approval resolves.
- **Offline / Online Transitions:** Tool Call requests are not submitted offline; a drafted request is retained locally and clearly indicated as pending submission until reconnected.
- **Exception Flows:** Approval denied → state reflects `Denied`; policy timeout → policy-defined outcome recorded; source-module invocation rejected under the invoker's authorization → tool call reflects failure state without partial mutation.

### C.3 Journey — Act on an AI Approval (WEB-018 §C.7)

- **Entry Points:** Push notification for a pending AI Approval; Governance → Approvals tab; direct deep link.
- **Primary Flow:** Approver opens the pending AI Approval → inspects requested Tool Definition, invocation context, retrieved grounding reference, requester identity, and policy in effect → acts `Granted` or `Denied` with reviewer notes → decision emits `AIApprovalGranted` or `AIApprovalDenied` via `ENG-024`.
- **Alternate Flows:** Delegate via `ENG-011`; escalate per policy; open on Web for full authoring context.
- **Interruption / Resume:** In-flight decision preserves reviewer notes until submission; the AI Approval transaction persists across sessions until resolved or timed out per policy.
- **Offline / Online Transitions:** Approve / deny actions are not submitted offline; the action is retained locally and clearly indicated as pending submission until reconnected.
- **Exception Flows:** Approver lacks scope → action rejected; item no longer eligible (state changed elsewhere) → surfaces a conflict state.

### C.4 Journey — Resume an AI Conversation (WEB-018 §C.1, §C.6)

- **Entry Points:** Conversations tab; shared conversation link within tenant scope; deep link.
- **Primary Flow:** User opens Conversation History → filters by source-module surface / participant / time range → opens a conversation → resumes at the last turn with grounded references intact.
- **Alternate Flows:** Share a conversation within tenant scope; open a referenced Prompt Version, Retrieval Corpus, or Tool Definition read-only.
- **Interruption / Resume:** Conversation state is durable per audit visibility rules per `ADR-014`.
- **Offline / Online Transitions:** Recently viewed conversations render from cache with an offline indicator; new turns require connectivity.
- **Exception Flows:** Access denied where policy prohibits; artifacts outside retention are surfaced as archived.

### C.5 Journey — Review the Prompt Publication Queue (WEB-018 §C.3, §C.11)

- **Entry Points:** Push notification for a pending Prompt Version review; Prompt Library → Review Queue.
- **Primary Flow:** Reviewer opens the pending Prompt Version → inspects business purpose, safety classification, and version notes → acts `Approve` or `Reject` with reviewer notes via `ENG-011`.
- **Alternate Flows:** Defer decision; open on Web for full authoring context; reassign per policy.
- **Interruption / Resume:** Reviewer notes are preserved across foreground / background transitions until submission.
- **Offline / Online Transitions:** Approve / reject actions are not submitted offline; retained locally and indicated as pending submission until reconnected.
- **Exception Flows:** Prompt Version already resolved elsewhere → surfaces a conflict state; reviewer lacks scope → routing re-evaluated.

### C.6 Journey — Monitor a Retrieval Corpus (WEB-018 §C.4)

- **Entry Points:** Retrieval tab; notification of a corpus refresh failure; deep link into a Retrieval Corpus.
- **Primary Flow:** User opens Retrieval Corpora → selects a corpus → inspects lifecycle state, bound source read-model references, refresh cadence, last-refreshed indicator, and recent refresh outcomes.
- **Alternate Flows:** Request an on-demand refresh where authorized (queued if offline); inspect ingestion health read-only.
- **Interruption / Resume:** Filter and selection state preserved across foreground / background transitions.
- **Offline / Online Transitions:** Recently viewed corpus details render read-only from cache; refresh requests are queued while offline (§G).
- **Exception Flows:** Refresh failure surfaced with reviewer notes; sensitive read models excluded per retrieval-authorization-at-query-time; access denied where policy prohibits.

### C.7 Journey — Inspect Tool Definitions and Tool Calls (WEB-018 §C.5)

- **Entry Points:** Tool Calling tab; notification of a resolved Tool Call; deep link into a Tool Definition or Tool Call.
- **Primary Flow:** User opens Tool Definitions or Tool Calls → filters by lifecycle state / requester / tool → opens a detail → reviews invocation constraints, approval-gate expectation, associated Approval, and source-module outcome.
- **Alternate Flows:** Open referenced Approval Policy read-only; open the originating AI Conversation.
- **Interruption / Resume:** Filter / selection state preserved.
- **Offline / Online Transitions:** Recently viewed details render read-only from cache; new detail loads require connectivity.
- **Exception Flows:** Access denied where policy prohibits; whitelisted tools indicated per policy.

### C.8 Journey — Review Governance Indicators on Mobile (WEB-018 §C.8, §C.9, §C.10)

- **Entry Points:** Governance tab; notification of a cost budget threshold or a safety governance change.
- **Primary Flow:** User opens Governance → reviews Approval Policies, Cost Budgets, Safety Governance, and Operational Reports (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency) read-only on mobile → drills into denied Tool Calls or pending approvals subject to authorization.
- **Alternate Flows:** Open an operational report for a scoped view; open on Web for full authoring context (Policy, Budget, Safety authoring remains Web-primary).
- **Interruption / Resume:** Filter and drill state preserved.
- **Offline / Online Transitions:** Recently viewed report snapshots render from cache with a freshness indicator; new queries require connectivity.
- **Exception Flows:** Access denied where policy prohibits; freshness indicator flags stale data.

### C.9 Journey — Audit-Visible History on Mobile (WEB-018 §C.6)

- **Entry Points:** Audit entry within Conversations, Prompt Library, Retrieval, or Tool Calling surfaces (Auditor persona and other authorized personas).
- **Primary Flow:** User opens the audit-visible history surface for the target entity → filters by time range / actor / entity within tenant scope → inspects publication, lifecycle, refresh, conversation, tool-call, or approval history — read-only.
- **Alternate Flows:** Deep link from an audit notification (if configured via `ENG-025`).
- **Interruption / Resume:** Filter state preserved.
- **Offline / Online Transitions:** Recently viewed records render read-only from cache; new queries require connectivity.
- **Exception Flows:** Records outside retention are surfaced as archived; access denied where policy prohibits.

## D. Mobile Navigation

Navigation groups are derived from Module Publication §3 (Approved Scope), which enumerates the AI Workspace submodules: Copilot Surfaces, Retrieval, Tool Calling, Prompt Library, and Governance. MOB-018 does not prescribe an information architecture beyond what the Published Module supports. Behaviour only — no visual designs.

### D.1 Bottom Navigation (Primary)

Primary mobile navigation exposes a compact set of tabs derived from the Publication's submodule set. For MOD-018 the derived set is:

- **Home** — persona-appropriate landing surface with recent AI Conversations, pending approvals, and Prompt review queue entries.
- **Copilot** — active copilot surface and AI Conversation history.
- **Prompts** — Prompt Library read-only browse and Review Queue.
- **Retrieval** — Retrieval Corpora read-only browse, refresh cadence indicator, ingestion health.
- **More** — Tool Calling (Tool Definitions, Tool Calls, Whitelisted Tools), Governance (Approvals, Approval Policies, Cost Budgets, Safety Governance, Operational Reports), and Audit-visible history entry.

Tabs are populated only when the corresponding capability is authorized for the current persona. Tabs the user cannot access are omitted rather than disabled.

### D.2 Side / Overflow Navigation

Where a device form factor exposes a side navigation (tablet) or overflow menu, the same submodule groupings are surfaced with the same authorization rules. No new navigation targets are introduced.

### D.3 Screen Hierarchy

Every mobile screen belongs to a single primary tab. Within a tab, screens follow a shallow hierarchy: catalog → detail → drill-down. Drill-down to a source-module surface leaves the AI Workspace area and is surfaced as outbound navigation.

### D.4 Deep-Link Entry Points

Deep links are supported for:

- An AI Conversation detail.
- A Prompt Version detail.
- A Retrieval Corpus detail.
- A Tool Definition detail.
- An AI Tool Call detail.
- An AI Approval detail (approver inbox target).
- An Approval Policy, Cost Budget, or Safety Governance detail (read-only on mobile).
- An operational report.

Every deep link is re-evaluated against the caller's authorization on resolution; unauthorized deep links surface an access-denied state and do not leak the target's existence beyond what Publication §4 permits.

### D.5 Back-Navigation Behaviour

- Back-navigation follows the platform-native pattern (system back on Android; navigation-bar back and swipe on iOS).
- Back from a detail returns to its catalog with prior filter / scroll state preserved.
- Back from a drill-down that crossed into a source-module surface returns to the originating AI Workspace screen.
- Back from an embedded copilot surface returns control to the invoking source-module mobile surface without carrying AI Workspace-owned state.
- Back from a notification-launched screen returns to the app's most recent primary tab (not to the notification).

## E. Mobile Screen Inventory

Each entry: purpose, business capability, primary actions, displayed business information, navigation relationships. Derived from the capabilities, master data, and transactions declared in the Module Publication. Visual layouts are out of scope.

### E.1 Mobile AI Workspace Home

- **Purpose:** Persona-appropriate mobile landing surface for AI Workspace.
- **Business Capability:** Copilot Surfaces; Governance overview (Publication §3).
- **Primary Actions:** Open Copilot, resume conversation, open pending approvals, open Prompt Review Queue.
- **Displayed Business Information:** Recent AI Conversations, pending AI Approvals within scope, recently published Prompt Versions, unread notifications summary.
- **Relationships:** Entry point to Copilot, Prompts, Retrieval, Tool Calling, Governance.

### E.2 Copilot Surface

- **Purpose:** Present the copilot conversation surface for an active source-module context on mobile.
- **Business Capability:** Copilot Surfaces; prompt-to-response process (Publication §3, §4.4).
- **Primary Actions:** Submit Prompt, Review Response, Request Tool Call, open grounded references, save / resume conversation.
- **Displayed Business Information:** Conversation turns, resolved workspace context, grounded references, suggested Tool Calls, freshness indicator on retrieved context.
- **Relationships:** Opens AI Conversation Detail (§E.4); routes to Tool Call Detail (§E.10); references Prompt Version Detail (§E.6) and Retrieval Corpus Detail (§E.7).

### E.3 AI Conversations Catalog

- **Purpose:** Browse AI Conversation transactions within scope on mobile.
- **Business Capability:** AI Conversation transaction authority (Publication §8).
- **Primary Actions:** Open, share (within tenant scope), archive.
- **Displayed Business Information:** Conversation identifier, participants, source-module surface, timestamps, resolution state.
- **Relationships:** Opens AI Conversation Detail (§E.4).

### E.4 AI Conversation Detail

- **Purpose:** Read AI Conversation history and grounded references on mobile.
- **Business Capability:** AI Conversation transaction authority; audit visibility per `ADR-014`.
- **Primary Actions:** Resume, share, review associated Tool Calls, open grounded references.
- **Displayed Business Information:** Turn-by-turn history, referenced Prompt Versions, referenced Retrieval Corpora, associated AI Tool Calls and AI Approvals.
- **Relationships:** Prompt Version Detail (§E.6); Retrieval Corpus Detail (§E.7); Tool Call Detail (§E.10); Approval Detail (§E.13).

### E.5 Prompt Library Browse

- **Purpose:** Browse Prompt master entries read-only on mobile.
- **Business Capability:** Prompt master authority (Publication §4.1).
- **Primary Actions:** Open Prompt Detail; filter by ownership / lifecycle state.
- **Displayed Business Information:** Prompt identifier, ownership, lifecycle state, Active Prompt Version indicator, last-published date.
- **Relationships:** Opens Prompt / Prompt Version Detail (§E.6) and Prompt Review Queue (§E.14).

### E.6 Prompt / Prompt Version Detail

- **Purpose:** Read a Prompt master and browse its Prompt Versions (immutable once submitted) on mobile.
- **Business Capability:** Prompt master and Prompt Version master authorities (Publication §4.1).
- **Primary Actions:** Open Version; open Review Queue if reviewer; open on Web for authoring.
- **Displayed Business Information:** Prompt definition, version list, Active version indicator, publication history, review notes.
- **Relationships:** Prompt Library Browse (§E.5); Prompt Review Queue (§E.14).

### E.7 Retrieval Corpora Browse and Detail

- **Purpose:** Browse Retrieval Corpus master entries and inspect a corpus read-only on mobile.
- **Business Capability:** Retrieval Corpus master authority; retrieval build-and-refresh process (Publication §4.2).
- **Primary Actions:** Open Detail; request refresh where authorized; inspect ingestion health.
- **Displayed Business Information:** Corpus identifier, bound source read-model references, refresh cadence, last-refreshed indicator, retention, lifecycle state, ingestion health.
- **Relationships:** Refresh Cadence Indicator (§E.8); Ingestion Health (§E.9).

### E.8 Refresh Cadence Indicator

- **Purpose:** Read-only view of `Retrieval refresh cadence` for a corpus / scope on mobile.
- **Business Capability:** Retrieval refresh cadence configuration authority (Publication §4.2).
- **Primary Actions:** Filter by scope; open corpus detail; open on Web for cadence authoring.
- **Displayed Business Information:** Schedule entries by tenant / company / context; upcoming refresh indicators; conflicts.
- **Relationships:** Retrieval Corpus Detail (§E.7).

### E.9 Ingestion Health

- **Purpose:** Read-only observation of Retrieval ingestion health on mobile.
- **Business Capability:** Read-model-only ingestion boundary (Publication §4.2).
- **Primary Actions:** Filter; drill into corpus.
- **Displayed Business Information:** Recent refresh outcomes, failure summaries, freshness indicators.
- **Relationships:** Retrieval Corpus Detail (§E.7).

### E.10 Tool Definitions Browse and Detail

- **Purpose:** Browse Tool Definition master entries and inspect a tool read-only on mobile.
- **Business Capability:** Tool Definition master authority; whitelisting for approval-gate bypass (Publication §4.3).
- **Primary Actions:** Open Detail; open on Web for authoring.
- **Displayed Business Information:** Tool identifier, bound source-module capability, invocation constraints, approval-gate expectation, safety classification, lifecycle state.
- **Relationships:** Tool Calls Catalog (§E.11).

### E.11 Tool Calls Catalog

- **Purpose:** Browse AI Tool Call transactions within scope on mobile.
- **Business Capability:** AI Tool Call transaction authority (Publication §8).
- **Primary Actions:** Open Detail; filter by state / requester / tool.
- **Displayed Business Information:** Tool Call identifier, tool definition, requester, current lifecycle state, associated Approval, source-module outcome.
- **Relationships:** Tool Call Detail (§E.12); Approval Detail (§E.13).

### E.12 Tool Call Detail

- **Purpose:** Read a single AI Tool Call transaction on mobile.
- **Business Capability:** AI Tool Call transaction authority; tool-call-with-approval process (Publication §4.3).
- **Primary Actions:** Open Approval Detail; view invocation context; view source-module outcome.
- **Displayed Business Information:** Requested Tool Definition, invocation context, retrieved grounding reference, Approval outcome, source-module outcome.
- **Relationships:** Approval Detail (§E.13); AI Conversation Detail (§E.4).

### E.13 AI Approval Detail

- **Purpose:** Read a single AI Approval transaction and act on it on mobile.
- **Business Capability:** AI Approval transaction authority (Publication §4.5, §8).
- **Primary Actions:** Grant, Deny (with notes), Delegate.
- **Displayed Business Information:** Requested Tool Call, invocation context, retrieved grounding reference, requester, policy in effect, decision history.
- **Relationships:** Tool Call Detail (§E.12); Approval Policy Detail (§E.15).

### E.14 Prompt Review Queue

- **Purpose:** Present Prompt Versions pending review-and-publish approval on mobile.
- **Business Capability:** Review-and-publish process authority (Publication §4.1); approvals via `ENG-011`.
- **Primary Actions:** Open item, Approve, Reject with notes, Reassign.
- **Displayed Business Information:** Pending Prompt Versions, requester, submission time, policy in effect.
- **Relationships:** Prompt / Prompt Version Detail (§E.6).

### E.15 Governance — Policies, Budgets, Safety (Read-Only on Mobile)

- **Purpose:** Read-only mobile view of Approval Policies, Cost Budgets, and Safety Governance in effect.
- **Business Capability:** Approval Policies, Cost Budgets, and Safety Governance configuration authorities (Publication §4.5).
- **Primary Actions:** Inspect entries; open Whitelisted Tools list; open on Web for authoring.
- **Displayed Business Information:** Scope, approver roles, whitelisted tools, timeout behaviour, budget windows, thresholds, current utilization indicator, safety configuration entries and recent enforcement outcomes.
- **Relationships:** Approvals Inbox (§E.16); Operational Reports (§E.17); Tool Call Detail (§E.12).

### E.16 Approvals Inbox

- **Purpose:** Present pending AI Approval transactions to authorized approvers on mobile.
- **Business Capability:** AI Approval transaction authority (Publication §4.5); approvals via `ENG-011`.
- **Primary Actions:** Open Detail; act Grant; act Deny; delegate.
- **Displayed Business Information:** Pending approvals, requester, tool, policy in effect, elapsed time.
- **Relationships:** AI Approval Detail (§E.13).

### E.17 Operational Reports

- **Purpose:** Present the published operational reports on mobile: AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency.
- **Business Capability:** Operational reports authority (Publication §4.5).
- **Primary Actions:** Open report; filter; drill down subject to authorization.
- **Displayed Business Information:** Report content rendered via `ENG-021`; freshness indicator.
- **Relationships:** AI Conversations (§E.3), Tool Calls (§E.11), Approvals Inbox (§E.16), Governance (§E.15).

### E.18 Notifications

- **Purpose:** Aggregate AI Workspace-originated notifications for the user (`AIConversationStarted`, `AIToolCallRequested`, `AIApprovalGranted`, `AIApprovalDenied`, pending review).
- **Business Capability:** Notification-driven consumption of AI Workspace events via `ENG-025`.
- **Primary Actions:** Open target; mark read; dismiss.
- **Displayed Business Information:** Notification type, target reference, timestamp, read state.
- **Relationships:** Opens the linked target screen.

### E.19 Settings & Session

- **Purpose:** Session, scope, notification preferences, and offline settings for AI Workspace on mobile.
- **Business Capability:** Cross-cutting user surface for AI Workspace consumption on mobile.
- **Primary Actions:** Sign out, switch tenant / company / context (where the platform allows), review notification preferences, review offline cache status.
- **Displayed Business Information:** Authenticated identity, active tenant / company / context, notification permissions, offline cache summary.
- **Relationships:** None outbound.

## F. Mobile Forms & User Interactions

Forms on mobile are limited to actions supported by the Published Module and appropriate for a mobile form factor. Field lists derive from the Master Data and Transaction Authorities in Module Publication §7–§8. Validation is business-level; technical validation is out of scope. Authoring of Prompt Master, Retrieval Corpus, Tool Definition, Approval Policy, Cost Budget, and Safety Governance remains Web-primary and is not surfaced as mobile authoring forms in MOB-018.

### F.1 Prompt Submission Form

- **Purpose:** Submit a prompt within a Copilot Surface on mobile.
- **Business Fields:** Prompt text, referenced Prompt Version (optional), attached documents (via `ENG-007` / `ENG-008` where the surface permits).
- **Required:** Prompt text.
- **Optional:** Referenced Prompt Version; attached documents.
- **Business Validation Rules:** Referenced Prompt Version must be Active; attached documents must be within scope; the copilot surface must be enabled for the tenant.
- **Save Outcome:** Local draft preserved.
- **Submit Outcome:** AI Conversation transaction opens (`AIConversationStarted` emits via `ENG-024`); response renders.
- **Cancel Outcome:** Draft discarded.
- **Retry Outcome:** On transient failure the draft is preserved and the user may retry; not submitted offline.

### F.2 Tool Call Request Form

- **Purpose:** Request a Tool Call from within an AI Conversation or a Tool Definition surface on mobile.
- **Business Fields:** Tool Definition reference, invocation context, business justification (where policy requires).
- **Required:** Tool Definition and invocation context; justification where policy mandates it.
- **Optional:** Reviewer-facing notes where the policy permits.
- **Business Validation Rules:** Tool Definition must be Active; invocation context must be within the requester's authorization; approval-gate expectation resolves against Approval Policies; whitelisting per policy bypasses the approval gate.
- **Save Outcome:** Local draft preserved.
- **Submit Outcome:** AI Tool Call transaction opens; `AIToolCallRequested` emits via `ENG-024`.
- **Cancel Outcome:** Draft discarded.
- **Retry Outcome:** Not submitted offline; retained locally as pending submission until reconnected.

### F.3 AI Approval Decision Form

- **Purpose:** Approver acts on a pending AI Approval on mobile.
- **Business Fields:** Decision (Grant / Deny), reviewer notes, delegation target (where applicable).
- **Required:** Decision; notes required on Deny.
- **Optional:** Delegation target.
- **Business Validation Rules:** Decision maker must be within scope and policy; delegation target must be authorized; item must still be eligible at submission time.
- **Save Outcome:** Not applicable (single-step decision).
- **Submit Outcome:** `AIApprovalGranted` or `AIApprovalDenied` emits via `ENG-024`; downstream Tool Call resolves accordingly.
- **Cancel Outcome:** Decision discarded; item remains pending.
- **Retry Outcome:** Not submitted offline; held locally as clearly pending submission until reconnected.

### F.4 Prompt Review Decision Form

- **Purpose:** Reviewer acts on a pending Prompt Version publication on mobile via `ENG-011`.
- **Business Fields:** Prompt Version reference, decision (Approve / Reject), reviewer notes.
- **Required:** Prompt Version reference, decision; notes required on Reject.
- **Optional:** Reassignment target where policy permits.
- **Business Validation Rules:** Reviewer must be within scope and policy; Prompt Version must still be pending at submission time; immutability of the submitted version is respected.
- **Submit Outcome:** Decision recorded via `ENG-011`; on Approve the version transitions to Active per the review-and-publish process; on Reject the version returns to Draft with reviewer notes.
- **Cancel Outcome:** Draft notes discarded; item remains pending.
- **Retry Outcome:** Not submitted offline; retained locally as pending submission until reconnected.

### F.5 Retrieval Refresh Request Form

- **Purpose:** Request an on-demand refresh of a Retrieval Corpus on mobile where authorized.
- **Business Fields:** Retrieval Corpus reference, requested scope, business justification (where policy requires).
- **Required:** Retrieval Corpus reference.
- **Optional:** Justification unless required by policy.
- **Business Validation Rules:** Corpus must be Active; requester must be within scope; retrieval never mutates source-module state; cadence-conflict validation is applied.
- **Submit Outcome:** Refresh queued via `ENG-013` where automated; last-refreshed indicator updates on completion.
- **Cancel Outcome:** Request discarded.
- **Retry Outcome:** Queued while offline per §G.

### F.6 Notification Preferences Form

- **Purpose:** Manage per-user notification preferences for AI Workspace-originated notifications within the permitted set exposed by `ENG-025`.
- **Business Fields:** Category (`AIConversationStarted`, `AIToolCallRequested`, `AIApprovalGranted`, `AIApprovalDenied`, pending review), delivery preference (as exposed by `ENG-025`).
- **Required:** Category and delivery preference.
- **Optional:** None.
- **Business Validation Rules:** Category and delivery preference must be within the permitted set.
- **Save Outcome:** Preference persisted; future notifications honour the change.
- **Submit Outcome:** Same as Save.
- **Cancel Outcome:** Local draft discarded.
- **Retry Outcome:** Queued while offline per §G.

### F.7 Filter / Scope Form (Conversations, Prompts, Retrieval, Tool Calls, Approvals, Reports, Audit-Visible History)

- **Purpose:** Apply filter / scope to a read-only viewing surface on mobile.
- **Business Fields:** Time range, entity scope, actor scope (audit only), classification filter (where applicable).
- **Required:** As dictated by the specific surface (typically time range for time-based views).
- **Optional:** Additional filter facets exposed by the surface.
- **Business Validation Rules:** Selections must be within the user's tenant / company / row-scope; sensitive classification filters respect the Safety Governance authority and Publication §4 authorities.
- **Save Outcome:** Filter state applied and persisted for the current session (and per persona where the surface supports personalisation).
- **Submit Outcome:** Not applicable — filters apply immediately.
- **Cancel Outcome:** Reverts to prior filter state.
- **Retry Outcome:** Filters that require a live query re-attempt on reconnect when offline.

## G. Mobile Collaboration

Collaboration on mobile is supported only where the Module Publication permits it (Publication §3–§4). MOB-018 introduces no new collaboration surfaces.

- **Shared Conversations:** AI Conversation transactions may be shared within tenant scope; conversation continuity persists across web and mobile sessions per the AI Conversation transaction authority.
- **Prompt Review Handoffs:** The Prompt review-and-publish process (§C.5, §F.4) routes via `ENG-011`; assignment, notes, and completion notifications are surfaced on mobile via `ENG-025`.
- **Tool-Call Approval Handoffs:** The tool-call-with-approval process (§C.3, §F.3) routes via `ENG-011`; approver actions, delegations, and outcomes are surfaced on mobile via `ENG-025`.
- **Shared Artifacts:** Prompt, Prompt Version, Retrieval Corpus, and Tool Definition master data are the shared artefacts. Only Active versions are consumed by mobile Copilot Surfaces; Draft and Inactive versions are visible only to authorized stewards on read-only surfaces.
- **Approval Notifications:** `AIApprovalGranted` and `AIApprovalDenied` outcomes are announced via `ENG-025` to the originating requester and audit-visible per `ADR-014`.
- **Concurrent-Edit Awareness:** Where a user opens a read-only mobile surface for an entity being authored on Web, a lifecycle-state indicator communicates the in-flight state without exposing draft content beyond scope.

## H. Mobile AI Interaction Experience

Documents only the AI capabilities published by MOD-018. No model implementation details.

### H.1 Prompt Submission

- Users submit prompts within a Copilot Surface bound to a resolved workspace context. Prompt Version references default to the tenant-active Prompt Version where the surface publishes one.

### H.2 Response Presentation

- Responses render with grounded references to Retrieved Context and referenced Prompt Version; freshness indicators apply to any retrieved content. Sensitive-data redaction applies where the user lacks row-level access.

### H.3 Task Execution Requests

- Suggested Tool Calls appear inline in the response surface. Users initiate an AI Tool Call transaction from the suggestion on mobile; execution never occurs without user confirmation (except for whitelisted Tool Definitions per policy).

### H.4 Approval Gates

- All AI-initiated state changes traverse the approval gate unless explicitly whitelisted. The mobile surface displays the pending Approval state and the currently applicable Approval Policy until the transaction resolves.

### H.5 Generated Artifact Review

- Where responses reference generated artefacts (documents attached via `ENG-007` / `ENG-008`, structured suggestions), users review the artefact on mobile before invoking any Tool Call. Artefacts remain within tenant and scope boundaries.

### H.6 Session Continuity

- AI Conversation transactions persist across sessions and across web and mobile surfaces; users resume prior conversations on mobile without re-establishing context.

### H.7 Contextual AI Assistance

- Embedded copilot entries from a source-module mobile surface open the copilot with the invoking surface as workspace context; contextual assistance never mutates the source-module transaction outside the tool-call-with-approval process.

## I. Accessibility

Aligned to `ADR-081` (Accessibility Standard). No implementation guidance; objectives only.

- **Screen-Reader Compatibility:** All interactive elements have accessible names; state changes (response received, tool-call submitted, approval resolved, refresh outcome, offline / online) are announced. Conversation surfaces provide summary-first announcements before detail traversal.
- **Touch-Target Sizing:** Every actionable target meets the platform accessibility baseline; hit areas remain generous on compact layouts.
- **Orientation Support:** Portrait is the primary orientation for phone form factors; landscape is supported for content-heavy surfaces (Conversation Detail, Operational Reports). Rotation preserves screen state.
- **Keyboard and Assistive Input:** External keyboards on tablet form factors expose consistent focus order and reachable actions; focus indicators remain visible; assistive-input paths reach every mobile action.
- **Focus Management:** Focus lands on the newest turn after a prompt submission; focus lands on the pending decision after opening an AI Approval; focus indicators are always visible.
- **Color-Independent Communication:** Lifecycle state (Draft / Active / Inactive / Archived), approval outcome (Granted / Denied / Pending), retrieval freshness, sensitive-data redaction, offline / online state, and error states are communicated by more than color alone (icon + text label).
- **Responsive Layouts:** Every screen reflows across phone and tablet form factors without loss of content or actions.
- **Localization:** All labels resolvable via `ENG-006`; layout tolerates text expansion on mobile form factors.

## J. Security Considerations

User-facing mobile security expectations derived from Module Publication §4 authorities and §11 engine / ADR consumption. No implementation mechanisms.

### J.1 Authentication Entry Points

- Access to AI Workspace on mobile requires authenticated identity per `ENG-001`. Unauthenticated launches direct to the platform-level sign-in surface owned by MOD-001; MOB-018 does not define authentication mechanics.
- Biometric unlock is an entry convenience only; it does not substitute for the platform authentication mechanism.

### J.2 Session Awareness

- The mobile surface communicates authenticated identity, active tenant / company / context, and configuration scope in a persistent surface element.
- Session expiration is communicated before it interferes with an in-progress action (prompt submission, tool-call request, approval decision).
- Backgrounding beyond the platform session envelope re-prompts for authentication on foreground per platform convention.

### J.3 Workspace Visibility & Authorization

- Tabs, screens, actions, and detail fields are gated by `ENG-002` / `ENG-003` per `ADR-032` (RBAC + ABAC). Users see only entities within their tenant, company, and row-level scope.
- Copilot surfaces render on mobile only when the tenant has `Enabled surfaces` configured for the surface.
- Prompt, Prompt Version, Retrieval Corpus, and Tool Definition catalogues honour tenant isolation per `ADR-011`. Cross-tenant navigation and sharing are not offered.
- AI Conversation sharing operates only within tenant scope.

### J.4 AI Usage Permissions

- Retrieval-authorization-at-query-time applies per Publication §4.2 on mobile: retrieved content excludes anything the querying user is not permitted to read.
- AI-initiated state changes traverse the approval gate per Publication §4.3 and §4.5 unless the Tool Definition is explicitly whitelisted by policy.
- Cost Budget thresholds influence allowed AI usage per scope; users see a policy-informed indicator when approaching a threshold.

### J.5 Audit Visibility

- Every state-changing action initiated on mobile (prompt submission, tool-call request, approval decision, prompt-review decision, refresh request, notification-preference change) is audit-visible per `ENG-004` and `ADR-014`. Users can inspect audit-visible history for the entities they own on the corresponding audit-visible surfaces (§C.9) within retention.

### J.6 Secure Handling of Business Information

- On-device cache (§G/§F) stores only content the user was authorized to view at capture time; sign-out clears the cache within the platform envelope.
- Downloaded artefacts (where the copilot surface permits document reference via `ENG-007` / `ENG-008`) are handed to the platform file-handling surface; MOB-018 does not define file-storage mechanics.
- Provider integration occurs exclusively via `ENG-028`; the mobile surface never surfaces provider identity or provider-native controls.
- Screenshots and screen-recording follow the platform convention for sensitive surfaces; no mechanism is defined by MOB-018.

### J.7 Tenant Isolation

- Tenant, company, and context boundaries per `ADR-011` are honoured identically on mobile; cross-tenant navigation is not permitted, and the active tenant / company / context is always communicated (§J.2).

## K. Traceability Matrix

Every MOB-018 feature is traced to the Published Module capability, the originating Sprint(s), and the related WEB-018 section for consistency reference only. WEB-018 is not a business source.

| MOB-018 Feature | Publication Capability (§) | Sprint(s) | Related WEB-018 Section |
| --- | --- | --- | --- |
| E.1 Mobile AI Workspace Home | Copilot Surfaces; Governance overview (§3) | SPR-MOD-018-004, 005 | E.1 |
| E.2 Copilot Surface / F.1 Prompt Submission / C.1 Prompt-to-response | Prompt-to-response process; AI Conversation transaction; `AIConversationStarted` (§4.4, §8, §9) | SPR-MOD-018-004 | E.2, F.4, C.1 |
| E.3 AI Conversations Catalog | AI Conversation transaction authority (§8) | SPR-MOD-018-004 | E.3 |
| E.4 AI Conversation Detail / C.4 Resume | AI Conversation transaction authority; audit visibility per ADR-014 (§8, §11) | SPR-MOD-018-004 | E.4, C.6 |
| E.5 Prompt Library Browse | Prompt master authority (§4.1) | SPR-MOD-018-001 | E.5 |
| E.6 Prompt / Prompt Version Detail | Prompt master and Prompt Version master authorities (§4.1) | SPR-MOD-018-001 | E.6 |
| E.7 Retrieval Corpora Browse and Detail / C.6 Monitor | Retrieval Corpus Master Authority; build-and-refresh (§4.2) | SPR-MOD-018-002 | E.8, C.4 |
| E.8 Refresh Cadence Indicator | Retrieval refresh cadence configuration authority (§4.2) | SPR-MOD-018-002 | E.9 |
| E.9 Ingestion Health | Read-model-only ingestion boundary (§4.2) | SPR-MOD-018-002 | E.10 |
| E.10 Tool Definitions Browse and Detail / C.7 Inspect | Tool Definition Master Authority (§4.3) | SPR-MOD-018-003 | E.11, C.5 |
| E.11 Tool Calls Catalog | AI Tool Call transaction authority (§8) | SPR-MOD-018-003 | E.12 |
| E.12 Tool Call Detail / F.2 Tool Call Request / C.2 Tool-call | AI Tool Call transaction authority; tool-call-with-approval; `AIToolCallRequested` (§4.3, §8, §9) | SPR-MOD-018-003 | E.13, F.5, C.2 |
| E.13 AI Approval Detail / F.3 Approval Decision / C.3 Approval | AI Approval transaction authority; `AIApprovalGranted` / `AIApprovalDenied` (§4.5, §8, §9) | SPR-MOD-018-005 | E.16, F.6, C.7 |
| E.14 Prompt Review Queue / F.4 Prompt Review / C.5 Review | Prompt review-and-publish process authority; approvals via ENG-011 (§4.1) | SPR-MOD-018-001 | E.7, C.3, C.11 |
| E.15 Governance — Policies, Budgets, Safety (read-only) / C.8 Review | Approval Policies, Cost Budgets, Safety Governance configuration authorities (§4.5) | SPR-MOD-018-005 | E.17, E.18, E.19, C.8, C.9 |
| E.16 Approvals Inbox | AI Approval transaction authority (§4.5); approvals via ENG-011 | SPR-MOD-018-005 | E.15 |
| E.17 Operational Reports / C.8 Reports | Operational Reports authority (AI Adoption, Tool-Call Success Rate, Cost per Surface, Approval Latency) (§4.5) | SPR-MOD-018-005 | E.20, C.10 |
| E.18 Notifications | Notification consumption via `ENG-025`; Publication §9 events | SPR-MOD-018-001, 002, 003, 004, 005 | (Web notifications equivalent) |
| E.19 Settings & Session | Cross-cutting user surface | SPR-MOD-018-001 | J.1, J.2 |
| F.5 Retrieval Refresh Request | Retrieval build-and-refresh process authority (§4.2) | SPR-MOD-018-002 | C.4 |
| F.6 Notification Preferences | Notification Engine consumption (`ENG-025`) | SPR-MOD-018-004, 005 | (Web preferences equivalent) |
| F.7 Filter / Scope | Read-only viewing surfaces | SPR-MOD-018-001, 002, 003, 004, 005 | E.3, E.5, E.8, E.11, E.12, E.15, E.20 |
| G Mobile Collaboration | Prompt review-and-publish; Tool-call-with-approval; AI Conversation sharing; audit visibility (§4.1, §4.3, §4.4, §11) | SPR-MOD-018-001, 003, 004, 005 | G |
| H Mobile AI Interaction Experience | Prompt-to-response process; retrieval grounding; tool-call-with-approval; provider integration via ENG-028 (§4.2, §4.3, §4.4) | SPR-MOD-018-002, 003, 004 | H |
| C.9 Audit-Visible History | Audit visibility per ADR-014 across §4.1–§4.5 authorities | SPR-MOD-018-001, 002, 003, 004, 005 | C.6 |
| I Accessibility | ADR-081 Accessibility Standard (§11) | Applies to all sprints | I |
| J Security | Authorities §4 + ADR-011, ADR-014, ADR-032 (§11); Retrieval-authorization-at-query-time; AI-initiated approval-gate rule (§4.2, §4.3) | Applies to all sprints | J |

No MOB-018 feature is absent from the traceability matrix. No feature in the matrix lacks an originating Sprint. MOB-018 introduces no capability, master data entity, transaction, event, engine, or ADR beyond those declared by `MOD-018_MODULE_PUBLICATION`.

## References

- [`docs/45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md`](../../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md)
- [`docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md`](../../40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md)
- [`docs/20-module-prds/ai/MODULE_PRD.md`](../../20-module-prds/ai/MODULE_PRD.md)
- [`docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`](../../30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md)
- [`docs/60-solution-design/web/WEB-018_AI_WORKSPACE.md`](../web/WEB-018_AI_WORKSPACE.md) — consistency reference only.
- [`docs/60-solution-design/README.md`](../README.md)
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](../SOLUTION_DESIGN_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
