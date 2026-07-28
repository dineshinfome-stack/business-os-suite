---
title: "Static Audit — Gate 3.8 Demo-Credential Seed History Repair"
doc_id: "MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_AUDIT_20260728"
version: "1.0"
status: "STATIC DEMO-CREDENTIAL REPAIR PASS — FRESH REPLAY REQUIRED"
type: "audit-report"
owner: "Architecture Office"
last_updated: "2026-07-28"
tags: ["audit", "governance", "gate-3.8", "migration", "security"]
---

# Static Audit — Gate 3.8 Demo-Credential Seed History Repair

Exception identifier: `MIG-20260728-GATE38-DEMO-CREDENTIAL-SEED-HISTORY-REPAIR`

## 1. Heads

| Item | Value |
| --- | --- |
| Original pre-repair baseline | `b72c9524fe9d017fb52b1cd9031abf86940b7693` |
| Technical repair head | `68541b4c55afa75d6143db9198c8603648451a1f` |
| Governance-completion starting head | `68541b4c55afa75d6143db9198c8603648451a1f` |
| Final head | recorded at synchronization of this governance-completion pass (successor of `68541b4c`) |

### Platform-created commits from `b72c9524` to the technical repair head

| SHA | Subject |
| --- | --- |
| `c3fda169bfab8fde94889c9f3a28b6c8feb7bbef` | Changes |
| `ac510120030c3793ac8a02d718e37f2211216e12` | Changes |
| `99de5520f3f5a1e566bbe3908be0c16f074b1508` | Changes |
| `68541b4c55afa75d6143db9198c8603648451a1f` | Cleaned up demo credentials |

The governance-completion pass adds exactly one further platform-created commit
containing only the five allowlisted documentation paths.

## 2. Changed paths

### 2.1 Cumulative nine paths (`b72c9524` → final head)

1. `supabase/migrations/20260722165326_df2419ce-7d8b-49f7-8313-6a5fe8f57723.sql`
2. `supabase/migrations/20260722181324_dd881546-55e0-49d3-8c5d-05b9f0ec83fc.sql`
3. `src/routes/login.tsx`
4. `docs/15-governance/RBAC_STANDARD.md`
5. `docs/15-governance/MIGRATION_REGISTRY.md`
6. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_20260728.md`
7. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_MANIFEST.json`
8. `docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_AUDIT_20260728.md`
9. `docs/50-audit-reports/SECURITY_FINDING_G38_DEMO_CREDENTIAL_AND_DEFINER_SURFACE_20260728.md`

Verified at `68541b4c`, `git diff --name-only b72c9524 HEAD` returned exactly paths
1–5. Paths 6–9 are added by this governance-completion pass.

### 2.2 Governance-completion five paths (`68541b4c` → final head)

1. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_20260728.md`
2. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_MANIFEST.json`
3. `docs/15-governance/MIGRATION_REGISTRY.md`
4. `docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_AUDIT_20260728.md`
5. `docs/50-audit-reports/SECURITY_FINDING_G38_DEMO_CREDENTIAL_AND_DEFINER_SURFACE_20260728.md`

No application source, tests, packages, lockfiles, `.lovable/plan.md`, historical
Sprint reports or live Gate 3.8 certification reports were touched.

## 3. Before/after file evidence

| Path | Before SHA-256 / bytes | After SHA-256 / bytes |
| --- | --- | --- |
| `…165326_df2419ce-….sql` | `28df79a4936ad58be3fcabc3e6d4619795e36f18d2ee5837044d6d48c730313e` / 2402 B, 53 nl, 51 logical | `95112000b97662f29acfae509d3d8a898e4f9592fc0d8ba975a6b64e137df08b` / 807 B, 17 nl, 17 logical |
| `…181324_dd881546-….sql` | `8085d32a900dd063e292692972cc9fbe9a3bd691cc3e443e0eb35a2d1e0e4e0d` / 15198 B, 240 nl, 215 logical | `1bd6462a70612978b9a4cea479052cecbe588e25f9dacea4df01132406744b6a` / 15523 B, 245 nl, 220 logical |
| `src/routes/login.tsx` | `654478839b7322b30b5ce414bb7025d347c459a2913886e33f373bcbf8e464ad` / 12442 B, 331 nl, 306 logical | `d354affac373cf1fab081c00b290e09d18bd467ab04cd78ae20d6e6d5fae7020` / 11070 B, 294 nl, 273 logical |

