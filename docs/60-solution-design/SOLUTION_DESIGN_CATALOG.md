---
title: "Solution Design Catalog"
summary: "Registration index for all Phase 3 platform specifications (WEB, MOB, API), grouped by family and followed by Cross-Platform Certifications. Specifications are registered as they are authored, one per Published Module per family."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-19"
tags: ["solution-design", "phase-3", "catalog", "SD-001"]
document_type: "Registration Catalog"
---

# Solution Design Catalog

Authoritative registration index for Phase 3 platform specifications. Each row records one authored specification and its provenance from a Published Module. Cross-Platform Certification artifacts are indexed in a separate section following the specification families.

## Planned Coverage Rule

**One planned WEB, MOB, and API specification per Published Module listed in [`docs/MODULE_PUBLICATION_CATALOG.md`](../MODULE_PUBLICATION_CATALOG.md).**

Numbering derives from the source module's `MOD-<NNN>`. No independent numeric range is reserved and no hard-coded module list is maintained here — the set of planned specifications is derived at read time from the Module Publication Catalog. As new modules are Published, three planned specifications (WEB / MOB / API) become in scope for authoring under this framework.

## WEB Specifications

| Spec ID | Source Module | Source Publication | Lifecycle State | Owner | Updated |
| --- | --- | --- | --- | --- | --- |
| [WEB-001](./web/WEB-001_PLATFORM_ADMINISTRATION.md) | MOD-001 Platform Administration | MOD-001_MODULE_PUBLICATION | Active | Architecture Office | 2026-07-18 |
| [WEB-002](./web/WEB-002_ACCOUNTING.md) | MOD-002 Accounting | MOD-002_MODULE_PUBLICATION | Active | Accounting | 2026-07-19 |
| [WEB-003 (46-)](../46-solution-design/web/sales/WEB-003_SOLUTION_DESIGN.md) | MOD-003 Sales | MOD-003_MODULE_PUBLICATION | Active | Sales | 2026-07-19 |
| [WEB-017](./web/WEB-017_ANALYTICS.md) | MOD-017 Analytics | MOD-017_MODULE_PUBLICATION | Active | Insights | 2026-07-18 |
| [WEB-018](./web/WEB-018_AI_WORKSPACE.md) | MOD-018 AI Workspace | MOD-018_MODULE_PUBLICATION | Active | AI Platform | 2026-07-18 |

## MOB Specifications

| Spec ID | Source Module | Source Publication | Lifecycle State | Owner | Updated |
| --- | --- | --- | --- | --- | --- |
| [MOB-001](./mobile/MOB-001_PLATFORM_ADMINISTRATION.md) | MOD-001 Platform Administration | MOD-001_MODULE_PUBLICATION | Active | Architecture Office | 2026-07-18 |
| [MOB-002](./mobile/MOB-002_ACCOUNTING.md) | MOD-002 Accounting | MOD-002_MODULE_PUBLICATION | Active | Accounting | 2026-07-19 |
| [MOB-003 (46-)](../46-solution-design/mobile/sales/MOB-003_SOLUTION_DESIGN.md) | MOD-003 Sales | MOD-003_MODULE_PUBLICATION | Active | Sales | 2026-07-19 |
| [MOB-017](./mobile/MOB-017_ANALYTICS.md) | MOD-017 Analytics | MOD-017_MODULE_PUBLICATION | Active | Insights | 2026-07-18 |
| [MOB-018](./mobile/MOB-018_AI_WORKSPACE.md) | MOD-018 AI Workspace | MOD-018_MODULE_PUBLICATION | Active | AI Platform | 2026-07-18 |

## API Specifications

| Spec ID | Source Module | Source Publication | Lifecycle State | Owner | Updated |
| --- | --- | --- | --- | --- | --- |
| [API-001](./api/API-001_PLATFORM_ADMINISTRATION.md) | MOD-001 Platform Administration | MOD-001_MODULE_PUBLICATION | Active | Architecture Office | 2026-07-18 |
| [API-002](./api/API-002_ACCOUNTING.md) | MOD-002 Accounting | MOD-002_MODULE_PUBLICATION | Active | Accounting | 2026-07-19 |
| [API-003 (46-)](../46-solution-design/api/sales/API-003_SOLUTION_DESIGN.md) | MOD-003 Sales | MOD-003_MODULE_PUBLICATION | Active | Sales | 2026-07-19 |
| [API-017](./api/API-017_ANALYTICS.md) | MOD-017 Analytics | MOD-017_MODULE_PUBLICATION | Active | Insights | 2026-07-18 |
| [API-018](./api/API-018_AI_WORKSPACE.md) | MOD-018 AI Workspace | MOD-018_MODULE_PUBLICATION | Active | AI Platform | 2026-07-18 |

## Cross-Platform Certifications

Certification artifacts are grouped separately from specifications and ordered by artifact type (Certification Report, then Certification Verification Report) — not by numeric suffix.

| Module | Artifact Type | Report | Path | Date |
| --- | --- | --- | --- | --- |
| MOD-003 Sales | Certification Report | MOD-003 Sales Cross-Platform Certification Report | [`MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z`](../50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_20260719T210000Z.md) | 2026-07-19 |
| MOD-003 Sales | Certification Verification Report | MOD-003 Cross-Platform Certification Verification Report | [`MOD003_CROSS_PLATFORM_CERTIFICATION_VERIFICATION_20260719T210500Z`](../50-audit-reports/MOD003_CROSS_PLATFORM_CERTIFICATION_VERIFICATION_20260719T210500Z.md) | 2026-07-19 |

Registration is additive. Each new specification adds one row per family and links to the artefact under `docs/60-solution-design/{web,mobile,api}/` or, where applicable, its canonical location under `docs/46-solution-design/{web,mobile,api}/`.

## Notes

- Lifecycle states follow the standard governance lifecycle: `Draft → Review → Active → Deprecated → Archived`.
- A specification MUST NOT be registered as `Active` unless its source Published Module is in a `Published` state.
- Superseded specifications remain in the table with lifecycle `Deprecated` or `Archived` and preserve their audit trail.
- **Ordering — Specifications:** Rows within each specification family (WEB, MOB, API) are sorted in ascending order of the numeric suffix of the Spec ID.
- **Ordering — Cross-Platform Certifications:** The Cross-Platform Certifications section is grouped separately, placed after the API family, and is ordered by artifact type — Certification Report, then Certification Verification Report — not by numeric suffix.
- **Surface duality (informational):** MOD-003 specification rows reference the canonical documents under `docs/46-solution-design/{web,mobile,api}/sales/`, while retaining the `(46-)` indicator in the Spec ID column to reflect the documented `46-`/`60-` surface duality (INFO-01 in prior verification reports). The catalog indexes existing canonical documents; the `(46-)` label is informational and does not imply path migration or repository restructuring.

## References

- [`docs/60-solution-design/README.md`](./README.md)
- [`docs/46-solution-design/README.md`](../46-solution-design/README.md)
- [`docs/MODULE_PUBLICATION_CATALOG.md`](../MODULE_PUBLICATION_CATALOG.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md)
