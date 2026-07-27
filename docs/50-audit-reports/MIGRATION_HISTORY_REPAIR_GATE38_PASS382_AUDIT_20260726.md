---
title: "Terminal Repository Audit — Migration-History Repair, Gate 3.8 / Pass 3.8.2"
summary: "Terminal audit for MIG-20260726-GATE38-PASS382-HISTORY-REPAIR: Commit A technical repair, Commit B verified closure, Commit C terminal governance and formal Pass 3.8.2 closure."
spec_id: "MIGRATION_HISTORY_REPAIR_GATE38_PASS382_AUDIT_20260726"
audit_report_id: "MIGRATION_HISTORY_REPAIR_GATE38_PASS382_AUDIT_20260726"
template: "GT-005_REPOSITORY_AUDIT"
template_version: "v1.0"
audit_profile: "migration_terminal_audit"
owner: "Architecture Office"
status: "PASS"
created: "2026-07-26"
updated: "2026-07-27"
tags: ["audit", "governance", "migration", "gate-3.8", "pass-3.8.2"]
document_type: "Repository Audit"
governance_specification: "v1.0"
migration_id: "MIG-20260726-GATE38-PASS382-HISTORY-REPAIR"
---

# Terminal Repository Audit — Migration-History Repair (Gate 3.8 / Pass 3.8.2)

## Verification Metadata

| Field | Value |
| --- | --- |
| Audit Report ID | `MIGRATION_HISTORY_REPAIR_GATE38_PASS382_AUDIT_20260726` |
| Migration ID | `MIG-20260726-GATE38-PASS382-HISTORY-REPAIR` |
| Gate / Pass | Phase 3 · Gate 3.8 · Pass 3.8.2 |
| Exception document | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` |
| Manifest | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` |
| Commit A (technical repair) | `98019c2cad8ae8467d123a46a5714dcced929a50` — pinned and verified |
| Commit B (verified closure candidate) | `a7bffe9557af14f73b6831ab5fc7638c5f0b703b` — pinned and verified |
| Commit B intermediate pinning write | `9c8cae541bf0f59278ba9b3341d2b8188bdb1288` |
| Commit C stable governed baseline | `d494a62701831315bd6dc400dafb3a473351159e` |
| Authority decision | `APPROVED_WITH_BINDING_CONDITIONS` — reaffirmed — reaffirmation SHA `303d2f7bc2158b04e88811ad5a3fcda39262b92d` |
| Result | **PASS** |

## Scope

Terminal governance audit only. Commit C is documentation-only and changes
exactly five paths. No source, migration, test, generated, package, lockfile or
plan changes are made or authorized by this audit.

## Check / Result / Action

| # | Check | Result | Action |
| --- | --- | --- | --- |
| 1 | Approved exception document exists and records the full decision chain (§9, §9.1, §9.3, §9.4) | PASS | None |
| 2 | Step 0B authority approval reaffirmed and SHA-pinned (`303d2f7b…`) | PASS | None |
| 3 | Fourteen binding conditions recorded, parity document ↔ manifest | PASS | None |
| 4 | Historical search ledger reconstructed — 18/18 hits, canonical digest `dfc2f8f2…` | PASS | None |
| 5 | Forensic migration identity chain verified (blob `12ce3d2b…`, SHA-256 `584269e1…`) | PASS | None |
| 6 | Commit A tombstone transition executed as approved; four technical files verified 4/4 | PASS | None |
| 7 | Protected runtime/migration files unchanged — 10/10 comparisons, drift 0 | PASS | None |
| 8 | Clean replay of the 31-migration chain on a disposable PostgreSQL 17 cluster | PASS | None |
| 9 | Certification harness — 16/16 assertions plus supplemental ACL invocation proof (`42501` for `anon`) | PASS | None |
| 10 | Postcheck marker present; no residue, clean rollback | PASS | None |
| 11 | Commit B quality gates from the candidate commit: tests 512/512, `./node_modules/.bin/tsc --noEmit` (TypeScript 5.9.3) 0 diagnostics, `bun run build` exit 0 | PASS | None |
| 12 | Commit B SHA pinned and verified at `2026-07-27T01:46:37Z` | PASS | None |
| 13 | Route-tree governed blob `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06`, net drift 0 | PASS | None |
| 14 | Migration registry updated with document, manifest and this terminal audit | PASS | None |
| 15 | Commit C path gate — exactly 5 documentation paths, no R/C, no binary, no source/migration/test/generated/package/lockfile/plan drift | PASS | None |
| 16 | Migration-history exception closed | PASS | None |
| 17 | Pass 3.8.2 formally closed | PASS | None |
| 18 | Separate signup-trigger finding retained as OPEN and referred to triage | PASS | Triage separately |
| 19 | Pass 3.8.3 not started and not executed in the Commit C turn | PASS | Separate controlled plan |

## Verification Summary

| Metric | Value |
| --- | --- |
| Checklist Items | 19 |
| Passed | 19 |
| Remediated | 0 |
| Failed | 0 |
| Outstanding Risks | 1 (separate, tracked outside this migration) |
| Verdict | **PASS** |

`Checklist Items = Passed + Remediated + Failed` → 19 = 19 + 0 + 0.

## Open Items Carried Outside This Migration

| ID | Title | Status |
| --- | --- | --- |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` (alias `FND-20260726-AUTH-SIGNUP-TENANTID`) | `private.fn_handle_new_auth_user` inserts into `public.organizations` without `tenant_id` | **OPEN — SEPARATE_TRIAGE_REQUIRED** |

## Terminal Disposition

```text
Migration registry ............ UPDATED
Terminal audit ................ PASS
Migration-history exception ... CLOSED
Pass 3.8.2 .................... CLOSED
Signup-trigger finding ........ OPEN — SEPARATE_TRIAGE_REQUIRED
Pass 3.8.3 .................... ELIGIBLE FOR SEPARATE CONTROLLED PLAN — NOT STARTED
Commit C path gate ............ PASS (5/5)
```
