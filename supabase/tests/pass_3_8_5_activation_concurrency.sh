#!/usr/bin/env bash
# =====================================================================
# SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.5B
# Two-session ACTIVATION RACE certification (OUT OF THE MIGRATION CHAIN).
#
# A transaction-wrapped SQL file cannot prove serialization: everything it
# does happens in one session. This runner opens TWO real sessions that race
# public.fn_onboarding_activate_tenant with the SAME expected version and
# asserts the tenant-scoped advisory lock serializes them:
#
#   * exactly ONE session activates and applies the lifecycle transition;
#   * the other loses deterministically with 40001 (stale version) or is an
#     idempotent replay — never a second transition, never a second
#     'activation' step row, never a second audit entry;
#   * public.tenants.lifecycle_state ends 'active' exactly once.
#
# Fixtures are committed (concurrency requires it) and removed by the trap
# on every exit path. The shared synthetic caller is deleted ONLY when this
# execution created it.
#
# Usage:
#   DB="postgresql://..." bash supabase/tests/pass_3_8_5_activation_concurrency.sh
# =====================================================================
set -Eeuo pipefail

DB="${DB:-${DATABASE_URL:-}}"
if [[ -z "$DB" ]]; then
  echo "FAIL: set DB (or DATABASE_URL) to a Postgres connection string" >&2
  exit 2
fi

PSQL=(psql "$DB" -v ON_ERROR_STOP=1 -At)

USER_OK='a5385100-0000-4000-8000-000000000001'
EMAIL_OK='pass385.conc.authorized@certification.invalid'

FIXTURES=()
TMPFILES=()
OWN_CALLER=0

cleanup() {
  for pair in "${FIXTURES[@]:-}"; do
    [[ -z "$pair" ]] && continue
    local_tenant="${pair%%:*}"
    local_org="${pair##*:}"
    "${PSQL[@]}" >/dev/null <<SQL || true
SET session_replication_role = replica;
DELETE FROM public.audit_logs               WHERE entity_id = '$local_tenant';
DELETE FROM public.tenant_onboarding_steps  WHERE tenant_id = '$local_tenant';
DELETE FROM public.tenant_onboarding        WHERE tenant_id = '$local_tenant';
DELETE FROM public.financial_years          WHERE tenant_id = '$local_tenant';
DELETE FROM public.branches                 WHERE tenant_id = '$local_tenant';
DELETE FROM public.organization_invitations WHERE organization_id = '$local_org';
DELETE FROM public.organizations            WHERE tenant_id = '$local_tenant';
DELETE FROM public.tenants                  WHERE id = '$local_tenant';
SQL
  done

  if [[ "$OWN_CALLER" -eq 1 ]]; then
    "${PSQL[@]}" >/dev/null <<SQL || true
SET session_replication_role = replica;
DELETE FROM public.user_roles WHERE user_id = '$USER_OK';
DELETE FROM auth.users        WHERE id = '$USER_OK';
SQL
  fi

  for f in "${TMPFILES[@]:-}"; do rm -f "$f" "${f}.err"; done
}
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }

echo "== prechecking the shared synthetic caller fixture =="
COLLISION="$("${PSQL[@]}" -c "SELECT (EXISTS (SELECT 1 FROM auth.users WHERE id = '$USER_OK'))::int + (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = '$USER_OK'))::int")"
if [[ "$COLLISION" != "0" ]]; then
  fail "synthetic caller fixture $USER_OK already exists. A previous run left fixtures behind; remove them manually. This runner never adopts or deletes fixtures it did not create."
fi

echo "== seeding the authorized platform caller =="
"${PSQL[@]}" >/dev/null <<SQL
BEGIN;
DO \$seed\$
DECLARE v_role uuid;
BEGIN
  SELECT id INTO v_role FROM public.roles WHERE key = 'platform_owner' AND scope = 'platform';
  IF v_role IS NULL THEN RAISE EXCEPTION 'platform_owner role missing'; END IF;

  SET LOCAL session_replication_role = replica;
  INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', '$USER_OK', 'authenticated',
    'authenticated', '$EMAIL_OK', now(),
    '{"provider":"synthetic","providers":["synthetic"]}'::jsonb,
    '{"full_name":"PASS385 Concurrency"}'::jsonb, now(), now(), '', '', '', '');
  SET LOCAL session_replication_role = origin;

  INSERT INTO public.user_roles (user_id, role, role_id, organization_id)
  VALUES ('$USER_OK', NULL, v_role, NULL);
END
\$seed\$;
COMMIT;
SQL
OWN_CALLER=1

