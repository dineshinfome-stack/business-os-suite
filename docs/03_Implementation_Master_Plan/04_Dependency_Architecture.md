---
document: IMP Chapter 04 — Dependency Architecture
version: 1.0.0
owner: Architecture
approval_status: Draft
---

# 04 — Dependency Architecture

## Purpose
Consolidate the module and shared-service dependency graph used to sequence implementation. Derived from ADR-007, Module PRDs, and Module Publications.

## Shared Platform Services (MOD-001)
All business modules depend on: Authentication, Organizations, Workspace, RBAC, Audit, Notifications, Settings, Search, Documents, Workflow, Reporting.

## Module Dependency Graph

```mermaid
graph LR
  P[MOD-001 Platform]
  P --> INV[MOD-005 Inventory]
  P --> CRM[MOD-006 CRM]
  P --> HR[MOD-007 HRMS]
  INV --> SAL[MOD-003 Sales]
  INV --> PUR[MOD-004 Purchase]
  CRM --> SAL
  INV --> POS[MOD-015 POS]
  SAL --> ACC[MOD-002 Accounting]
  PUR --> ACC
  POS --> ACC
  HR --> PAY[MOD-008 Payroll]
  ACC --> PAY
  INV --> WH[MOD-019 Warehouse]
  INV --> MFG[MOD-009 Manufacturing]
  SAL --> PROJ[MOD-010 Projects]
  HR --> PROJ
  SAL --> AMC[MOD-011 AMC]
  AMC --> FS[MOD-012 Field Service]
  P --> SD[MOD-016 Service Desk]
  INV --> ASSET[MOD-013 Assets]
  ASSET --> FLEET[MOD-014 Fleet]
  ACC --> AN[MOD-017 Analytics]
  SAL --> AN
  INV --> AN
  AN --> AI[MOD-018 AI Workspace]
```

## Critical Path
`MOD-001 → MOD-005 → MOD-003 → MOD-002 → MOD-017 → MOD-018`

Any slip on the critical path defers all downstream waves.

## External Integration Dependencies
Follow module-specific SD (API) chapters: payment providers (MOD-015), tax authorities (MOD-002), telematics (MOD-014), messaging (MOD-016), AI Gateway (MOD-018).

## References
- ADR-007 `docs/11-adrs/architecture/ADR-007-core-erp-module-boundaries.md`
- EEMP Ch. 10 Module Dependency Matrix
- `docs/module-dependency-matrix.md`
- Module PRDs (all 19)
