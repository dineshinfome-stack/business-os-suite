---
title: "Solution Design Catalog"
summary: "Registration index for all Phase 3 platform specifications (WEB, MOB, API). Empty at framework establishment; specifications are registered as they are authored, one per Published Module per family."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-18"
tags: ["solution-design", "phase-3", "catalog", "SD-001"]
document_type: "Registration Catalog"
---

# Solution Design Catalog

Authoritative registration index for Phase 3 platform specifications. Each row records one authored specification and its provenance from a Published Module.

## Planned Coverage Rule

**One planned WEB, MOB, and API specification per Published Module listed in [`docs/MODULE_PUBLICATION_CATALOG.md`](../MODULE_PUBLICATION_CATALOG.md).**

Numbering derives from the source module's `MOD-<NNN>`. No independent numeric range is reserved and no hard-coded module list is maintained here — the set of planned specifications is derived at read time from the Module Publication Catalog. As new modules are Published, three planned specifications (WEB / MOB / API) become in scope for authoring under this framework.

## Registration Table

| Spec ID | Family | Source Module | Source Publication | Lifecycle State | Owner | Updated |
| --- | --- | --- | --- | --- | --- | --- |
| [WEB-001](./web/WEB-001_ANALYTICS.md) | WEB | MOD-017 Analytics | MOD-017_MODULE_PUBLICATION | Active | Insights | 2026-07-18 |
| [MOB-001](./mobile/MOB-001_ANALYTICS.md) | MOB | MOD-017 Analytics | MOD-017_MODULE_PUBLICATION | Active | Insights | 2026-07-18 |
| [API-001](./api/API-001_ANALYTICS.md) | API | MOD-017 Analytics | MOD-017_MODULE_PUBLICATION | Active | Insights | 2026-07-18 |
| [WEB-002](./web/WEB-002_AI_WORKSPACE.md) | WEB | MOD-018 AI Workspace | MOD-018_MODULE_PUBLICATION | Active | AI Platform | 2026-07-18 |
| [MOB-002](./mobile/MOB-002_AI_WORKSPACE.md) | MOB | MOD-018 AI Workspace | MOD-018_MODULE_PUBLICATION | Active | AI Platform | 2026-07-18 |
| [API-002](./api/API-002_AI_WORKSPACE.md) | API | MOD-018 AI Workspace | MOD-018_MODULE_PUBLICATION | Active | AI Platform | 2026-07-18 |

Registration is additive. Each new specification adds one row per family and links to the artefact under `docs/60-solution-design/{web,mobile,api}/`.

## Notes

- Lifecycle states follow the standard governance lifecycle: `Draft → Review → Active → Deprecated → Archived`.
- A specification MUST NOT be registered as `Active` unless its source Published Module is in a `Published` state.
- Superseded specifications remain in the table with lifecycle `Deprecated` or `Archived` and preserve their audit trail.

## References

- [`docs/60-solution-design/README.md`](./README.md)
- [`docs/MODULE_PUBLICATION_CATALOG.md`](../MODULE_PUBLICATION_CATALOG.md)
- [`docs/MODULE_BASELINE_CATALOG.md`](../MODULE_BASELINE_CATALOG.md)
