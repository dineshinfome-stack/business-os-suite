---
title: "MOD-015 Module Publication — POS"
summary: "GT-005 Module Publication for MOD-015 POS. Terminal governance artifact derived exclusively from MOD015_POS_BASELINE_v1 and the MOD-015 Module PRD. Reference publication only — introduces no new requirements, authorities, ownership, scope, or governance evolution."
spec_id: "MOD-015_MODULE_PUBLICATION"
publication_id: "MOD-015_MODULE_PUBLICATION"
module_id: "MOD-015"
module_name: "POS"
version: "1.0"
status: "Published"
owner: "Revenue"
lifecycle_state: "Published"
workflow_stage: "GT-005 — Module Publication"
template: "GT-005_MODULE_PUBLICATION"
template_version: "v1.0"
parent_module_prd: "docs/20-module-prds/pos/MODULE_PRD.md"
parent_sprint_plan: "docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md"
parent_module_baseline: "docs/40-module-baselines/MOD015_POS_BASELINE_v1.md"
source_module: "MOD-015"
source_sprints: ["SPR-MOD-015-001", "SPR-MOD-015-002", "SPR-MOD-015-003", "SPR-MOD-015-004", "SPR-MOD-015-005"]
layer: "delivery"
updated: "2026-07-20"
tags: ["publication", "module", "MOD-015", "pos", "GT-005", "terminal"]
document_type: "Module Publication"
governance_specification: "v1.0"
authored_via_template: "GT-005"
authored_via_template_version: "v1.0"
execution_id: "GT005-MOD015-20260720T160000Z-001"
related_engines: ["ENG-001", "ENG-002", "ENG-003", "ENG-004", "ENG-005", "ENG-006", "ENG-007", "ENG-010", "ENG-011", "ENG-012", "ENG-017", "ENG-018", "ENG-019", "ENG-021", "ENG-022", "ENG-023", "ENG-024", "ENG-025", "ENG-027"]
related_adrs: ["ADR-011", "ADR-032"]
related_modules: ["MOD-001", "MOD-002", "MOD-005", "MOD-017"]
---

# MOD-015 Module Publication — POS

> **Reference publication only.** Faithful representation of [`MOD015_POS_BASELINE_v1`](../../40-module-baselines/MOD015_POS_BASELINE_v1.md) and the [`MOD-015 Module PRD`](../../20-module-prds/pos/MODULE_PRD.md). Introduces no new requirements, authorities, ownership, scope, engines, ADRs, events, or governance conventions. Any conflict between this publication and the Module Baseline resolves in favor of the Module Baseline, and this publication is corrected in the same change.

## 1. Module Identity

