---
title: "SPR-MOD-001-005 — Localization Packs"
summary: "Sprint PRD for the localization-pack layer of MOD-001 Platform Administration: locale-pack registration and activation lifecycle; default language, locale, currency, timezone, and regional formatting; tenant- and company-scoped localization preferences; locale inheritance across the Tenant → Company → Branch → Financial Year hierarchy (consumed from ENG-005); audit integration; and localizationpack.*, locale.*, currency.*, and regionalformat.* events. Consumes upstream layers; never redefines them."
layer: "delivery"
owner: "Platform"
status: "Draft"
updated: "2026-07-06"
sprint_id: "SPR-MOD-001-005"
parent_module: "MOD-001"
iteration: "Sprint 5"
stage: "2"
pass: "8.2.5"
related_engines: ["ENG-001", "ENG-004", "ENG-005", "ENG-006", "ENG-018", "ENG-024"]
related_adrs: ["ADR-011", "ADR-012", "ADR-014", "ADR-051"]
tags: ["sprint", "prd", "platform", "mod-001", "localization", "locale", "currency", "stage-2"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-005 — Localization Packs

> **Stage 2 deliverable.** Fifth authored Sprint PRD under the repository-wide [`Module Implementation Workflow`](../../MODULE_IMPLEMENTATION_WORKFLOW.md). Consumes ERP Core Engines and Accepted ADRs; **never redefines them**. Physical schema, code, routes, migrations, and UI are implementation activities and are **out of scope for this PRD**.
>
> **Editorial consistency.** *The level of detail, terminology, section ordering, traceability conventions, and writing style SHOULD remain consistent with `SPR-MOD-001-001` through `SPR-MOD-001-004` so that all Sprint PRDs evolve as a uniform documentation family. Improvements MAY be introduced where they clearly improve clarity or maintainability, but established governance patterns, document structure, and traceability conventions MUST remain consistent across authored Sprint PRDs.*

## Frontmatter Summary

| Field | Value |
| --- | --- |
| Sprint ID | `SPR-MOD-001-005` (permanent) |
| Parent Module | `MOD-001` — Platform Administration |
| Parent Sprint Plan | [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) |
| Iteration | Sprint 5 |
| Status | Draft |
| Estimated Size | Medium |
| Upstream Sprints | `SPR-MOD-001-001`, `SPR-MOD-001-002`, `SPR-MOD-001-003`, `SPR-MOD-001-004` |
| Downstream Sprints | `SPR-MOD-001-006`; every subsequent sprint in every downstream module that reads locale, currency, timezone, or regional-format defaults |

---

## 1. Objective and Scope

### 1.1 Objective

Deliver the shared **localization infrastructure** consumed by every downstream business module. Establish locale-pack registration and activation lifecycle; default language, locale, currency, timezone, and regional formatting; tenant- and company-scoped localization preferences; the locale inheritance surface across `Tenant → Company → Branch → Financial Year` (consumed from `ENG-005`); audit integration; and the `localizationpack.*`, `locale.*`, `currency.*`, and `regionalformat.*` event contracts. Locale, currency, and format resolution mechanics are owned by `ENG-006` (Localization) and `ENG-018` (Currency) and consumed here without redefinition.

> **Localization Ownership Convention.** *Localization Packs define available regional capabilities and defaults. Business modules consume localization services and MAY contribute module-specific localized resources, but MUST NOT redefine localization lifecycle, activation rules, or inheritance established by the Platform module. Business modules own the localized business content they introduce (for example, regulatory labels, domain terminology, or module-specific resources), while the Platform module owns localization pack lifecycle, activation, inheritance, locale resolution, and regional defaults.*

> **Effective Configuration Convention (inherited from `SPR-MOD-001-004`).** *Locale, currency, timezone, and regional-format preferences are configuration values whose scope resolution is owned by `ENG-005`. This sprint stores those preferences and consumes `ENG-005` for effective-value resolution; it MUST NOT re-implement hierarchy resolution locally.*

> **Configuration Ownership Convention (inherited from `SPR-MOD-001-004`).** *This sprint owns the definition and business semantics of platform-level localization preference keys (default locale, default currency, default timezone, regional format profile). `ENG-005` owns their storage and resolution.*

> **Event Ownership Convention (inherited from `SPR-MOD-001-004`).** *The sprint that first introduces an event becomes the authoritative owner of that event. This sprint owns every event listed in §11.*

### 1.2 In Scope

- Locale-pack registration surface (metadata: language, region, currency defaults, formatting defaults, timezone defaults).
- Locale-pack activation and deactivation lifecycle at tenant scope.
- Default language and locale management at tenant and company scopes.
- Default currency management at tenant and company scopes (currency semantics consumed from `ENG-018`).
- Number, date, and time formatting defaults at tenant and company scopes.
- Timezone defaults at tenant and company scopes.
- Regional business preferences (locale-derived defaults consumed by downstream modules).
- Tenant- and company-scoped localization preferences persisted through the configuration hierarchy delivered by `SPR-MOD-001-004`.
- Audit integration for every locale-pack, locale, currency, timezone, and regional-format transition via `ENG-004`.
- Events published: `localizationpack.registered`, `localizationpack.activated`, `localizationpack.deactivated`, `locale.changed`, `currency.changed`, `regionalformat.changed` — delivered via `ENG-024`.

### 1.3 Out of Scope

Reserved for later Platform sprints, later modules, or the existing localization engine, which is **consumed only** (see [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md)):

- Translation authoring, editorial workflow, and runtime translation editing — deferred; string catalogs owned by their originating modules per the Localization Ownership Convention.
- Country-specific taxation, accounting, statutory, and regulatory rules — owned by the respective business modules and their governing engines.
- Payroll localization and country-specific payroll rules — owned by MOD-006 Payroll.
- Country-specific compliance and reporting formats — owned by their respective modules.
- Marketplace and third-party localization providers beyond baseline — deferred.
- OCR / document-recognition language packs — owned by the AI workspace module.
- AI language models and translation models — owned by the AI engines.
- Audit Review UI (search, export, dashboards) — `SPR-MOD-001-006`.
- Module-specific localized string catalogs and domain terminology — owned by the originating modules per the Localization Ownership Convention above.

---

## 2. Sprint Deliverables

> **Rule.** *Sprint Deliverables summarize the concrete outputs expected upon successful completion of the sprint. This section describes what will exist when the sprint is complete, but MUST NOT prescribe implementation details or redefine acceptance criteria. It complements, but does not replace, the Definition of Done.*

Upon successful completion of `SPR-MOD-001-005`, the following will exist:

- **Business capabilities.**
  - A platform administrator can register a locale pack and inspect its metadata (language, region, currency defaults, formatting defaults, timezone defaults).
  - A platform administrator can activate and deactivate locale packs at tenant scope.
  - A platform administrator can set default language, locale, currency, timezone, and regional-format profile at tenant and company scopes.
  - A platform administrator can view effective localization preferences for any resolution context (tenant / company / branch / financial year), computed by `ENG-005`.
  - Every locale-pack, locale, currency, timezone, and regional-format transition is tenant-scoped and versioned per MOD-001 MODULE_PRD §7.
- **Published events.** Six event contracts (see §11) registered in the event catalog and emitted by the corresponding transitions.
- **Audit artifacts.** An audit record exists for every locale-pack, locale, currency, timezone, and regional-format transition, produced via `ENG-004`, in a form consumable by the audit review surface delivered in `SPR-MOD-001-006`.
- **Documentation updates.**
  - This Sprint PRD, in status appropriate to progression (`Draft` → `Planned` → `In Progress` → `Done`).
  - Sprint Catalog entry for `SPR-MOD-001-005`.
  - `localizationpack.*`, `locale.*`, `currency.*`, `regionalformat.*` event entries in the event catalog referenced from §11.
- **Migration artifacts.** *N/A at PRD authoring time.* Physical schema and migrations are implementation activities and are out of scope for this document.

This section describes **what will exist**; it does not describe **how it is built** and does not restate acceptance criteria.

---

## 3. Traceability to Module PRD

| MOD-001 MODULE_PRD Section | Delivered By |
| --- | --- |
| §2 Business Scope — Localization | Locale-pack lifecycle; default language, locale, currency, timezone, and regional-format profile |
| §5 Master Data — Locale Pack / Localization Preference | Locale Pack, Locale, Currency Profile, Regional Format Profile conceptual entities (§10) |
| §6 Transactions — Localization Change | Locale-pack activation/deactivation; default locale/currency/timezone/format transitions |
| §7 Business Rules — Tenant-scoped, versioned configuration changes | Locale-pack and localization-preference transitions are tenant-scoped and versioned |
| §8 Integration Points — LocalizationChanged event | `localizationpack.*`, `locale.*`, `currency.*`, `regionalformat.*` events (§11) |
| §10 Configuration — Locale, currency, timezone, and regional-format defaults | Localization preference surface at tenant and company scopes |
| §12 ERP Core Engine Consumption | Engine consumption (§8) |

Sprint scope is bounded strictly by these sections. No new business requirements are introduced here.

---

## 4. User Stories

- **US-001.** *As a platform administrator, I want to register a locale pack, so that the language, region, currency defaults, formatting defaults, and timezone defaults it declares become available for activation.*
- **US-002.** *As a platform administrator, I want to activate a locale pack at tenant scope, so that its defaults become available to companies, branches, and financial years within the tenant.*
- **US-003.** *As a platform administrator, I want to deactivate a locale pack at tenant scope, so that its defaults are no longer selectable while preserving prior audit history.*
- **US-004.** *As a platform administrator, I want to set the default language and locale at tenant and company scopes, so that downstream modules consume a deterministic locale.*
- **US-005.** *As a platform administrator, I want to set the default currency at tenant and company scopes, so that downstream modules resolve currency through `ENG-018` without local overrides.*
- **US-006.** *As a platform administrator, I want to set the default timezone and regional-format profile at tenant and company scopes, so that number, date, and time formatting is deterministic per scope.*
- **US-007.** *As a platform administrator, I want to view effective localization preferences for a resolution context (tenant / company / branch / financial year), so that I can verify what applies without inspecting each scope.*
- **US-008.** *As a security reviewer, I want every locale-pack and localization-preference transition to be audited via `ENG-004`, so that I can reconstruct the localization history from an authoritative log.*
- **US-009.** *As a downstream module (system persona), I want to receive `localizationpack.*`, `locale.*`, `currency.*`, and `regionalformat.*` events, so that I can react to localization transitions in a decoupled way.*
- **US-010.** *As a downstream module (system persona), I want to read effective locale, currency, timezone, and regional-format defaults through `ENG-005`, `ENG-006`, and `ENG-018`, so that I never re-implement localization resolution locally.*

---

## 5. Acceptance Criteria

Given / When / Then form. Objective and testable.

### 5.1 Locale-pack lifecycle (US-001, US-002, US-003)

- **Given** a valid locale-pack payload,
  **when** a platform admin registers it,
  **then** the pack is persisted, its metadata is visible, and a `localizationpack.registered` event is emitted.
- **Given** a registered locale pack,
  **when** a platform admin activates it at tenant scope,
  **then** its language, currency, timezone, and format defaults become available to companies, branches, and financial years within the tenant, and a `localizationpack.activated` event is emitted.
- **Given** an active locale pack that is not the only active pack,
  **when** a platform admin deactivates it at tenant scope,
  **then** the pack is no longer selectable for new preferences, prior audit history is preserved, and a `localizationpack.deactivated` event is emitted.

### 5.2 Locale, currency, timezone, and regional-format preferences (US-004, US-005, US-006)

- **Given** an active locale pack at tenant scope,
  **when** a platform admin sets the default locale at tenant or company scope,
  **then** the preference is persisted through the configuration hierarchy delivered by `SPR-MOD-001-004`, a new configuration version is recorded, and a `locale.changed` event is emitted.
- **Given** an active locale pack at tenant scope,
  **when** a platform admin sets the default currency at tenant or company scope,
  **then** the preference is persisted, `ENG-018` semantics are consumed (not redefined), and a `currency.changed` event is emitted.
- **Given** an active locale pack at tenant scope,
  **when** a platform admin sets the default timezone or regional-format profile at tenant or company scope,
  **then** the preference is persisted, a new configuration version is recorded, and a `regionalformat.changed` event is emitted.

### 5.3 Inheritance and effective localization visibility (US-007, US-010)

- **Given** any resolution context (tenant / company / branch / financial year),
  **when** a platform admin requests the effective localization preferences,
  **then** `ENG-005` returns the resolved locale, currency, timezone, and regional-format values (including source scope for each) per the Effective Configuration Convention (§1); this sprint does not re-implement hierarchy resolution.
- **Given** a downstream module,
  **when** it needs a locale, currency, timezone, or regional-format value,
  **then** it reads through `ENG-005`, `ENG-006`, and `ENG-018` as appropriate, and never through a local resolution path.

### 5.4 Audit integration (US-008)

- **Given** any locale-pack or localization-preference transition,
  **when** it completes,
  **then** an audit record is produced via `ENG-004` containing the actor, tenant ID, scope (tenant / company / branch / FY), preference key or pack identifier, transition type, prior value / prior state, new value / new state, and timestamp.

### 5.5 Events (US-009)

- **Given** any transition enumerated in §11,
  **when** it completes,
  **then** the corresponding event is published via `ENG-024` conforming to that contract.

### 5.6 Tenant isolation (all stories)

- **Given** any locale-pack activation or localization-preference write,
  **when** it executes,
  **then** `ADR-011` isolation invariants hold — no cross-tenant reads, writes, or activations occur under any code path.

---

## 6. Parent Module Reference

- **Parent Module:** `MOD-001` — Platform Administration.
- **Module PRD:** [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md).
- **Module Sprint Plan (Stage 1):** [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md).
- **Module PRD sections fulfilled:** §2 (Localization), §5 (Locale Pack, Localization Preference), §6 (Localization Change), §7 (tenant-scoped versioning), §8 (LocalizationChanged), §10 (locale / currency / timezone / format defaults), §12 (Engine consumption). See §3.

---

## 7. Dependencies

- **Parent:** `MOD-001` MODULE_PRD.
- **Upstream sprints:**
  - `SPR-MOD-001-001` — Tenancy Foundation. Tenant context and `ADR-011` isolation invariants.
  - `SPR-MOD-001-002` — Organization Structure. The `Tenant → Company → Branch → Financial Year` hierarchy consumed for scope-bound localization preferences.
  - `SPR-MOD-001-003` — Users, Roles & Permissions. Administered users and role/permission grants used to authorize localization writes.
  - `SPR-MOD-001-004` — Configuration Hierarchy. Configuration scopes, override precedence, versioning, and the `ENG-005` effective-configuration surface consumed for localization preferences.
- **Downstream sprints:** `SPR-MOD-001-006` (audit review reads localization change history); every sprint in every downstream module (Accounting, Purchase, Inventory, Sales, HRMS, Payroll, Manufacturing, Projects, AMC, Field Service, Assets, Fleet, POS, Service Desk, Analytics, AI Workspace) that reads locale, currency, timezone, or regional-format defaults.

---

## 8. ERP Core Engine Consumption

Engine behavior is **consumed, not redefined**. See each engine's specification for capability details. The Localization Ownership Convention in §1 governs the boundary between this sprint and `ENG-006` / `ENG-018`.

| Engine | Role in this sprint |
| --- | --- |
| `ENG-001` Identity | Provides the platform administrator identity used to authorize locale-pack and localization-preference transitions. |
| `ENG-004` Audit | Records every locale-pack, locale, currency, timezone, and regional-format transition. |
| `ENG-005` Configuration | Authoritative owner of storage and effective-value resolution for localization preferences at tenant / company / branch / FY scopes. Consumed here per the Effective Configuration Convention (§1). |
| `ENG-006` Localization | Authoritative owner of locale resolution, formatting, and localization service surfaces. Consumed here — this sprint does not redefine locale resolution or formatting mechanics. |
| `ENG-018` Currency | Authoritative owner of currency semantics (codes, precision, rounding). Consumed here — this sprint does not redefine currency behavior. |
| `ENG-024` Eventing | Publishes `localizationpack.*`, `locale.*`, `currency.*`, and `regionalformat.*` events with the contracts declared in §11. |

---

## 9. ADR Consumption

Only **Accepted** ADRs are relied upon.

| ADR | Applied As |
| --- | --- |
| `ADR-011` Multi-Tenant Isolation | Authoritative isolation model; enforced across every locale-pack activation and localization-preference record — not redefined. |
| `ADR-012` Tenant Lifecycle | Authoritative lifecycle state-machine pattern; the same pattern is applied consistently to the locale-pack activation lifecycle. |
| `ADR-014` Audit Strategy | Authoritative audit contract used by `ENG-004` integration for localization transitions. |
| `ADR-051` Event Contracts | Authoritative event envelope / naming / delivery guarantees for `localizationpack.*`, `locale.*`, `currency.*`, and `regionalformat.*` events. |

`ADR-026` Configuration Hierarchy remains `Proposed` per `MOD-001_SPRINT_PLAN.md` and is deliberately **not** relied upon here; this sprint consumes only the Accepted ADRs above and the effective-configuration surface delivered by `SPR-MOD-001-004`.

---

## 10. Data Model Impact

> **Rule.** *Data Model Impact documents conceptual entities, ownership, and relationships only. Physical schema design remains an implementation activity and MUST NOT appear in Sprint PRDs.*

The Localization Ownership Convention and Configuration Ownership Convention in §1 apply here: this sprint owns the localization business definitions below; `ENG-005` owns their storage and resolution; `ENG-006` and `ENG-018` own the runtime semantics they surface.

### 10.1 Conceptual Entities

| Entity | Owner | Purpose |
| --- | --- | --- |
| Locale Pack | MOD-001 (this sprint) | A registered bundle declaring a language, region, currency defaults, formatting defaults, and timezone defaults. |
| Locale | MOD-001 (this sprint) | A language–region identifier available for selection when a locale pack is active at tenant scope. |
| Currency Profile | MOD-001 (this sprint) | A tenant- or company-scoped currency default; currency semantics are consumed from `ENG-018`. |
| Regional Format Profile | MOD-001 (this sprint) | A tenant- or company-scoped set of number, date, and time formatting defaults. |
| Timezone Preference | MOD-001 (this sprint) | A tenant- or company-scoped default timezone. |
| Localization Preference | MOD-001 (this sprint) | A composite view of default locale, currency, timezone, and regional format at a given scope. |
| Effective Localization | ENG-005 (consumed) | The resolved localization preference set for a given context; produced by `ENG-005` — this sprint consumes it. |
| Module-Specific Localized Content | Originating Module (consumed) | Regulatory labels, domain terminology, and module-specific resources — owned by the module that introduces them, per the Localization Ownership Convention (§1). |

### 10.2 Relationships

- A **locale pack** is available for use only while it is `Active` at tenant scope.
- A **localization preference** is bound to exactly one scope (tenant or company).
- **Effective localization** at branch or financial-year scope is resolved by `ENG-005` from ancestor-scope preferences per the same inheritance rules used for configuration values in `SPR-MOD-001-004`.
- A **currency profile** references currency semantics owned by `ENG-018`; this sprint does not persist currency behavior, only the tenant/company default selection.

### 10.3 Ownership Boundaries

- All entities listed with owner "MOD-001 (this sprint)" are owned here.
- **Effective Localization** is owned by `ENG-005`; **locale resolution and formatting mechanics** are owned by `ENG-006`; **currency semantics** are owned by `ENG-018`. This sprint **consumes** them and MUST NOT redefine their behavior.
- Module-specific localized content (regulatory labels, domain terminology, module-specific resources) is owned by the originating modules, per the Localization Ownership Convention in §1.

Physical schema (tables, columns, indexes, constraints) is deliberately excluded and belongs to implementation.

---

## 11. Events Published

Referenced authoritatively in [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md). Envelope, naming, and delivery guarantees are governed by `ADR-051`.

> **Event Ownership Convention.** *The sprint that first introduces an event becomes the authoritative owner of that event. Subsequent Sprint PRDs MAY reference or consume the event but MUST NOT redefine its business meaning, ownership, or delivery guarantees. Any evolution of an existing event MUST be documented by updating the owning Sprint PRD (or its successor baseline), not by redefining the event in consuming Sprint PRDs.*

| Event Name | Owning Module | Publishing Sprint | Known Consumer Modules | Delivery Guarantee |
| --- | --- | --- | --- | --- |
| `localizationpack.registered` | MOD-001 | SPR-MOD-001-005 | MOD-001 (self), all downstream modules | At-least-once, ordered per tenant (per `ADR-051`) |
| `localizationpack.activated` | MOD-001 | SPR-MOD-001-005 | MOD-001 (self), all downstream modules | At-least-once, ordered per tenant |
| `localizationpack.deactivated` | MOD-001 | SPR-MOD-001-005 | MOD-001 (self), all downstream modules | At-least-once, ordered per tenant |
| `locale.changed` | MOD-001 | SPR-MOD-001-005 | MOD-001 (self), MOD-002 (Accounting), MOD-003 (Sales), MOD-004 (Purchase), MOD-006 (Payroll), all downstream modules | At-least-once, ordered per tenant |
| `currency.changed` | MOD-001 | SPR-MOD-001-005 | MOD-001 (self), MOD-002, MOD-003, MOD-004, MOD-006, all downstream modules | At-least-once, ordered per tenant |
| `regionalformat.changed` | MOD-001 | SPR-MOD-001-005 | MOD-001 (self), all downstream modules | At-least-once, ordered per tenant |

Consumer lists reflect **known** consumers at authoring time and MAY grow. Payload contracts are described in the event catalog; this PRD does not redefine them. Per the Event Ownership Convention above, `SPR-MOD-001-005` is the authoritative owner of every event listed here.

---

## 12. Definition of Done

Objective, verifiable checklist. All items MUST be true before the sprint moves to `Done`.

- [ ] All acceptance criteria in §5 are met and demonstrated.
- [ ] `localizationpack.*`, `locale.*`, `currency.*`, and `regionalformat.*` events are registered in the event catalog with their contracts and are emitted on the corresponding transitions.
- [ ] Locale-pack activation and localization-preference resolution are deterministic through `ENG-005` for every tenant / company / branch / financial-year context.
- [ ] Locale packs can be registered, activated, and deactivated at tenant scope with the same lifecycle pattern used elsewhere in MOD-001.
- [ ] Every locale-pack and localization-preference transition produces an audit record via `ENG-004`.
- [ ] Localization changes are tenant-scoped and versioned per MOD-001 MODULE_PRD §7.
- [ ] Effective localization preferences are readable through `ENG-005` — no local hierarchy-resolution path exists in this sprint.
- [ ] Currency semantics are consumed from `ENG-018`; locale resolution and formatting are consumed from `ENG-006`; this sprint does not redefine either.
- [ ] Automated tests exist and pass per the authoritative testing standard (referenced from `docs/02-architecture/testing-strategy.md` and the corresponding ADR); this sprint does not redefine the testing standard.
- [ ] Observability signals are in place per the authoritative observability standard.
- [ ] Sprint status updated in [`docs/SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md) and in [`README.md`](./README.md).
- [ ] No unresolved architectural exceptions.

---

## 13. Sprint Exit Criteria

Copied verbatim from `MOD-001_SPRINT_PLAN.md` §2 (`SPR-MOD-001-005`):

- A tenant admin can install / update a locale pack and assign default locale and currency at tenant scope.
- Users can select an allowed locale; the platform resolves formatting deterministically.
- Locale changes are audited and observable in downstream modules through `ENG-006`.

If any exit criterion is not met, the sprint MUST NOT move to `Done`.

---

## 14. Risks and Assumptions

- **R1 — Upstream dependency.** `SPR-MOD-001-001` through `SPR-MOD-001-004` MUST be in the `Done` lifecycle state before implementation of this sprint begins. Documentation authoring MAY proceed while upstream sprints are still in `Draft` or `Planned`, but implementation sequencing follows the dependency graph.
- **R2 — Localization ownership.** Locale resolution and formatting mechanics are owned by `ENG-006`; currency semantics by `ENG-018`; effective-value resolution by `ENG-005`. This sprint MUST NOT introduce competing resolution paths, per the Localization Ownership Convention (§1).
- **R3 — Module content ownership.** Module-specific localized content (regulatory labels, domain terminology, module-specific resources) is owned by the originating modules per the Localization Ownership Convention (§1). This sprint MUST NOT define module-specific content.
- **R4 — Downstream deferrals.** Translation authoring, country-specific taxation / accounting / statutory / regulatory rules, payroll localization, marketplace providers, OCR language packs, AI language models, and the audit review UI are deferred to later modules and sprints. Assumption: these deferrals hold; this sprint does not silently absorb their scope.
- **R5 — ADR acceptance.** All referenced ADRs (`ADR-011`, `ADR-012`, `ADR-014`, `ADR-051`) are Accepted at authoring time. If any becomes non-Accepted, this sprint is re-planned. `ADR-026` (Configuration Hierarchy) remains `Proposed`; this sprint deliberately does not depend on it and is not blocked by its acceptance state.
- **R6 — Version atomicity.** Localization preference version tracking MUST be atomic with the corresponding write. If atomicity cannot be achieved for a specific implementation path, that path is rejected — the acceptance criterion is not weakened.
- **R7 — Event delivery.** `localizationpack.*`, `locale.*`, `currency.*`, and `regionalformat.*` events rely on `ENG-024` delivery guarantees stated in `ADR-051`. Assumption: those guarantees hold; this sprint does not redefine them.

---

## 15. Test Strategy Summary

Test approach references (not redefines) the authoritative testing standard in [`../../02-architecture/testing-strategy.md`](../../02-architecture/testing-strategy.md) and the corresponding ADR. Test categories exercised:

- **Unit** — locale-pack lifecycle transitions; localization-preference writes and version bumps; scope integrity checks; tenant-scoping checks.
- **Integration** — audit emission via `ENG-004`, effective-localization resolution via `ENG-005`, locale/formatting semantics via `ENG-006`, currency semantics via `ENG-018`, event publication via `ENG-024`.
- **Contract** — `localizationpack.*`, `locale.*`, `currency.*`, `regionalformat.*` event contracts against the event catalog.
- **End-to-end (smoke)** — a smoke fixture that provisions a tenant, registers and activates two locale packs, sets default locale / currency / timezone / regional-format at tenant and company scopes, and verifies that (a) effective-localization resolution through `ENG-005` returns the correct values for every context, (b) `ENG-006` and `ENG-018` are consulted for locale/formatting and currency semantics respectively, (c) all transitions are audited, (d) all events are emitted, (e) versioning is preserved end-to-end, and (f) `ADR-011` isolation invariants hold across every localization record.

Sprint-specific fixtures: a two-tenant / two-company smoke fixture with two active locale packs used to prove activation, inheritance, and deterministic effective-localization resolution.

---

## 16. Implementation Notes

> **Rule.** *Implementation Notes MAY record non-authoritative engineering guidance or suggested sequencing. They MUST NOT introduce new business requirements, architectural decisions, engine behavior, or acceptance criteria.*

- Consider modeling locale-pack lifecycle with the same state-machine primitive used for tenant, company, branch, financial-year, user, and feature-flag lifecycles in prior sprints, so audit and event emission remain trivially uniform across all lifecycles.
- Consider persisting localization preferences through the configuration surface delivered by `SPR-MOD-001-004`, so versioning, inheritance, and effective-value resolution are inherited "for free".
- Consider evaluating tenant-scoping at the same boundary the platform enforces `ADR-011` isolation, so localization reads and writes inherit the guarantee for free.
- Consider treating currency defaults as a thin reference to `ENG-018` records rather than a copy, so that currency-semantic evolution is not duplicated in this sprint.

These notes are **non-authoritative**. They do not add requirements, ADRs, or engine behavior.

---

## 17. Review Gate

This section is a **reusable self-validation block** applied to every authored Sprint PRD. Answers below are inline and specific to `SPR-MOD-001-005`.

1. **Does the sprint have exactly one objective?**
   Yes. Deliver the shared localization infrastructure — locale packs, default locale / currency / timezone / regional-format, tenant- and company-scoped preferences, audit, and events — consumed downstream via `ENG-005`, `ENG-006`, and `ENG-018` (§1.1).
2. **Does every feature trace to a specific Module PRD section?**
   Yes. See §3 traceability matrix; every feature is tied to a `MOD-001` MODULE_PRD section.
3. **Are engines and ADRs consumed rather than redefined?**
   Yes. §8 and §9 list them explicitly with "consumed, not redefined" language; the Localization Ownership Convention in §1 explicitly delegates resolution semantics to `ENG-005`, `ENG-006`, and `ENG-018`.
4. **Are out-of-scope items enumerated and linked to their owning sprints?**
   Yes. §1.3 enumerates translation authoring, country-specific rules, payroll localization, marketplace providers, OCR / AI language models, audit review UI, and module-specific localized content — each linked to its owning sprint or module.
5. **Are acceptance criteria objective and testable?**
   Yes. §5 uses Given/When/Then form with observable outcomes.
6. **Is Definition of Done separate from Deliverables and Exit Criteria?**
   Yes. §2 (Deliverables) describes what will exist. §12 (DoD) is a verification checklist. §13 (Exit Criteria) is copied verbatim from the Stage 1 plan. Each has a distinct role.
7. **Does the next reserved sprint (`SPR-MOD-001-006`) begin immediately after this one completes?**
   Yes. `SPR-MOD-001-006 Audit Review Surface` is the immediate successor per [`MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md) §2–§3 and depends on `SPR-MOD-001-001` through `SPR-MOD-001-005`.

---

## 18. References

- Parent Module PRD — [`../../20-module-prds/platform/MODULE_PRD.md`](../../20-module-prds/platform/MODULE_PRD.md)
- Parent Module Sprint Plan (Stage 1) — [`./MOD-001_SPRINT_PLAN.md`](./MOD-001_SPRINT_PLAN.md)
- Upstream Sprint PRDs — [`./SPR-MOD-001-001-tenancy-foundation.md`](./SPR-MOD-001-001-tenancy-foundation.md), [`./SPR-MOD-001-002-organization-structure.md`](./SPR-MOD-001-002-organization-structure.md), [`./SPR-MOD-001-003-users-roles-permissions.md`](./SPR-MOD-001-003-users-roles-permissions.md), [`./SPR-MOD-001-004-configuration-hierarchy.md`](./SPR-MOD-001-004-configuration-hierarchy.md)
- Module Implementation Workflow — [`../../MODULE_IMPLEMENTATION_WORKFLOW.md`](../../MODULE_IMPLEMENTATION_WORKFLOW.md)
- Sprint Authoring Guide — [`../../SPRINT_AUTHORING_GUIDE.md`](../../SPRINT_AUTHORING_GUIDE.md)
- Sprint Catalog — [`../../SPRINT_CATALOG.md`](../../SPRINT_CATALOG.md)
- Sprint Roadmap — [`../../SPRINT_ROADMAP.md`](../../SPRINT_ROADMAP.md)
- Sprint Dependency Matrix — [`../../SPRINT_DEPENDENCY_MATRIX.md`](../../SPRINT_DEPENDENCY_MATRIX.md)
- Sprint Estimation Guide — [`../../SPRINT_ESTIMATION_GUIDE.md`](../../SPRINT_ESTIMATION_GUIDE.md)
- Event Catalog — [`../../02-architecture/event-catalog.md`](../../02-architecture/event-catalog.md)
- Sprint PRD Template — [`../../99-templates/sprint-prd-template.md`](../../99-templates/sprint-prd-template.md)
