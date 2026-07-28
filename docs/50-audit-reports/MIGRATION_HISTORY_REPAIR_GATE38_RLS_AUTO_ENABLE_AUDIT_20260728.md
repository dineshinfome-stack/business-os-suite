---
title: "Gate 3.8 — rls_auto_enable Portability History Repair — Static Audit"
doc_id: "MIGRATION_HISTORY_REPAIR_GATE38_RLS_AUTO_ENABLE_AUDIT_20260728"
version: "1.0"
status: "STATIC ONE-FILE REPAIR PASS — FRESH REPLAY REQUIRED"
type: "audit-report"
owner: "Architecture Office"
last_updated: "2026-07-28"
tags: ["audit", "gate-3.8", "migration", "history-repair"]
---

# Static Repair Audit — `MIG-20260728-GATE38-RLS-AUTO-ENABLE-PORTABILITY-HISTORY-REPAIR`

## 1. Authority and baseline

- Starting HEAD: `cdd1ad2bfe0de6511edefb74a287e90ac758fa93`
- Explicit one-file repair authority: granted in the authorizing prompt, limited
  to replacing four unconditional `public.rls_auto_enable()` revokes with an
  existence-guarded `DO` block.
- DB-free shell-write authorization: granted for the single subject migration
  only. No Supabase access, no SQL execution, no CERT_DB_URL.
- Preparation result: **PASS** — `git status --porcelain=v1` empty; subject blob
  `d40f8cd24610cb1693c2b492b3b2c3c17a5795d6`; routeTree blob
  `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06`.

## 2. Before / after evidence

| Metric | Before | After |
| --- | --- | --- |
| Git blob | `d40f8cd24610cb1693c2b492b3b2c3c17a5795d6` | `6beb4285005aa0aab64c056691d91ff65996591a` |
| SHA-256 | `ba196ea778…c9f9d` (full: `ba196ea778ee9a4b20a93e1fe11cb3bd95b05fdd6929682b2fa2e3940c6c9f9d`) | `9114911341a4c91c14171df9ccefa2b39a78d72b1f17a921012c54ef7f9f46b0` |
| Bytes | 1330 | 1756 |
| Newlines | 18 | 27 |
| Logical lines | 19 | 28 |

## 3. Exact SQL replacement

```sql
-- 1. public.rls_auto_enable is an environment-provided DDL event-trigger
--    function. It is not created by this migration chain and may be absent on a
--    fresh Supabase project. When present, revoke all client-facing EXECUTE
--    grants; when absent, perform no action and create no object.
DO $rls_auto_enable_hardening$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM authenticated';
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM service_role';
  END IF;
END;
$rls_auto_enable_hardening$;
```

## 4. Static verification results

| Check | Result |
| --- | --- |
| Authorized changed paths | 5 / 5 exactly |
| Subject migration filename unchanged | PASS |
| Migration-file count | 50 (unchanged) |
| Migrations added / deleted / renamed | 0 / 0 / 0 |
| Guarded `DO` blocks | 1 |
| Guarded `rls_auto_enable` revokes | 4 (PUBLIC, anon, authenticated, service_role) |
| Unconditional `rls_auto_enable` revokes outside guard | 0 |
| `private.fn_*` revokes retained | 4 |
| `private.fn_*` `ALTER FUNCTION` retained | 4 |
| Function / event-trigger creations added | 0 |
| Exception handlers added | 0 |
| Section-2/3 tail byte-identity vs baseline | PASS (882 bytes identical) |
| Manifest parses as valid JSON | PASS |
| Manifest after-hash matches repository file | PASS |
| `src/routeTree.gen.ts` blob | `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` (unchanged) |
| Certification reports changed | none |
| `.lovable/plan.md` changed | no |
| Application / test / package / lockfile paths changed | none |
| Unauthorized path drift | none detected |

## 5. Execution posture

- Database execution: **NOT RUN**
- Fresh replay: **PENDING**
- Catalog equivalence: **PENDING**
- Gate 3.8: **CERTIFICATION FAILED**
- Tenant activation: **BLOCKED**
- Signup finding: **OPEN**

## 6. Verdict

**STATIC ONE-FILE REPAIR PASS — FRESH REPLAY REQUIRED**