Git blobs: demo migration `d6c695e8…` → `b944cdfb…`; bootstrap migration
`0eae151c…` → `2f3b7b91…`; login route `4aec53d6…` → `bd99ffff…`. All match the
required values.

## 4. Verification results

| Check | Result |
| --- | --- |
| Tombstone validation — demo migration non-comment, non-blank lines | **0 — PASS (COMMENT-ONLY TOMBSTONE)** |
| Original filename retained | **PASS** |
| `private.fn_bootstrap_platform_owner(text)` still defined | **PASS** (`CREATE OR REPLACE FUNCTION` at line 226 of `…181324`) |
| Hard-coded bootstrap invocation removed | **PASS** — only `REVOKE`/`GRANT` privilege statements reference the function; no call site remains |
| Login cleanup — `DEMO_PASSWORD`, `DEV_ROLES`, `fillDevCredentials`, Development Login UI | **PASS — all absent from `src/**`** |
| Credential scan — retired password literal in active migrations | **PASS — absent** |
| Credential scan — retired password literal in `src/**` | **PASS — absent** |
| Residual `demo.test` occurrences | 3, all inside explanatory comments (2 in the tombstone header, 1 in the bootstrap migration note) — no executable reference |
| Migration inventory | 50 total = 8 comment-only + 42 executable — **PASS** |
| RBAC standard | blob `a9052a2c9bee1a4f6ad763339fd4fedc2480f9f1` — unchanged this turn, §6 records the removal of the hard-coded bootstrap invocation — **PASS** |
| Registry correction | shortened identifier replaced with canonical identifier; placeholder columns replaced with links to authority document, manifest and this audit; no duplicate row appended — **PASS** |
| Manifest JSON validation | `json.load` succeeded — **VALID JSON** |
| Manifest final SHA-256 | `27cac284697d89a8ad1f0b7842df7bffe9c5ec951ac375ca4af028f250d2f28b` |
| routeTree protection | `src/routeTree.gen.ts` blob `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` — unchanged — **PASS** |
| Both prior history repairs (duplicate-baseline, `rls_auto_enable`) intact | **PASS** — untouched this turn |

## 5. Testing and execution posture

| Item | Value |
| --- | --- |
| Test result previously reported | **585/585 PASS** |
| Tests rerun during this turn | **NO** — governance-documentation-only turn; no source, test, or dependency change |
| Build run | NO |
| Development server started | NO |
| Route generation invoked | NO |
| Database execution | **NOT RUN** |
| Supabase accessed | NO |
| `CERT_DB_URL` used or created | NO |
| SQL executed | NO |
| Users or fixtures created | NO |
| Migrations replayed | NO |

## 6. Gate state

| Item | State |
| --- | --- |
| Fresh clean replay | **PENDING** — new disposable target required |
| Residue verification (`auth.users` 0 rows) | **PENDING** |
| Gate 3.8 | **CERTIFICATION FAILED** |
| Tenant activation | **BLOCKED** |
| `FINDING-G38-DEMO-CREDENTIAL-SEED` | IMPLEMENTED — LIVE VERIFICATION PENDING |
| `FINDING-G38-PRIVATE-SECURITY-DEFINER-EXECUTE-SURFACE` | OPEN — SEPARATE REMEDIATION REQUIRED |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` | OPEN |

No claim is made that a live replay passed. The Phase 1 replay executed earlier
applied all 50 migrations and passed catalog and RLS verification, but **failed**
the `auth.users` 0-row residue contract; that contract has not yet been re-proven.

## 7. Verdict

**STATIC DEMO-CREDENTIAL REPAIR PASS — FRESH REPLAY REQUIRED**
