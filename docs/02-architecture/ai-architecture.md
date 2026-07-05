---
title: "AI Architecture"
summary: "The AI constitution for BusinessOS: copilot contract, capability taxonomy and classification, tool-calling model, RAG governance, prompt governance, AI-as-scoped-principal, human-in-the-loop, hallucination controls, model provider abstraction, and cost governance."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "ai", "platform", "pass-4c"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-standards"
  - "02-architecture/multi-tenant-architecture"
  - "02-architecture/data-dictionary"
  - "02-architecture/api-architecture"
  - "02-architecture/security-architecture"
referenced_by: []
---

# AI Architecture

> Part of **Pass 4C — Platform Constitution**. Defines the platform-wide contract for how AI is embedded in BusinessOS: how it perceives, how it acts, how it is authorized, how it is governed, and how it is contained. It does **not** name specific models, prompts, providers, SDKs, embedding schemas, or vector engines — those are downstream of this document.

## Overview

BusinessOS treats AI as a **first-class platform citizen**, not as a bolt-on feature. AI capabilities span assistant-style Q&A, copilot-style drafting and preparation, and agent-style execution within approved scopes. Every AI surface — whether embedded in a form, exposed through the copilot, or driving an automation — obeys the principles in this document. Uniform governance is what makes AI safe to expose across accounting, inventory, payroll, and customer-facing modules on the same platform.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## AI Principles

- **AIP-01 — AI is a scoped principal.** Every AI capability acts on behalf of an identifiable principal within a defined scope; there is no "AI mode" that bypasses authorization.
- **AIP-02 — Never bypasses RBAC, RLS, workflow, or audit.** AI reads and writes flow through the same authorization, tenant isolation, workflow, and audit rails as any other principal.
- **AIP-03 — Grounded by default.** AI responses about tenant data are grounded in retrievable, cited sources; ungrounded generation is called out to the user.
- **AIP-04 — Human-in-the-loop for consequential actions.** Irreversible, financial, or externally visible actions require explicit human approval, always.
- **AIP-05 — Vendor-neutral by architecture.** Models, providers, and runtimes are abstracted so capabilities are not locked to any one vendor.
- **AIP-06 — Deterministic contracts, non-deterministic engines.** The platform's contracts around AI (schemas, permissions, audit) are deterministic; only the generative step is probabilistic.
- **AIP-07 — Observability parity.** AI operations produce the same class of logs, metrics, and traces as any other operation, with additional AI-specific signals.
- **AIP-08 — Cost is a design constraint.** Cost and latency envelopes are declared alongside functional requirements for every AI capability.
- **AIP-09 — Refusal is a valid outcome.** An AI capability that cannot answer safely or within policy MUST refuse clearly rather than approximate.
- **AIP-10 — Prompt injection is assumed.** Every ingested source is treated as potentially adversarial; user, retrieved, and tool-returned content are structurally separated in prompts.

## Copilot Contract

The Copilot is the platform's canonical AI surface. Its contract binds every module that participates in it.

- **Scope of address** — the Copilot addresses tenant-scoped questions, drafts, and preparatory actions across the modules the current user is authorized for.
- **Grounding requirement** — factual claims about tenant data cite the underlying records, documents, or reports they were drawn from.
- **Action model** — the Copilot may *suggest* and *prepare* actions; it *executes* only through explicitly consented flows.
- **Refusal contract** — when the request is out of scope, insufficiently grounded, or blocked by policy, the Copilot MUST state so plainly and offer a permissible alternative when possible.
- **Session model** — Copilot conversations are tenant- and user-scoped; there is no cross-tenant memory and no cross-user leakage.
- **Explainability** — when the Copilot acts, its intent, inputs, tools invoked, and outcome are captured in the audit trail alongside the underlying business record.

## AI Capability Taxonomy

Three capability tiers are recognized platform-wide. Every AI feature MUST be classified into exactly one tier and MUST document that classification in its module PRD.

