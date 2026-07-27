# Phase 3 · Gate 3.8 · Pass 3.8.4 — Completion Report

Tenant administrator invitation, membership observation and role assignment.

| Field | Value |
|---|---|
| Sprint | SPR-MOD-001-003 |
| Gate | Phase 3 · Gate 3.8 |
| Pass | 3.8.4 (final correction) |
| Baseline commit | `5315408e7bd7f3873bb39107c4ec4673176e622e` |
| Status | COMPLETE |

## 1. One-time token behaviour

- The invitation secret is generated in `admin-service.server.ts` and only its
  SHA-256 hash (`^[0-9a-f]{64}$`) reaches the database.
- The plaintext is returned exactly once — on creation and on resend — through
  the ephemeral `oneTimeInvitationToken` field of the admin action DTO.
- It is never persisted, audited, logged or echoed on replay or on any failure
  path. An architecture test restricts the field to that single DTO.

## 2. Atomic create / replay / resend

- `public.fn_onboarding_invite_first_admin_atomic` performs default-organization
  resolution, organization-scoped `pg_advisory_xact_lock`, replay equivalence and
  the single `tenant_admin_invitation` step write in ONE transaction.
- `public.fn_onboarding_resend_first_admin_atomic` revokes and reissues inside the
  same transaction, so a failure can never leave the tenant with no invitation.
- The application issues no follow-up invitation-step write on any path.
- Legacy `fn_onboarding_invite_first_admin` is retired and not callable by
  `authenticated`.

## 3. Permission matrix

| Command | Required permissions |
|---|---|
| Invite first administrator | `platform.tenant.update`, `platform.invitations.manage` |
| Resend invitation | `platform.tenant.update`, `platform.invitations.manage` |
| Observe membership | `platform.tenant.update`, `platform.invitations.view` |
| Assign administrator role | `platform.tenant.update`, `platform.invitations.view`, `platform.memberships.manage`, `platform.roles.assign` |

Every routine re-checks its permissions in-database via
`private.fn_onboarding_require_perms` and raises SQLSTATE `42501`.

## 4. Default-organization enforcement

`private.fn_onboarding_default_org` is authoritative: exactly one non-deleted
`is_default` organization per tenant, no fallback. Missing → `P3841`; foreign
organization → `P3842`. No RPC accepts a caller-supplied organization id.

## 5. Accepted membership and role integrity

| Atomic result | `tenant_admin_membership` | `roles_assigned` |
|---|---|---|
| pending (pre-acceptance) | `skipped` / `acceptance_pending` | `skipped` / `role_grant_pending_acceptance` |
| accepted + membership active | `completed` | — |
| accepted + membership missing | `blocked` / `membership_missing_after_acceptance` | — |
| accepted + membership inactive | `blocked` / `membership_inactive_after_acceptance` | — |
| accepted + role granted | — | `completed` |
| accepted + role missing | — | `blocked` / `role_grant_missing` |

Optimistic concurrency: a SQLSTATE `40001` from either atomic routine returns
`version_conflict` and performs NO step write, so a stale expectation can never
overwrite a newer workflow version.

## 6. Direct-RPC validation (corrective migration)

Append-only migration `20260727091655_28fe2103-15ea-42ac-a55b-4ba146858538.sql`:

- `private.fn_onboarding_validate_invite_inputs` is now **STABLE** (it evaluates
  `now()`), and validates token hash, expiry, correlation id and expected version
  for both invite and resend; email/role only when supplied.
- New `private.fn_onboarding_validate_invite_identity` makes email and role
  MANDATORY for the atomic invite: NULL email, blank/whitespace email, NULL role
  and non-administrative role are rejected with `22023`.
- Retained: 64-character lowercase hex token hash, future expiry ≤ 7 days,
  correlation id ≤ 128 chars, non-negative expected version.
- The committed migration `20260727055004_…` was not modified.

## 7. SQL certification

`supabase/tests/pass_3_8_4_admin_rpc_certification.sql` (transaction-wrapped,
`ROLLBACK`-terminated) — CERT-001…CERT-013, now including CERT-012 (NULL email,
blank email, NULL role, non-administrative role, malformed token hash, past and
over-ceiling expiry, resend without email/role) and CERT-013 (validator
volatility must not be `IMMUTABLE`).

## 8. Concurrency scenarios

`supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh` — two independent `psql`
sessions per scenario, each on its own disposable tenant + default organization
starting from empty state, fixtures removed by `trap` on success or failure.

| Scenario | Race | Expected |
|---|---|---|
| A | same email + same role | 1 `created=true`, 1 replay, 1 pending invitation, 1 step row |
| B | same email + different administrative roles | 1 creation, 1 `P3843`, 1 pending invitation |
| C | different emails | 1 creation, 1 `P3847`, 1 pending invitation |

Each scenario also asserts the invitation step row count and version.

## 9. Verification results

| Gate | Result |
|---|---|
| `bun run test` | 553 / 553 passed (51 files) |
| `./node_modules/.bin/tsc --noEmit` | clean |
| `bun run build` | success |
| Migration application | corrective migration applied successfully to the connected project |
| Certification / concurrency scripts | authored and syntax-verified; execution requires a direct Postgres connection string (`DB=…`), which the build sandbox does not expose |

## 10. Changed paths

```
src/lib/tenant-onboarding/server/admin-service.server.ts
src/lib/tenant-onboarding/__tests__/admin-commands.test.ts
supabase/tests/pass_3_8_4_admin_rpc_certification.sql
supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh
supabase/migrations/20260727091655_28fe2103-15ea-42ac-a55b-4ba146858538.sql
docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md
```

## 11. Limitations and open items

- **Notification limitation:** invitation delivery is not wired. Every result
  carries `notificationQueued: false`; the one-time token is handed to the
  operator for out-of-band delivery.
- **`FINDING-AUTH-SIGNUP-TENANT-FK-20260726` remains OPEN — release blocker.**
- Pass 3.8.5 (blocker evaluation and readiness) is ELIGIBLE but NOT STARTED.
