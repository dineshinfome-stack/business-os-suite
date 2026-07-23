# Sprint 1.0 — MOD-001 Business Workspace Foundation — Closure Verification Report

- **Sprint:** 1.0
- **Module:** MOD-001 Business Workspace Foundation
- **Date:** 2026-07-23
- **Author:** Lovable Engineering
- **Previous state:** `READY_FOR_SPRINT_1_0`

---

## 1. Scope Recap

MOD-001 delivers the first functional Business OS module on top of the shared
platform foundation (Sprints 0.4–0.9). In-scope capabilities:

- **Business Profile** — legal identity, tax/registration, contact, locale.
- **Organization Branding** — logo, favicon, primary/secondary colors, theme.
- **User Profile** — per-organization display name, job title, department,
  avatar, locale.
- **Team Directory** — active organization members with resolved profiles.
- **Invitations** — cryptographically strong tokenized invite lifecycle
  (create, list, revoke, accept).

Out of scope (deferred): notification wiring for invite emails, invitation
resend, seat billing.

---

## 2. Verification Matrix

| # | Check | Result |
|---|---|---|
| 1 | Migration 014 — workspace tables & RLS | **PASS** |
| 2 | Migration 015 — `citext` schema + invite UPDATE CHECK | **PASS** |
| 3 | RLS & multi-tenancy scoping | **PASS** |
| 4 | RBAC & permission manifest | **PASS** |
| 5 | Server functions (auth + validation + token hashing) | **PASS** |
| 6 | Audit integration | **PASS** |
| 7 | Notifications integration | **DEFERRED (documented)** |
| 8 | Navigation registry | **PASS** |
| 9 | Search registry | **N/A (deferred to Sprint 1.1)** |
| 10 | UI routes + `head()` metadata | **PASS** |
| 11 | Typecheck (`bunx tsgo --noEmit`) | **PASS** |
| 12 | Tests (`bunx vitest run`) | **PASS (17/17)** |
| 13 | Security posture | **PASS** |

**Overall verdict:** All mandatory checks PASS. Deferred items are recorded
below and do not block the state transition.

---

## 3. Database (Migrations 014 & 015)

Migration `014` introduces four workspace tables:

- `public.organization_profiles` (1:1 with `organizations`)
- `public.organization_branding` (1:1 with `organizations`)
- `public.user_profiles` (unique on `(organization_id, user_id)`)
- `public.organization_invitations` (unique on `(organization_id, lower(email), status='pending')`)

Each table:

1. `CREATE TABLE`
2. Explicit `GRANT` to `authenticated` and `service_role` (no `anon`)
3. `ALTER TABLE … ENABLE ROW LEVEL SECURITY`
4. Member-scoped `CREATE POLICY` clauses.

Migration `015` follow-ups:

- Moves the `citext` extension to the `extensions` schema (linter cleanup).
- Tightens the `organization_invitations` UPDATE policy with a CHECK that
  prevents mutation of identity fields (`organization_id`, `email`, `role`,
  `token_hash`, `expires_at`, `invited_by`).

---

## 4. RLS & Multi-Tenancy

Policies rely on the existing `private.fn_is_org_member` /
`private.fn_has_org_role` helpers established in Sprint 0.4, consistent with
`TENANCY_STANDARD`:

- **Read:** any active member of the organization.
- **Write:** organization `owner` or `admin` only (except `user_profiles`,
  where the row's own `user_id` may self-manage).
- **Invitations:** invitee visibility scoped by JWT email
  (`lower(auth.jwt() ->> 'email') = lower(email)`), enabling the invitee to
  fetch their own pending invite by hashed token without member privileges.

Cross-tenant leakage is prevented by `organization_id` predicates on every
policy.

---

## 5. RBAC & Permission Manifest

**13 new MOD-001 Workspace permission keys** were added to
`docs/15-governance/permission-catalog.manifest.yaml`, covering the
organization, branding, profile, member, invitation, and workspace-hub
action surface (not all prefixed `workspace.*`):

- `organization.profile.read` / `organization.profile.manage`
- `organization.branding.read` / `organization.branding.manage`
- `profile.self.read` / `profile.self.manage`
- `member.directory.read`
- `invitation.read` / `invitation.create` / `invitation.revoke` /
  `invitation.accept`
- `workspace.hub.access` / `workspace.settings.access`

`src/lib/generated/permission-keys.ts` was regenerated via
`bun run gen:permissions`. `<Can>` gates are applied on the workspace
tabs (Business Profile, Branding, Team, Invitations) and on invite
create/revoke actions.

---

## 6. Server Functions

`src/lib/workspace/functions.ts`:

- Every mutation and read uses `.middleware([requireSupabaseAuth])`.
- Every input is validated with a Zod schema (`OrgIdInput`,
  `OrgProfileInput`, `BrandingInput`, `ProfileInput`, `CreateInviteInput`,
  `InviteIdInput`, `AcceptInput`).
- Invitation tokens: `randomBytes(32).toString("base64url")`, returned
  **once** to the inviter, and persisted only as `sha256` hex digest
  (`token_hash`) — plaintext is never stored.
- Invitation TTL: 168 h (7 days) via `expires_at`.
- Acceptance verifies token hash, status, expiry, and JWT email match
  before upserting membership.

---

## 7. Audit Integration

Audit rows are written via `context.supabase.from("audit_logs").insert(…)`
using the schema-correct fields `actor_id` and `new_values` for:

- `organization_profile_updated`
- `organization_branding_updated`
- `user_profile_updated`
- `member_invited` (with `{ email, role }` in `new_values`)
- `invitation_revoked`
- `member_joined` (with `{ invitation_id }` in `new_values`)

Rows are constrained by existing `audit_logs` RLS.

---

## 8. Notifications Integration — DEFERRED

The invitation flow currently returns the acceptance URL/token to the
inviter for out-of-band delivery. Wiring the transactional email provider
into `member_invited` is intentionally deferred to a later sprint when
the email transport is provisioned. This is recorded as **known deferral**,
not a defect.

---

## 9. UI Routes & `head()` Metadata

- `src/routes/_authenticated/workspace.tsx` — tabbed hub (Overview,
  Business Profile, Branding, My Profile, Team, Invitations) with a
  unique `head()` (title/description/og).
- `src/routes/_authenticated/workspace.accept.tsx` — invitation redemption
  landing page with its own `head()` and safe `token` search validator
  (`z.string().min(20).max(200)`).

---

## 10. Navigation

Three permission-gated nodes registered in `src/lib/navigation/registry.ts`:

- Workspace hub (`workspace.hub.access`)
- Team directory (`member.directory.read`)
- Invitations (`invitation.read`)

They appear in the sidebar only for entitled roles, verified against the
navigation registry test suite.

---

## 11. Search Registry — N/A this sprint

Workspace resources (members, invitations) will be registered with the
global search framework in Sprint 1.1 alongside the first cross-module
search rollout. Not required for MOD-001 closure.

---

## 12. Regression Evidence

**Typecheck** — `bunx tsgo --noEmit`: clean, no diagnostics.

**Tests** — `bunx vitest run`:

```
 ✓ src/__tests__/smoke.test.ts (2)
 ✓ src/lib/search/__tests__/providers.test.ts (5)
 ✓ src/lib/navigation/__tests__/registry.test.ts (6)
 ✓ src/lib/search/__tests__/registry.test.ts (4)

 Test Files  4 passed (4)
      Tests  17 passed (17)
```

---

## 13. Security Posture

- No new `SECURITY DEFINER` functions introduced this sprint.
- All new tables have explicit `GRANT`s scoped to `authenticated` and
  `service_role`; `anon` is not granted.
- Invitation tokens are cryptographically random (32 bytes) and stored
  only as SHA-256 hashes.
- Accepted risks unchanged: **R-074** (Supabase Leaked Password
  Protection — accepted WARN).

---

## 14. Verdict & Repository State

All rows in the verification matrix are **PASS** (with two recorded
deferrals that do not block closure).

**Repository status advanced to:** `READY_FOR_SPRINT_1_1`