- **Module ID:** MOD-015
- **Module Name:** POS
- **Owner:** Revenue
- **Publication ID:** MOD-015_MODULE_PUBLICATION
- **Source Baseline:** `MOD015_POS_BASELINE_v1`
- **Source Module PRD:** [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- **Source Sprint Plan:** [`docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md`](../../30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md)
- **Source Sprints:** `SPR-MOD-015-001` … `SPR-MOD-015-005`
- **Lifecycle State:** Published (terminal, per GT-005)

## 2. Module Purpose

POS is the authoritative bounded context for Retail Counter Operations (Baseline §1; PRD §1). It owns Store, Counter, Offer, and Loyalty Program master lifecycles and POS Configuration (denominations, rounding, discount limits per role, offline mode policy, numbering series for POS documents); the Cart composition and pricing/discount evaluation surface with supervisor-override enforcement; offline sale capture with deterministic reconciliation; the POS Sale transaction with multi-tender payment capture and payment terminal integration; receipt generation, reprint, and receipt notification; gift-card handling; the POS Return transaction with return-window enforcement; the Cash Deposit and Day Close transactions with mismatched-cash approval; and the POS operational read model for reports, dashboards, exports, and audit readiness (Baseline §2; PRD §2). Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration; ledger effects of POS sales, returns, cash deposits, and day close are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` bindings triggered by POS-published events; Item, price list, and stock master data are consumed read-only from MOD-005 Inventory, together with the `InventoryLowStock` event; `OfferPublished` is consumed to activate offers at counters; cross-module KPI definitions remain owned by MOD-017 Analytics (Baseline §2, §5, §7, §9; PRD §2, §13).

## 3. Approved Scope

Restates the scope consolidated in `MOD015_POS_BASELINE_v1` §2 and the Module PRD §2. POS owns:

- Store, Counter, and POS Configuration foundations — Store and Counter master data; counter-to-store hierarchy; POS configuration (denominations, rounding, discount limits per role, offline mode policy); numbering series for POS documents (Baseline §2; PRD §2, §5, §10).
- Cart, pricing, and discounts — Cart composition; pricing and discount evaluation; supervisor-override rule for beyond-threshold discounts (Baseline §2; PRD §2, §7).
- Offline resilience — Offline sale capture per configured offline mode policy with deterministic reconciliation on connectivity restore (Baseline §2; PRD §2).
- POS Sale transaction — Sale lifecycle and `POSSaleCompleted` publication (Baseline §2; PRD §2, §6, §8).
- Multi-tender payments and receipts — Multi-tender payment capture (cash, card, digital, mixed); payment terminal integration; receipt generation and reprint; receipt notification (Baseline §2; PRD §2, §6, §8).
- Offers, loyalty, and gift cards — Offer master; Loyalty Program master; gift-card handling; `OfferPublished` consumption (Baseline §2; PRD §2, §5, §8).
- Returns — POS Return transaction lifecycle; return-window rule; `POSReturnProcessed` publication (Baseline §2; PRD §2, §6, §7, §8).
- Day close and hand-over — Cash Deposit and Day Close transactions; mismatched-cash approval rule; `POSDayClosed` publication (Baseline §2; PRD §2, §6, §7, §8).
- POS Analytics & Compliance — read-model operational reports (Day Sales, Cashier Report, Offer Impact, Returns Report), dashboards, exports, `InventoryLowStock` consumption, and audit-readiness surface (Baseline §2; PRD §9, §11).

Authoritative scope definitions remain in the Module PRD and Module Baseline.

## 4. Consolidated Authorities

Inherited verbatim from `MOD015_POS_BASELINE_v1` §7.

### 4.1 SPR-MOD-015-001 — POS Foundation (Stores, Counters & Configuration)

- **Store and Counter Master Authority** — MOD-015 owns the business semantics of Store and Counter masters and the counter–store hierarchy. ERP Core Engines provide shared infrastructure (identity, authorization, audit, configuration, localization, numbering, documents, rules, eventing, notification) but MUST NOT redefine POS business rules.
- **POS Configuration Authority** — MOD-015 owns the POS configuration surface (denominations, rounding, discount limits per role, offline mode policy) delivered via `ENG-005` in the tenant → company → context hierarchy; numbering series for POS documents are configured via `ENG-017`.
- **Foundation Master Lifecycle Boundary** — Sale, payment, offer/loyalty, return, and day-close authoring are explicitly deferred to SPR-MOD-015-002..005.

### 4.2 SPR-MOD-015-002 — Cart, Pricing, Discounts & Offline Sale

- **Cart & POS Sale Transaction Authority** — MOD-015 owns the Cart composition semantics and the POS Sale transaction lifecycle enforced via `ENG-010`/`ENG-011`. `POSSaleCompleted` events are published via `ENG-024`; ledger effects are produced by MOD-002 via posting-rule bindings triggered by the published event.
- **Pricing, Discount & Supervisor-Override Rule Authority** — Pricing and discount evaluation runs deterministically via `ENG-012`; tax evaluation runs via `ENG-019`; currency handling runs via `ENG-018`. Beyond-threshold discounts require supervisor approval via `ENG-011`.
- **Offline Sale Capture Authority** — Offline sale capture is supported per the configured offline mode policy; sales reconcile deterministically when connectivity is restored.

### 4.3 SPR-MOD-015-003 — Multi-Tender Payments & Receipts

- **Payment Capture & Tender Authority** — MOD-015 owns multi-tender payment capture on POS Sale (cash, card, digital, mixed) with deterministic tender validation via `ENG-012`.
- **Receipt Issuance & Reprint Authority** — Receipts are generated via `ENG-007`; reprints preserve identity of the original receipt and are audited via `ENG-004`. Receipt notifications (e.g., email/SMS) dispatch via `ENG-025` where configured.
- **Payment Terminal Integration Authority** — Payment terminal integration is routed exclusively through `ENG-023`.

### 4.4 SPR-MOD-015-004 — Offers, Loyalty & Returns

- **Offer & Loyalty Program Master Authority** — MOD-015 owns the Offer master and Loyalty Program master lifecycles enforced via `ENG-010`/`ENG-011`; gift cards are issued and redeemed through the offers/loyalty surface.
- **POS Return Transaction & Return-Window Authority** — MOD-015 owns the POS Return transaction lifecycle enforced via `ENG-010`/`ENG-011`; returns must reference a valid POS Sale within the configured return window, enforced via `ENG-012`. `POSReturnProcessed` events publish via `ENG-024`.
- **`OfferPublished` Consumption & Loyalty Platform Integration Boundary** — `OfferPublished` events are consumed to activate offers at counters; loyalty platform interactions are routed through `ENG-023`.

### 4.5 SPR-MOD-015-005 — Day Close, Analytics & Compliance

- **Cash Deposit & Day Close Transaction Authority** — MOD-015 owns Cash Deposit and Day Close transaction lifecycles enforced via `ENG-010`/`ENG-011`. `POSDayClosed` events publish via `ENG-024` to trigger MOD-002 posting bindings.
- **Mismatched-Cash Approval Rule Authority** — Day Close with mismatched cash requires supervisor approval via `ENG-011`, enforced through `ENG-012`; tolerance thresholds resolve read-only via `ENG-005`.
- **POS Operational Reports, Dashboards, and Export Authority** — MOD-015 owns operational POS reports (Day Sales, Cashier Report, Offer Impact, Returns Report) rendered via `ENG-021`, dashboards via `ENG-022`, and bulk exports via `ENG-027`, all operating over the POS read model. Cross-module KPI definitions remain exclusive to MOD-017 Analytics and are consumed read-only via `ENG-023`.
- **Read-Model-Only Boundary Convention** — Dashboards, reports, integration, and export operate over the POS read model; no new master data, transactions, workflows, or published events are introduced by Sprint 5 beyond `POSDayClosed`.
- **Audit-Readiness Surface & POS Module Read Model Authority** — Every state-changing POS transaction traces to an `ENG-004` audit event; the POS module read model exposes prior-sprint events (`POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed`) and consumed events (`OfferPublished`, `InventoryLowStock`) through the read model. Audit collection remains owned by Platform (`ENG-004`) under `MOD001_PLATFORM_BASELINE_v1`.

## 5. Functional Requirements

Functional requirements are inherited verbatim from the Sprint PRD family (`SPR-MOD-015-001` … `SPR-MOD-015-005`) as consolidated in `MOD015_POS_BASELINE_v1`. This publication introduces no new requirements.

## 6. Business Rules

Verbatim from Module PRD §7 and Baseline §7:

- A POS day cannot be closed with mismatched cash without approval (PRD §7; Baseline §7 Mismatched-Cash Approval Rule).
- Discounts beyond a threshold require supervisor override (PRD §7; Baseline §7 Supervisor-Override Rule).
- Returns must reference a valid POS Sale within the return window (PRD §7; Baseline §7 Return-Window Rule).
- POS master and transaction lifecycles are POS-owned; no other module mutates POS state (Baseline §7).
- POS does not implement double-entry posting; ledger effects of POS sales, returns, cash deposits, and day close are produced by MOD-002 Accounting via `ENG-015` and `ENG-016` bindings triggered by POS-published events (PRD §2, §6; Baseline §5, §7, §9).
- `OfferPublished` and `InventoryLowStock` are consumed read-only (Baseline §7, §8).
- Analytics surfaces are read-only projections over the POS read model (Baseline §7).

## 7. Master Data Authorities

Verbatim from Module PRD §5 and Baseline §4, §7:

| Master Data Entity | Originating Sprint |
| --- | --- |
| Store | SPR-MOD-015-001 |
| Counter | SPR-MOD-015-001 |
| Offer | SPR-MOD-015-004 |
| Loyalty Program | SPR-MOD-015-004 |

## 8. Transaction Authorities

Verbatim from Module PRD §6 and Baseline §4, §7:

| Transaction | Originating Sprint |
| --- | --- |
| POS Sale | SPR-MOD-015-002 |
| POS Return | SPR-MOD-015-004 |
| Cash Deposit | SPR-MOD-015-005 |
| Day Close | SPR-MOD-015-005 |

## 9. Published Events

Emitted via `ENG-024` (Event Engine) under the Platform Event Ownership Convention. Business semantics owned by POS; delivery infrastructure owned by Platform. Verbatim from Baseline §8 and Module PRD §8:

- `POSSaleCompleted` — SPR-MOD-015-002
- `POSReturnProcessed` — SPR-MOD-015-004
- `POSDayClosed` — SPR-MOD-015-005

## 10. Consumed Events

Consumed via `ENG-024`. Consumption is read-only. Verbatim from Baseline §8 and Module PRD §8:

- `OfferPublished` — SPR-MOD-015-004
- `InventoryLowStock` (from MOD-005 Inventory) — SPR-MOD-015-005
- `POSSaleCompleted`, `POSReturnProcessed`, `POSDayClosed` (POS-published; consumed by the read model) — SPR-MOD-015-005

## 11. Platform Engine Usage

Engines remain platform-owned and are consumed by MOD-015 via their Capability Interfaces. Engine set inherited verbatim from `MOD015_POS_BASELINE_v1` §5:

| Engine | Consumed By |
| --- | --- |
| ENG-001 (Identity Engine) | SPR-MOD-015-001 |
| ENG-002 (Authorization Engine) | SPR-MOD-015-001, 002, 003, 004, 005 |
| ENG-003 (Permission Management Engine) | SPR-MOD-015-001 |
| ENG-004 (Audit Engine) | SPR-MOD-015-001, 002, 003, 004, 005 |
| ENG-005 (Configuration Engine) | SPR-MOD-015-001, 002, 003, 004 |
| ENG-006 (Localization Engine) | SPR-MOD-015-001, 002, 003 |
| ENG-007 (Document Engine) | SPR-MOD-015-001, 002, 003, 004 |
| ENG-010 (Workflow Engine) | SPR-MOD-015-002, 003, 004, 005 |
| ENG-011 (Approval Engine) | SPR-MOD-015-002, 004, 005 |
| ENG-012 (Rules Engine) | SPR-MOD-015-001, 002, 003, 004, 005 |
| ENG-017 (Numbering Engine) | SPR-MOD-015-001, 002, 003, 004, 005 |
| ENG-018 (Currency Engine) | SPR-MOD-015-002, 003 |
| ENG-019 (Tax Engine) | SPR-MOD-015-002 |
| ENG-021 (Reporting Engine) | SPR-MOD-015-005 |
| ENG-022 (Dashboard Engine) | SPR-MOD-015-005 |
| ENG-023 (Integration Engine) | SPR-MOD-015-003, 004, 005 |
| ENG-024 (Event Engine) | SPR-MOD-015-001, 002, 003, 004, 005 |
| ENG-025 (Notification Engine) | SPR-MOD-015-001, 003, 004, 005 |
| ENG-027 (Export Engine) | SPR-MOD-015-005 |

Related ADRs (all `Accepted`, inherited from Baseline §6): `ADR-011` (Multi-Tenant Isolation), `ADR-032` (RBAC + ABAC). `ENG-015` Voucher and `ENG-016` Posting are **not** consumed by any POS sprint — ledger effects of POS sales, returns, cash deposits, and day close are owned by MOD-002 via posting-rule bindings triggered by POS-published events, per the governance boundary in the Module PRD and Baseline §5, §7.

## 12. Dependencies

Verbatim from `MOD015_POS_BASELINE_v1` §9 and Module PRD §13.

**Upstream contracts consumed by POS:**

- `MOD001_PLATFORM_BASELINE_v1` — tenancy, organization structure, users/roles/permissions, configuration hierarchy, localization, audit collection.
- `MOD002_ACCOUNTING_BASELINE_v1` — ledger effects of POS sales, returns, cash deposits, and day close are owned by MOD-002 via `ENG-015` and `ENG-016` bindings; MOD-015 does not invoke the voucher or posting engines directly.
- `MOD005_INVENTORY_BASELINE_v1` — Item, price list, and stock master data are consumed read-only; `InventoryLowStock` events are consumed by the POS read model.
- `MOD017_ANALYTICS_BASELINE_v1` — cross-module KPI catalog consumed read-only via `ENG-023`.

**Downstream consumers of POS:**

- `MOD-002 Accounting` — consumes `POSSaleCompleted`, `POSReturnProcessed`, and `POSDayClosed` for ledger-effect bindings.
- `MOD-005 Inventory` — consumes `POSSaleCompleted` and `POSReturnProcessed` for stock adjustment.
- `MOD-017 Analytics` — consumes POS operational read models and lifecycle events for cross-module KPIs; owns cross-module KPI definitions.

## 13. Ownership Boundaries

Verbatim from Baseline §7 and §9 and PRD §2, §13:

- MOD-015 owns **only** the authorities enumerated in §4.
- Downstream modules MUST NOT own POS master data, redefine the Store / Counter / Offer / Loyalty Program / POS Sale / POS Return / Cash Deposit / Day Close lifecycles, or redefine POS analytics ownership.
- Identity, authentication, roles, permissions, configuration hierarchy, localization, and audit collection remain owned by MOD-001 Platform Administration.
- Ledger posting for POS sales, returns, cash deposits, and day close is produced by MOD-002 via `ENG-015` and `ENG-016`; POS emits events and does not write journal entries directly.
- Item, price list, and stock master data are owned by MOD-005 Inventory; POS consumes them read-only. `InventoryLowStock` is owned by MOD-005; POS consumes it read-only.
- `OfferPublished` is consumed by POS read-only.
- `ENG-004` remains authoritative for audit collection; POS owns only the business-level audit-readiness surface.
- `ENG-024` remains authoritative for event delivery infrastructure; POS owns the semantics of the events it emits.
- Cross-module KPI definitions remain exclusive to MOD-017 Analytics.

## 14. Traceability

Complete bidirectional traceability is preserved from Module PRD → Sprint Plan → Sprint PRDs → Module Baseline → this Module Publication.

| Layer | Artifact |
| --- | --- |
| Stage 1 — Module PRD | [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md) |
| Stage 2 — Sprint Plan | [`docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md`](../../30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md) |
| Stage 2 — Sprint PRDs | `SPR-MOD-015-001` … `SPR-MOD-015-005` |
| Stage 3 — Module Baseline | [`docs/40-module-baselines/MOD015_POS_BASELINE_v1.md`](../../40-module-baselines/MOD015_POS_BASELINE_v1.md) |
| GT-005 — Module Publication | this document |

## 15. Non-Goals

Inherited verbatim from Baseline §11 and Module PRD §14 (as future items):

- Omni-channel receipts (PRD §14 Future Enhancements).
- AI upsell prompts (PRD §14).
- Cross-module KPI definitions (owned by MOD-017 Analytics).
- Ledger effects of POS sales, returns, cash deposits, and day close (owned by MOD-002 Accounting).
- Deferred Event Catalog items recorded as `R-EV-*` risks in the originating Sprint PRDs.

## 16. Implementation Order

Per `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` and the MOD-006 … MOD-014 reference pattern, Phase 3 Solution Design proceeds in the sequence:

`WEB-015 → MOB-015 → API-015 → CPC-015 → VR-015`

## 17. Acceptance Criteria

This publication is Accepted when:

1. Every authority in §4 is inherited verbatim from `MOD015_POS_BASELINE_v1`.
2. Engine and ADR sets in §11 match Baseline §5–§6 exactly.
3. Dependency set in §12 matches Baseline §9 exactly.
4. Traceability chain in §14 resolves for every Stage 1–3 artifact.
5. Publication Verification Report emits deterministic PASS under `FINDING_SEVERITY_STANDARD v1.0`.

## 18. Publication Metadata

- **Publication Template:** `GT-005_MODULE_PUBLICATION` v1.0
- **Governance Specification:** v1.0
- **Execution ID:** `GT005-MOD015-20260720T160000Z-001`
- **Lifecycle State:** Published (terminal)
- **Handoff State:** `MOD015_PUBLICATION_COMPLETE` → ready for `WEB-015 POS Solution Design`.
- **Supersession Rule:** Superseded only by a future publication derived from a new Module Baseline version (e.g. `MOD015_POS_BASELINE_v2`).

## 19. Repository State Transition

`MOD015_BASELINE_FROZEN` → **`MOD015_PUBLICATION_COMPLETE`**

## 20. References

- [`docs/40-module-baselines/MOD015_POS_BASELINE_v1.md`](../../40-module-baselines/MOD015_POS_BASELINE_v1.md) — authoritative Module Baseline.
- [`docs/20-module-prds/pos/MODULE_PRD.md`](../../20-module-prds/pos/MODULE_PRD.md)
- [`docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md`](../../30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md)
- [`docs/45-module-publications/fleet/MOD-014_MODULE_PUBLICATION.md`](../fleet/MOD-014_MODULE_PUBLICATION.md) — GT-005 reference pattern.
- [`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`](../../15-governance/REPOSITORY_NAVIGATION_STANDARD.md)
- [`docs/10-erp-core/ENGINE_CATALOG.md`](../../10-erp-core/ENGINE_CATALOG.md)
- [`docs/11-adrs/ADR_INDEX.md`](../../11-adrs/ADR_INDEX.md)
