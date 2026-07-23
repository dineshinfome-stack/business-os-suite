# Sprint 1.0 — MOD-001 Business Workspace Foundation

## Objective
Ship the first Business OS module on top of the Sprint 0.4–0.9 platform: organization profile, branding, user profile, team directory, and a minimal workspace dashboard — all reusing existing Auth, RBAC, Tenancy, Navigation, Notifications, Search, Audit, and Settings frameworks.

## Architecture Rules (non-negotiable)
- No new infrastructure. Extend existing registries and frameworks only.
- All server logic in `src/lib/workspace/*.functions.ts` (client-safe) + `*.server.ts` (privileged helpers).
- `organization_id` always derived from `requireOrgContext` middleware — never from client input.
- Every mutation: RBAC gate → org scope → audit event → (where relevant) notification emission.

## Deliverables

### 1. Database — Migration `014_mod001_workspace`
Four new tables:
- `public.organization_profiles` (1:1 org) — legal/display name, business_type, industry, tax IDs, contact, currency, timezone, language.
- `public.organization_branding` (1:1 org) — logo_url, favicon_url, primary/secondary color, theme.
- `public.user_profiles` (1:1 user×org) — display_name, job_title, department, avatar_url, phone, timezone, language, `preferences jsonb`.
- `public.organization_invitations` — separates invitations from memberships:
  - `id`, `organization_id`, `email` (citext), `role`, `invited_by`, `token_hash` (unique, see §3), `status` (`pending|accepted|expired|revoked`), `expires_at`, `accepted_at`, `accepted_by`, `revoked_at`, `created_at`, `updated_at`.
  - Unique partial index on `(organization_id, lower(email)) WHERE status='pending'` to prevent duplicate open invites.
  - Membership row in `organization_members` is created **only on acceptance**.

Per repository standard, each table: `CREATE` → `GRANT` (authenticated + service_role) → `ENABLE RLS` → policies using `private.fn_is_org_member(auth.uid(), organization_id)`. `updated_at` trigger via `fn_set_updated_at`. Invitation SELECT policy also allows the invitee (by matching `auth.jwt() ->> 'email'`) to see their own pending invites — but the token is never selectable, only the hash.

### 2. RBAC
Append to `docs/15-governance/permission-catalog.manifest.yaml`:
`organization.read/update`, `branding.read/update`, `profile.read/update`, `member.read`, `member.invite`, `member.remove`, `invitation.read`, `invitation.revoke`, `workspace.read/manage`.

Regenerate `src/lib/generated/permission-keys.ts` via `bun run gen:permissions`. Seed permission rows + role grants in the same migration (owner: all; admin: all except destructive; member: `*.read`, `profile.update`, `workspace.read`).

### 3. Backend — `src/lib/workspace/`
- `types.ts` — DTOs for Organization, Branding, Profile, Member, Invitation.
- `schemas.ts` — Zod validators (shared client + server).
- `service.server.ts` — privileged helpers (no direct client import), including invitation-token helpers.
- `functions.ts` — `createServerFn` with `.middleware([requireOrgContext])` + explicit permission checks:
  - Organization: `getOrganization`, `updateOrganization`
  - Branding: `getBranding`, `updateBranding`
  - Profile: `getProfile`, `updateProfile`
  - Members: `listMembers`, `removeMember`
  - Invitations:
    - `listInvitations` (org-scoped, pending)
    - `createInvitation` — validates email + role; **generates a 32-byte cryptographically random token** via `crypto.getRandomValues(new Uint8Array(32))` and base64url-encodes it (~43 chars, ~256 bits of entropy). Stores only `token_hash = sha256(token)` in the DB; the raw token is returned **once** in the response payload to the inviter for copy/share and never persisted or logged. Sets `expires_at = now() + 7 days`. Emits `member.invited` notification + audit event.
    - `revokeInvitation` — sets `status='revoked'`, audit + notification.
    - `acceptInvitation({ token })` — authenticated caller; hashes the presented token, looks up row by `token_hash`, verifies `pending` + not expired + email matches `auth.jwt().email`; atomically inserts `organization_members` row and sets invitation `status='accepted'`, `accepted_at`, `accepted_by`; emits `member.joined` audit. Constant-time comparison via hash lookup (no plaintext scan).

