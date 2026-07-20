---
title: "Navigation Availability Audit v2.0"
summary: "Disk-truth audit of module-group contract items in docs/_meta.json against actual repository contents."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-20"
version: "2.0"
tags: ["governance", "navigation", "audit"]
---

# Navigation Availability Audit v2.0

## 1. Scope and Method

**Scope.** Every `MOD-XXX` sidebar group in `docs/_meta.json` (MOD-001..MOD-019). Non-module groups (Dashboard, Foundation, Architecture, Delivery, Implementation Readiness Review, Sprint PRDs) are out of scope.

**Contract items audited** (Repository Navigation Standard v2.0 §2): Overview, Baseline, Publication, WEB-XXX, MOB-XXX, API-XXX, CPC-XXX, VR-XXX, Sprint Plan, Sprint PRDs.

**Method.** For each module, the filesystem under `docs/` is scanned for each contract item independently of what the sidebar currently lists. Presence/absence on disk is authoritative. Any sidebar item whose file does not exist is removed from `docs/_meta.json`; nothing is added, no placeholders are created.

## 2. Availability Matrix

Legend: `Y` = present on disk. `.` = missing. `Sprints` counts SPR-MOD-XXX-* files on disk.

| Module | Overview | Baseline | Publication | WEB | MOB | API | CPC | VR | Sprint Plan | Sprints |
|---|---|---|---|---|---|---|---|---|---|---|
| MOD-001 Platform Administration | Y | Y | Y | Y | Y | Y | Y | Y | Y | 6 |
| MOD-002 Accounting | Y | Y | Y | Y | Y | Y | Y | . | Y | 6 |
| MOD-003 Sales | Y | Y | Y | Y | Y | Y | Y | Y | Y | 6 |
| MOD-004 Purchase | Y | Y | . | Y | Y | Y | Y | Y | Y | 6 |
| MOD-005 Inventory | Y | Y | . | Y | Y | Y | Y | Y | Y | 6 |
| MOD-006 CRM | Y | Y | . | . | . | . | . | . | Y | 6 |
| MOD-007 HRMS | Y | Y | . | . | . | . | . | . | Y | 6 |
| MOD-008 Payroll | Y | Y | . | . | . | . | . | . | Y | 6 |
| MOD-009 Manufacturing | Y | Y | . | . | . | . | . | . | Y | 6 |
| MOD-010 Projects | Y | Y | . | . | . | . | . | . | Y | 5 |
| MOD-011 AMC | Y | Y | . | . | . | . | . | . | Y | 4 |
| MOD-012 Field Service | Y | Y | . | . | . | . | . | . | Y | 5 |
| MOD-013 Assets | Y | Y | . | . | . | . | . | . | Y | 4 |
| MOD-014 Fleet | Y | Y | . | . | . | . | . | . | Y | 4 |
| MOD-015 POS | Y | Y | . | . | . | . | . | . | Y | 5 |
| MOD-016 Service Desk | Y | Y | . | . | . | . | . | . | Y | 0 |
| MOD-017 Analytics | Y | Y | Y | Y | Y | Y | . | . | Y | 0 |
| MOD-018 AI Workspace | Y | Y | Y | Y | Y | Y | . | . | Y | 0 |
| MOD-019 Warehouse | Y | Y | . | Y | Y | Y | Y | Y | Y | 6 |

## 3. Documentation Gaps

**MOD-002 Accounting**
- Verification Report (VR-002): Missing

**MOD-004 Purchase**
- Module Publication: Missing

**MOD-005 Inventory**
- Module Publication: Missing

**MOD-006 CRM**
- Module Publication: Missing
- Web Solution Design (WEB-006): Missing
- Mobile Solution Design (MOB-006): Missing
- API Solution Design (API-006): Missing
- Cross-Platform Certification (CPC-006): Missing
- Verification Report (VR-006): Missing

**MOD-007 HRMS**
- Module Publication: Missing
- Web Solution Design (WEB-007): Missing
- Mobile Solution Design (MOB-007): Missing
- API Solution Design (API-007): Missing
- Cross-Platform Certification (CPC-007): Missing
- Verification Report (VR-007): Missing

