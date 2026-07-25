---
title: "SPR-MOD-001-006 — Localization & Regionalization (v2)"
summary: "Sprint PRD for Tenant-scoped localization and regionalization under ADR-017: languages, time zones, currency, date/time and number formatting, regional compliance settings, translation management, and user overrides — all resolved through the SPR-004 Effective Configuration Resolver."
sprint_id: "SPR-MOD-001-006"
parent_module: "MOD-001"
iteration: "Sprint 6"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-004", "ENG-005", "ENG-006", "ENG-024"]
related_adrs: ["ADR-017", "ADR-026", "ADR-014"]
supersedes: "docs/30-sprint-prds/platform/SPR-MOD-001-005-localization-packs.md"
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "localization", "i18n", "l10n", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-006 — Localization & Regionalization (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-006**, and **TENANCY_STANDARD v2.0**. Inherited standards are **referenced by ID and not restated**. This sprint **consumes** Effective Configuration Resolver **v1.0** (SPR-004) and does not redefine it.

## Inheritance Block

- **ADR-017** — locale/currency/timezone settings persist in the Tenant DB; Platform Defaults live in Platform DB.
- **ADR-026** — extensibility conventions for locale packs.
- **TENANCY_STANDARD v2.0** — R6 (no cross-tenant queries).
- **MOD001_PLATFORM_BASELINE_v2 §7** — Effective Configuration Convention (consumed).

## 1. Sprint Objective and Scope

**Objective.** Deliver languages, time zones, currency, date/time and number formatting, regional compliance settings, and translation management at Tenant/Workspace/Company scope, with user overrides, all resolved deterministically via the SPR-004 resolver.

**In-scope surface.** Locale registration, locale pack install/activate, translation catalog CRUD, formatting rules, regional compliance flags, tenant/company/user locale selection, `l10n.*` events.

**Out-of-scope.** Module-specific string catalogs (owned by their modules). Fiscal calendar policy (owned by SPR-002 Financial Year lifecycle).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-006-01 | Locale registry & pack lifecycle | Baseline v2 §7 |
| F-006-02 | Translation catalog CRUD | Baseline v2 §7 |
| F-006-03 | Formatting rule set (date/time, number, currency) | Baseline v2 §7 |
| F-006-04 | Regional compliance flag catalog | ADR-026 |
| F-006-05 | Locale selection at Tenant / Workspace / Company scope | ADR-017; Baseline v2 §7 |
| F-006-06 | User locale overrides | Baseline v2 §7 |
| F-006-07 | `l10n.*` events | ADR-014 |
| F-006-08 | Tenant audit for l10n changes | ADR-014 |

## 3. Functional Requirements

- **FR-006-001.** The system SHALL persist locale packs, translations, and formatting rules in the Tenant DB (Platform Defaults in Platform DB).
- **FR-006-002.** Locale selection SHALL be resolved by the **Effective Configuration Resolver v1.0** (SPR-004) following the canonical chain Platform → Tenant → Workspace → Company → Branch → Financial Year, with a User override applied last for the current session.
- **FR-006-003.** SPR-006 SHALL consume the Resolver contract by ID and version and SHALL NOT redefine it.
- **FR-006-004.** Locale pack activation SHALL validate against the locale registry; invalid packs are rejected.
- **FR-006-005.** All l10n mutations SHALL emit the corresponding `l10n.*` event and Tenant audit entry.
- **FR-006-006.** No `workspaces` table or `workspace_id` column SHALL be introduced (ADR-017 I3).
- **FR-006-007.** Cross-tenant reads/writes SHALL be prohibited (TENANCY_STANDARD R6).
- **FR-006-008.** Regional compliance flags SHALL be readable through the Resolver as boolean-valued keys with source scope.

## 4. Non-Functional Requirements

- **NFR-006-001.** Locale resolution p95 < 5 ms (cached).
- **NFR-006-002.** Translation catalog reads scale to 100k keys per Tenant without pagination breaking clients.

## 5. User Experience

Locale panel exposes install/activate, default locale, timezone, currency; user preferences panel exposes user-scoped overrides with an inline "effective source" indicator.

## 6. Technical Design (contract references only)

- **Consumed contract:** Effective Configuration Resolver **v1.0** (owner SPR-004).
- **Consumed contract:** Permission Catalog Integration **v1.0** (owner SPR-003) for l10n permissions.
- No new shared contract is introduced by this sprint.

## 7. Security

Mutations gated by Permission Catalog entries `l10n.pack.manage`, `l10n.translation.write`, `l10n.formatting.write` (integration owned by SPR-003).

## 8. Acceptance Criteria

- **AC-006-001.** Locale resolution matches the canonical chain, with the user override applied last.
- **AC-006-002.** A locale pack activation is rejected when it references unregistered locale codes.
- **AC-006-003.** Every mutation emits the correct `l10n.*` event and Tenant audit entry.
- **AC-006-004.** No cross-tenant SQL is added; no Workspace identifier is introduced.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`; resolver-chain integration tests exercise all six scopes.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-004.
- Consumed contracts: Effective Configuration Resolver v1.0 (SPR-004), Permission Catalog Integration v1.0 (SPR-003).
- Owned contracts: none.
- Emitted events: `l10n.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, no cross-tenant SQL added, no Workspace identifier introduced, no resolver redefinition.

## 12. Out-of-Scope

- Module-specific string catalogs; fiscal calendar policy (SPR-002).

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §7 Effective Configuration Convention (consumer) | F-006-05, FR-006-002..003 |
| ADR-026 Extensibility | F-006-04, FR-006-008 |
| ADR-017 §I3 | FR-006-006 |
| ADR-017 §I6/I7 | FR-006-001 |
| TENANCY_STANDARD R6 | FR-006-007 |
| ADR-014 Audit | F-006-07..08, FR-006-005 |

Zero-orphan FR check: 8/8 linked.

## 14. Change Log from v1

Replaces v1 sprint **`SPR-MOD-001-005-localization-packs.md`** (renumbered under Sprint Plan v2.0).

| Change | Reason |
| --- | --- |
| Renumbered from -005 to -006. | Sprint Plan v2.0 sequencing. |
| Expressed locale selection as a Resolver consumer, not an independent lookup. | Contract-driven architecture (A13). |
| Added canonical chain scope declarations for Workspace, Branch, Financial Year. | ADR-017 configuration hierarchy. |
| Prohibited any `workspaces` table introduction. | ADR-017 Invariant I3. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references) |
| §1..§3 | Newly authored |
| §4 NFRs | Newly authored |
| §5 UX | Newly authored |
| §6 Technical Design | Newly authored |
| §7 Security | Reused unchanged (references RBAC_STANDARD + Permission Catalog) |
| §8 AC | Newly authored |
| §9 Testing | Reused unchanged (references PLATFORM_TESTING_STANDARD) |
| §10..§11 | Newly authored |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017, ADR-026, ADR-014
- MOD001_PLATFORM_BASELINE_v2 §7
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-006
- TENANCY_STANDARD v2.0
- v1 (superseded): `SPR-MOD-001-005-localization-packs.md`
