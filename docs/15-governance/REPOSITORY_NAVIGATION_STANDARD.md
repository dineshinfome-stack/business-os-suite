---
title: "Repository Navigation Standard"
summary: "Official Business OS standard governing the per-module self-contained implementation-package navigation architecture."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-20"
version: "2.0"
supersedes: ["1.1"]
tags: ["governance", "navigation", "standard"]
---

# Repository Navigation Standard

## 1. Purpose & Authority

This document defines the approved Business OS repository navigation architecture. Version 2.0 supersedes Version 1.1 by adopting the **per-module self-contained implementation package** as the mandatory navigation model. This is an architectural change under §7.

> **Scope of this revision.** This change supersedes only the navigation layout. It does **not** change repository ownership, document authority, implementation workflow, or governance responsibilities. The repository remains the single source of truth; navigation exists only to improve discoverability.

## 2. Mandatory Navigation Contract

Every Business OS module **SHALL** expose one sidebar group whose header is `MOD-XXX <Name>` (e.g. `MOD-001 Platform Administration`). Within that group, items **SHALL** appear in this exact order (only those that exist on disk):

1. `Overview` — Module PRD
2. `Baseline` — Module Baseline
3. `Publication` — Module Publication
4. `WEB-XXX — Web Solution Design`
5. `MOB-XXX — Mobile Solution Design`
6. `API-XXX — API Solution Design`
7. `CPC-XXX — Cross-Platform Certification`
8. `VR-XXX — Verification` — Solution Design Verification report
9. `Sprint Plan`
10. `SPR-MOD-XXX-NNN — <Sprint Title>` — sprint PRDs ordered by sprint ID

### 2.1 Label Deduplication Rule

Item labels inside a module group **SHALL NOT** repeat the module name. The group header already carries `MOD-XXX <Name>`; items use `Overview`, `Baseline`, `Publication`, then ID-prefixed labels for WEB/MOB/API/CPC/VR, and `Sprint Plan` for the plan.

### 2.2 Module Ordering

Module groups **SHALL** be ordered by Module ID (MOD-001 → MOD-019, then MOD-020+). No other ordering is permitted.

### 2.3 Placeholders & Dead Links

Placeholder navigation entries are prohibited. Dead links are prohibited. Only documents that exist on disk appear in navigation.

## 3. Delivery Standard

Execution artifacts and phase gates **SHALL NOT** appear inside module navigation. The following **SHALL** remain centralized under global `Delivery — <Phase>` groups (or the equivalent centralized `Implementation Readiness` group for IRR):

- **Implementation Readiness Review (IRR)** — phase gate, not a module artifact
- Implementation Planning
- Engineering Execution
- Engineering Completion
- System Verification
- User Acceptance
- Release Readiness
- Production Release
- Post-Release Verification

Module navigation contains **implementation inputs**. Delivery navigation contains **implementation history and phase-gate reviews**. This separation is normative.

`VR-XXX` inside a module group refers to the module's **Solution Design Verification** report, not to any Delivery-phase verification.

## 4. IRR Placement (Normative)

The Implementation Readiness Review reviews the module package; it is not part of it. IRR documents **SHALL** live only under the centralized `Implementation Readiness` (or Delivery) navigation, never inside a `MOD-XXX <Name>` group.

If a per-module readiness artifact is desired in the future, it will be introduced under a distinct name — **Module Implementation Readiness Assessment (MIRA)** — via a separate architectural governance change. No MIRA is introduced by this standard.

## 5. Document ID Standard

| Document | Label / ID |
| --- | --- |
| Overview / Baseline / Publication | `Overview` / `Baseline` / `Publication` (module ID implicit from group header) |
| Web Solution Design | `WEB-XXX` |
| Mobile Solution Design | `MOB-XXX` |
| API Solution Design | `API-XXX` |
| Cross-Platform Certification | `CPC-XXX` |
| Solution Design Verification | `VR-XXX` |
| Sprint Plan | `Sprint Plan` |
| Sprint PRD | `SPR-MOD-XXX-NNN` |

These are navigation labels. File names may retain historical patterns; this standard does not require file renames.

## 6. Applicability

This standard applies to MOD-001 through MOD-019, MOD-020 and all future modules, AI modules, industry extensions, optional plug-in modules, and all future repository documentation additions.

## 7. Change Control

The Repository Navigation Standard is intended to remain stable across Business OS releases. Future changes **SHALL** be classified as either editorial or architectural.

### Editorial Changes

Editorial changes improve clarity without altering the navigation architecture (spelling, grammar, wording, formatting, metadata, cross-references, non-functional improvements). They **MAY** be approved through the normal documentation review process and **SHALL NOT** modify the navigation architecture.

### Architectural Changes

Architectural changes modify the approved model (adding/removing top-level groups, changing hierarchy, changing the module navigation contract, moving artifacts between groups, changing Delivery organization, introducing new patterns, modifying governance principles related to navigation). They **SHALL** require formal approval through the established Business OS governance process before implementation.

### Stability Principle

Future modules, AI capabilities, industry extensions, optional plug-ins, and documentation additions **SHALL** integrate into the approved navigation architecture rather than introducing alternative organizational patterns.

## 8. Repository Principles

- The repository remains the single source of truth.
- Navigation exists only to improve discoverability.
- Navigation **SHALL NEVER** duplicate documentation.
- Intentional duplicate navigation entries are permitted **only** when they improve usability. Sanctioned duplicate navigation entry points:
  - `SOLUTION_STATUS`
  - `BUSINESS_OS_EXECUTION_ROADMAP`
  - Sprint PRDs
- No document (by `path`) **SHALL** appear inside more than one `MOD-XXX <Name>` group.

## 9. Availability Matrix (Required Pre-Validation Artifact)

Before any change to `docs/_meta.json`, an Availability Matrix **SHALL** be produced enumerating, for each module, which of the ten contract items exist on disk. The matrix is the source input for the navigation rewrite. Items absent from disk **MUST NOT** appear in the sidebar. The matrix may be emitted inline in the change report.

## 10. Validation

Every change to `docs/_meta.json` **SHALL** be validated against:

1. Every `path` resolves to an existing `.md` file (no dead links).
2. Each module group's item order matches the §2 contract (skipping absent items).
3. Modules are ordered by Module ID.
4. No document (by `path`) appears inside more than one module group.
5. IRR documents do not appear inside any module group.
6. Sprint PRDs inside a module group belong to that module (`SPR-MOD-XXX-*`).
7. Item labels inside a module group do not repeat `MOD-XXX` beyond the sanctioned ID prefixes (WEB/MOB/API/CPC/VR/SPR-MOD).

## 11. Cross-References

- `docs/_meta.json` — current implementation of the sidebar that realizes this standard.
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` — module lifecycle producing the artifacts referenced by the navigation contract.
- `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` — governance framework registry.
- `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md` — frontmatter conventions applied to this document.

## 12. Version History

- **2.0 (2026-07-20)** — Adopted the per-module self-contained implementation package as the mandatory navigation model. Added label deduplication rule, Document ID Standard, Module Ordering clause, IRR placement rule (centralized only), Availability Matrix requirement, and expanded validation checks. Supersedes 1.1.
- **1.1** — Added Change Control section (editorial vs architectural).
- **1.0** — Initial workflow-based sidebar (Revision 3.1).
