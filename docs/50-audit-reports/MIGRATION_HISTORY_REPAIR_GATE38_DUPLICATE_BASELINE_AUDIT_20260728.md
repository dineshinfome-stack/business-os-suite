---
document: Migration History Repair — Gate 3.8 Duplicate Baseline Terminal Audit
migration_id: MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR
version: 1.0.0
date: 2026-07-28
owner: Platform Architecture
verdict: STATIC REPAIR PASS — LIVE CLEAN REPLAY REQUIRED
---

# Terminal Repair Audit — MIG-20260728-GATE38-DUPLICATE-BASELINE-HISTORY-REPAIR

## 1. Baseline and authority

- Current starting HEAD: `45125372558d0ebf9183f7d25e5f2bf250b77e90`
- Original recovery commit: `d44c836e266e10406d2edfe2f313ccdbcfeeb99a`
- Shell-based, DB-free repository writes were **explicitly authorized** by the
  repository owner for this repair only.
- Preparation gate: `git status --porcelain=v1` returned empty (clean tree).
- The normal migration editor **refused** writes under `supabase/migrations/`
  ("managed by the migration system"); the authorized shell exception was used.
- The Supabase migration execution tool was **NOT used**.
- **No database was accessed. No SQL was executed.** `CERT_DB_URL` was neither
  used nor recreated.

## 2. Exact changed paths (10)

1. `supabase/migrations/20260721163958_0dcf4abf-e6db-4b96-a6d8-df7d27f95a1b.sql`
2. `supabase/migrations/20260721164025_fa9fb614-6563-4737-9843-0adae61dc636.sql`
3. `supabase/migrations/20260721164105_a2d6fca5-cda1-4964-b383-2a95fb666339.sql`
4. `supabase/migrations/20260721164143_3b5c5d5e-f813-416a-99b3-c4998e21f3d1.sql`
5. `supabase/migrations/20260721164222_8c4c1388-e4c4-4d28-afbc-31b3cc3ecc58.sql`
6. `supabase/migrations/20260721164347_105ef743-9451-4870-b0c7-fd2d9863d9d9.sql`
7. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_20260728.md`
8. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_MANIFEST.json`
9. `docs/15-governance/MIGRATION_REGISTRY.md`
10. `docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_AUDIT_20260728.md`

## 3. Before / after evidence

| # | File | Before blob | Before SHA-256 | Before bytes / NL / exec | After SHA-256 | After bytes / NL / exec |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 20260721163958… | `c9b3adf8…` | `98698cde…266b0ab` | 3811 / 84 / 49 | `53e28bc0…02012d` | 803 / 13 / 0 |
| 2 | 20260721164025… | `3721561b…` | `d44e314f…034df97` | 817 / 13 / 3 | `64dbd588…68803b` | 809 / 13 / 0 |
| 3 | 20260721164105… | `f48195e9…` | `5fe5ec86…bad27a` | 5308 / 113 / 66 | `eff93652…439fcb` | 796 / 13 / 0 |
| 4 | 20260721164143… | `391db720…` | `c249d2c1…7ee080d` | 574 / 10 / 1 | `6825e619…ab57df` | 805 / 13 / 0 |
| 5 | 20260721164222… | `75da2889…` | `77dcfd1d…ae67ad9` | 4449 / 71 / 38 | `673b8684…e69c635` | 768 / 13 / 0 |
| 6 | 20260721164347… | `eca59383…` | `b809ffa0…c0204d` | 685 / 13 / 3 | `7759eab2…a44bd7` | 810 / 13 / 0 |

Full-precision values are recorded in the manifest.

## 4. Tombstone executable-line results

`grep -nEv '^[[:space:]]*(--.*)?$'` returned **no output** for all six
repository files: 6 of 6 have **0** executable lines.

## 5. Active object-creation counts

| Object | Active creations | Location |
| --- | --- | --- |
| `public.profiles` | 1 | `20260722030037…sql:20` |
| `public.app_role` | 1 | `20260722030037…sql:78` |
| `public.user_roles` | 1 | `20260722030037…sql:80` |
| `public.audit_logs` | 1 | `20260722030037…sql:130` |

## 6. Protected-file checks

| File | Result |
| --- | --- |
| `src/routeTree.gen.ts` | blob `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` — unchanged |
| `20260721163907…` (001_extensions) | byte-identical |
| `20260721163929…` (002_shared_helpers) | byte-identical |
| `20260722030037…` (canonical baseline) | byte-identical |
| Migration file count | 50 (unchanged) |
| Added / deleted / renamed migrations | none |

## 7. Manifest validation

`MIGRATION_HISTORY_REPAIR_GATE38_DUPLICATE_BASELINE_MANIFEST.json` parses as
valid JSON; recorded after-hashes match the six repository tombstones.

## 8. Unauthorized-path check

`git status --porcelain=v1` shows changes confined to the ten authorized paths.
No application source, test, harness, plan, package or lockfile changed.

## 9. Standing statuses

| Item | Status |
| --- | --- |
| Clean replay | **PENDING — NOT RUN, CERT_DB_URL INTENTIONALLY ABSENT** |
| Database-catalog equivalence | **PENDING** |
| Gate 3.8 | **CERTIFICATION FAILED** |
| Tenant activation | **BLOCKED** |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` | **OPEN** |

## 10. Verdict

**STATIC REPAIR PASS — LIVE CLEAN REPLAY REQUIRED**
