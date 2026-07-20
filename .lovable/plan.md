## Objective

Freeze the per-module "self-contained implementation package" as the repository navigation standard (v2.0). Each module exposes the same ordered set of documents in the sidebar. IRR is **excluded** from the module package and remains a centralized phase gate. Sidebar labels inside a module group omit the module name to avoid duplication (the group header already carries `MOD-XXX <Name>`).

## Scope

- Documentation and navigation only. Changes limited to `docs/_meta.json` and `docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md`.
- Applies to all existing modules (MOD-001 … MOD-019) and all future modules.

## Frozen Module Navigation Contract (v2.0)

Group header: `MOD-XXX <Name>` (e.g. `MOD-001 Platform Administration`).

Item labels within the group (module name is **not** repeated):

1. `Overview` (Module PRD)
2. `Baseline`
3. `Publication`
4. `WEB-XXX — Web Solution Design`
5. `MOB-XXX — Mobile Solution Design`
6. `API-XXX — API Solution Design`
7. `CPC-XXX — Cross-Platform Certification`
8. `VR-XXX — Verification` (Solution Design verification)
9. `Sprint Plan`
10. `SPR-MOD-XXX-NNN — <Sprint Title>` (ordered by sprint ID)

Only documents that exist on disk are listed — no placeholders, no dead links. Modules SHALL be ordered by Module ID (MOD-001 → MOD-019, then MOD-020+).

## IRR Placement (Explicit)

The **Implementation Readiness Review (IRR)** is a **phase gate**, not a module artifact. It reviews the module package; it is not part of it.

- IRR documents remain under a centralized **`Implementation Readiness`** navigation group (or the existing Delivery grouping that already hosts them).
- IRR SHALL NOT appear inside any module group.
- If a per-module readiness artifact is desired in the future, it will be introduced under a distinct name — **Module Implementation Readiness Assessment (MIRA)** — via a separate governance change. No MIRA is introduced in this pass.

## Document ID Standard (Frozen)

| Document | ID |
|---|---|
| Overview / Baseline / Publication | `MOD-XXX` (implicit from group header; label omits it) |
| Web Solution Design | `WEB-XXX` |
| Mobile Solution Design | `MOB-XXX` |
| API Solution Design | `API-XXX` |
| Cross-Platform Certification | `CPC-XXX` |
| Verification | `VR-XXX` |
| Sprint Plan | `Sprint Plan` (label); file remains as-is |
| Sprint PRD | `SPR-MOD-XXX-NNN` |

IDs are navigation labels only — no file renames in this pass.

## Change Classification

Architectural change under `REPOSITORY_NAVIGATION_STANDARD.md` §7. Supersedes the prior contract that centralized WEB/MOB/API/CPC in global sibling groups.

Governance scope clarification recorded verbatim in v2.0:

> This change supersedes only the navigation layout. It does not change repository ownership, document authority, implementation workflow, or governance responsibilities.

Delivery artifacts (Implementation Planning, Engineering Execution/Completion, System Verification, User Acceptance, Release Readiness, Production Release, Post-Release Verification) and IRR remain **centralized under global groups**. `VR-XXX` inside a module group refers to the module's Solution Design Verification report, not to Delivery-phase verifications.

## Deliverables

1. **`docs/15-governance/REPOSITORY_NAVIGATION_STANDARD.md` → v2.0**
   - Rewrite §2 "Mandatory Navigation Contract" to the 10-item per-module package above (no IRR).
   - Codify the **label-deduplication rule**: within a `MOD-XXX <Name>` group, item labels MUST NOT repeat the module name; use `Overview`, `Baseline`, `Publication`, then ID-prefixed labels for WEB/MOB/API/CPC/VR.
   - Update §3 to clarify: Delivery artifacts and IRR remain centralized.
   - Add "Document ID Standard" and "Module Ordering" sections (ordered by Module ID).
   - Record the governance-scope clarification sentence.
   - Version history: v2.0 supersedes v1.1.

2. **Availability Matrix (Required pre-validation artifact used to generate `_meta.json`)**
   - Before editing `_meta.json`, enumerate for each MOD-001 … MOD-019 which of the 10 contract items exist on disk (path + presence).
   - Serves as the source input for the `_meta.json` rewrite. Items absent on disk MUST NOT appear in the sidebar.
   - Emitted inline in the execution report; no separate persisted file.

3. **`docs/_meta.json` restructure**
   - Remove the standalone global groups: `WEB Specifications`, `MOB Specifications`, `API Specifications`, `Cross-Platform Certifications`.
   - Under a `Modules` top-level section, create one group per module (`MOD-001 Platform Administration`, `MOD-002 Accounting`, …, `MOD-019 Warehouse`) ordered by Module ID.
   - Populate each module group from the Availability Matrix, ordered per the contract, with de-duplicated labels.
   - IRR documents move to (or remain in) a centralized `Implementation Readiness` group at the top level.
   - Existing top-level groups (Dashboard, Execution Workspace, Implementation Roadmap, Foundation, Architecture, Design System, AI, Platform, Governance, Delivery — *, PM, Archive) remain unchanged.
   - Preserve sanctioned duplicate entries (SOLUTION_STATUS, BUSINESS_OS_EXECUTION_ROADMAP, Sprint PRDs).

## Explicit Non-Goals

- No file renames, no path changes, no content edits inside any module document.
- No changes to `MODULE_IMPLEMENTATION_WORKFLOW.md`, catalogs, or ADRs.
- No new document types.
- No MIRA introduced in this pass.
- No changes to Delivery groups.

## Validation

Python script over `docs/_meta.json` asserts:
1. Every `path` resolves to an existing `.md` file (no dead links).
2. Each module group's item order matches the 10-item contract (skipping absent items).
3. Modules are ordered by Module ID.
4. **No document (by `path`) appears inside more than one module group.**
5. IRR documents do not appear inside any module group.
6. Sprint PRDs inside a module group belong to that module (`SPR-MOD-XXX-*`).
7. Item labels inside a module group do not contain the module name substring (deduplication rule).

Manual spot-check in preview for MOD-001, MOD-002, MOD-003.

## Rollout

1. Update `REPOSITORY_NAVIGATION_STANDARD.md` to v2.0.
2. Produce the Availability Matrix.
3. Rewrite affected portion of `docs/_meta.json` from the matrix.
4. Run validation script; report per-module inventory and gaps.
