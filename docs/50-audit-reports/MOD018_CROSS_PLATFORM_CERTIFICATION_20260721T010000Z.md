---
title: "MOD-018 AI Workspace — Cross-Platform Certification (CPC-018)"
summary: "Cross-Platform Certification verifying consistency across MOD-018 Publication, WEB-018, MOB-018, and API-018. Documentation-only certification."
report_id: "MOD018_CROSS_PLATFORM_CERTIFICATION_20260721T010000Z"
spec_id: "CPC-018"
module_id: "MOD-018"
module_name: "AI Workspace"
version: "1.0"
status: "Pass"
owner: "AI Platform"
layer: "audit"
updated: "2026-07-21"
tags: ["certification", "cross-platform", "MOD-018", "ai-workspace", "CPC-018"]
document_type: "Cross-Platform Certification"
source_publication: "docs/45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md"
inputs:
  - "docs/60-solution-design/web/WEB-018_AI_WORKSPACE.md"
  - "docs/60-solution-design/mobile/MOB-018_AI_WORKSPACE.md"
  - "docs/60-solution-design/api/API-018_AI_WORKSPACE.md"
---

# MOD-018 AI Workspace — Cross-Platform Certification (CPC-018)

Certifies consistency of WEB-018, MOB-018, and API-018 against the [`MOD-018 Publication`](../45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md). Documentation-only audit; introduces no new business requirements, workflows, screens, APIs, validation rules, permissions, events, or webhooks.

## 1. Inputs

- Publication: `docs/45-module-publications/ai/MOD-018_MODULE_PUBLICATION.md`
- Baseline (reference): `docs/40-module-baselines/MOD018_AI_WORKSPACE_BASELINE_v1.md`
- Module PRD (reference): `docs/20-module-prds/ai/MODULE_PRD.md`
- WEB: `docs/60-solution-design/web/WEB-018_AI_WORKSPACE.md`
- MOB: `docs/60-solution-design/mobile/MOB-018_AI_WORKSPACE.md`
- API: `docs/60-solution-design/api/API-018_AI_WORKSPACE.md`

Precedence: Publication → Baseline → PRD.

## 2. Executive Summary

WEB-018, MOB-018, and API-018 are cross-platform consistent and faithful to the MOD-018 Publication. All five authority groups (Prompt Library & AI Workspace Foundation, Retrieval Workspaces (RAG), Tool Calling on Module Capabilities, Copilot Surfaces & Conversations, Governance: Human-Approval Gates / Cost / Safety) are represented on every applicable surface. Intentional mobile exclusions (Prompt Library authoring, Retrieval Corpus authoring, Tool Definition authoring, Approval-policy and Cost-budget configuration) are declared and traced to Publication §4 and §13. The four published events (`AIConversationStarted`, `AIToolCallRequested`, `AIApprovalGranted`, `AIApprovalDenied`) appear verbatim in the API surface. Provider-integration exclusivity via `ENG-028` is preserved on all surfaces; MOD-018 imports no provider SDK. No deviations, no required corrections.

## 3. Compliance Matrix

