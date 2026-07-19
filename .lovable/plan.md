## Pass 38.2.0 — WEB-003 Solution Design (MOD-003 Sales)

Translate the approved GT-005 MOD-003 publication into the canonical web solution design, mirroring the certified WEB-002 structure. No mobile, API, implementation, or governance evolution.

### State transition

`MOD003_PUBLICATION_AUTHORED → WEB003_SOLUTION_DESIGNED`

### Deliverable A — WEB-003 Solution Design

Create `docs/46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md`, following the certified WEB-002 spine.

Frontmatter (per `GOVERNANCE_FRONTMATTER_STANDARD`):
`spec_id: WEB-003_SOLUTION_DESIGN`, `template: WEB-003`, `template_version`, `module: MOD-003 Sales`, `source_publication: MOD-003_MODULE_PUBLICATION`, `lifecycle_state: WEB003_SOLUTION_DESIGNED`, `owner`, `updated: 2026-07-19`, `tags`, `document_type`.

Mandatory sections (functional/behavioral only — no code, API, or schema):

1. Identity & Traceability — Baseline → Sprint PRDs → GT-005 → WEB-003 chain.
2. Design Principles — GT-005 parity, responsive-first, a11y-first, reusable components, Business OS UX consistency.
3. Information Architecture — Sales workspace, module nav, page hierarchy, menu placement.
4. Screen Catalogue — Dashboard, Quotations, Sales Orders, Deliveries, Invoices, Credit/Debit Notes, Returns, Customers, Pricing (price lists / discounts), Reports, Sales Settings.
5. Page Specifications — per screen: purpose, entry, exit, user actions, displayed info, navigation, permissions.
6. User Flows — Quote→Order, Order→Delivery, Delivery→Invoice, Invoice→Return, Draft→Approval, Cancel/Reject, Reopen.
7. UI Component Specifications — grids, filters, search, forms, dialogs, lookup, action bars, approval banners, attachments, activity timelines (behavior only).
8. Client-side Validation — mandatory fields, formats, workflow gating, permission gating, duplicate prevention; business rules delegated to backend.
9. Client State Model — page/draft/edit/approval/loading/sync/offline expectations.
10. Error Handling — validation, authorization, concurrency, unavailable resources, unexpected failures.
11. Roles & Permissions — GT-005 permission mapping to UI (Sales Executive, Manager, Order Desk, Accountant read-only, Warehouse Manager scoped).
12. Accessibility — keyboard nav, focus, screen reader, color independence, responsive breakpoints.
13. Cross-Module Navigation — CRM, Inventory, Accounting, Analytics (respecting ownership boundaries).
14. Traceability Matrix — GT-005 Requirement → Screen → Workflow → Component.
15. Design Constraints — explicit exclusions (no backend, no API, no schema, no code, no governance evolution).

### Deliverable B — Verification Report

Create `docs/50-audit-reports/WEB003_SOLUTION_DESIGN_VERIFICATION_20260719T180000Z.md` using the standard 16-check format (Verification Metadata, Checklist table, Verification Summary with identity check, Certification).

Checks (16): document created; frontmatter complete; traceability complete; IA complete; screen catalogue complete; page specs complete; user flows complete; component specs complete; validation rules complete; client state defined; accessibility documented; no implementation content; no API design content; no governance modifications; registration synchronized; state transition authorized.

Target: 16/16 PASS, MAJOR=0, CRITICAL=0 (per `FINDING_SEVERITY_STANDARD`). Record an INFO note if `_meta.json` lacks a dedicated solution-design group (consistent with prior passes).

### Deliverable C — Registration

- `docs/SOLUTION_STATUS.md` — advance state to `WEB003_SOLUTION_DESIGNED`; update MOD-003 register row (Web Solution Design complete).
- `docs/DOCUMENT_INDEX.md` — register WEB-003 Solution Design and its Verification Report.
- `docs/_meta.json` — register under closest existing surface; INFO-note in verification report if no dedicated group.
- `docs/46-solution-design/web/README.md` — add MOD-003 Sales entry. (Note: existing web specs live at `docs/60-solution-design/web/`; this pass explicitly directs the new path `docs/46-solution-design/web/sales/` and the `46-...` README — I will honor the pass instructions exactly and record the path divergence from prior WEB-001/WEB-002 as an INFO finding in the verification report, not correct it.)
- `.lovable/plan.md` — append `WEB003_SOLUTION_DESIGNED`.

### Constraints

No mobile, API, implementation, backend, schema, code, or governance changes. MOD-001 and MOD-002 artifacts untouched. Any inconsistencies found are recorded as findings, not corrected.

### Exit criteria

WEB-003 authored; 16/16 PASS verification; all registration surfaces synchronized; repository state = `WEB003_SOLUTION_DESIGNED`; authorizes Pass 38.3.0 (MOB-003).

### Technical notes

- Path divergence: prior WEB-001/WEB-002 live under `docs/60-solution-design/web/`; this pass instructs `docs/46-solution-design/web/sales/` and its README. Will follow the instruction literally and log an INFO finding noting the divergence for future reconciliation.
- Verification timestamp: `20260719T180000Z` per instruction.


## Pass 38.2.0 — WEB-003 Solution Design (MOD-003 Sales)

- State: `MOD003_PUBLICATION_AUTHORED` → `WEB003_SOLUTION_DESIGNED`
- Authored `docs/46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md`
- Verification: `WEB003_SOLUTION_DESIGN_VERIFICATION_20260719T180000Z` — 16/16 PASS; MAJOR=0; CRITICAL=0
- Registration synchronized: SOLUTION_STATUS.md, DOCUMENT_INDEX.md, _meta.json, docs/46-solution-design/web/README.md, docs/60-solution-design/web/README.md
- WEB003_SOLUTION_DESIGNED
