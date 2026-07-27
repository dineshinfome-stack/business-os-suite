#!/usr/bin/env bash
# =====================================================================
# SPR-MOD-001-003 · Gate 3.8 · Pass 3.8.4
# Two-session concurrency certification for the first-administrator
# invitation routine (OUT OF THE MIGRATION CHAIN).
#
# A transaction-wrapped SQL file cannot prove serialization: everything it
# does happens in one session. This runner opens TWO real sessions that race
# public.fn_onboarding_invite_first_admin_atomic against the SAME tenant and
# asserts the organization-scoped advisory lock actually serializes them.
#
# Expected outcome of a race with two DIFFERENT emails:
#   * exactly one session creates the invitation (created = true);
#   * the other is rejected with SQLSTATE P3847 (email conflict);
#   * the tenant ends with exactly ONE pending administrator invitation;
#   * exactly ONE tenant_admin_invitation step row exists.
#
# A race with the SAME email + role must instead yield one creation and one
# replay, never two invitations.
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

TENANT='ce773841-0000-4000-8000-000000000001'
ORG='ce773841-0000-4000-8000-000000000010'
USER_OK='a5384100-0000-4000-8000-000000000001'
EMAIL_OK='pass384.conc.authorized@certification.invalid'
ADMIN_A='pass384.conc.a@certification.invalid'
ADMIN_B='pass384.conc.b@certification.invalid'
HASH_A="$(printf 'a%.0s' {1..64})"
HASH_B="$(printf 'b%.0s' {1..64})"

cleanup() {
  "${PSQL[@]}" >/dev/null <<SQL || true
SET session_replication_role = replica;
DELETE FROM public.tenant_onboarding_steps WHERE tenant_id = '$TENANT';
DELETE FROM public.tenant_onboarding      WHERE tenant_id = '$TENANT';
DELETE FROM public.organization_invitations WHERE organization_id = '$ORG';
DELETE FROM public.user_roles  WHERE user_id = '$USER_OK';
DELETE FROM public.organizations WHERE tenant_id = '$TENANT';
DELETE FROM public.tenants     WHERE id = '$TENANT';
DELETE FROM auth.users         WHERE id = '$USER_OK';
SQL
}
trap cleanup EXIT

fail() { echo "FAIL: $*" >&2; exit 1; }

echo "== seeding synthetic concurrency fixtures =="
"${PSQL[@]}" >/dev/null <<SQL
DO \$seed\$
DECLARE v_role uuid;
BEGIN
  SELECT id INTO v_role FROM public.roles WHERE key = 'platform_owner' AND scope = 'platform';
  IF v_role IS NULL THEN RAISE EXCEPTION 'platform_owner role missing'; END IF;
  IF EXISTS (SELECT 1 FROM public.tenants WHERE id = '$TENANT') THEN
    RAISE EXCEPTION 'concurrency fixtures already exist; clean up first';
  END IF;

  SET LOCAL session_replication_role = replica;
  INSERT INTO auth.users (instance_id, id, aud, role, email, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, email_change, email_change_token_new, recovery_token)
  VALUES ('00000000-0000-0000-0000-000000000000', '$USER_OK', 'authenticated',
    'authenticated', '$EMAIL_OK', now(),
    '{"provider":"synthetic","providers":["synthetic"]}'::jsonb,
    '{"full_name":"PASS384 Concurrency"}'::jsonb, now(), now(), '', '', '', '');
  SET LOCAL session_replication_role = origin;

  INSERT INTO public.user_roles (user_id, role, role_id, organization_id)
  VALUES ('$USER_OK', NULL, v_role, NULL);
  INSERT INTO public.tenants (id, slug, display_name, code)
  VALUES ('$TENANT', 'cert3841-tenant', 'CERT3841 Tenant', 'C3841001');
  INSERT INTO public.organizations (id, tenant_id, name, slug, is_default)
  VALUES ('$ORG', '$TENANT', 'CERT3841 Default', 'cert3841-default', true);
END
\$seed\$;
SQL

# Each racing session holds a transaction open for a moment so the two
# overlap for certain, then calls the atomic routine.
race_session() {
  local email="$1" hash="$2" out="$3"
  "${PSQL[@]}" -o "$out" <<SQL 2>"${out}.err" || true
BEGIN;
SELECT set_config('request.jwt.claims',
  json_build_object('sub','$USER_OK','role','authenticated')::text, true);
SET LOCAL ROLE authenticated;
SELECT pg_sleep(0.25);
SELECT coalesce((public.fn_onboarding_invite_first_admin_atomic(
  '$TENANT', '$email', 'admin', '$hash', now() + interval '72 hours',
  'cert-3841-race', NULL) ->> 'created'), 'null');
COMMIT;
SQL
}

echo "== race 1: two different emails, same tenant =="
T1="$(mktemp)"; T2="$(mktemp)"
race_session "$ADMIN_A" "$HASH_A" "$T1" &
race_session "$ADMIN_B" "$HASH_B" "$T2" &
wait

created_count=0
conflict_count=0
for f in "$T1" "$T2"; do
  if grep -qx 'true' "$f"; then created_count=$((created_count + 1)); fi
  if grep -q 'P3847' "${f}.err"; then conflict_count=$((conflict_count + 1)); fi
done

[[ "$created_count" -eq 1 ]] || fail "expected exactly 1 creation, got $created_count"
[[ "$conflict_count" -eq 1 ]] || fail "expected exactly 1 P3847 conflict, got $conflict_count"

pending="$("${PSQL[@]}" -c "SELECT count(*) FROM public.organization_invitations WHERE organization_id='$ORG' AND status='pending'")"
[[ "$pending" -eq 1 ]] || fail "expected 1 pending invitation after the race, got $pending"

steps="$("${PSQL[@]}" -c "SELECT count(*) FROM public.tenant_onboarding_steps WHERE tenant_id='$TENANT' AND step_key='tenant_admin_invitation'")"
[[ "$steps" -eq 1 ]] || fail "expected exactly 1 invitation step row, got $steps"

echo "== race 2: identical email and role must replay, never duplicate =="
winner="$("${PSQL[@]}" -c "SELECT email FROM public.organization_invitations WHERE organization_id='$ORG' AND status='pending'")"
T3="$(mktemp)"; T4="$(mktemp)"
race_session "$winner" "$HASH_A" "$T3" &
race_session "$winner" "$HASH_B" "$T4" &
wait

replays=0
for f in "$T3" "$T4"; do
  grep -qx 'false' "$f" && replays=$((replays + 1))
done
[[ "$replays" -eq 2 ]] || fail "expected both equivalent calls to replay, got $replays"

pending="$("${PSQL[@]}" -c "SELECT count(*) FROM public.organization_invitations WHERE organization_id='$ORG' AND status='pending'")"
[[ "$pending" -eq 1 ]] || fail "replay race produced $pending pending invitations"

steps="$("${PSQL[@]}" -c "SELECT count(*) FROM public.tenant_onboarding_steps WHERE tenant_id='$TENANT' AND step_key='tenant_admin_invitation'")"
[[ "$steps" -eq 1 ]] || fail "replay race produced $steps invitation step rows"

rm -f "$T1" "$T2" "$T3" "$T4" "$T1.err" "$T2.err" "$T3.err" "$T4.err"
echo "PASS384-CONC: advisory-lock serialization certified across two live sessions."