| # | Dimension | Publication Anchor | WEB-018 | MOB-018 | API-018 | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Functional parity — Prompt Library & AI Workspace Foundation | §3, §4.1, §7 | Prompt Library authoring, versioning, review-and-publish | Read-only Prompt browsing; authoring excluded | Prompt / Prompt Version endpoints | PASS |
| 2 | Functional parity — Retrieval Workspaces (RAG) | §3, §4.2, §7 | Corpus authoring, build/refresh, cadence config | Retrieval consumption within conversations | Retrieval Corpus + build endpoints | PASS |
| 3 | Functional parity — Tool Calling on Module Capabilities | §3, §4.3, §7, §8 | Tool Definition authoring, tool-call lifecycle, approval gate | Tool-call initiation from mobile copilots with approval gate surfaced | Tool Definition + AI Tool Call endpoints; `AIToolCallRequested` | PASS |
| 4 | Functional parity — Copilot Surfaces & Conversations | §3, §4.4, §8 | Embedded copilots across modules; conversation lifecycle | Native mobile copilot surfaces; conversation lifecycle | AI Conversation endpoints; `AIConversationStarted` | PASS |
| 5 | Functional parity — Governance: Approval Gates, Cost & Safety | §3, §4.5, §8 | Approval inbox, Approval Policies, Cost Budgets, Safety config | Approval act-on surfaces (grant/deny) | AI Approval endpoints; `AIApprovalGranted`, `AIApprovalDenied` | PASS |
| 6 | Feature completeness — All 5 authority groups represented | §4.1–§4.5 | All present | 5/5 (authoring/config intentionally excluded) | All present | PASS |
| 7 | Workflow — Prompt lifecycle `Draft → Active → Inactive → Archived`; Prompt Versions immutable | §6, §7 | Publish/version flow; version immutability enforced server-side | Read-only | Lifecycle endpoints; immutable version resource | PASS |
| 8 | Workflow — Tool Definition lifecycle `Draft → Active → Inactive → Archived` | §7 | Publish flow with server-authoritative lifecycle | Read-only | Lifecycle endpoints | PASS |
| 9 | Workflow — Tool-Call-with-Approval | §4.3, §6 | Approval gate before invocation; AI-initiated state changes gated | Approval acted-on with server-authoritative resolution | Approval-gated capability call chain | PASS |
| 10 | Business rule — AI-initiated state changes require approval gate unless whitelisted (ENG-011, ADR-032) | §6 | Approval gate on every AI-initiated capability call | Inherited | Approval enforced server-side | PASS |
| 11 | Business rule — Retrieval never mutates source-module state; mutations occur exclusively via each source module's published capabilities under invoking user's authorization | §6, §13 | Read-model-only ingestion; state changes routed through source-module contracts | Inherited | Read-model-only ingestion; approval-gated invocation | PASS |
| 12 | Business rule — Retrieval respects module-level authorization at query time (ENG-002 / ENG-003) | §6, §11 | Query-time authorization surfaced | Inherited | Server-enforced query-time authorization | PASS |
| 13 | Business rule — Provider integration exclusively via `ENG-028`; MOD-018 imports no provider SDK | §6, §11, §15 | No provider SDK on web | No provider SDK on mobile | No provider SDK on API | PASS |
| 14 | Business rule — Prompts and Tool Definitions are versioned and audited (ENG-004, ADR-014) | §6, §11 | Audit surfaces present | Inherited | Audit enforced server-side | PASS |
| 15 | Validation rule consistency | §6 | Validation rules mirror server | Inherited (no offline-write authority) | Validation failures surfaced with structured errors | PASS |
| 16 | Role & permission consistency | §11 (ADR-032); PRD | AI Steward / business user roles | Same role set consumed | ENG-002/003 enforced | PASS |
| 17 | Security alignment — RBAC + ABAC, tenant isolation | §11 (ADR-011, ADR-032) | Tenant-scoped; row-level access at read time | Inherited; server-authoritative | Tenant-scoped enforcement | PASS |
| 18 | Error handling consistency | §11 (platform) | Form/session error surfaces | Native platform surfacing | Structured error taxonomy | PASS |
| 19 | Notification consistency — ENG-025 for approvals and copilot notifications | §11, §4.4, §4.5 | Approval and copilot notifications | Approval push notifications | Event-driven notifications | PASS |
| 20 | Accessibility consistency | §11 | A11y section present | Mobile a11y inherited | N/A (API) | PASS |
| 21 | Performance requirements | PRD / Publication §12 | Responsive envelopes documented | Native performance envelopes | Documented latency budgets | PASS |
| 22 | Audit requirements | §11 (ENG-004, ADR-014) | Audit trail surfaced | Inherited (server-authoritative) | Audit enforced server-side | PASS |
| 23 | GPS scope | Publication §4/§7/§11 authorize none | N/A on web | N/A on mobile (explicit) | N/A | PASS |
| 24 | Offline-write scope | Publication §4 declares no offline-write authority | N/A on web | N/A on mobile (read-only cache; approvals require online) | N/A | PASS |
| 25 | Events published — set and naming verbatim | §9 | `AIConversationStarted`, `AIToolCallRequested`, `AIApprovalGranted`, `AIApprovalDenied` surfaced | Event-driven notifications reference same set | Events verbatim: `AIConversationStarted`, `AIToolCallRequested`, `AIApprovalGranted`, `AIApprovalDenied` | PASS |
| 26 | Events consumed — all module domain events read-only via ENG-024 | §10 | Read-model-only ingestion boundary | Inherited | Read-model-only ingestion | PASS |
| 27 | Ledger effects — none declared by MOD-018 (owned by MOD-002) | §8, §15 | No ledger surfaces | No ledger surfaces | No ledger endpoints | PASS |
| 28 | Publication traceability — every SD claim maps to a Publication section | (governance) | §K (Traceability Matrix) | §K (Traceability Matrix) | §K (Traceability Matrix) | PASS |

## 4. Traceability Review

Every WEB-018 §E and §F entry, every MOB-018 §C and §E entry, and every API-018 §C and §E entry is anchored to Publication §3 (Approved Scope), §4 (Consolidated Authorities), §6 (Business Rules), §7 (Master Data Authorities), §8 (Transaction Authorities), §9 (Published Events), §10 (Consumed Events), or §11 (Platform Engine Usage). No SD element cites a source outside the Publication or its declared references (Baseline, PRD, Sprint PRDs).

## 5. Deviations

None. Intentional platform exclusions (mobile excluded from Prompt / Prompt Version / Retrieval Corpus / Tool Definition authoring and from Approval-policy and Cost-budget configuration; API exposes no consumer-facing webhooks beyond declared events) are traced to Publication §4 / §7 / §13, WEB-018 (authoring surfaces), MOB-018 (§A exclusions), and API-018 (§E events) and are not deviations. GPS and offline-write are `N/A` on mobile per Publication §4 / §7 / §11 (no authorizing authority, master data, transaction, or engine).

## 6. Risks

- **R-1 (Low):** Approval-gate correctness depends on ENG-011 delivery of policy evaluation (Publication §6 / §11); denial paths (`AIApprovalDenied`) are the mitigation surface across WEB-018, MOB-018, and API-018.
- **R-2 (Low):** Provider-integration exclusivity depends on ENG-028 remaining the sole boundary (Publication §6, §11, §15); any future direct-SDK proposal must return through GT-004 Baseline consolidation.
- **R-3 (Low):** Retrieval accuracy depends on read-model freshness via ENG-024 (Publication §10 / §11); read-only ingestion boundary prevents source-module drift, but stale corpora surface as retrieval-quality risk mitigated via `Retrieval refresh cadence` (Publication §4.2).

## 7. Required Corrections

None.

## 8. Outstanding Issues

None. Sidebar registration for CPC-018 and VR-018 is deferred to a downstream navigation update per the audit constraint (this certification does not modify `docs/_meta.json`); see VR-018 §3.

## 9. Certification Result

**PASS** — WEB-018, MOB-018, and API-018 are cross-platform consistent and faithful to `MOD-018_MODULE_PUBLICATION`.

## 10. Handoff

Repository state: `MOD018_CROSS_PLATFORM_CERTIFIED`. Next artifact: VR-018 Wave Verification.
