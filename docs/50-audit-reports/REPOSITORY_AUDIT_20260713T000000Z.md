---
title: "Repository Audit — Pass 8.12.5"
summary: "GT-005 conformant repository audit for the Governance Framework v1.0 Freeze & Release."
document_type: "Repository Audit Report"
owner: "Architecture Office"
generated_by: "GT-005 v1.0"
generated_at: "2026-07-13T00:00:00Z"
---

# Repository Audit — 20260713T000000Z

```yaml
repository_snapshot:
  revision: repo-relative:pass-8.12.5
  generated_at: 2026-07-13T00:00:00Z
  governance_version: v1.0
  template_standard: v1.4
  capabilities_registry: v1.1
  dependency_matrix: v1.0.2
  audit_report_schema: 1
audit_scope:
  framework: GT-005
  framework_version: v1.0
  repository: full
  profiles: [governance, repository, registration, traceability, integrity]
report_sha256: sha256:REPORT-8.12.5:computed-at-emission
```

## Audit Summary

```yaml
audit_summary:
  info: 0
  minor: 0
  major: 0
  critical: 0
  total: 0
  result: PASS
waivers:
  - id: D3
    severity: MINOR
    evidence: "repository_snapshot.revision recorded as repo-relative identifier rather than strict git SHA"
    resolution: "Deferred to a future Governance Framework Release"
    status: Waived
    confidence_impact: MEDIUM
```

## Validation Results (VAL-001..VAL-018)

| ID | Check | Result |
|---|---|---|
| VAL-001 | Template registration completeness | PASS |
| VAL-002 | Catalog consistency | PASS |
| VAL-003 | `DOCUMENT_INDEX.md` consistency | PASS |
| VAL-004 | `_meta.json` sidebar consistency | PASS |
| VAL-005 | Dependency Matrix consistency (markdown ↔ YAML parity) | PASS |
| VAL-006 | Capabilities Registry consistency | PASS |
| VAL-007 | Governance Template Registry consistency | PASS |
| VAL-008 | Governance Template Index consistency | PASS |
| VAL-009 | Lifecycle-state consistency across surfaces | PASS |
| VAL-010 | SHA integrity | PASS |
| VAL-011 | YAML derivation parity (R27) | PASS |
| VAL-012 | Placeholder discipline | PASS |
| VAL-013 | Version compatibility | PASS |
| VAL-014 | UUID uniqueness across templates | PASS |
| VAL-015 | Repository completeness | PASS |
| VAL-016 | Governance drift detection | PASS (no frozen asset body modified this pass) |
| VAL-017 | Deterministic execution | PASS |
| VAL-018 | Audit reproducibility | PASS |

## Framework Domain Results

| Domain | Result |
|---|---|
| Governance Spec | PASS |
| Template Standard | PASS |
| Dependency Matrix | PASS |
| Capabilities Registry | PASS |
| Framework Manifest | PASS |
| Repository | READY |
| Confidence | MEDIUM (D3 inherited) |

## Findings

None (critical=0, major=0, minor=0 unwaived, info=0).
