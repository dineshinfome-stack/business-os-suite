---
document: Engineering Proposal (Pre-Intake)
title: Settings Namespace Bootstrap
status: Draft — Proposal (no sprint identifier reserved)
owner: Engineering
approver: Architecture Board (intake pending)
authority: Non-authoritative until Architecture Board intake
originating_dependency: SIP-014 (SPR-MOD-001-002, Phase 2)
supersedes: none
---

# Settings Namespace Bootstrap — Engineering Proposal

> **Governance status.** This is an **engineering proposal / PRD stub**, not a scheduled sprint. The Architecture Board will determine at intake whether this becomes `SPR-ENG-005-001`, is folded into another approved workstream, or is deferred further. **No sprint identifier is reserved.**

## 1. Origin

Raised as an architecture dependency during **SPR-MOD-001-002 Phase 2 closeout** (SIP-014). During Phase 2 backend implementation, the settings framework (`ENG-005`) was found to expose no primitive for initializing a configuration namespace scoped to a newly-created or newly-activated entity below the organization level, and the `setting_definitions` catalog contains no `company`- or `branch`-scoped keys.

Extending either the schema (`setting_scope` enum, per-entity `setting_values` addressing) or the seeded catalog is outside the Organization Structure sprint's scope and outside Phase 2's no-schema-edit invariant. The Architecture Board approved SIP-014 as **Deferred** and directed that the enhancement be raised as a separate engineering proposal.

Reference: `docs/04_Program_Status/reports/PHASE2_SPR-MOD-001-002_CLOSEOUT.md`.

## 2. Problem Statement

Downstream modules (Accounting, Sales, Purchase, Field Service, POS, etc.) will need company- and branch-scoped configuration surfaces — for example: currency, posting policy, numbering series, tax profile per branch, POS terminal defaults. Today the Settings Framework supports two scopes only:

- `platform` — global, single row per definition
- `organization` — one row per definition per tenant

There is no mechanism to (a) declare a setting whose value is keyed by `company_id` or `branch_id`, or (b) initialize the configuration namespace for a specific company/branch at lifecycle transitions (creation, activation).

## 3. Proposed Scope (subject to Board intake)

The following are candidate scope items only. The Board will confirm, split, or reject them at intake.

1. **Scope extension.** Add `company` and `branch` values to the settings scope enum and to `setting_definitions.scope`.
2. **Value addressing.** Extend `setting_values` to carry an optional `company_id` and `branch_id` column with a scope-appropriate UNIQUE index. Resolution precedence becomes `system default → platform → organization → company → branch`.
3. **Namespace initialization API.** Introduce a server-fn / RPC primitive:
   ```
   initializeNamespace(scope: "company" | "branch", entityId: uuid)
   ```
   Idempotent; seeds any `is_system=false` definitions declared for that scope with their declared defaults; emits an audit entry per initialization.
4. **Definition seeding.** A first-party catalog migration seeds an initial set of `company`- and `branch`-scoped definitions required by downstream modules. Exact list authored jointly with those modules' PRDs, not this proposal.
5. **Lifecycle integration hook.** Wire `initializeNamespace` into:
   - `fn_activate_company` — initializes the company namespace on the first activation transition.
   - `fn_create_branch` — initializes the branch namespace at creation.
   Both hooks are idempotent (safe on re-activation / re-creation retries) and no-op when the target namespace already exists.
6. **Read/write API.** Extend `resolveSettingFn` / `setSettingFn` to accept `{ scope, companyId?, branchId? }` and enforce that the caller's org context matches the entity's parent organization.
7. **Permissions.** New permission keys under `settings.company.*` and `settings.branch.*`, seeded and granted to appropriate platform / organization roles.
8. **Backward compatibility.** No change to existing `platform` / `organization` scope behavior. `setting_definitions` and `setting_values` migrations are additive.

## 4. Out of Scope

- Any per-user or per-role scope.
- Redesign of the audit or event surfaces.
- Migration of existing organization-scoped definitions down to company/branch scope (case-by-case decision per downstream sprint).
- UI surfaces for editing company/branch settings — those ship with the sprint(s) that consume the enhancement.

## 5. Dependencies

- `ENG-005` — Settings Framework (author of record).
- `ENG-024` — Audit / eventing (consumer of new namespace-init audit entry).
- `MOD-001` — Organization Structure (consumer via lifecycle hooks).

## 6. Non-Goals for This Document

This proposal is deliberately thin. It does not:

- Constitute an approved PRD.
- Reserve a sprint identifier.
- Commit to a delivery window.
- Author acceptance criteria, test plans, or data models — those follow only if the Board admits the work.

## 7. Board Intake Questions

1. Does the Board admit this as a discrete engineering sprint, fold it into an existing ENG-005 workstream, or defer further pending consumer demand?
2. If admitted as discrete, is the identifier `SPR-ENG-005-001` acceptable, or does the Board prefer a different assignment?
3. Should scope items 5 and 8 (lifecycle hooks; backward compatibility) be enforced in the same sprint or split?

## 8. Change Log

| Date | Change | Author |
|---|---|---|
| Phase 2 closeout | Initial proposal drafted from SIP-014 deferral. | Program Delivery |
