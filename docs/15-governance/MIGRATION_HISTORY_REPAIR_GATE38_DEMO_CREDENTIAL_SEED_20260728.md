---
title: "Gate 3.8 — Demo-Credential Seed Migration History Repair"
doc_id: "MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_20260728"
version: "1.0"
status: "IMPLEMENTED — FRESH REPLAY CERTIFICATION PENDING"
type: "governance-migration-authority"
owner: "Architecture Office"
last_updated: "2026-07-28"
tags: ["governance", "migration", "gate-3.8", "security", "credentials"]
---

# Gate 3.8 — Demo-Credential Seed Migration History Repair

## 1. Canonical exception identifier

`MIG-20260728-GATE38-DEMO-CREDENTIAL-SEED-HISTORY-REPAIR`

This identifier supersedes the shortened registry identifier previously recorded
(`MIG-20260728-GATE38-DEMO-CREDENTIAL-HISTORY-REPAIR`). The registry row has been
corrected in the same governance-completion pass that produced this document.

## 2. Authorization

- Discovery pass: **PLANNING ONLY — READ-ONLY DECISION GATE** (completed; outcome
  `READY TO IMPLEMENT DEMO-CREDENTIAL HISTORY AND APPLICATION REPAIR`).
- Technical repair pass: **EXECUTION AUTHORIZED — CONTROLLED REPOSITORY REPAIR ONLY**.
- Governance-completion pass (this document): **EXECUTION AUTHORIZED — GOVERNANCE
  COMPLETION ONLY**.

Migration history is normally append-only. This repair is a controlled, explicitly
authorized exception recorded here and in the migration registry.

## 3. Baselines

| Item | Value |
| --- | --- |
| Original pre-repair baseline | `b72c9524fe9d017fb52b1cd9031abf86940b7693` |
| Technical repair head | `68541b4c55afa75d6143db9198c8603648451a1f` |
| Governance-completion starting head | `68541b4c55afa75d6143db9198c8603648451a1f` |
| Working tree at start | clean |

## 4. Cumulative nine-path repair scope

From `b72c9524` to the final governance-completion head, exactly nine paths change:

1. `supabase/migrations/20260722165326_df2419ce-7d8b-49f7-8313-6a5fe8f57723.sql`
2. `supabase/migrations/20260722181324_dd881546-55e0-49d3-8c5d-05b9f0ec83fc.sql`
3. `src/routes/login.tsx`
4. `docs/15-governance/RBAC_STANDARD.md`
5. `docs/15-governance/MIGRATION_REGISTRY.md`
6. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_20260728.md`
7. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_MANIFEST.json`
8. `docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_AUDIT_20260728.md`
9. `docs/50-audit-reports/SECURITY_FINDING_G38_DEMO_CREDENTIAL_AND_DEFINER_SURFACE_20260728.md`

Paths 1–5 were changed by the technical repair pass; paths 5–9 by the
governance-completion pass (path 5 is touched by both).

## 5. Git blob evidence

| Path | Original blob (`b72c9524`) | Current blob (`68541b4c`) |
| --- | --- | --- |
| `…20260722165326_df2419ce-….sql` | `d6c695e88b1d342574a413f04e76598b232e5337` | `b944cdfb14fd05be8c332ab0c2f258e08a1758f4` |
| `…20260722181324_dd881546-….sql` | `0eae151cf32dc22629c180a7409254d828217825` | `2f3b7b9141feb6df1d32301821bf36ba48969e3d` |
| `src/routes/login.tsx` | `4aec53d6eef4dad2a391847d25d77f9f8289c30a` | `bd99fffffd48e729ed8de125bbd3bb0e3a1f2fcd` |
| `docs/15-governance/RBAC_STANDARD.md` | (pre-repair) | `a9052a2c9bee1a4f6ad763339fd4fedc2480f9f1` |
| `src/routeTree.gen.ts` (protected, unchanged) | `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` | `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` |

## 6. Recalculated content evidence

### 6.1 Demo-user migration — `20260722165326_df2419ce-7d8b-49f7-8313-6a5fe8f57723.sql`

| Metric | Before | After |
| --- | --- | --- |
| SHA-256 | `28df79a4936ad58be3fcabc3e6d4619795e36f18d2ee5837044d6d48c730313e` | `95112000b97662f29acfae509d3d8a898e4f9592fc0d8ba975a6b64e137df08b` |
| Bytes | 2402 | 807 |
| Newlines | 53 | 17 |
| Logical (non-blank) lines | 51 | 17 |
| Executable SQL statements | present (`INSERT INTO auth.users`, `auth.identities`, `user_roles`) | **0** |

