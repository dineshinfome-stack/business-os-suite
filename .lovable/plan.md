# Sprint 0.4B — Platform Security Hardening (v2)

Small, focused sprint to resolve non-blocking security observations from Sprint 0.4A before starting RBAC (Sprint 0.5). Two workstreams: (1) formally review and accept the `SECURITY DEFINER` helper warnings, (2) enable Supabase Auth leaked-password protection. v2 incorporates reviewer refinements on ownership wording, existing-user verification, and linter-independent success criteria.

## Objective

Close out the two open observations from `SPRINT_0_4A_AUTHENTICATION_STABILIZATION_REPORT.md` §5:
- `SECURITY DEFINER` warnings on `private.fn_has_role`, `private.fn_is_org_member`, `private.fn_org_role`.
- "Leaked Password Protection Disabled" in Supabase Auth.

Success is measured by security outcomes (documented review + enabled setting + existing users unaffected), not by whether any specific linter rule continues to emit informational warnings.

## Scope

### 1. SECURITY DEFINER review (documentation-only unless a gap is found)

Review each of the three helpers against a fixed checklist and record the result. Only issue a migration if a concrete gap is found.

Checklist per function:
- Resides in `private` schema (not exposed via PostgREST).
- Declared `SECURITY DEFINER` with a fixed `search_path` (e.g. `SET search_path = pg_catalog, public`).
- Owned by the dedicated database role defined by the project's database security standard (`docs/15-governance/DATABASE_STANDARD.md`), or another least-privileged owner if no dedicated role exists. If no such role is defined yet, record that as a follow-up for a future governance update and accept the current owner if it is not a broad application role.
- `EXECUTE` granted only to `authenticated` (and `service_role` where needed); `PUBLIC` revoked.
- Body performs only the intended authorization read; no dynamic SQL, no writes, deterministic.
- `STABLE` (or `IMMUTABLE`) volatility where appropriate.

Outcomes:
- If every check passes → document as **Accepted by Design** in the verification report and add a short "Security Notes" block to `docs/15-governance/TENANCY_STANDARD.md` (or a new `docs/11-adrs/security/ADR-030-security-definer-helpers.md` if we want a dedicated ADR).
- If a gap is found → single remediation migration `008_security_definer_hardening.sql` that sets `search_path`, tightens grants, or transfers ownership. No behavioral changes.

### 2. Supabase Auth — Leaked Password Protection

- Enable "Leaked Password Protection" in Supabase Auth settings (dashboard toggle; not a migration).
- Verify demo accounts (`admin@demo.test`, `member@demo.test`) still sign in with existing `DemoPass123!` — confirming existing users are not force-reset and continue to authenticate.
- Confirm password reset flow (`/forgot-password` → `/reset-password`) still succeeds with a fresh strong password.
- Confirm the existing `weak_password` mapping in `src/lib/auth-errors.ts` surfaces the pwned-password rejection cleanly; extend the message-match list if Supabase returns a distinct error code for breached passwords.
- Document implications: users choosing common/breached passwords will now be rejected on signup and password change; existing users are not force-reset.

### 3. Verification report

Author `docs/50-audit-reports/SPRINT_0_4B_SECURITY_HARDENING_REPORT.md` using the standard Check / Evidence / Result table plus a Verification Summary. Sections:
- Scope and objectives.
- SECURITY DEFINER review table (one row per function × checklist item).
- Supabase Auth configuration table (setting, before, after, evidence).
- Regression checks (existing-user login, new signup, password reset with weak/strong/breached password).
- Verification Summary (totals) and exit-criteria checklist.
- Sprint 0.5 authorization statement.

## Exit criteria

- All three helper functions verified against the checklist and either **Accepted by Design** with documented rationale, or remediated via `008_security_definer_hardening.sql`.
- Leaked Password Protection enabled (or a documented exception with justification).
- Existing demo users continue to authenticate successfully after the setting change.
- Existing linter findings are either resolved or explicitly documented as **Accepted by Design** with supporting evidence; no new HIGH/CRITICAL findings introduced.
- Verification report authored with all checks PASS.
- Sprint 0.5 (RBAC Foundation) explicitly authorized at the end of the report.

## Out of scope

- Any RBAC schema, roles, or policy changes (belongs to Sprint 0.5).
- MFA, CAPTCHA, session length changes, or other auth hardening beyond the leaked-password toggle.
- Rewriting or relocating the helper functions unless the review finds a concrete gap.

## Technical details

- Verification queries (via `supabase--read_query`):
  - `pg_proc` join `pg_namespace` for `prosecdef`, `proconfig` (search_path), `provolatile`, `proowner` on the three helpers.
  - `has_function_privilege('authenticated', ..., 'EXECUTE')` and `has_schema_privilege('authenticated','private','USAGE')`.
  - `pg_proc.proacl` to confirm no `PUBLIC` execute.
- Supabase linter re-run after any change; results interpreted per the linter-independent exit criterion above.
- No changes to `src/integrations/supabase/*`, RLS policies, or application code unless the auth error mapping needs a new message pattern.
