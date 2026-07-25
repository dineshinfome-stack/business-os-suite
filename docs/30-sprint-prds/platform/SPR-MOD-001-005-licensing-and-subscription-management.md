---
title: "SPR-MOD-001-005 — Licensing & Subscription Management (v2)"
summary: "Sprint PRD for the Platform-owned License and Subscription lifecycle under ADR-017: plans, entitlements, usage limits, trials, renewals, suspension, expiration, and the single-owner License Enforcement contract that fulfils the SPR-003 pass-through hook and gates every Tenant DB connection."
sprint_id: "SPR-MOD-001-005"
parent_module: "MOD-001"
iteration: "Sprint 5"
version: "2.0"
status: "Draft"
layer: "delivery"
owner: "Platform"
updated: "2026-07-25"
related_engines: ["ENG-001", "ENG-002", "ENG-004", "ENG-024"]
related_adrs: ["ADR-017", "ADR-014"]
supersedes: null
source_baseline: "MOD001_PLATFORM_BASELINE_v2"
source_sprint_plan: "docs/30-sprint-prds/platform/MOD-001_SPRINT_PLAN_v2.md"
tags: ["sprint", "mod-001", "platform", "licensing", "subscription", "entitlement", "v2", "dedicated-db"]
document_type: "Sprint PRD"
---

# SPR-MOD-001-005 — Licensing & Subscription Management (v2)

> Authored against **ADR-017**, **MOD001_PLATFORM_BASELINE_v2**, **MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-005**, and **TENANCY_STANDARD v2.0**. Inherited standards are **referenced by ID and not restated**. This sprint **owns** the License Enforcement contract and **fulfils** the SPR-003 pass-through License hook.

## Inheritance Block

- **ADR-017 §Architectural Invariants** — License, Subscription, Plan, Entitlement records live in the **Platform DB** (Tenant-scoped platform metadata). Enforcement runs upstream of every Tenant DB connection.
- **TENANCY_STANDARD v2.0** — no cross-tenant queries; License Attachment Convention.
- **MOD001_PLATFORM_BASELINE_v2 §7** — License Attachment Convention, extended Audit Ownership Convention.

## 1. Sprint Objective and Scope

**Objective.** Deliver the License and Subscription lifecycle in the Platform DB and gate every Tenant DB connection through the License Enforcement contract.

**In-scope surface.** License entity, Subscription lifecycle (Trial → Active → Grace → Suspended → Expired → Terminated), Plans, Entitlements catalog, plan-limit evaluation surface, renewal, suspension, expiration, license enforcement middleware contract, `license.*` and `subscription.*` events, Platform audit.

**Out-of-scope.** Payment collection, tax computation, invoicing (out of MOD-001). Usage metering telemetry pipelines (deferred).

## 2. Features Included

| # | Feature | Trace |
| --- | --- | --- |
| F-005-01 | Plan catalog (Platform DB) | Baseline v2 §4 |
| F-005-02 | Entitlement catalog (feature keys, quotas) | Baseline v2 §7 |
| F-005-03 | License entity + Subscription lifecycle state machine | ADR-017; Baseline v2 §7 |
| F-005-04 | Trial issuance and conversion | Baseline v2 §7 |
| F-005-05 | Renewal, suspension, expiration, termination | Baseline v2 §7 |
| F-005-06 | License Enforcement contract (owned) | ADR-017 §Authentication Flow |
| F-005-07 | Plan-limit evaluation surface | Baseline v2 §7 |
| F-005-08 | `license.*` and `subscription.*` events | ADR-014 |
| F-005-09 | Platform audit trail for every lifecycle transition | ADR-014 |

## 3. Functional Requirements

- **FR-005-001.** The Platform DB SHALL store exactly one active License per Tenant at any given time.
- **FR-005-002.** Subscription state SHALL follow **Trial → Active → Grace → Suspended → Expired → Terminated**; invalid transitions are rejected and audited.
- **FR-005-003.** The **License Enforcement contract v1.0** SHALL be evaluated upstream of every Tenant DB connection. Suspended/Expired/Terminated tenants SHALL be denied Tenant DB access.
- **FR-005-004.** The Enforcement contract SHALL expose `check(tenant_id, feature_key, quota_key?)` returning `{allow, reason, plan_scope, entitlement_scope}`.
- **FR-005-005.** Plan-limit evaluation SHALL resolve entitlements by (Plan → Overrides at Tenant); no Tenant business data is required to compute the answer.
- **FR-005-006.** Trials SHALL carry an expiry timestamp and convert automatically to Active or Expired at expiry.
- **FR-005-007.** Renewal, suspension, expiration, and termination SHALL each emit a corresponding `subscription.*` event and a Platform audit entry.
- **FR-005-008.** License grants and revocations SHALL emit `license.granted` / `license.revoked` events.
- **FR-005-009.** No License, Subscription, Plan, or Entitlement record SHALL live in any Tenant DB (ADR-017 Invariant I6).
- **FR-005-010.** This sprint **fulfils** the pass-through License hook declared in SPR-MOD-001-003; SPR-003 remains the hook owner, SPR-005 is the enforcement owner.