All emit audit events via existing `logAuditEventFn` and notifications via existing framework using new registry entries in `src/lib/notifications/registry.ts` (`organization.updated`, `branding.updated`, `member.invited`, `member.removed`, `invitation.revoked`, `profile.updated`).

### 4. Navigation
Append nodes to `src/lib/navigation/registry.ts`: Workspace (`/workspace`), Organization (`/organization`), Team (`/team`), Profile (`/profile`), Organization Settings (nested under `/settings`). Each with `permission` + `icon`.

### 5. Search
Promote reserved resource types in `src/lib/search/registry.ts` to `active`: `organization`, `team_member`, `profile`, `workspace`. DatabaseProvider picks them up; no framework changes.

### 6. Settings Integration
Register Organization / Branding / Workspace / Profile setting definitions via existing `setting_definitions` seed in the same migration.

### 7. Frontend — `src/components/workspace/`
`OrganizationCard`, `BusinessProfileForm`, `BrandingForm`, `MemberList`, `MemberCard`, `InviteMemberDialog` (creates invitation, displays the one-time shareable link containing the raw token — with a "copy link" affordance and a warning that it won't be shown again), `InvitationList` (pending, with revoke), `UserProfileForm`, `WorkspaceDashboard`.

Routes under `src/routes/_authenticated/`:
- `workspace.tsx` — dashboard (org summary, team + pending-invite counts, recent activity, quick actions).
- `organization.tsx` — profile + branding tabs.
- `team.tsx` — members + pending invitations tabs.
- `profile.tsx` — user profile form.
- `settings.organization.tsx` — org-level settings surface.
- `invitations.accept.tsx` — reads `?token=`, calls `acceptInvitation` (under `_authenticated` so acceptor is signed in first), redirects to `/workspace`.

Each route: unique `head()`; RBAC-gated via `<Can>`; uses existing `AppShell`.

### 8. Hooks — `src/hooks/workspace/`
`useOrganization`, `useBranding`, `useProfile`, `useMembers`, `useInvitations` — TanStack Query, keys added under new `workspace` namespace in `src/lib/query-keys.ts`.

### 9. Tests
`src/lib/workspace/__tests__/` — schema validation, RBAC rejection, tenancy isolation, audit emission, invitation lifecycle (token entropy + hashing; create → accept creates membership; expired/revoked/tampered rejected; email mismatch rejected; duplicate pending blocked), navigation + search registry entries present. Regression: `bunx tsgo --noEmit` + `bunx vitest run` green.

### 10. Verification Report
`docs/50-audit-reports/SPRINT_1_0_MOD001_WORKSPACE_REPORT.md` covering migration, RBAC seed, RLS proof, invitation lifecycle + token-hashing proof, framework-reuse checklist, test + regression evidence for Sprints 0.7–0.9.

## Sequence
1. Migration `014` (4 tables + grants + RLS + RBAC seed + settings seed).
2. Manifest + regenerate permission keys.
3. Notification + search registry entries.
4. Backend types/schemas/service/functions (incl. hashed-token invitation lifecycle).
5. Navigation registry entries + query keys.
6. Hooks.
7. Components + routes (incl. `/invitations/accept`).
8. Tests + typecheck.
9. Verification report → advance to `READY_FOR_SPRINT_1_1`.

## Notes on Invitation Model & Token
- Invitations live in a dedicated `organization_invitations` table; membership rows created only on acceptance.
- **Token**: 32 bytes from `crypto.getRandomValues`, base64url-encoded (~256 bits entropy). Only `sha256(token)` is stored; raw token shown to inviter exactly once. Aligns with password-reset/invite best practice — DB compromise cannot yield usable bearer tokens.
- Supports expiry (7d), revocation, and future email delivery without schema changes.
- Non-members never appear in `organization_members`, keeping RBAC/tenancy checks clean.
- Audit trail: `member.invited` → (`invitation.revoked` | `member.joined`).
