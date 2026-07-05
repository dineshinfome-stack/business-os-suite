---
title: "Document Ownership Matrix"
summary: "Governance ownership index for every documentation family: primary owner, approval authority, change mechanism, and authoritative documents."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["ownership", "governance", "index"]
document_type: "Governance Guide"
---

# Document Ownership Matrix

> **Derived document.** This matrix restates ownership and approval responsibilities established elsewhere in the repository. It introduces **no new governance rules and no ownership changes**. On any conflict, the source governance document wins and this matrix is corrected in the same change.

## Purpose

The **Document Ownership Matrix** is the governance ownership index for the documentation repository. It gives readers and maintainers a single place to answer three questions for every documentation family:

- Who owns it?
- Who approves changes to it?
- How is a change proposed and ratified?

## Maintenance Note

This matrix SHOULD be regenerated or reviewed whenever a governance responsibility, owner, or approval authority changes in a source document. It MUST NOT become an independent source of truth.

## Ownership Matrix

| Documentation Family | Primary Owner | Approval Authority | Change Mechanism | Authoritative Documents |
| --- | --- | --- | --- | --- |
| Foundation Freeze | Platform | Architecture Governance + Product Governance | New Foundation revision (versioned) | `docs/FOUNDATION_FREEZE_v1.md` |
| Product Documentation Baseline | Platform | Architecture Governance + Product Governance | New baseline revision (versioned) | `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md` |
| Canon | Platform | Architecture Governance | Canon amendment, requires review | `docs/canon.md` |
| Business Blueprint | Product | Product Governance | PRD/Roadmap update review | `docs/00-vision/`, `docs/01-master/` |
| Architecture | Architecture Governance | ADR process | New or superseding ADR → doc update | `docs/02-architecture/` |
| ERP Core Engines | Platform | ADR + Architecture Governance | Engine SemVer change; ADR when interface changes | `docs/10-erp-core/` |
| Architecture Decision Records | Platform | ADR lifecycle (`Draft → Proposed → Accepted`) | New ADR or supersession | `docs/11-adrs/` |
| Documentation Traceability & Indexes | Platform | Documentation Governance | Regenerate on source change | `docs/DOCUMENT_TRACEABILITY.md`, `docs/REPOSITORY_MAP.md`, `docs/DOCUMENT_INDEX.md`, `docs/GLOSSARY_INDEX.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/ADR_IMPACT_MATRIX.md`, `docs/MODULE_CATALOG.md`, `docs/SPRINT_CATALOG.md`, this document |
| Module PRDs | Product | Product + Architecture review | Module PRD lifecycle | `docs/20-module-prds/` → `MOD-001` … `MOD-018` |
| Sprint PRDs | Engineering | Engineering review | Sprint PRD lifecycle (`Draft → Planned → In Progress → Done → Superseded`) | `docs/30-sprint-prds/` → `SPR-MOD-NNN-NNN` |
| Coding Standards | Engineering | Engineering + Architecture review | ADR (Engineering category) → doc update | `docs/03-design/coding-standards.md` |
| Design Standards | Design | Design + Engineering review | ADR (UI category) → doc update | `docs/03-design/ui-ux-design-system.md`, `docs/03-design/ux-standards.md` |

## Change Authority

- **Canon** → Architecture Governance. Only amended when a Foundation-level assumption changes.
- **Business Blueprint** → Product Governance. Bound by Canon.
- **Architecture** → ADR process. No direct edits without an Accepted ADR.
- **ERP Core Engines** → ADR + Architecture Governance. Interface changes require an ADR; internal changes follow SemVer.
- **ADRs** → ADR lifecycle (`Draft → Proposed → Accepted → Superseded | Deprecated | Rejected`).
- **Module PRDs** → Product + Architecture review. Must consume Canon, Architecture, ERP Core Engines, and Accepted ADRs. No platform redefinition.
- **Sprint PRDs** → Engineering. Bound by their Module PRD.
- **Documentation indexes** (Traceability, Repository Map, Document Index, Ownership Matrix, Glossary Index, Engine Usage Matrix, ADR Impact Matrix, Module Catalog) → Documentation Governance. Regenerated or reviewed whenever their sources change.

## References

- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/canon.md`
- `docs/governance.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/REPOSITORY_MAP.md`
- `docs/11-adrs/README.md`
- `docs/10-erp-core/ENGINE_CATALOG.md`