- **Assistant** — informational only. Reads user context, answers questions, explains concepts, summarizes records. Does not prepare or execute state changes.
- **Copilot** — prepares state changes. Reads context, drafts records (invoices, purchase orders, journal entries, replies), proposes actions and their consequences, and hands them to a human for review and approval.
- **Agent** — executes state changes. Operates within an explicitly approved scope, may act autonomously within that scope, and MUST NOT exceed it. Agents remain subject to RBAC, RLS, workflow approvals for consequential actions, and full audit.

### AI Capability Classification Matrix

| Capability | Read Data | Suggest Actions | Execute Actions | Human Approval Required | Typical Use Cases |
|---|---|---|---|---|---|
| **Assistant** | Yes, within user scope | No | No | N/A | Ask *"what were last month's sales?"*; explain a report; summarize a customer's history; look up a policy. |
| **Copilot** | Yes, within user scope | Yes, prepared drafts and previews | No — only on explicit user approval | Yes, for every action | Draft an invoice from a quote; propose journal entries from a bank statement; suggest a payroll adjustment; compose a customer reply. |
| **Agent** | Yes, within the agent's approved scope | Yes | Yes, within the agent's approved scope | Yes for consequential actions; workflow rules govern the rest | Auto-reconcile bank lines that match unambiguously; auto-tag documents; escalate stalled workflows; generate scheduled reports. |

Rules that apply to every tier:

- An Assistant that begins to prepare actions has become a Copilot and MUST be reclassified and re-governed.
- A Copilot that begins to execute actions without per-action approval has become an Agent and MUST be reclassified.
- Agents MUST never bypass RBAC, RLS, workflow, or audit; their approved scope narrows what they may do, it does not widen it beyond what a human peer could do.
- Every tier is subject to the refusal contract, the retention rules, and the observability requirements below.

## Tool-Calling Model

AI capabilities interact with the platform through a registry of **tools**. Tools are the only path from generative reasoning to platform effect.

- **Tool registry** — every tool is registered with a specification: name, description, input schema, output schema, side-effect classification (read / write / external), and required permissions.
- **Capability scoping** — an AI capability declares the tools it may invoke; the runtime enforces this list. A capability cannot reach a tool it did not declare.
- **Tenant and domain scoping** — tools are further scoped by tenant and domain. A tool exposed in one domain is not implicitly available in another.
- **Permission passthrough** — invoking a tool is subject to the AI principal's RBAC and ABAC permissions. A tool call that would fail as a human call fails identically as an AI call.
- **Dry-run vs execute** — write-capable tools support a dry-run mode that returns the *would-be* effect without persisting; Copilots use dry-run to build previews.
- **Determinism at the seam** — tool inputs and outputs are validated against schemas; malformed generative output is rejected before it reaches the platform.
- **Audit** — every tool call is audited with correlation to the originating AI session, prompt, and (where applicable) the retrieved sources used.

## Retrieval & RAG Governance

Retrieval-Augmented Generation is the platform's default grounding mechanism. It is governed as strictly as any data-access path.

- **Indexability** — data is indexed for retrieval only when its classification tier permits and its owner has declared it retrievable. Sensitive-tier data is not indexed unless an explicit policy exception exists.
- **Tenant scoping** — retrieval is tenant-scoped by construction. Cross-tenant retrieval is impossible by design, not by filter.
- **Permission-aware retrieval** — retrieval results respect the requester's permissions; a document not readable to the user is not retrievable through the AI.
- **Freshness contracts** — every retrieval surface documents its freshness envelope; AI responses that depend on fresher data than the surface guarantees MUST say so.
- **PII in embeddings** — embeddings derived from Personal- or Sensitive-tier data are themselves classified at the source tier and stored under equivalent controls; embedding stores are not a loophole around classification.
- **Provenance** — every retrieved chunk carries provenance (source, version, timestamp, permission context) usable for citation and audit.
- **Right-to-erasure alignment** — erasure of source data cascades to derived indexes and embeddings under the platform's retention rules; embeddings are not a shadow copy exempt from statutory rights.

## Prompt Governance

Prompts are **software artifacts** and are governed as such.

