---
title: "Gate 3.8 — Security Finding Report: Demo Credential Seed and Private Definer Execute Surface"
doc_id: "SECURITY_FINDING_G38_DEMO_CREDENTIAL_AND_DEFINER_SURFACE_20260728"
version: "1.0"
status: "Active"
type: "security-finding-report"
owner: "Architecture Office"
last_updated: "2026-07-28"
tags: ["security", "gate-3.8", "credentials", "security-definer"]
---

# Gate 3.8 — Security Finding Report (2026-07-28)

Related authority document:
[`MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_20260728.md`](../15-governance/MIGRATION_HISTORY_REPAIR_GATE38_DEMO_CREDENTIAL_SEED_20260728.md)

The retired password literal is deliberately not reproduced anywhere in this report.

---

## FINDING-G38-DEMO-CREDENTIAL-SEED

- **Severity:** BLOCKER
- **Status:** IMPLEMENTED — LIVE CLEAN-REPLAY VERIFICATION PENDING
- **Exception identifier:** `MIG-20260728-GATE38-DEMO-CREDENTIAL-SEED-HISTORY-REPAIR`

### Observed condition

- **Known credentials previously existed in an active migration and in browser
  source.** Migration `20260722165326_df2419ce-7d8b-49f7-8313-6a5fe8f57723.sql`
  inserted two demo accounts into `auth.users` / `auth.identities` with a
  hard-coded password literal, and `src/routes/login.tsx` shipped the same literal
  to the browser as a `DEMO_PASSWORD` constant with a `DEV_ROLES` table, a
  `fillDevCredentials` helper and an unconditional Development Login UI block.
- **Migration-created identities generated downstream fixtures.** The signup
  trigger cascade turned the two seeded identities into rows in `profiles`,
  `tenants`, `organizations`, `organization_members` and `user_roles`, so a
  supposedly clean certification baseline carried real tenant and organization
  fixtures.
- **Certification impact.** Gate 3.8 Phase 1 clean replay applied all 50 migrations
  and passed catalog and RLS verification, but failed the residue contract:
  `auth.users` held 2 rows where 0 are required.

### Remediation applied

- **Seed migration tombstoned.** The migration is now a comment-only tombstone with
  zero executable SQL, retaining its original filename so existing applied-migration
  ledgers continue to resolve.
- **Hard-coded platform-owner invocation removed.** The
  `private.fn_bootstrap_platform_owner('admin@demo.test')` call was removed from
  migration `20260722181324_dd881546-55e0-49d3-8c5d-05b9f0ec83fc.sql`.
- **Bootstrap function retained.** `private.fn_bootstrap_platform_owner(text)`
  remains defined and privilege-restricted; the initial platform owner is now
  granted explicitly by each deployment (see `RBAC_STANDARD.md` §6).
- **Development Login removed.** The demo password constant, `DEV_ROLES`,
  `fillDevCredentials` and the Development Login UI are absent from `src/**`.

### Residual risk

- **No cleanup was executed against unknown existing environments.** No database was
  accessed and no SQL was executed. Any environment that already applied the seed
  migration may still contain the demo identities and their downstream fixtures.
  Development status rests on prior evidence only; staging and production are
  **NOT INSPECTED — STATUS UNKNOWN**.
- Closure requires a fresh clean replay against a new disposable target proving the
  `auth.users` 0-row residue contract.

---

## FINDING-G38-PRIVATE-SECURITY-DEFINER-EXECUTE-SURFACE

- **Severity:** HIGH
- **Status:** OPEN — SEPARATE REMEDIATION REQUIRED BEFORE FINAL GATE 3.8 SIGN-OFF

### Observed condition

On the disposable replay target, the `authenticated` role holds `USAGE` on the
`private` schema and `EXECUTE` on 36 `private` `SECURITY DEFINER` functions.
PostgREST exposure is limited to the `public` schema, so these routines are not
directly RPC-callable today; the concern is defense-in-depth — any future
`public` wrapper, view, or schema-exposure change would immediately widen the
reachable definer surface.

### Disposition

- **This finding was not repaired in the demo-credential turn.** Its scope is
  privilege hardening, which is disjoint from the credential-seed repair and would
  have exceeded that turn's authorized allowlist.
- **It does not prevent creating the next disposable clean-replay project.** The
  replay exercises migration portability and residue contracts, neither of which
  depends on this grant surface.
- **It must be remediated or formally accepted with evidence before Gate 3.8
  certification sign-off.** Expected remediation: revoke blanket `EXECUTE` from
  `authenticated` on `private` routines and grant only the specific helpers the
  application invokes under user context.
- **No private-schema grants were changed** in the demo-credential repair turn or
  in this governance-completion turn.

---

## Gate state at time of report

| Item | State |
| --- | --- |
| Fresh clean replay | PENDING — new disposable target required |
| Residue verification | PENDING |
| Gate 3.8 | CERTIFICATION FAILED |
| Tenant activation | BLOCKED |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` | OPEN |
