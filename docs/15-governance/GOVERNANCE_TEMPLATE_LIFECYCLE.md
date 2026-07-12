---
title: "Governance Template Lifecycle"
summary: "Lifecycle states, transitions, versioning rules, and change authority for governance templates."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "lifecycle", "semver"]
document_type: "Governance Standard"
---

# Governance Template Lifecycle

## States

```text
Draft → Review → Active → Deprecated → Archived
```

| State | Executable? | Editable? | Notes |
|---|---|---|---|
| Draft | No | Yes | Authoring in progress. |
| Review | No | Yes (review comments only) | Awaiting Governance Board acceptance. |
| Active | Yes | No (additive Minor only via new version) | Current authoritative version. |
| Deprecated | No (new work) | No | Valid for historical executions in perpetuity. |
| Archived | No | No | Immutable; read-only historical record. |

## Transition Rules

- `Draft → Review` — author declares readiness; Standard conformance self-check passes.
- `Review → Active` — Governance Board approval; `template_sha256` recorded; Registry updated.
- `Active → Deprecated` — a successor version reaches Active. Predecessor is marked Deprecated in the Registry with `Superseded By` populated.
- `Deprecated → Archived` — no further historical modifications expected; read-only.
- `Active → Archived` is not permitted (must pass through Deprecated).

## Versioning — Semantic Versioning `Major.Minor`

| Bump | Trigger | Compatibility |
|---|---|---|
| **Minor** (v1.0 → v1.1) | Additive-only enhancements | Backward compatible; same `compatible_governance` |
| **Major** (v1.x → v2.0) | Breaking governance changes | New `compatible_governance` required |

Rules:

- Minor bumps MUST NOT change validation semantics of prior versions.
- Minor bumps MUST NOT invalidate any previously executed pass.
- Major bumps require a new Compatibility Matrix row and Governance Board approval.
- A Minor bump may promote the predecessor from Active to Deprecated only when the successor reaches Active.

## Compatibility Matrix (per template)

Each template maintains a Compatibility Matrix in its Section 14. Rows:

```text
template_version | governance_version | matrix_entry | result
```

`result = PASS` iff a matching matrix entry exists and `governance_version` equals the active Governance Specification version.

## Change Authority

- **Owner** — Architecture Office (default; overridable per template).
- **Change Authority** — Governance Board.
- **Review Frequency** — Annual (per template `governance_asset` metadata).

## Historical Preservation

- Corrective and successor passes SHALL augment historical records.
- Corrective and successor passes SHALL NOT replace historical records.
- Chronological audit order MUST be preserved across state transitions.