- **Versioned artifacts** — system prompts, tool descriptions, and guardrail prompts live under version control with owners, review, and changelogs.
- **Structural separation** — trusted (system) content, retrieved (grounded) content, tool output, and user input are structurally separated in the composed prompt; ingested content MUST NOT be able to escalate to system authority.
- **Prompt-injection defence** — inputs from documents, emails, tickets, and external sources are treated as adversarial. Retrieval and tool-return content is delimited and stripped of directive framing before use.
- **Output constraints** — where structured output is required, prompts declare the schema and the runtime validates against it; invalid outputs are rejected or repaired, never trusted.
- **Language and localization** — system prompts respect the user's locale and the tenant's language settings; refusals remain intelligible in the user's language.
- **Content policy** — prompts and outputs are subject to a written content policy covering safety, professionalism, and jurisdictional obligations.

## AI Permissions

- **AI is a distinct principal class**, not a technical bypass. AI actors have identities, credentials, and audit trails.
- **Actor identity** — every AI action carries a distinct actor identity in the audit record, distinguishable from the initiating human (when there is one) and from other AI actors.
- **Scope inheritance** — an AI acting on behalf of a user inherits the user's permissions and MUST NOT exceed them. An autonomous agent acts on its own principal, whose permissions are narrower than any human role and are explicitly enumerated.
- **No bypass** — there is no permission that grants "AI override" of RBAC, RLS, workflow approvals, or audit. If an action cannot be performed by any human role at any tier, AI cannot perform it.
- **Attribution** — records created or modified by AI are attributed to both the AI actor and the initiating user; both appear in audit and, where user-visible, in the record history.

## Human-in-the-Loop

- **Reversible vs irreversible** — actions are classified as reversible (drafts, notifications, tags, non-financial edits within a review window) or irreversible (postings, external notifications, payments, exports, deletions beyond soft-delete).
- **Approval thresholds** — reversible actions MAY be executed by Agents within approved scope without per-action approval; irreversible actions REQUIRE explicit human confirmation.
- **Financial actions always confirm** — any action that affects a ledger, a payment, a tax filing, a payroll disbursement, or an externally visible financial artifact REQUIRES explicit human approval, regardless of tier or configuration.
- **Batch actions** — a batch that contains any irreversible or financial item is treated as irreversible in whole and confirmed as a batch.
- **Approval traceability** — approvals are captured with actor, timestamp, correlation id, and the exact preview presented to the approver.
- **Revocation** — approvals granted in error MUST be revocable within the platform's compensating-action window; irrevocable actions taken past that window follow standard reversal workflows.

## Hallucination Controls

- **Grounding-first** — factual claims about tenant data MUST be traceable to retrieved sources; unsourced claims are prefaced with an explicit uncertainty marker or refused.
- **Refusal contract** — the AI refuses clearly when it cannot answer safely, cannot ground its answer, or would violate policy. Refusal names the reason at the appropriate abstraction (e.g. *"I don't have access to that data"* rather than internal error text).
- **Confidence surfacing** — where confidence signals exist, they are surfaced to the user in a form actionable at the UI (e.g. "high confidence", "needs review"), not as raw scores.
- **Schema validation** — structured outputs are validated; free-text outputs pass through content-policy filters before display.
- **Consequence gating** — the greater the potential consequence, the stricter the grounding requirement and the higher the approval threshold.
- **Continuous evaluation** — AI outputs are sampled and evaluated for accuracy, safety, and drift; evaluation results feed back into prompt and capability governance.

## Model Provider Abstraction

- **Provider-agnostic interfaces** — the platform interacts with generative models through an internal interface, not vendor SDKs directly. Swapping providers or models is a configuration change, not a code migration.
- **Capability profiles** — models are described by capability profile (context window, structured-output support, tool-calling support, latency band, cost band, safety controls), not by brand name.
- **Multi-provider by design** — the architecture accommodates multiple concurrent providers so that different capabilities can be routed to the most appropriate model.
- **Regional routing** — where data residency requires it, model calls are routed to compliant regional providers; residency constraints override capability optimization.
- **Fallback and degradation** — capabilities degrade gracefully when a preferred model is unavailable; degraded modes are user-visible.
- **No vendor lock-in** — no domain, feature, or module encodes a specific provider or model identifier in its business logic.

## Cost & Quota Governance

