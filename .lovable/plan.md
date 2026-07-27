
# Pass 3.8.4 — Focused Functional and Security Repair (v4, final + execution clarifications)

Baseline `598647dadd482acec8a13917e9772e990c1f689b`. Lean, in-place repair. One corrective migration, one completion report, no Pass 3.8.5, no further planning revision.

Verified: no invitee delivery channel exists, so the one-time token handoff applies and `notificationQueued` stays `false`.

## 1. One-time invitation handoff

- Ephemeral `oneTimeInvitationToken: string | null` on `OnboardingAdminActionResultDTO` **only**.
- Returned only for a newly created or resent invitation via an authorized POST mutation; `null` on replay and on every failure; fresh per resend.
- Never persisted, audited, logged, or placed in query cache/keys, read DTOs, error text or telemetry.
- Architecture test forbids token-like fields in `TenantAdminInvitationDTO`, query/activity DTOs, audit metadata and read mappers; explicitly allows the approved write-result field.

## 2. In-RPC permission enforcement

Corrective migration enforces permissions inside every SECURITY DEFINER routine via `private.fn_user_has_permission`, raising `42501`:

| Routine | Permissions |
|---|---|
| `fn_onboarding_resolve_first_admin` | `platform.tenant.update`, `platform.invitations.view` |
| `fn_onboarding_invite_first_admin_atomic` (new) | `platform.tenant.update`, `platform.invitations.manage` |
| `fn_onboarding_resend_first_admin_atomic` (new) | same |
| `fn_onboarding_revoke_invitation` | same |
| `fn_onboarding_assign_admin_role` | `platform.tenant.update`, `platform.invitations.view`, `platform.memberships.manage`, `platform.roles.assign` |

`commands.functions.ts` middleware is aligned to exactly these sets. No new permission keys.

## 3. Atomic RPC signatures — organization resolved internally

```text
public.fn_onboarding_invite_first_admin_atomic(
  _tenant_id uuid, _email text, _invited_role text,
  _token_hash text, _expires_at timestamptz,
  _correlation_id text, _expected_version integer)

public.fn_onboarding_resend_first_admin_atomic(
  _tenant_id uuid, _invitation_id uuid, _token_hash text, _expires_at timestamptz,
  _correlation_id text, _expected_version integer)
```

No `_organization_id`, no defaults, distinct names (no ambiguous overload). The invite function resolves the non-deleted `is_default IS TRUE` organization itself (`P3841` when absent). The application calls the atomic RPC directly and never pre-calls the resolver, avoiding the `invitations.view` / `invitations.manage` mismatch.

Both atomic RPCs return authoritative state sufficient to build the result without a second read:

```text
organization_id, invitation_id, invitation_status, created, replayed,
membership_status, role_granted, step_status, step_version
```

## 4. Authoritative default organization across all five RPCs (Clarification 2)

Every relevant routine — `fn_onboarding_resolve_first_admin`, both atomic functions, `fn_onboarding_revoke_invitation`, `fn_onboarding_assign_admin_role` — resolves and enforces the single non-deleted `is_default IS TRUE` organization.

- The resolver **removes the oldest-organization fallback** entirely and raises `P3841` when no default exists.
- The resolver locates accepted administrative invitations **independently of the submitted email**.
- Revoke and role assignment reject an invitation belonging to a non-default organization of the same tenant with `P3842`.

## 5. Retire the legacy six-argument surface

No null-`expectedVersion` delegation. The migration issues:

```sql
REVOKE ALL ON FUNCTION
  public.fn_onboarding_invite_first_admin(uuid, uuid, text, text, text, timestamptz)
FROM PUBLIC, anon, authenticated;
```

and retains it only as a non-executable compatibility stub (or drops it). Its only references are its migration, generated types, and the Pass 3.8.4 service — all migrated. Certification asserts `authenticated` cannot execute it and that exactly one `fn_onboarding_invite_first_admin` signature remains.

## 6. Organization-scoped serialization and replay equivalence

Inside `fn_onboarding_invite_first_admin_atomic`, one transaction:

1. resolve the unique default organization (`P3841` if none);
2. take a **transaction-level advisory lock derived from the default organization ID alone**, with `unique_violation` catch + authoritative re-read as backstop;
3. inspect **all** valid administrative invitations for that organization, not just the submitted email;
4. apply outcomes:

| Existing state | Result |
|---|---|
| Accepted administrator invitation | authoritative replay (earliest by `accepted_at ASC NULLS LAST, created_at ASC`) |
| Pending, same email + same role | idempotent replay |
| Pending, same email, different role | `P3843 invitation_role_conflict` |
| Pending, different email | `P3847 invitation_email_conflict` |
| Only revoked/expired history | create allowed |
| No administrative invitation | create allowed |

5. insert only when allowed; record the step in the same transaction.

A different first-admin email must go through the explicit resend/change flow.

## 7. Exactly-once step recording (Clarification 1)

