---
title: "Screen Identifier Standard"
summary: "Repository-wide governance standard defining stable, module-scoped Screen Identifiers for Mobile Solution Design specifications. Independent of the Frontmatter Standard; governs internal content identifiers only."
spec_id: "SCREEN_IDENTIFIER_STANDARD"
template: "GOVERNANCE_STANDARD"
template_version: "v1.0"
layer: "platform"
owner: "Architecture Office"
status: "Active"
lifecycle_state: "Active"
version: "1.0"
updated: "2026-07-18"
tags: ["governance", "standard", "identifiers", "screen-id", "mobile", "solution-design"]
document_type: "Governance Standard"
governance_specification: "v1.0"
release_pass: "34.0.1"
---

# Screen Identifier Standard (v1.0)

Authoritative repository-wide standard for **Screen Identifiers** — the stable, module-scoped identifiers assigned to individual screens declared inside a Mobile Solution Design specification. This standard is deliberately separated from the [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md) because Screen IDs are **internal content identifiers**, not frontmatter metadata; keeping them in their own standard preserves separation of concerns and leaves room for future identifier standards (UI components, workflows, reports, dashboards, notifications) without expanding the Frontmatter Standard.

## 1. Purpose & Scope

- **Purpose.** Define a deterministic, human-readable, and immutable identifier for every screen declared inside a Mobile Solution Design specification, so that Traceability Matrices, User Journeys, Screen Hierarchies, and downstream Web / API references remain stable even when a screen's title or ordering evolves.
- **Applies To.** Every Mobile Solution Design specification authored under `SD-001_MOB_SPEC` (v1.0 or later) **from Pass 34.0.1 forward**, i.e. MOB-001 and every subsequent MOB specification.
- **Does Not Apply To (yet).** Web (`SD-001_WEB_SPEC`) and API (`SD-001_API_SPEC`) specifications. A separate future governance pass may extend the convention (or a companion Screen / Endpoint standard) to those families; that extension is out of scope for v1.0.
- **Grandfathering.** [`MOB-017`](../60-solution-design/mobile/MOB-017_ANALYTICS.md) and [`MOB-018`](../60-solution-design/mobile/MOB-018_AI_WORKSPACE.md) predate this standard and are **not** renumbered. They remain valid; a future governance pass may adopt this convention retroactively.

## 2. Identifier Syntax

Every Screen ID MUST match the regular expression:

```text
^MOD\d{3}-SCR-\d{3}$
```

- `MOD<NNN>` — three-digit, zero-padded module ordinal matching the source `MOD-<NNN>` of the enclosing specification.
- `SCR` — literal separator segment identifying the identifier family.
- `<NNN>` — three-digit, zero-padded, per-module sequence number starting at `001`.

Examples: `MOD001-SCR-001`, `MOD001-SCR-042`, `MOD017-SCR-101`.

## 3. Numbering Rules

- Numbering starts at `001` per module.
- Numbers are assigned in **first-authored order** and are stable thereafter.
- Gaps introduced by deprecation MUST NOT be reclaimed (see §4 Immutability).
- Sequence numbers MUST be unique within a single specification (per-module scope).

## 4. Immutability

- Once assigned, a Screen ID MUST NOT be re-numbered, re-assigned to a different screen, or removed from the enclosing specification.
- A screen whose behaviour is retired transitions to `Deprecated` (see §6 Lifecycle) but **retains its Screen ID**. The ID remains reserved indefinitely.
- Renaming the screen's user-facing title does **not** change the Screen ID.

## 5. Grandfathering

- MOB-017 and MOB-018 are grandfathered and continue to reference screens by name.
- Future MOB specifications MUST adopt this standard.
- A future governance pass may retroactively assign IDs to grandfathered specifications; until then, references to those specifications remain by-name.

## 6. Lifecycle

Each Screen carries one of the following lifecycle states inside the enclosing specification's Screen Hierarchy:

| State | Meaning |
| --- | --- |
| `Active` | Currently in scope of the specification. |
| `Deprecated` | No longer in scope; retained for traceability and audit; ID reserved. |
| `Removed` | Retired from the surface. ID **remains reserved** and MUST NOT be reused. |

Transitions: `Active → Deprecated → Removed`. No other transitions are permitted.

## 7. Validation Rules

Every audit that touches a Mobile Solution Design specification governed by this standard MUST verify:

- **V1 — Well-formedness.** Every Screen ID matches the regex in §2.
- **V2 — Uniqueness within specification.** No Screen ID appears more than once in the Screen Hierarchy of a single specification.
- **V3 — Bidirectional consistency.** Every Screen ID referenced elsewhere in the specification (User Journeys, Traceability Matrix, Forms, Navigation, cross-references) MUST be defined in the Screen Hierarchy. Conversely, every screen in the Screen Hierarchy MUST appear at least once in the Traceability Matrix.
- **V4 — Module scope.** The `MOD<NNN>` prefix of every Screen ID MUST equal the source module ordinal of the enclosing specification.
- **V5 — Immutability.** A Screen ID present in a prior version of a specification MUST NOT change its meaning or vanish; if the screen is retired, its lifecycle state MUST transition per §6.
- **V6 — Sequence continuity.** Sequence numbers MUST be unique; gaps caused by deprecation are allowed but reclaimed numbers are not.

Failure of any V-rule blocks the audit as `FAIL` per the Verification Reporting Standard.

## 8. Examples

Well-formed:

```text
MOD001-SCR-001    Platform Administration — Home
MOD001-SCR-014    Users — Detail
MOD001-SCR-042    Audit Timeline — Filters
```

Ill-formed (rejected by V1):

```text
MOD1-SCR-1        (missing zero-padding)
SCR-001           (missing module prefix)
MOD001_SCR_001    (wrong separator)
MOD001-SCREEN-001 (wrong family segment)
```

## 9. References

- [`GOVERNANCE_FRONTMATTER_STANDARD.md`](./GOVERNANCE_FRONTMATTER_STANDARD.md) — parallel repository-wide standard for frontmatter metadata (`spec_id`, `template`, `template_version`).
- [`GOVERNANCE_TEMPLATE_REGISTRY.md`](./GOVERNANCE_TEMPLATE_REGISTRY.md) — the `SD-001_MOB_SPEC` record references this standard.
- [`GOVERNANCE_FRAMEWORK_MANIFEST.json`](./GOVERNANCE_FRAMEWORK_MANIFEST.json) — registers this standard as an active asset.
- [`../60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md`](../60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md) — first adopter (Pass 34.0.1).
- [`../MODULE_IMPLEMENTATION_WORKFLOW.md`](../MODULE_IMPLEMENTATION_WORKFLOW.md) — Verification Reporting Standard consumed by audits enforcing §7.