- **Cost envelopes** — every AI capability declares an expected cost envelope per operation; excursions beyond the envelope are surfaced as operational events.
- **Per-tenant quotas** — tenants have declared quotas for AI usage; quotas are enforceable, observable, and configurable per plan.
- **Per-user quotas** — heavy-use surfaces expose per-user quotas to prevent single-user runaway.
- **Rate limiting** — AI endpoints participate in the standard rate-limiting model; excess is signalled via the canonical error envelope with retry guidance.
- **Cost attribution** — every AI operation is attributable to a tenant, a capability, a principal, and (where applicable) a business record.
- **Budget alerts** — tenants receive proactive notice as quota consumption approaches configured thresholds.

## Observability & Evaluation

- **Standard telemetry parity** — AI operations produce logs, metrics, and traces on the same rails as any other operation.
- **AI-specific telemetry** — additionally captured: model identifier (or profile), prompt version, tool calls, retrieval sources used, token or unit counts, latency components, refusal reasons, and post-action outcomes.
- **Correlation** — every AI operation is correlated to the initiating request, the resulting business action(s), and the audit records they produced.
- **Evaluation datasets** — capabilities are evaluated against curated datasets before release and continuously in production through sampling; results feed capability governance.
- **Feedback loops** — user feedback (thumbs, corrections, escalations) is captured and attached to the underlying operation for evaluation and regression detection.
- **Detailed telemetry design belongs to Observability Architecture (Pass 4D);** this document establishes the requirements it must satisfy.

## Safety & Content Policy

- **Written content policy** — the platform maintains a written AI content policy covering professionalism, non-discrimination, safety-critical topics, and jurisdictional obligations. Every AI surface conforms to it.
- **Sensitive topics** — capabilities that intersect legal, medical, or financial advice are constrained to informational output and MUST refer users to qualified sources.
- **Localization of policy** — refusals and safety messages are localized to the user's language.
- **Reporting** — users can report AI outputs; reports enter a review queue and can trigger capability degradation until reviewed.

## AI Decisions Pending

| Topic | Why Deferred | Rough Window | Owner | ADR Placeholder |
|---|---|---|---|---|
| Model roster and capability profiles | Requires ongoing evaluation against evolving providers. | Continuous, revisited per release. | Intelligence + Platform | ADR-TBD |
| Retrieval store and embedding strategy | Depends on scale, cost, and residency choices. | Pre-Copilot GA. | Intelligence + Data | ADR-TBD |
| Structured-output validation approach | Depends on model capability adoption. | Pre-Copilot GA. | Intelligence | ADR-TBD |
| Agent scope catalogue (which agents exist and what they may do) | Emerges as automation capabilities mature. | Post-Copilot GA, iterative. | Domain owners + Intelligence | ADR-TBD |
| Cost accounting granularity and tenant-facing surfacing | Depends on cost model of chosen providers. | Pre-GA and revisited. | Platform + Finance | ADR-TBD |
| Continuous evaluation methodology and thresholds | Requires operational baseline. | Post-GA. | Intelligence | ADR-TBD |
| Content-policy specifics per jurisdiction | Requires jurisdictional legal review. | Per market entry. | Legal + Intelligence | ADR-TBD |

*Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.*

## Conforms to Canon

- **A.3 / A.4** — AI Architecture is authoritative for AI governance; PRDs and code conform to it.
- **P.2** — Normative language follows RFC 2119.
- **Canon AI chapter** — AI is a scoped principal; never bypasses RBAC, RLS, workflow, or audit; financial actions always require human confirmation.
- **Canon multi-tenancy chapter** — retrieval, memory, and tool invocation are strictly tenant-scoped.
- **Canon audit chapter** — every AI action is captured with distinct AI actor identity and full correlation.
- **Canon evolution chapter** — models, providers, and prompts evolve through governed change, not silent updates.

## References

- Master Architecture (Pass 4A)
- Domain Map (Pass 4A)
- Multi-Tenant Architecture (Pass 4B)
- Data Dictionary (Pass 4B)
- API Architecture (Pass 4C)
- Security Architecture (Pass 4C)
- AI Copilot (09-AI)
- Tool Calling (09-AI)
- RAG (09-AI)
- AI Guardrails (09-AI)
- ADR-0008 — AI Copilot Pattern
- BusinessOS Canon
