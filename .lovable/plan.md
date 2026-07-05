
# Pass 2 (v2, approved) — Author the Canon

## Charter

Treat `docs/canon.md` as the **constitution of BusinessOS ERP**. It is the highest-authority document in the repository. Every future PRD, architecture document, ADR, engine spec, module spec, and generated implementation must conform to it. Build it as a comprehensive principles document — **not** a feature specification.

## Front-matter conventions used inside the Canon

### Normative vs Informative

A short banner at the top of the Canon (right after the metadata) states:

> **Normative vs Informative.** Sections and clauses containing **MUST**, **MUST NOT**, **REQUIRED**, **SHALL**, **SHALL NOT** are **normative** and binding on every implementation and downstream document. Rationale, examples, and explanatory prose are **informative** and never override normative requirements. Where the two appear to conflict, the normative text wins.

RFC 2119 keyword conventions (MUST / SHOULD / MAY / MUST NOT / SHOULD NOT) are explicitly adopted and defined once in the preamble.

### Authority hierarchy (explicit)

Immediately after the normative-vs-informative banner, the Canon fixes the order of authority in the repository:

```text
Canon
  ↓
ADRs (Architecture Decision Records)
  ↓
Architecture Documents (02-architecture/*)
  ↓
Master PRD (01-master/prd.md)
  ↓
Module / Domain PRDs (04-domains/**)
  ↓
Sprint PRDs (Lovable sprint prompts)
  ↓
Implementation (source code)
  ↓
Tests
```

Rules (normative):

- **Canon overrides all other documents** until amended by an approved ADR.
- **An ADR can only override the Canon after the Canon is amended** to reflect it (amendment procedure below).
- **A PRD MUST NOT override an Architecture document.**
- **Generated code MUST NOT override documentation.** If code and docs conflict, docs win and code is corrected.
- **Tests MUST reflect the specification, not the current implementation.**

## Deliverable

A single, dense, self-contained `docs/canon.md` with a preamble (normative/informative banner, RFC 2119 keywords, authority hierarchy), **14 numbered chapters** (fixed order below), a **Laws of BusinessOS** section, and an **Amendment Procedure**. Target: 40–70 pages of markdown — authoritative but readable.

## Chapter outline (fixed order)

Every chapter uses the same shape: **Intent · Principles (numbered) · Rules (MUST / SHOULD / MUST NOT) · Rationale · Examples · Non-goals · Cross-references** to ADRs, engines, standards, and catalogs.

1. **Product Philosophy** — what BusinessOS is, what it is not, long-term vision, target customers (India → GCC → global; SME through enterprise across manufacturing, trading, retail, services, construction, field service, healthcare, education, multi-branch orgs).
2. **Product Principles** — simplicity over complexity, configuration over customization, automation over manual work, AI-first, mobile-first, API-first, offline-first for field users, multi-tenant by default, localizable by default.
3. **Architecture Principles** — cloud-native, multi-tenant, DDD, Clean Architecture, event-driven, CQRS where justified, plugin/extension framework, PostgreSQL as system of record. Includes the sharpened rule:

   > **Default architecture is a modular monolith. A transition to microservices REQUIRES an approved ADR demonstrating measurable operational or scalability benefits (concrete SLOs, throughput, blast-radius, team topology, or deployment independence).**

