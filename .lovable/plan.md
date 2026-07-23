## Objective

Formally classify Supabase "Leaked Password Protection Disabled" as an **Accepted Risk (WARN)** in verification documentation. No runtime, config, or code changes.

## Scope

Documentation-only. No changes to auth, Supabase config, RBAC, tenancy, DB, RLS, or server functions.

## Changes

1. **Update `docs/50-audit-reports/SPRINT_0_7_NAVIGATION_FRAMEWORK_REPORT.md`**
   - Expand the "Outstanding Items" row for Leaked Password Protection: change disposition from "User-deferred (security memory)" to **"Accepted Risk"** with explicit rationale, owner (Project Architecture), and review trigger (Future Security Hardening Sprint).
   - Add a short note under the Verification Matrix WARN row confirming Accepted-Risk WARNs are non-blocking when documented.

2. **Update `docs/decision-register.md`** (existing governance doc — reuse rather than create new)
   - Append a decision entry:
     - Decision: Supabase Leaked Password Protection remains disabled.
     - Status: Accepted Risk
     - Owner: Project Architecture
     - Review: Future Security Hardening Sprint
     - Rationale: current password policy satisfies project requirements; may be enabled later.

3. **Update `docs/01-master/risk-register.md`** (if present as risk register)
   - Add row: Risk = weak/breached password reuse; Mitigation = current policy; Status = Accepted; Owner = Project Architecture; Review = Future Security Hardening Sprint.

4. **Update security memory** (`security--update_memory`)
   - Record the Accepted Risk so future scans don't re-flag as blocking. Do not ignore the finding via `manage_security_finding` — keep it visible.

## Explicit non-changes

- No Supabase Dashboard toggles.
- No `manage_security_finding` ignore/fix calls.
- No CI/linter suppressions.
- No new governance documents (reuse existing register + verification report).

## Verification gate (unchanged)

Repository advancement continues to require: 0 FAIL, 0 HIGH, 0 CRITICAL. Documented WARNs remain non-blocking.

## Exit criteria

- Auth behavior unchanged.
- Warning still surfaces in Supabase linter output.
- Verification report + decision/risk register document it as Accepted Risk with owner and review trigger.
- Security memory reflects the accepted risk.
