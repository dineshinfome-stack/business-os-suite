# Pass 8.2.5 — Author SPR-MOD-001-005 (Localization Packs)

Documentation-only pass. Fifth Platform Sprint PRD, structurally identical to Sprint 004, adding a Localization Ownership Convention with a clarified split between platform infrastructure and business-module localized content.

## 1. Create Sprint PRD

**File**: `docs/30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md`

Use `docs/99-templates/sprint-prd-template.md`. Match the 19-heading structure, terminology, disclaimers, and Review Gate wording established by SPR-MOD-001-004.

**Frontmatter**:
- `sprint_id: SPR-MOD-001-005`, `module_id: MOD-001`, `iteration: Sprint 5`, `size: Medium`, `status: Draft`, `owner: Platform`, `parent_module: MOD-001`, `parent_sprint_plan: MOD-001_SPRINT_PLAN.md`
- `related_engines`: ENG-001, ENG-004, ENG-005, ENG-024
- `related_adrs`: ADR-011, ADR-012, ADR-014, ADR-051
- `updated: 2026-07-06`

**Sections 1–18** (mirror Sprint 004):
1. Objective and Scope — In-Scope: pack registration/activation, default language/locale, currency defaults, number/date/time formatting, timezone defaults, regional business preferences, tenant- and company-level localization, audit integration. Out-of-Scope: translation authoring, runtime translation editing, country-specific taxation, country-specific accounting rules, payroll localization, regulatory compliance, marketplace, OCR language packs, AI language models.
2. Sprint Deliverables — pack lifecycle, activation/deactivation, locale inheritance, regional/formatting/currency/timezone defaults, metadata, audit artifacts, event contracts, documentation updates.
3. Traceability to `docs/20-module-prds/platform/MODULE_PRD.md` Localization sections; no orphan requirements.
4. User Stories — Platform Administrator: register/activate packs, change tenant locale, configure company locale, configure default currency, configure regional formatting, audit localization changes.
5. Acceptance Criteria — Given/When/Then covering activation, inheritance, formatting, locale/currency defaults, audit, visibility.
6. Parent Module Reference — MOD-001 Platform Administration.
7. Dependencies — Upstream: SPR-MOD-001-001..004. Downstream: SPR-MOD-001-006 and all listed business modules (Accounting, Purchase, Inventory, Sales, HRMS, Payroll, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk, Analytics, AI Workspace).
8. ERP Core Engine Consumption — ENG-001, ENG-004, ENG-005, ENG-024; no engine behavior redefined.
9. ADR Consumption — Accepted only: ADR-011, ADR-012, ADR-014, ADR-051. No Proposed ADRs.
10. Data Model Impact — Conceptual entities: Localization Pack, Locale, Currency Profile, Regional Format, Language Profile, Localization Preference. Include standard physical-schema disclaimer verbatim.
11. Events Published — table `Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee` with: `localizationpack.registered`, `localizationpack.activated`, `localizationpack.deactivated`, `locale.changed`, `currency.changed`, `regionalformat.changed`. Reference `docs/02-architecture/event-catalog.md`. Apply Event Ownership Convention. No payloads.
12. Definition of Done — per `SPRINT_AUTHORING_GUIDE.md`.
13. Sprint Exit Criteria — copied verbatim from `MOD-001_SPRINT_PLAN.md` entry for SPR-MOD-001-005.
14. Risks and Assumptions — deferred items as listed; assumes Sprints 001–004 complete.
15. Test Strategy — reference authoritative testing standard; cover activation, inheritance, locale resolution, formatting, audit, event publication.
16. Implementation Notes — standard non-authoritative disclaimer verbatim.
17. Review Gate — reuse Sprint 001 wording exactly.
18. References — same structure as prior Platform Sprint PRDs.

**Governance Callouts** in §1 (cross-referenced from §8/§10 where applicable), preserving prior conventions and adding:

> **Localization Ownership Convention.** Localization Packs define available regional capabilities and defaults. Business modules consume localization services and MAY contribute module-specific localized resources, but MUST NOT redefine localization lifecycle, activation rules, or inheritance established by the Platform module. Business modules own the localized business content they introduce (for example, regulatory labels, domain terminology, or module-specific resources), while the Platform module owns localization pack lifecycle, activation, inheritance, locale resolution, and regional defaults.

This mirrors the Event Ownership and Configuration Ownership Conventions — Platform owns the infrastructure; business modules own their domain-specific localized content — without introducing a new governance model.

## 2. Governance Registrations (derived docs only)

- `docs/SPRINT_CATALOG.md` — append one Draft row for SPR-MOD-001-005.
- `docs/30-sprint-prds/platform/README.md` — replace Sprint 005 placeholder with authored link; status `Draft (authored, Stage 2)`.
- `docs/DOCUMENT_INDEX.md` — exactly one S-block entry.
- `docs/_meta.json` — exactly one sidebar registration.
- `.lovable/plan.md` — append Pass 8.2.5 execution record.

No changes to `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`, `REPOSITORY_MAP.md` (category-level entries cover Sprint PRDs).

## 3. Repository Verification (`SPRINT_AUTHORING_GUIDE.md` §13)

1. Exactly one `DOCUMENT_INDEX.md` entry.
2. Exactly one Draft row in `SPRINT_CATALOG.md`.
3. Platform README links Sprint 005.
4. Exactly one `_meta.json` registration.
5. Structural parity with Sprint 004 (section count, ordering, terminology, governance callouts, disclaimers, Review Gate).
6. Cross-doc synchronization: Module PRD ↔ Sprint Plan ↔ Sprint Catalog ↔ README ↔ `_meta.json` ↔ derived indexes.

## Not Changed

No code, schema, SQL, migrations, APIs, UI, Module PRDs, ERP Core Engines, ADRs, Sprint Plans, or workflow documents.

## Outcome

SPR-MOD-001-005 authored as fifth Platform Sprint PRD with a refined Localization Ownership Convention that separates Platform-owned localization infrastructure from business-module-owned localized content, positioning MOD-001 for Pass 8.2.6 (SPR-MOD-001-006) and Pass 8.2.Z (MOD001_PLATFORM_BASELINE_v1).
---

## Execution Record — Pass 8.2.5 (2026-07-06)

Authored `docs/30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md` (fifth Platform Sprint PRD), mirroring the SPR-MOD-001-004 structure and adding the Localization Ownership Convention with an explicit split between Platform-owned localization infrastructure (pack lifecycle, activation, inheritance, locale/currency/timezone/format resolution surface) and business-module-owned localized content (regulatory labels, domain terminology, module-specific resources). Consumes ENG-001/004/005/006/018/024 and Accepted ADRs 011/012/014/051; owns the `localizationpack.*`, `locale.changed`, `currency.changed`, and `regionalformat.changed` events. Registered in DOCUMENT_INDEX.md, SPRINT_CATALOG.md, platform README.md, and _meta.json sidebar. No code, schema, Module PRDs, engines, ADRs, Sprint Plans, or workflow docs changed.