**MOD-008 Payroll**
- Module Publication: Missing
- Web Solution Design (WEB-008): Missing
- Mobile Solution Design (MOB-008): Missing
- API Solution Design (API-008): Missing
- Cross-Platform Certification (CPC-008): Missing
- Verification Report (VR-008): Missing

**MOD-009 Manufacturing**
- Module Publication: Missing
- Web Solution Design (WEB-009): Missing
- Mobile Solution Design (MOB-009): Missing
- API Solution Design (API-009): Missing
- Cross-Platform Certification (CPC-009): Missing
- Verification Report (VR-009): Missing

**MOD-010 Projects**
- Module Publication: Missing
- Web Solution Design (WEB-010): Missing
- Mobile Solution Design (MOB-010): Missing
- API Solution Design (API-010): Missing
- Cross-Platform Certification (CPC-010): Missing
- Verification Report (VR-010): Missing

**MOD-011 AMC**
- Module Publication: Missing
- Web Solution Design (WEB-011): Missing
- Mobile Solution Design (MOB-011): Missing
- API Solution Design (API-011): Missing
- Cross-Platform Certification (CPC-011): Missing
- Verification Report (VR-011): Missing

**MOD-012 Field Service**
- Module Publication: Missing
- Web Solution Design (WEB-012): Missing
- Mobile Solution Design (MOB-012): Missing
- API Solution Design (API-012): Missing
- Cross-Platform Certification (CPC-012): Missing
- Verification Report (VR-012): Missing

**MOD-013 Assets**
- Module Publication: Missing
- Web Solution Design (WEB-013): Missing
- Mobile Solution Design (MOB-013): Missing
- API Solution Design (API-013): Missing
- Cross-Platform Certification (CPC-013): Missing
- Verification Report (VR-013): Missing

**MOD-014 Fleet**
- Module Publication: Missing
- Web Solution Design (WEB-014): Missing
- Mobile Solution Design (MOB-014): Missing
- API Solution Design (API-014): Missing
- Cross-Platform Certification (CPC-014): Missing
- Verification Report (VR-014): Missing

**MOD-015 POS**
- Module Publication: Missing
- Web Solution Design (WEB-015): Missing
- Mobile Solution Design (MOB-015): Missing
- API Solution Design (API-015): Missing
- Cross-Platform Certification (CPC-015): Missing
- Verification Report (VR-015): Missing

**MOD-016 Service Desk**
- Module Publication: Missing
- Web Solution Design (WEB-016): Missing
- Mobile Solution Design (MOB-016): Missing
- API Solution Design (API-016): Missing
- Cross-Platform Certification (CPC-016): Missing
- Verification Report (VR-016): Missing

**MOD-017 Analytics**
- Cross-Platform Certification (CPC-017): Missing
- Verification Report (VR-017): Missing

**MOD-018 AI Workspace**
- Cross-Platform Certification (CPC-018): Missing
- Verification Report (VR-018): Missing

**MOD-019 Warehouse**
- Module Publication: Missing

## 4. Navigation Changes

None — sidebar already matches disk. Every item currently listed inside a `MOD-XXX` group in `docs/_meta.json` resolves to an existing `.md` file. No entries were removed. No placeholders were introduced.

## 5. Additional Observations (Informational)

- `MOD-001` has an additional WEB Solution Design file on disk at `docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md` that is not referenced by the sidebar (the sidebar points to `60-solution-design/web/platform/MOD-001_WEB_SOLUTION_DESIGN.md`). This is an authoring-side duplication concern, not a navigation defect, and is out of scope for this pass.

## 6. Validation

- [x] Every remaining module-group `path` in `docs/_meta.json` resolves to an existing `.md` file.
- [x] No placeholder or dead-link entry was created.
- [x] Item order inside each module group matches Repository Navigation Standard v2.0 §2.
- [x] No IRR document appears inside any `MOD-XXX` group (IRR remains centralized under the `Implementation Readiness Review` group).
- [x] No document `path` appears inside more than one module group.

## 7. Versioning

This document uses stable versioned naming (`NAVIGATION_AVAILABILITY_AUDIT_vX.Y.md`). Future audits supersede in place by incrementing the version suffix. Timestamped audit filenames are not used for this artifact.