# new_fixture <suffix> -> echoes "<tenant_uuid>:<org_uuid>"
# Tenant + completed provisioning job + ACTIVE default organization + primary
# branch + a valid pending administrator invitation are created in ONE
# transaction: either all exist or none do. Pass 3.8.5C made the evaluator
# strict, so a partial fixture would simply be blocked and prove nothing.
new_fixture() {
  local suffix="$1"
  local tenant="ce773851-0000-4000-8000-0000000000${suffix}"
  local org="ce773851-0000-4000-8000-0000000001${suffix}"
  local job="ce773851-0000-4000-8000-0000000002${suffix}"
  "${PSQL[@]}" >/dev/null <<SQL
BEGIN;
INSERT INTO public.tenants (id, slug, display_name, code, provisioning_status)
VALUES ('$tenant', 'cert3851-t$suffix', 'CERT3851 Tenant $suffix', 'C385${suffix}001', 'provisioned');

-- provisioning_completed is evaluated from the latest job, not the flag.
INSERT INTO public.provisioning_jobs (id, tenant_id, state, correlation_id, provider_key)
VALUES ('$job', '$tenant', 'completed', 'cert-3851-seed', 'supabase');
INSERT INTO public.provisioning_steps (job_id, step_key, sequence, status, correlation_id)
VALUES ('$job', 'create_project', 1, 'succeeded', 'cert-3851-seed');

-- organization_exists requires an ACTIVE default organization.
INSERT INTO public.organizations (id, tenant_id, name, slug, is_default, lifecycle_state)
VALUES ('$org', '$tenant', 'CERT3851 Default $suffix', 'cert3851-def-$suffix', true, 'active');
INSERT INTO public.branches (tenant_id, organization_id, code, name, is_default)
VALUES ('$tenant', '$org', 'MAIN', 'CERT3851 Primary $suffix', true);

-- A valid pending administrative invitation satisfies admin_invitation_valid
-- and admin_role_assigned before acceptance; acceptance stays a warning, which
-- the racing sessions acknowledge explicitly.
INSERT INTO public.organization_invitations
  (organization_id, email, role, invited_by, token_hash, expires_at, status)
VALUES ('$org', 'pass385.conc.admin.$suffix@certification.invalid', 'admin', '$USER_OK',
        encode(sha256(convert_to('cert-3851-$suffix', 'UTF8')), 'hex'),
        now() + interval '14 days', 'pending');
COMMIT;
SQL
  # Start the workflow and complete every step as the authorized caller, so
  # both racing sessions start from the SAME committed, activation-eligible
  # state. Readiness itself is still re-evaluated inside the RPC.
  "${PSQL[@]}" >/dev/null <<SQL
BEGIN;
SELECT set_config('request.jwt.claims',
  json_build_object('sub','$USER_OK','role','authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT public.fn_onboarding_start('$tenant', 'cert-3851-seed');
COMMIT;
SQL
  "${PSQL[@]}" >/dev/null <<SQL
UPDATE public.tenant_onboarding_steps
   SET status = 'completed', completed_at = now()
 WHERE tenant_id = '$tenant'
   AND step_key <> 'activation';
SQL
  echo "$tenant:$org"
}

current_version() {
  "${PSQL[@]}" -c "SELECT version FROM public.tenant_onboarding WHERE tenant_id='$1'"
}

# Preflight: the race only proves serialization if the fixture is actually
# activation-eligible. Assert the verdict BEFORE racing.
assert_activation_eligible() {
  local tenant="$1" verdict
  verdict="$("${PSQL[@]}" -c "SELECT (j->>'overall_status') || '/' || (j->>'blocking_count') FROM (SELECT private.fn_onboarding_evaluate_readiness_json('$tenant','cert-3851-preflight') AS j) s")"
  case "$verdict" in
    ready/0|ready_with_warnings/0) echo "  preflight: readiness = $verdict" ;;
    *) fail "fixture $tenant is not activation-eligible (readiness = $verdict)" ;;
  esac
}