## 4. Non-Functional Requirements

- **NFR-005-001.** Enforcement check p95 < 10 ms (in-memory cache hit).
- **NFR-005-002.** Enforcement is fail-closed on unavailable Platform DB.
- **NFR-005-003.** Suspension takes effect within 60 s across all Tenant DB connection paths.

## 5. User Experience

Platform admin surface lists plans, entitlements, active licenses per Tenant, next renewal, and current subscription state with lifecycle actions.

## 6. Technical Design (contract references only)

- **Contract: License Enforcement v1.0** — owner SPR-005; consumers SPR-003 (hook @ v1.0), SPR-007 (Workspace surfaces @ v1.0), and future modules.
- Storage: Platform DB only. No cross-tenant queries. See Contract Ownership + Version table in the Phase B2 Cross-PRD Consistency Matrix.

## 7. Security

- License and Subscription mutations require Platform-scoped permissions (`license.write`, `subscription.write`) resolved via Permission Catalog Integration v1.0 (SPR-003 owner).
- Enforcement responses redact plan-internal identifiers to non-Platform callers.

## 8. Acceptance Criteria

- **AC-005-001.** A Tenant with a Suspended Subscription cannot open a Tenant DB connection.
- **AC-005-002.** Trial converts to Active or Expired at expiry timestamp exactly once.
- **AC-005-003.** Every lifecycle transition emits the correct event and a Platform audit entry.
- **AC-005-004.** No License/Subscription/Plan/Entitlement row exists in any Tenant DB.
- **AC-005-005.** SPR-003 pass-through hook is fulfilled: identity middleware calls the Enforcement contract v1.0 and receives a deterministic decision.

## 9. Testing

Per `PLATFORM_TESTING_STANDARD.md`; enforcement contract additionally covered by connection-gate integration tests.

## 10. Dependencies

- Upstream (runtime): SPR-MOD-001-001.
- Fulfils: License hook declared by SPR-MOD-001-003.
- Consumed contracts: Permission Catalog Integration v1.0 (SPR-003), Tenant Connection Registry v1.0 (SPR-001).
- Owned contracts: License Enforcement v1.0.
- Emitted events: `license.*`, `subscription.*`.

## 11. Exit / Definition of Done

Every FR met, every AC green, License Enforcement v1.0 published for consumers, SPR-003 hook fulfilled, zero License records outside the Platform DB.

## 12. Out-of-Scope

- Payment collection, tax, invoicing.
- Usage metering pipelines.
- Configuration key registration (SPR-004), locale packs (SPR-006), Workspace surfaces (SPR-007).

## 13. Traceability

| Baseline v2 / ADR element | Delivered by |
| --- | --- |
| Baseline §7 License Attachment Convention | F-005-01..03, FR-005-001..003 |
| Baseline §7 Extended Audit Ownership | F-005-09, FR-005-007..008 |
| ADR-017 §Authentication Flow | F-005-06, FR-005-003..004 |
| ADR-017 §I6 (Platform DB scope) | FR-005-009 |
| ADR-014 Audit | F-005-08..09, FR-005-007..008 |
| SPR-003 pass-through hook | FR-005-010, AC-005-005 |

Zero-orphan FR check: 10/10 linked.

## 14. Change Log from v1

No direct v1 predecessor (v1 sprint plan did not carry a dedicated Licensing sprint at this position). New under Sprint Plan v2.0.

| Change | Reason |
| --- | --- |
| Introduced License Enforcement as a single-owner, versioned contract. | Contract-driven architecture (Phase B2 A13/A15). |
| Located all License/Subscription/Plan/Entitlement rows in the Platform DB. | ADR-017 Invariant I6. |
| Formalised SPR-003 pass-through hook fulfilment. | Phase B1 Dependency Validation §6.4. |

## 15. Reuse Provenance

| Section | Outcome |
| --- | --- |
| Inheritance Block | Reused unchanged (references) |
| §1..§3 | Newly authored |
| §4 NFRs | Newly authored |
| §5 UX | Newly authored |
| §6 Technical Design | Newly authored |
| §7 Security | Reused unchanged (references RBAC_STANDARD + Permission Catalog) |
| §8 AC | Newly authored |
| §9 Testing | Reused unchanged (references PLATFORM_TESTING_STANDARD) |
| §10..§11 | Newly authored |
| §12 Out-of-Scope | Newly authored |
| §13 Traceability | Newly authored |
| §14 Change Log | Newly authored |
| §15 Reuse Provenance | Newly authored |

## 16. References

- ADR-017, ADR-014
- MOD001_PLATFORM_BASELINE_v2 §7
- MOD-001_SPRINT_PLAN_v2 §SPR-MOD-001-005
- TENANCY_STANDARD v2.0
- SPR-MOD-001-003 (pass-through hook declaration)
