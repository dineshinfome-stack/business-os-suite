# Pass 4C — Platform Constitution (v3, Final — Approved Structure)

Pass 4C authors **exactly three documents** — the Platform Constitution:
**API · Security · AI**.

Observability, Integration, and all runtime/operational concerns are **owned by Pass 4D** (Operational Architecture). This preserves clean layering:

| Pass | Responsibility | Question it answers |
|---|---|---|
| 4A | Enterprise Architecture | How is BusinessOS architected? |
| 4B | Data Constitution | How is data governed? |
| 4C | Platform Constitution | How does the platform behave? |
| 4D | Operational Architecture | How does the platform run? |

---

## Deliverables (Pass 4C — three documents only)

All three overwrite existing stubs, vendor-neutral, conforming to Canon and Passes 4A/4B.

### 1. `docs/02-architecture/api-architecture.md`
Overview · API Principles (AP-01…N) · API Style (REST-first; when GraphQL/RPC are permitted) · Resource Model & URL Conventions · Versioning Strategy · Request Conventions (headers, tenant/company/branch scope, idempotency keys, correlation IDs) · Response Conventions · Error Model (canonical envelope, error codes, correlation) · Pagination (cursor-based default) · Filtering & Sorting · Search Semantics · Bulk & Batch Operations · Long-Running Operations · Idempotency · Concurrency (ETag/version) · Webhooks (delivery, signing, retries, replay) · Event Publishing vs API · Rate Limiting & Quotas · **Deprecation Policy** ·
**API Lifecycle Governance** (immediately after Deprecation Policy):
  - States: **Draft · Preview · General Availability (GA) · Deprecated · Sunset · Retired**.
  - For each: Purpose · Intended Audience · Stability Expectations · Compatibility Requirements · Documentation Requirements · Exit Criteria.
  - Backward compatibility expectations · Version support philosophy · Deprecation communication principles · Sunset notice expectations.
  - Architectural governance only — no tooling, gateways, or CI/CD.
· SDK/Contract Generation Principle · API Decisions Pending · Conforms to Canon · References.

### 2. `docs/02-architecture/security-architecture.md`
Overview · Security Principles (SP-01…N) · Threat Model at Platform Level · Authentication · Authorization Model (RBAC + ABAC principles; role/permission taxonomy; least privilege) · Tenant Isolation Enforcement (identity claim → RLS → cache/transport) · **Data Classification** (Public / Internal / Confidential / Financial / Personal / Sensitive) · Encryption (in transit, at rest, at column where applicable, key management principle) · Secrets Management · Audit & Non-Repudiation · Privileged Access & Break-Glass · Input Validation & Trust Boundaries · Rate Limiting & Abuse Controls · Supply-Chain Security Posture ·
**Compliance Architecture & Posture** (renamed from "Compliance Posture"):
  - Architectural approach to regulatory compliance.
  - Separation between compliance architecture and certification (posture only; MUST NOT claim certification or regulatory approval).
  - Compliance-by-design principles.
  - Regulatory adaptability across jurisdictions (GDPR-style erasure, statutory retention, data residency, SOC/ISO alignment as posture).
  - Relationship to audit, retention, security, and data governance.
· Incident Response Principles · Security Decisions Pending · Conforms to Canon · References.

### 3. `docs/02-architecture/ai-architecture.md`
Overview · AI Principles (AIP-01…N) · Copilot Contract · AI Capability Taxonomy ·
**AI Capability Classification Matrix** (immediately after Capability Taxonomy):
  - Markdown table. Columns: **Capability · Read Data · Suggest Actions · Execute Actions · Human Approval Required · Typical Use Cases**.
  - Populated for at least **Assistant**, **Copilot**, **Agent**.
  - Assistant is informational only; Copilot may prepare actions but requires user approval; Agents may execute only within explicitly approved scopes and must never bypass RBAC, RLS, workflow, or audit.
· Tool-Calling Model (registry, capability scoping, tenant/domain scoping, dry-run vs execute) · Retrieval & RAG Governance (indexability, tenant scoping, freshness, PII in embeddings) · Prompt Governance (system prompts as versioned artifacts, prompt-injection defence, output constraints) · AI Permissions (AI acts as a scoped principal; never bypasses RBAC/RLS; distinct AI actor identity in audit) · Human-in-the-Loop (approval thresholds; reversible vs irreversible actions; financial actions always confirm) · Hallucination Controls (grounding, refusal contract, confidence surfacing) · Model Provider Abstraction (vendor-neutral) · Cost & Quota Governance · Observability & Evaluation · Safety & Content Policy · AI Decisions Pending · Conforms to Canon · References.

---

## Consistency Requirements

Every Pass 4C document must:
- Include standard frontmatter (`title`, `summary`, `layer: platform`, `owner: Platform`, `status: approved`, `updated`, `tags: ["architecture"]`, `depends_on`, `referenced_by`).
- Include a **Conforms to Canon** section citing specific Canon rules.
- Include a **Decisions Pending** section (topic · why deferred · rough window · owner) with ADR placeholders.
- Remain vendor-neutral. Verbatim clause: *"Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation."*
- Cross-reference Pass 4A/4B docs via `depends_on`.

## Portal / Navigation

`docs/_meta.json` — `02-architecture` group already lists Security, API, AI after Reference Data. No reordering. No route, package, or UI changes.

## Deferred to Pass 4D (not authored here)

Pass 4D — Operational Architecture — will author:
- Deployment Architecture
- DevOps Architecture
- Testing Strategy
- **Observability Architecture** (deferred from earlier drafts of 4C)
- **Integration Architecture** (deferred from earlier drafts of 4C)
- UI/UX Design System
- UX Standards
- Coding Standards
- **Quality Attributes** (`docs/quality-attributes.md`) — single source of truth for measurable platform quality goals (availability, reliability, scalability, performance, maintainability, recoverability, security qualities, accessibility, localization, offline capability, DR objectives). Elevated to an explicit deliverable because multiple existing documents reference it.

## Non-Goals for Pass 4C

❌ Endpoint catalogs · ❌ Model/provider names · ❌ IAM policy JSON, RLS SQL · ❌ Secret values · ❌ Prompt content · ❌ SDK code · ❌ Gateway products or CI/CD tooling · ❌ Deployment content · ❌ Testing strategy · ❌ Design-system content · ❌ Observability tooling · ❌ Integration middleware · ❌ Certification or regulatory-approval claims.

## Acceptance Criteria

✓ Only three documents authored in Pass 4C: API · Security · AI.
✓ Canonical error envelope + cursor pagination + idempotency + webhook signing/retry/replay defined.
✓ **API Lifecycle Governance** section present with all six states fully specified.
✓ **Data Classification** section present with all six tiers.
✓ Security section titled **Compliance Architecture & Posture** and expanded (compliance-by-design, jurisdictional adaptability, posture-not-certification clause).
✓ RBAC + ABAC principle articulated; role/permission taxonomy defined.
✓ **AI Capability Classification Matrix** present, populated for Assistant / Copilot / Agent.
✓ AI acts as a scoped principal; never bypasses RBAC/RLS; distinct AI actor in audit; financial/irreversible actions always confirm.
✓ Model provider abstraction is vendor-neutral.
✓ Every doc has Decisions Pending with ADR placeholders.
✓ Observability and Integration Architecture are **not** created in this pass; they are held for Pass 4D alongside Quality Attributes.
✓ Zero implementation details, tooling, gateway products, SDKs, or provider names leaked.