4. **Accounting Principles (the accounting constitution)** — double-entry integrity, immutable postings, voucher lifecycle (draft → validated → posted → cancelled-by-reversal), financial-year locking, audit trail, numbering (unique per company / FY / voucher type), tax handling (India: GST/TDS/TCS; GCC: VAT; extensible), multi-currency posting, cost centers/categories, no destructive edits on posted vouchers.
5. **Database Principles** — UUID primary keys, soft delete convention, mandatory audit columns (`created_at`, `created_by`, `updated_at`, `updated_by`, `tenant_id`, `deleted_at`), naming rules, foreign keys always defined, transactions around aggregate writes, optimistic locking via `row_version`, RLS on every tenant-scoped table.
6. **API Principles** — REST-first, versioning strategy (`/v1`, additive changes only), standard error envelope, pagination (cursor default), filtering DSL, idempotency keys on writes, bearer auth, rate limits, webhooks with signed payloads.
7. **UX Principles** — keyboard-first for back office, responsive, fast data entry, WCAG AA accessibility, consistent navigation, standard data grids, standard lookup dialogs, standard filter panels, mobile field UX (offline-first, low bandwidth).
8. **Security Principles** — RBAC with deny-by-default, least privilege, strict tenant isolation, encryption in transit and at rest, secret management, OWASP ASVS baseline, audit of all privileged actions.
9. **AI Principles** — AI assists users; **AI never silently posts financial transactions**; human-in-the-loop for any state-changing action; RAG-grounded answers preferred over free generation; explainability required; guardrails documented per surface; per-module Copilots follow one shared contract.
10. **Performance Principles** — measurable targets referenced from `performance.md`: dashboard first paint, voucher posting p95, list/search latency, report generation, mobile sync round-trip.
11. **Coding Principles** — strict TypeScript, SOLID, Clean Code, testability, documentation-with-code, no dead code, small modules, module boundaries enforced by lint rules.
12. **Documentation Principles** — every module needs a PRD, every API is documented, every architectural change requires an ADR, **the Canon overrides all other documents until an ADR amends it**, every document carries the standard metadata block, every downstream document MUST cite the Canon chapter(s) it conforms to.
13. **Definition of Done** — every feature ships with tests (unit + integration where applicable), documentation update, permissions matrix, audit coverage, localization keys, accessibility check, performance check, security review checklist.
14. **The Laws of BusinessOS** — short, numbered, non-negotiable:
    - **L1.** Every financial transaction creates balanced journal entries.
    - **L2.** Posted vouchers are immutable; corrections happen via reversal + re-post.
    - **L3.** Every record belongs to exactly one tenant.
    - **L4.** Every user action is auditable.
    - **L5.** Permissions are deny-by-default.
    - **L6.** Every API is versioned.
    - **L7.** Every module is extensible without modifying core code.
    - **L8.** Every tenant-scoped query is filtered by `tenant_id`.
    - **L9.** Money is stored with explicit currency and precision — never as a bare number.
    - **L10.** Time is stored in UTC; presented in tenant time zone.
    - **L11.** AI never silently changes state; every AI action is proposed, then approved.
    - **L12.** The Canon overrides all other documents until an ADR amends it.

**Amendment Procedure** — how the Canon is changed: propose an ADR referencing the affected Canon chapter, get approval, update the Canon chapter, bump the Canon `version`, add the ADR to `decision-register.md`, and record the change in a Canon "Change Log" section at the bottom.

## Standard metadata block (adopted repository-wide)

Extend the existing frontmatter schema with `document_type`, `version`, `created`, and `referenced_by`. Applied to the Canon in this pass; back-filled to other Level 1 docs as they are authored.

```yaml
---
title: "BusinessOS ERP Canon"
document_type: "Constitution"
summary: "The highest-authority document in the repository. All PRDs, ADRs, and code must conform."
layer: "platform"
owner: "Platform / Architecture Council"
status: "approved"
version: "1.0.0"
created: "2026-07-05"
updated: "2026-07-05"
depends_on: []
referenced_by: []
tags: ["canon","constitution","laws","principles"]
---
```

## Files touched

- **Author**: `docs/canon.md` — full constitution (preamble + 14 chapters + Laws + amendment procedure + change log).
- **Extend types + rendering**:
  - `src/lib/docs.ts` — add `document_type`, `version`, `created`, `referenced_by` to `DocFrontmatter`.
  - `src/routes/docs.$.tsx` — surface `document_type`, `version`, `created` in the header; render a "Referenced By" section when populated.
- **Landing pointer**: `src/routes/docs.index.tsx` — the Canon quick-link chip is labelled **Constitution** with a one-liner: "The highest-authority document. Every PRD, ADR, and implementation must conform."
- **No changes** to routing, packages, or other skeleton files.

## Explicit non-goals for Pass 2

- No content in any other doc (Vision, PRD, Architecture, engines, domain PRDs) — those are Pass 3+.
- No back-fill of the expanded metadata block into skeleton docs — that happens per doc as it gets authored.
- No new dependencies.

Approve to write the Canon.
