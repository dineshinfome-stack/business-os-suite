#!/usr/bin/env bash
# =====================================================================
# SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.4
# Two-session concurrency certification for the first-administrator
# invitation routine (OUT OF THE MIGRATION CHAIN).
#
# A transaction-wrapped SQL file cannot prove serialization: everything it
# does happens in one session. This runner opens TWO real sessions per
# scenario that race public.fn_onboarding_invite_first_admin_atomic and
# asserts the organization-scoped advisory lock serializes them.
#
# Every scenario starts from EMPTY state on its own disposable tenant and
# default organization, so no scenario can inherit another's invitation.
#
#   Scenario A — same email + same role      → 1 created, 1 replayed, 1 pending
#   Scenario B — same email, different roles → 1 created, 1 P3843,   1 pending
#   Scenario C — different emails            → 1 created, 1 P3847,   1 pending
#
# Fixtures are committed (concurrency requires it) and removed by the trap
# on every exit path, success or failure.
#
# Usage:
#   DB="postgresql://..." bash supabase/tests/pass_3_8_4_admin_rpc_concurrency.sh
# =====================================================================
set -Eeuo pipefail

DB="${DB:-${DATABASE_URL:-}}"
if [[ -z "$DB" ]]; then
  echo "FAIL: set DB (or DATABASE_URL) to a Postgres connection string" >&2
  exit 2
fi

PSQL=(psql "$DB" -v ON_ERROR_STOP=1 -At)

USER_OK='a5384100-0000-4000-8000-000000000001'
EMAIL_OK='pass384.conc.authorized@certification.invalid'

# token_hash is globally unique, so every racing call needs its own hash.
# Deterministic 64-char lowercase hex derived from "<scenario>:<session>".
make_hash() {
  printf 'pass384-conc:%s' "$1" | sha256sum | cut -c1-64
}

# Tenants/organizations created by this run, cleaned up unconditionally.
FIXTURES=()
TMPFILES=()

cleanup() {
  for pair in "${FIXTURES[@]:-}"; do
    [[ -z "$pair" ]] && continue
    local_tenant="${pair%%:*}"
    local_org="${pair##*:}"
    "${PSQL[@]}" >/dev/null <<SQL || true
SET session_replication_role = replica;
DELETE FROM public.tenant_onboarding_steps  WHERE tenant_id = '$local_tenant';
DELETE FROM public.tenant_onboarding        WHERE tenant_id = '$local_tenant';
DELETE FROM public.organization_invitations WHERE organization_id = '$local_org';
DELETE FROM public.organizations            WHERE tenant_id = '$local_tenant';
DELETE FROM public.tenants                  WHERE id = '$local_tenant';
SQL
  done
  "${PSQL[@]}" >/dev/null <<SQL || true
SET session_replication_role = replica;
DELETE FROM public.user_roles WHERE user_id = '$USER_OK';
DELETE FROM auth.users        WHERE id = '$USER_OK';
SQL
  for f in "${TMPFILES[@]:-}"; do rm -f "$f" "${f}.err"; done
}
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }

echo "== seeding the authorized platform caller =="
"${PSQL[@]}" >/dev/null <<SQL
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
    '{"full_name":"PASS384 Concurrency"}'::jsonb, now(), now(), '', '', '', '')
  ON CONFLICT (id) DO NOTHING;
  SET LOCAL session_replication_role = origin;

  INSERT INTO public.user_roles (user_id, role, role_id, organization_id)
  VALUES ('$USER_OK', NULL, v_role, NULL)
  ON CONFLICT DO NOTHING;
END
\$seed\$;
SQL

# new_fixture <suffix> -> echoes "<tenant_uuid>:<org_uuid>"
new_fixture() {
  local suffix="$1"
  local tenant="ce773841-0000-4000-8000-0000000000${suffix}"
  local org="ce773841-0000-4000-8000-0000000001${suffix}"
  "${PSQL[@]}" >/dev/null <<SQL
INSERT INTO public.tenants (id, slug, display_name, code)
VALUES ('$tenant', 'cert3841-t$suffix', 'CERT3841 Tenant $suffix', 'C384${suffix}001');
INSERT INTO public.organizations (id, tenant_id, name, slug, is_default)
VALUES ('$org', '$tenant', 'CERT3841 Default $suffix', 'cert3841-def-$suffix', true);
SQL
  FIXTURES+=("$tenant:$org")
  echo "$tenant:$org"
}