### 6.2 Bootstrap migration — `20260722181324_dd881546-55e0-49d3-8c5d-05b9f0ec83fc.sql`

| Metric | Before | After |
| --- | --- | --- |
| SHA-256 | `8085d32a900dd063e292692972cc9fbe9a3bd691cc3e443e0eb35a2d1e0e4e0d` | `1bd6462a70612978b9a4cea479052cecbe588e25f9dacea4df01132406744b6a` |
| Bytes | 15198 | 15523 |
| Newlines | 240 | 245 |
| Logical (non-blank) lines | 215 | 220 |

### 6.3 Login route — `src/routes/login.tsx`

| Metric | Before | After |
| --- | --- | --- |
| SHA-256 | `654478839b7322b30b5ce414bb7025d347c459a2913886e33f373bcbf8e464ad` | `d354affac373cf1fab081c00b290e09d18bd467ab04cd78ae20d6e6d5fae7020` |
| Bytes | 12442 | 11070 |
| Newlines | 331 | 294 |
| Logical (non-blank) lines | 306 | 273 |

The retired password literal is deliberately not reproduced in this document.

## 7. Origin of the defect

The Gate 3.8 Phase 1 clean replay on disposable target `smvmrljjspeezedewkpm`
**succeeded structurally**: 50 migrations applied, previously observed defects
`42P07` (duplicate `public.profiles`) and `42883` (missing `public.rls_auto_enable()`)
did not recur, and catalog/RLS verification passed.

The replay nevertheless **FAILED the residue contract**: `auth.users` contained two
rows after replay where the contract requires zero. The rows originated from the
demo-credential seed migration, whose identities cascaded through the signup trigger
into `profiles`, `tenants`, `organizations`, `organization_members` and `user_roles`.

## 8. Repair rationale

- **Demo migration tombstoned.** The file contained only demo fixture creation — no
  schema, no functions, no grants — so converting it to a comment-only tombstone
  removes the residue at its source without altering any structural object. Its
  original filename is retained so applied-migration ledgers in existing
  environments continue to resolve.
- **Hard-coded bootstrap invocation removed.** Migration `20260722181324` invoked
  `private.fn_bootstrap_platform_owner('admin@demo.test')`. With the demo seed
  tombstoned the call was a silent no-op, but a hard-coded privileged-grant address
  in append-only history is unacceptable; it was removed.
- **Bootstrap function retained.** `private.fn_bootstrap_platform_owner(text)`
  remains defined in the same migration. It is production-required and is now
  deployment-invoked with the intended owner address (see `RBAC_STANDARD.md` §6).
- **Development Login removed.** `src/routes/login.tsx` no longer contains the
  demo password constant, the `DEV_ROLES` table, the `fillDevCredentials` helper or
  the Development Login UI block, so no credential material ships in browser source.

## 9. Rejected alternatives

- **Manual post-replay deletion of the seeded rows.** Rejected: it hides the defect
  rather than removing it, is non-reproducible, and every future clean replay would
  reintroduce the credentials before any human intervention.
- **Environment-conditioned demo seeding.** Rejected: the migration stream has no
  trustworthy environment signal, a conditional path is easily mis-evaluated in a
  restored or cloned database, and a known credential that exists on *any* path is
  a credential that can reach production.
- **Randomized demo passwords.** Rejected: it still creates real `auth.users`
  identities, still violates the 0-row residue contract, and still produces
  downstream tenant/organization fixtures that pollute a certification baseline.

## 10. Environment impact — explicitly not remediated

- Existing environments were **not** automatically cleaned. No database was
  accessed and no SQL was executed in either the technical repair pass or this
  governance-completion pass.
- **Development ledger status relies on prior evidence only.** No live
  re-inspection was performed in this pass.
- **Staging: NOT INSPECTED — STATUS UNKNOWN.**
- **Production: NOT INSPECTED — STATUS UNKNOWN.**

Any environment that previously applied migration `20260722165326` may still hold
the seeded identities and their downstream fixtures. Operator-driven cleanup of
those environments is a separate, unscheduled task.

## 11. Outstanding state

- A **fresh clean replay against a new disposable target remains required** to
  certify the `auth.users` 0-row residue contract.
- **Gate 3.8 remains FAILED** (certification not achieved).
- **Tenant activation remains BLOCKED** pending Gate 3.8 certification.
- `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` (signup trigger) remains **OPEN**.
- `FINDING-G38-PRIVATE-SECURITY-DEFINER-EXECUTE-SURFACE` remains **OPEN — SEPARATE
  REMEDIATION REQUIRED**.

## 12. Status

**IMPLEMENTED — FRESH REPLAY CERTIFICATION PENDING**