- The atomic invite RPC records `tenant_admin_invitation` **exactly once in both the create and the replay path**.
- The application **never** calls `recordOnboardingStep` for `tenant_admin_invitation` after a successful atomic invite or resend result — no follow-up write on any path.
- Atomic resend: revoke old + insert replacement (preserving email and administrative role) + step recording in one transaction; failure rolls back both.
- `tenant_admin_membership` and `roles_assigned` are recorded independently.
- Both atomic RPCs honour `_expected_version` and `_correlation_id`. Audit writes stay best-effort after commit.
- The prohibited state — invitation created + token unavailable + command reported failure — is structurally impossible.

## 8. Database-side input validation on direct RPC calls (Clarification 4)

Both atomic RPCs validate before any mutation, raising the mapped SQLSTATEs (`22023` for generic contract violations):

- email: trimmed/lower-cased, non-empty, ≤ 320 characters;
- invited role: `owner` or `admin` only;
- token hash: exactly 64 lowercase hexadecimal characters;
- `expires_at`: strictly in the future and ≤ 7 days ahead;
- correlation ID: bounded length;
- `expected_version`: null or non-negative.

## 9. Canonical deterministic error mapping (Clarification 3)

`classifyError` in `command-service.server.ts` maps SQLSTATE only; no message parsing.

```text
42501 permission_denied
40001 version_conflict
P3841 default_organization_missing
P3842 organization_not_default
P3843 invitation_role_conflict
P3844 invitation_missing
P3845 invitation_expired
P3846 invitation_accepted
P3847 invitation_email_conflict
```

## 10. Accepted-invitation integrity recording

- active membership → `tenant_admin_membership` **completed**
- missing membership → **blocked**, `membership_missing_after_acceptance`
- inactive membership → **blocked**, `membership_inactive_after_acceptance`
- matching `user_roles` grant → `roles_assigned` **completed**
- missing grant → **blocked**, `role_grant_missing`
- pre-acceptance → `skipped` with `acceptance_pending` / `role_grant_pending_acceptance`

## 11. Tests

**Unit (fake client).** Extend the existing 18 cases with: token presence/absence, typed SQLSTATE mapping incl. `P3847`, atomic call shape without `organizationId`, no pre-resolver call, **atomic replay records the invitation step once**, **no application follow-up invitation-step write**, integrity recording, and exactly-once version/`attempt_count` increment per create and per resend.

**`supabase/tests/pass_3_8_4_admin_rpc_certification.sql`** (Pass 3.8.2 harness pattern: transaction-wrapped fixtures, rollback, PASS/FAIL). Asserts:

1. exactly one `fn_onboarding_invite_first_admin` signature; `authenticated` cannot execute it;
2. `42501` denials on each routine for an unprivileged caller;
3. no default organization → `P3841`; **resolver has no oldest-organization fallback**;
4. accepted-invitation resolution independent of submitted email, earliest-accepted ordering;
5. pending same-role → replay; different-role → `P3843`; different-email → `P3847`;
6. **revoke rejects a non-default same-tenant organization (`P3842`)**;
7. **role assignment rejects a non-default same-tenant organization (`P3842`)**;
8. **direct RPC rejects malformed token hash, invalid/over-long expiry, and non-administrative role**;
9. create and resend each record the invitation step exactly once, no double increment;
10. failed step write rolls back invitation creation; failed resend replacement rolls back the revocation;
11. plaintext token absent from all database and audit surfaces.

**`supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh`** — two independent `psql` sessions on disposable fixtures verifying:

1. same email + same role → one creation, one replay;
2. same email + different role → one creation, one `P3843`;
3. different email → one creation, one `P3847`;
4. exactly one valid pending first-admin invitation remains;
5. `trap`-based cleanup on success or failure.

If two sessions cannot be established, the runner reports concurrency **UNAVAILABLE** — never PASS. Concurrency PASS is never claimed from the single-session SQL file.

## 12. Quality gates

Same turn: `bun run test`, repository-local `tsc --noEmit`, `bun run build`, migration validation/replay, SQL certification harness, two-session concurrency runner, and a changed-path review with zero unrelated changes.

## 13. Completion report

Single file `docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md`. No other documentation changes.

## Expected changed paths (~12)

```text
src/integrations/supabase/types.ts
src/lib/tenant-onboarding/server/admin-service.server.ts
src/lib/tenant-onboarding/server/command-service.server.ts
src/lib/tenant-onboarding/commands.functions.ts
src/lib/tenant-onboarding/schemas.ts
src/lib/tenant-onboarding/types/v1/onboarding-admin-result.dto.ts
src/lib/tenant-onboarding/__tests__/admin-commands.test.ts
src/lib/tenant-onboarding/__tests__/architecture.test.ts
supabase/migrations/<new_corrective_migration>.sql
supabase/tests/pass_3_8_4_admin_rpc_certification.sql
supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh
docs/60-engineering/PHASE3_GATE38_PASS384_COMPLETION_REPORT.md
```

`types/v1/index.ts` changes only if an additional exported type is required. `src/integrations/supabase/types.ts` is regenerated after the migration so both atomic RPCs are typed.

## Out of scope

`FINDING-AUTH-SIGNUP-TENANT-FK-20260726` stays OPEN as a release blocker. Pass 3.8.5 is not started.
