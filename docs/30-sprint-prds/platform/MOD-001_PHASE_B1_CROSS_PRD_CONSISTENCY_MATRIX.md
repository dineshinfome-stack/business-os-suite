---
title: "MOD-001 Phase B1 — Cross-PRD Consistency Matrix"
summary: "Consistency verification across SPR-MOD-001-001, -002, -003 (v2). Verifies terminology, architecture, lifecycle, event naming, dependency ordering, ownership, ADR references, capability references, and absence of shared-DB wording."
layer: "governance"
owner: "Platform"
status: "approved"
updated: "2026-07-25"
scope: ["SPR-MOD-001-001", "SPR-MOD-001-002", "SPR-MOD-001-003"]
related_adrs: ["ADR-017"]
tags: ["governance", "consistency", "mod-001", "phase-b1", "v2"]
document_type: "Consistency Matrix"
---

# MOD-001 Phase B1 — Cross-PRD Consistency Matrix

Verifies the three Phase B1 Sprint PRDs (v2) against a fixed set of consistency axes. Result cells: **✓ Pass**, **✗ Fail**, **N/A** where the axis does not apply to a given PRD.

## 1. Verification Axes

| # | Axis | Definition |
| --- | --- | --- |
| A1 | Terminology identical | Tenant / Workspace / Company / Branch / Financial Year / Platform DB / Tenant DB used with identical meanings across PRDs. |
| A2 | Architecture identical | Same ADR-017 posture; no PRD contradicts another. |
| A3 | Lifecycle consistent | Lifecycle states referenced (Tenant / Company / Branch / FY) match across PRDs. |
| A4 | Event naming consistent | Event names follow `<domain>.<entity>.<action>` and do not collide. |
| A5 | Dependency ordering correct | No PRD depends on a later PRD's capability. |
| A6 | No duplicated standards | Governance / RBAC / audit / event / permission standards are referenced, not restated. |
| A7 | No conflicting ownership | Each capability has exactly one owning PRD across the set. |
| A8 | Identical ADR references | ADR-017 (and dependents) cited with identical status and scope. |
| A9 | Valid capability references | Every capability cited resolves to Baseline v2 §4 or Module PRD. |
| A10 | No shared-DB wording | No shared-schema/RLS-scoped-tenant-column phrasing anywhere. |

## 2. Per-PRD Matrix

| Axis | SPR-001 | SPR-002 | SPR-003 |
| --- | :-: | :-: | :-: |
| A1 Terminology identical | ✓ | ✓ | ✓ |
| A2 Architecture identical | ✓ | ✓ | ✓ |
| A3 Lifecycle consistent | ✓ | ✓ | ✓ |
| A4 Event naming consistent | ✓ | ✓ | ✓ |
| A5 Dependency ordering correct | ✓ (root) | ✓ (depends on 001) | ✓ (depends on 001, 002) |
| A6 No duplicated standards | ✓ | ✓ | ✓ |
| A7 No conflicting ownership | ✓ | ✓ | ✓ |
| A8 Identical ADR references | ✓ | ✓ | ✓ |
| A9 Valid capability references | ✓ | ✓ | ✓ |
| A10 No shared-DB wording | ✓ | ✓ | ✓ |

## 3. Pair-Wise Consistency (Interaction Points)

| Pair | Interaction | Result | Notes |
| --- | --- | :-: | --- |
| 001 ↔ 002 | 001 seeds default Company + Financial Year; 002 owns Company/Branch/FY lifecycles. | ✓ | 002 FR-002-004 explicitly protects the seeded defaults. |
| 001 ↔ 002 | 001 bootstraps logical Workspace; 002 owns Workspace navigation contract. | ✓ | No `workspaces` table introduced by either. |
| 001 ↔ 003 | 001 creates initial Tenant Admin invitation; 003 owns identity & role model. | ✓ | 003 assumes the invited Tenant Admin exists. |
| 001 ↔ 003 | 001 writes connection registry; 003 consumes it via tenant-resolution middleware. | ✓ | Consumption direction one-way (003 reads what 001 writes). |
| 002 ↔ 003 | 002 defines effective-config resolver contract; 003 defines permission inheritance parallel to it. | ✓ | Contracts named identically ("effective … resolver"). |
| 002 ↔ 003 | 002 declares required role identifiers; 003 owns permission catalog integration. | ✓ | 002 uses identifiers only; 003 registers them. |

## 4. Ownership Map (No Overlap)

| Capability | Owning Sprint |
| --- | --- |
| Tenant record + lifecycle | SPR-MOD-001-001 |
| Dedicated Tenant DB provisioning | SPR-MOD-001-001 |
| Connection registry writes | SPR-MOD-001-001 |
| Workspace bootstrap (logical) | SPR-MOD-001-001 |
| Company / Branch / Financial Year lifecycles | SPR-MOD-001-002 |
| Workspace navigation contract | SPR-MOD-001-002 |
| Effective configuration resolver contract | SPR-MOD-001-002 |
| Identity storage (Platform DB / Tenant DB split) | SPR-MOD-001-003 |
| Role, permission, permission inheritance | SPR-MOD-001-003 |
| Tenant-resolution middleware & session | SPR-MOD-001-003 |
| Super Admin elevation | SPR-MOD-001-003 |

## 5. Event Namespace Reservation

| Event | Owner |
| --- | --- |
| `tenant.*` | SPR-MOD-001-001 |
| `org.company.*`, `org.branch.*`, `org.financialyear.*` | SPR-MOD-001-002 |
| `iam.*` | SPR-MOD-001-003 |

No collisions across namespaces.

## 6. Result

**All axes pass** for all three PRDs and all pairwise interactions. No conflicts, no duplicated standards, no shared-DB wording, no forward or cyclic dependency.
