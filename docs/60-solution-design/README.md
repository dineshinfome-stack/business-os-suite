---
title: "Phase 3 — Platform Solution Design Framework (SD-001 v1.0)"
summary: "Governance framework for Phase 3 platform specifications (Web, Mobile, API). Establishes lifecycle, families, naming, traceability, principles, validation, and guardrails. Zero business-requirement changes; every specification derives exclusively from its Published Module."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-18"
tags: ["solution-design", "phase-3", "framework", "SD-001", "web", "mobile", "api"]
document_type: "Framework Charter"
template: "SD-001"
template_version: "v1.0"
governance_specification: "v1.0"
---

# Phase 3 — Platform Solution Design Framework

> **Framework-only charter.** This document defines the governance for Phase 3 platform specifications. It does **not** author any module-specific Web, Mobile, or API specification, and it does **not** modify any GT-002 → GT-005 artifact. Business definition remains authoritative; Solution Design consumes it read-only.

## 1. Purpose and Scope

Phase 3 — Solution Design — translates each **Published Module** (produced through GT-002 → GT-005) into three platform specifications: **Web (WEB)**, **Mobile (MOB)**, and **API**. This framework establishes the standards, lifecycle, naming, traceability, principles, and validation that every platform specification MUST follow.

Phase 3 is strictly separated from business definition. No platform specification may introduce, alter, or reinterpret business requirements. Any perceived business gap MUST be routed back through the Module PRD / Sprint PRD / Module Baseline / Module Publication chain and re-published before the affected platform specification is amended.

## 2. Platform Design Lifecycle

```text
Published Module (MOD-<NNN>)
        │
        ▼
WEB Specification (WEB-<NNN>)
        │
        ▼
MOB Specification (MOB-<NNN>)
        │
        ▼
API Specification (API-<NNN>)
        │
        ▼
Solution Design Complete (per module)
```

Every specification MUST cite its Published Module as the **sole** business authority. Ordering (WEB → MOB → API) reflects the default authoring sequence; platform teams MAY parallelise authoring provided all three specifications reference the same Published Module revision.

## 3. Specification Families

### 3.1 WEB Specifications

Purpose:

- User journeys
- Navigation
- Screen hierarchy
- UI states
- Forms
- Dashboards
- Responsive behaviour
- Accessibility
- Client-side validation

### 3.2 MOB Specifications

Purpose:

- Mobile workflows
- Offline behaviour
- Push notifications
- Camera
- Voice
- Device capabilities
- Mobile navigation
- Synchronisation

### 3.3 API Specifications

Purpose:

- REST endpoints
- Commands
- Queries
- Event contracts
- Authentication
- Authorization
- Payload schemas
- Error models
- Versioning
- Integration contracts

## 4. Repository Structure

```text
docs/
└── 60-solution-design/
    ├── README.md                        This document
    ├── SOLUTION_DESIGN_CATALOG.md       Registration index
    ├── web/                             WEB-<NNN> specifications
    │   └── README.md
    ├── mobile/                          MOB-<NNN> specifications
    │   └── README.md
    └── api/                             API-<NNN> specifications
        └── README.md
```

## 5. Naming Standards

- **Web:** `WEB-<NNN>` (e.g. `WEB-001`, `WEB-018`)
- **Mobile:** `MOB-<NNN>` (e.g. `MOB-001`, `MOB-018`)
- **API:** `API-<NNN>` (e.g. `API-001`, `API-018`)

`<NNN>` MUST match the `MOD-<NNN>` identifier of the source Published Module listed in `docs/MODULE_PUBLICATION_CATALOG.md`. No independent numbering scheme is permitted.

## 6. Traceability Rules

Every platform specification MUST reference, in its frontmatter and body:

- The **Published Module** (`docs/45-module-publications/...`)
- The **Module PRD** (`docs/20-module-prds/...`)
- The **Sprint Plan** (`docs/30-sprint-prds/<domain>/MOD-<NNN>_SPRINT_PLAN.md`)
- The **Sprint PRDs** (`docs/30-sprint-prds/<domain>/sprints/...`)
- The **Module Baseline** (`docs/40-module-baselines/MOD<NNN>_..._BASELINE_v<version>.md`)

No platform specification may introduce new business requirements. Where a specification identifies a business gap, the correct remedy is to raise a Module Baseline revision or Sprint PRD amendment through the existing governance chain — never a unilateral Solution Design change.

## 7. Platform Design Principles

- **Business-first** — Every UI, mobile flow, and API endpoint traces to a Published Module authority.
- **Platform-independent business logic** — Business rules live in the module; platforms consume them.
- **Reusable components** — Prefer shared UI, navigation, and API components across modules.
- **Responsive design** — Web specifications MUST address desktop, tablet, and mobile viewports.
- **API-first integration** — Web and Mobile consume the same API contracts; no platform-specific business endpoints.
- **Accessibility** — WCAG 2.1 AA baseline across Web and Mobile.
- **Security by design** — Authentication, authorization, tenant isolation, and audit are specified per-surface.
- **Multi-tenant compatibility** — Every specification honours tenant scoping declared by the Published Module.
- **AI-assisted UX where applicable** — Where the source module (e.g. MOD-018) declares AI surfaces, platform specifications integrate them via published capabilities only.

## 8. Validation Framework

Every platform specification is validated dynamically. No hard-coded check count; the checklist adapts to what the source Published Module declares.

Minimum validation dimensions:

1. **Traceability to Published Module** — All required references present and resolvable.
2. **Consistency with business definition** — No introduced authorities, requirements, or rules.
3. **Complete platform coverage** — The specification covers every scope element declared in its family's purpose list (§3) as applicable to the source module.
4. **Repository registration** — Entry present on `SOLUTION_DESIGN_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`, and `REPOSITORY_MAP.md` as applicable.
5. **Metadata integrity** — Frontmatter fields (`title`, `summary`, `owner`, `status`, `spec_id`, `family`, `source_module`, `source_publication`, `updated`) are valid and complete.

Validation reports MUST follow the repository-wide Verification Reporting Standard: Metadata header + Check / Result / Action table + Verification Summary with `Checklist Items = Passed + Remediated + Failed`. Repository Status is `READY` only when `Failed = 0` and Outstanding Risks = 0.

## 9. Guardrails

- No modification of published modules.
- No modification of GT-002 through GT-005 artifacts.
- No business requirement changes.
- No implementation guidance.
- No UI mockups (in the framework layer).
- No API endpoint definitions (in the framework layer).
- No mobile screen designs (in the framework layer).
- No code generation.

## 10. Cross-References

Read-only pointers. This framework does not evolve any of the referenced documents.

- [`docs/MODULE_PUBLICATION_CATALOG.md`](../MODULE_PUBLICATION_CATALOG.md) — authoritative list of Published Modules and the source of `<NNN>` allocation.
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md) — consolidated Stage 3 baselines.
- [`docs/MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — business-definition workflow (GT-002 → GT-005). Referenced only; not altered by this framework.
- [`docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`](./SOLUTION_DESIGN_CATALOG.md) — Phase 3 registration index.
- [`docs/60-solution-design/web/README.md`](./web/README.md), [`docs/60-solution-design/mobile/README.md`](./mobile/README.md), [`docs/60-solution-design/api/README.md`](./api/README.md) — family indices.