# race_session <tenant> <email> <role> <hash> <outfile>
race_session() {
  local tenant="$1" email="$2" role="$3" hash="$4" out="$5"
  "${PSQL[@]}" -o "$out" <<SQL 2>"${out}.err" || true
BEGIN;
SELECT set_config('request.jwt.claims',
  json_build_object('sub','$USER_OK','role','authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_sleep(0.25);
SELECT coalesce((public.fn_onboarding_invite_first_admin_atomic(
  '$tenant', '$email', '$role', '$hash', now() + interval '72 hours',
  'cert-3841-race', NULL) ->> 'created'), 'null');
COMMIT;
SQL
}

count_pending() {
  "${PSQL[@]}" -c "SELECT count(*) FROM public.organization_invitations WHERE organization_id='$1' AND status='pending'"
}
count_steps() {
  "${PSQL[@]}" -c "SELECT count(*) FROM public.tenant_onboarding_steps WHERE tenant_id='$1' AND step_key='tenant_admin_invitation'"
}
max_step_version() {
  "${PSQL[@]}" -c "SELECT coalesce(max(version),0) FROM public.tenant_onboarding_steps WHERE tenant_id='$1' AND step_key='tenant_admin_invitation'"
}

run_scenario() {
  local label="$1" suffix="$2" email_a="$3" role_a="$4" email_b="$5" role_b="$6" expect_state="$7"

  echo "== scenario $label =="
  local pair tenant org
  pair="$(new_fixture "$suffix")"
  tenant="${pair%%:*}"; org="${pair##*:}"

  local f1 f2
  f1="$(mktemp)"; f2="$(mktemp)"
  TMPFILES+=("$f1" "$f2")

  race_session "$tenant" "$email_a" "$role_a" "$HASH_A" "$f1" &
  race_session "$tenant" "$email_b" "$role_b" "$HASH_B" "$f2" &
  wait

  local created=0 replayed=0 conflicts=0
  for f in "$f1" "$f2"; do
    grep -qx 'true'  "$f" && created=$((created + 1))
    grep -qx 'false' "$f" && replayed=$((replayed + 1))
    grep -q "$expect_state" "${f}.err" && conflicts=$((conflicts + 1))
  done

  [[ "$created" -eq 1 ]] || fail "$label: expected exactly 1 creation, got $created"

  if [[ "$expect_state" == "REPLAY" ]]; then
    [[ "$replayed" -eq 1 ]] || fail "$label: expected exactly 1 replay, got $replayed"
  else
    [[ "$conflicts" -eq 1 ]] || fail "$label: expected exactly 1 $expect_state, got $conflicts"
  fi

  local pending steps version
  pending="$(count_pending "$org")"
  steps="$(count_steps "$tenant")"
  version="$(max_step_version "$tenant")"

  [[ "$pending" -eq 1 ]] || fail "$label: expected 1 pending invitation, got $pending"
  [[ "$steps"   -eq 1 ]] || fail "$label: expected exactly 1 invitation step row, got $steps"
  [[ "$version" -ge 1 ]] || fail "$label: invitation step version not recorded ($version)"

  echo "   $label OK — created=$created replayed=$replayed conflicts=$conflicts pending=$pending step_version=$version"
}

# Scenario A: identical email + identical role → creation + replay.
run_scenario "A (same email, same role)" "01" \
  "pass384.conc.a@certification.invalid" "admin" \
  "pass384.conc.a@certification.invalid" "admin" "REPLAY"

# Scenario B: identical email, different administrative roles → P3843.
run_scenario "B (same email, different roles)" "02" \
  "pass384.conc.b@certification.invalid" "admin" \
  "pass384.conc.b@certification.invalid" "owner" "P3843"

# Scenario C: different emails → P3847.
run_scenario "C (different emails)" "03" \
  "pass384.conc.c1@certification.invalid" "admin" \
  "pass384.conc.c2@certification.invalid" "admin" "P3847"

echo "PASS384-CONC: scenarios A, B and C certified across two live sessions each."
