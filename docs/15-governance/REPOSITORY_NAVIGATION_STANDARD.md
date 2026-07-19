---
title: "Repository Navigation Standard"
summary: "Official Business OS standard governing the workflow-based repository documentation navigation architecture."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-19"
version: "1.1"
supersedes: []
tags: ["governance", "navigation", "standard"]
---

# Repository Navigation Standard

## 1. Purpose & Authority

This document formally adopts the current Business OS workflow-based navigation architecture as the approved repository navigation standard. The initial implementation of this standard was completed under Workflow-Based Sidebar Reorganization (Revision 3.1). Future refinements do not invalidate this standard unless it is formally revised through governance.

This standard is part of the Business OS governance framework and is mandatory for all current and future Business OS documentation. It governs the organization of the repository's documentation sidebar; it does not govern application UI navigation, product menus, or in-product wayfinding.

## 2. Mandatory Navigation Contract

Every Business OS module **SHALL** expose the following navigation contract, in this exact order:

1. Overview (Module PRD)
2. Baseline
3. Publication
4. WEB Solution Design
5. Mobile Solution Design
6. API Solution Design
7. Cross-Platform Certification
8. Sprints

Only documents that actually exist shall appear. Placeholder navigation entries are prohibited. Dead links are prohibited.

## 3. Delivery Standard

Execution artifacts **SHALL NOT** appear inside module navigation. The following artifacts **SHALL** remain centralized under the global `Delivery — <Phase>` navigation groups:

- Implementation Planning
- Engineering Execution
- Engineering Completion
- System Verification
- User Acceptance
- Release Readiness
- Production Release
- Post-Release Verification

Module navigation contains **implementation inputs**. Delivery navigation contains **implementation history**. This separation is normative.

## 4. Applicability

This standard applies to:

- MOD-001 through MOD-019
- MOD-020 and all future modules
- AI modules
- Industry extensions
- Optional plug-in modules
- All future repository documentation additions

## 5. Governance Rule

Any deviation from this navigation standard **SHALL** require approval through the established Business OS governance process before the navigation architecture is modified.

Individual documents may evolve freely. The navigation architecture itself shall remain stable unless formally revised.

## 6. Repository Principles

- The repository remains the single source of truth.
- Navigation exists only to improve discoverability.
- Navigation **SHALL NEVER** duplicate documentation.
- Intentional duplicate navigation entries are permitted **only** when they improve usability. Sanctioned duplicate navigation entry points:
  - `SOLUTION_STATUS`
  - `BUSINESS_OS_EXECUTION_ROADMAP`
  - Sprint PRDs

These remain alternate navigation entry points into the same underlying document.

## 7. Change Control

The Repository Navigation Standard is intended to remain stable across Business OS releases.

Future changes **SHALL** be classified as either editorial or architectural.

### Editorial Changes

Editorial changes improve clarity without altering the navigation architecture. Examples include:

- spelling corrections
- grammar improvements
- wording clarification
- formatting updates
- metadata updates
- cross-reference updates
- non-functional documentation improvements

Editorial changes **MAY** be approved through the normal documentation review process. They **SHALL NOT** modify the navigation architecture.

### Architectural Changes

Architectural changes modify the approved repository navigation model. Examples include:

- adding or removing top-level navigation groups
- changing navigation hierarchy
- changing the standard module navigation contract
- moving artifacts between navigation groups
- changing Delivery organization
- introducing new navigation patterns
- modifying governance principles related to navigation

Architectural changes **SHALL** require formal approval through the established Business OS governance process before implementation.

### Stability Principle

The approved Repository Navigation Standard is intended to remain stable across Business OS releases.

Future modules, AI capabilities, industry extensions, optional plug-ins, and documentation additions **SHALL** integrate into the approved navigation architecture rather than introducing alternative organizational patterns.

This principle preserves:

- repository consistency
- developer experience
- predictable Lovable AI implementation
- documentation discoverability
- long-term maintainability

## 8. Future Module Standard

Future modules shall follow the approved navigation contract without modification. Future modules **SHALL NOT** introduce:

- additional lifecycle sections
- execution history under module navigation
- duplicate engineering artifacts
- module-specific navigation structures

unless the Business OS navigation architecture is formally revised through governance approval.

## 9. Stability Policy

The navigation architecture should remain stable across releases. New modules shall integrate into the existing navigation model rather than introducing new organizational patterns. Stability ensures:

- consistent developer experience
- predictable Lovable AI implementation workflow
- simplified onboarding
- long-term repository maintainability
- preservation of the repository as the single source of truth

## 10. Cross-References

- `docs/_meta.json` — current implementation of the sidebar that realizes this standard.
- `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` — module lifecycle producing the artifacts referenced by the navigation contract.
- `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` — governance framework registry.
- `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md` — frontmatter conventions applied to this document.

**Historical note.** The initial implementation of this standard was delivered under Workflow-Based Sidebar Reorganization (Revision 3.1). Later revisions of the sidebar implementation do not affect the normative sections of this standard unless they are formally revised.

## 11. Success Criteria

- This standard exists as an approved governance document.
- The sidebar implementation continues to satisfy the Mandatory Navigation Contract and the Delivery Standard.
- All future modules inherit the same contract.
- Delivery artifacts remain centralized under `Delivery — <Phase>` groups.
- Module navigation remains implementation-input-focused.
- Future repository growth follows a consistent governance model.