# race_session <tenant> <expected_version> <outfile>
race_session() {
  local tenant="$1" version="$2" out="$3"
  "${PSQL[@]}" -o "$out" <<SQL 2>"${out}.err" || true
\set VERBOSITY sqlstate
BEGIN;
SELECT set_config('request.jwt.claims',
  json_build_object('sub','$USER_OK','role','authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_sleep(0.25);
SELECT coalesce((public.fn_onboarding_activate_tenant(
  '$tenant', $version, true, 'cert-3851-race') ->> 'lifecycle_transition_applied'), 'null');
COMMIT;
SQL
}

count_activation_steps() {
  "${PSQL[@]}" -c "SELECT count(*) FROM public.tenant_onboarding_steps WHERE tenant_id='$1' AND step_key='activation'"
}
count_activation_audits() {
  "${PSQL[@]}" -c "SELECT count(*) FROM public.audit_logs WHERE entity_id='$1' AND action='tenant_onboarding.activated'"
}
lifecycle_state() {
  "${PSQL[@]}" -c "SELECT lifecycle_state::text FROM public.tenants WHERE id='$1'"
}
onboarding_state() {
  "${PSQL[@]}" -c "SELECT state FROM public.tenant_onboarding WHERE tenant_id='$1'"
}

echo "== scenario A — two sessions activate with the SAME expected version =="
pair="$(new_fixture "01")"
# Command substitution runs new_fixture in a SUBSHELL, so the cleanup list
# must be appended here, in the parent shell, or the trap sees nothing.
FIXTURES+=("$pair")
tenant="${pair%%:*}"

version="$(current_version "$tenant")"
[[ -n "$version" ]] || fail "scenario A: onboarding workflow was not seeded"

f1="$(mktemp)"; f2="$(mktemp)"
TMPFILES+=("$f1" "$f2")

race_session "$tenant" "$version" "$f1" &
race_session "$tenant" "$version" "$f2" &
wait

applied=0; not_applied=0; conflicts=0; blocked=0
for f in "$f1" "$f2"; do
  if grep -qx 'true'  "$f"; then applied=$((applied + 1)); fi
  if grep -qx 'false' "$f"; then not_applied=$((not_applied + 1)); fi
  # VERBOSITY sqlstate: stderr carries the bare five-character code. Match it
  # as a bounded token, never the English message, never a substring.
  if grep -Eq '(^|[^0-9A-Za-z])40001([^0-9A-Za-z]|$)' "${f}.err"; then
    conflicts=$((conflicts + 1))
  fi
  if grep -Eq '(^|[^0-9A-Za-z])P3848([^0-9A-Za-z]|$)' "${f}.err"; then
    blocked=$((blocked + 1))
  fi
done

if [[ "$blocked" -gt 0 ]]; then
  # The evaluator is authoritative. If the seeded fixture is not activation
  # ready, the race proves nothing — surface it rather than passing silently.
  fail "scenario A: readiness blocked activation (P3848) in $blocked session(s); the fixture is not activation-eligible"
fi

[[ "$applied" -eq 1 ]] ||
  fail "scenario A: expected exactly 1 lifecycle transition, got $applied"
[[ $((not_applied + conflicts)) -eq 1 ]] ||
  fail "scenario A: expected exactly 1 loser (40001 or idempotent replay), got $((not_applied + conflicts))"

steps="$(count_activation_steps "$tenant")"
[[ "$steps" -eq 1 ]] || fail "scenario A: expected exactly 1 activation step row, got $steps"

audits="$(count_activation_audits "$tenant")"
[[ "$audits" -eq 1 ]] || fail "scenario A: expected exactly 1 activation audit entry, got $audits"

state="$(lifecycle_state "$tenant")"
[[ "$state" == "active" ]] || fail "scenario A: expected lifecycle 'active', got '$state'"

wstate="$(onboarding_state "$tenant")"
[[ "$wstate" == "activated" ]] || fail "scenario A: expected workflow 'activated', got '$wstate'"

echo "  PASS: 1 transition, 1 loser, 1 step row, 1 audit entry, lifecycle=active"

echo "== scenario B — post-activation replay is idempotent =="
version="$(current_version "$tenant")"
f3="$(mktemp)"; TMPFILES+=("$f3")
race_session "$tenant" "$version" "$f3"
grep -qx 'false' "$f3" ||
  fail "scenario B: replay should report lifecycle_transition_applied=false"

steps="$(count_activation_steps "$tenant")"
[[ "$steps" -eq 1 ]] || fail "scenario B: replay created an extra activation step ($steps)"
audits="$(count_activation_audits "$tenant")"
[[ "$audits" -eq 1 ]] || fail "scenario B: replay created an extra audit entry ($audits)"
after="$(current_version "$tenant")"
[[ "$after" == "$version" ]] ||
  fail "scenario B: replay bumped the workflow version ($version -> $after)"

echo "  PASS: replay applied no transition, no step, no audit, no version bump"

echo
echo "Pass 3.8.5B activation concurrency certification: ALL SCENARIOS PASSED"
