## Sprint 1.0 — MOD-001 Workspace Foundation: Closure Verification

Author a formal verification report and, if all checks pass, advance the repository state. No code changes.

### Deliverable

`docs/50-audit-reports/SPRINT_1_0_MOD001_WORKSPACE_REPORT.md`

### Report structure

1. **Scope recap** — MOD-001 Workspace: Business Profile, Branding, User Profile, Team Directory, Invitations.

2. **Verification matrix** (concise summary table before detailed sections):

   | Check | Result |
   |---|---|
   | Migration 014 | PASS/FAIL |
   | Migration 015 | PASS/FAIL |
   | RLS & tenancy | PASS/FAIL |
   | RBAC & permission manifest | PASS/FAIL |
   | Server functions | PASS/FAIL |
   | Audit integration | PASS/FAIL |
   | Notifications integration | PASS/FAIL |
   | Navigation | PASS/FAIL |
   | Search registry | PASS/FAIL |
   | UI (routes + head metadata) | PASS/FAIL |
   | Typecheck (`bunx tsgo --noEmit`) | PASS/FAIL |
   | Tests (`bunx vitest run`) | PASS/FAIL |
   | Security posture | PASS/FAIL |

3. **Database** — Migrations 014/015: tables, columns, RLS policies, GRANTs, `citext` in `extensions` schema, tightened invitation UPDATE CHECK preventing identity-field mutation.

4. **RLS & tenancy** — Member-scoped policies verified against `TENANCY_STANDARD`; invitation visibility scoped by JWT email for invitees.

5. **RBAC** — **13 new MOD-001 Workspace permission keys added to the manifest**, covering organization, branding, profile, member, invitation, and workspace-hub actions (not all prefixed `workspace.*`). Regenerated `src/lib/generated/permission-keys.ts`; `<Can>` gates applied in UI.

6. **Server functions** — `requireSupabaseAuth` on every mutation; Zod input validators; invitation tokens are 32-byte crypto-random, returned once to inviter, persisted only as SHA-256 hashes.

7. **Audit integration** — Rows written for profile/branding/invite/revoke/accept using correct `actor_id` / `new_values` mapping.

8. **Notifications integration** — Confirm current status (wired vs. deferred) and record explicitly.

9. **UI** — `/workspace` tabbed hub + `/workspace/accept` route; each route has unique `head()` metadata.

10. **Navigation** — Three registry entries permission-gated; sidebar surfaces for entitled roles only.

11. **Regression evidence** — Captured stdout from `bunx tsgo --noEmit` and `bunx vitest run`.

12. **Security posture** — No new SECURITY DEFINER surface; accepted risks unchanged (R-074).

13. **Verdict & Repository State** — Tied to evidence:
    - **If every matrix row = PASS** → advance repository to `READY_FOR_SPRINT_1_1`.
    - **Otherwise** → `BLOCKED`, with the failed items enumerated and remediation owners noted. No state advance until re-verification.

### Process

- Read migrations 014/015, `workspace/functions.ts`, `workspace.tsx`, `workspace.accept.tsx`, navigation registry, and permission manifest to gather evidence.
- Re-run `bunx tsgo --noEmit` and `bunx vitest run`; embed results.
- Write report; copy to `/mnt/documents/` for download.
- No source or schema modifications.
