## Pass 37.3.0 — MOB-002 Accounting Solution Design

**State transition:** `MOD002_WEB_SOLUTION_DESIGN_COMPLETE` → `MOD002_MOBILE_SOLUTION_DESIGN_COMPLETE`

**Nature:** Mobile Solution Design authoring. Zero governance evolution, zero implementation, zero new business scope.

### Authoritative Inputs (read-only)

- `docs/45-module-publications/accounting/MOD-002_MODULE_PUBLICATION.md` — sole functional contract (22 authorities, 14 engines, 8 ADRs)
- `docs/60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md` — canonical mobile pattern
- `docs/60-solution-design/web/WEB-002_ACCOUNTING.md` — web parity reference (26 pages, 11 journeys, 12 forms)
- `docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md`, MOD-002 Module PRD, Sprint PRDs
- Governance: SD-001, GOVERNANCE_FRONTMATTER_STANDARD, FINDING_SEVERITY_STANDARD, SCREEN_IDENTIFIER_STANDARD

### Deliverable A — MOB-002 Solution Design

**Create:** `docs/60-solution-design/mobile/MOB-002_ACCOUNTING.md`

Frontmatter: `spec_id: MOB-002`, `template: SD-001_MOBILE_SPEC`, `template_version: 1.0`, status, dependencies, Pass Classification.

Structure mirrors MOB-001; parity with WEB-002. Sections:

1. Purpose · Scope · Business Context
2. Mobile Personas — Accountant, Controller, CFO, Auditor, AP Clerk, AR Clerk, Tax Officer (7)
3. Mobile Navigation Architecture (tab-based; 5 primary tabs)
4. Mobile Information Architecture
5. Screen Inventory — canonical `MOD002-SCR-NNN` IDs covering all 6 WEB-002 domains (Foundation, Vouchers, Journals & Ledgers, Financial Statements, Taxation, Period Close & Audit); each screen row: ID, Name, Purpose, Primary Persona, Navigation Entry, Related Workflow, GT-005 Authority Mapping. Target ~28-32 screens (mobile-scoped subset of WEB-002 pages, adapted for form-factor)
6. Screen Specifications
7. Mobile User Journeys — mirrors WEB-002 C.1–C.11 adapted for mobile
8. Forms & Data Entry Optimization — numeric keypad (amounts), attachment capture (voucher docs via ENG-008), date pickers, search, inline validation; barcode/QR **only if authorized by publication** (else omit)
9. Mobile UI Component Architecture
10. Permissions & RBAC — from ENG-002/003 + ADR-032
11. Offline Behaviour — cached ledgers/masters (read), offline voucher draft capture (if supported by publication — else read-only offline), sync-on-reconnect, conflict surfacing per ADR-083 opted-in flows; document only what publication/ADRs authorize
12. Device Capability Integration — biometric auth, camera for attachment capture, secure upload, push for approvals/period-close alerts (only where ENG-025 / ADRs permit)
13. State Management
14. Search & Filtering
15. Notifications (ENG-025)
16. Error Handling
17. Accessibility — ADR-081 baseline
18. Responsive Mobile Layout
19. Engine Integration Mapping — all 14 engines from Publication §11
20. Cross-module Integration — MOD-001, MOD-003, MOD-004, MOD-008, MOD-015, MOD-017
21. Non-functional Requirements
22. Design Constraints — no new business requirements; no tech decisions absent ADR; parity with GT-005 and WEB-002; implementation-independent
23. Acceptance Criteria
24. **Traceability Matrix** (6 columns): GT-005 Authority | Sprint | Screen ID | Workflow | Engine(s) | ADR(s) — one row per Publication §4 authority (22 rows)
25. Repository State Transition

Upstream inconsistencies are reported as blocking findings, not corrected.

### Deliverable B — Registration Surfaces

- `docs/60-solution-design/mobile/README.md` — add MOB-002 row
- `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md` — add MOB-002 row
- `docs/_meta.json` — add MOB-002 under mobile group
- `docs/DOCUMENT_INDEX.md` — add MOB-002 entry
- `.lovable/plan.md` — append execution record `MOB002-SD-<timestamp>-001`

No governance standards, templates, or unrelated catalogs touched.

### Deliverable C — Verification Report

**Create:** `docs/50-audit-reports/MOB002_SOLUTION_DESIGN_VERIFICATION_<timestamp>.md`

16-check Check / Result / Action table per repository verification standard: frontmatter, structure vs MOB-001, GT-005 parity, WEB-002 parity, no orphan functionality, canonical screen IDs, journey coverage, RBAC, engine mappings, cross-module refs, offline documented, device capabilities authorized, accessibility, Design Constraints present, no governance mods, state transition authorized.

**Verification Summary:** `Checklist Items = Passed + Remediated + Failed`
**Certification rule:** `MAJOR = 0 ∧ CRITICAL = 0` per FINDING_SEVERITY_STANDARD.

### Exit Criteria

- MOB-002 authored with canonical structure and Screen IDs
- Parity with GT-005 and WEB-002 verified
- Offline/device capabilities documented only where authorized
- Verification passes with MAJOR=0, CRITICAL=0
- Registration surfaces updated
- State → `MOD002_MOBILE_SOLUTION_DESIGN_COMPLETE`
- Authorizes Pass 37.4.0 — API-002 Accounting

### Out of Scope

API design, code, DB schema, ADRs, engines, GT-005/WEB-002/baseline revisions, governance evolution, MOD-001 changes.

---

## Execution Record — MOB002-SD-20260719T060000Z-001

- **Pass ID:** 37.3.0
- **Pass Classification:** Solution Design — Mobile — Read/Author with scoped verification
- **Parent Execution:** WEB002-SD-20260719T050000Z-001
- **Deliverables:**
  - Authored `docs/60-solution-design/mobile/MOB-002_ACCOUNTING.md` (spec_id `MOB-002`, template `SD-001_MOBILE_SPEC` v1.0, 34 canonical Screen IDs `MOD002-SCR-001` … `MOD002-SCR-083`, 13 journeys, 15 form sections, 22 authorities in 6-col traceability §N).
  - Emitted `docs/50-audit-reports/MOB002_SOLUTION_DESIGN_VERIFICATION_20260719T060000Z.md` (16/16 PASS; MAJOR=0, CRITICAL=0).
  - Registered on `docs/60-solution-design/mobile/README.md`, `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md`, `docs/_meta.json`, `docs/DOCUMENT_INDEX.md`.
- **Repository State:** `MOD002_WEB_SOLUTION_DESIGN_COMPLETE` → `MOD002_MOBILE_SOLUTION_DESIGN_COMPLETE`.
- **Authorizes:** Pass 37.4.0 — API-002 Accounting Solution Design.
