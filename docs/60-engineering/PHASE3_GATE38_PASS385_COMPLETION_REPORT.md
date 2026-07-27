# Phase 3 · Gate 3.8 — Pass 3.8.5B Completion Report

**Sprint:** SPR-MOD-001-003
**Pass:** 3.8.5 / 3.8.5B — Tenant readiness evaluator, snapshot persistence and guarded activation
**Mode:** Lean corrective execution
**Date:** 2026-07-27

---

## 1. Scope delivered

| Area | Outcome |
| --- | --- |
| Required-settings readiness authority (D1-A) | `public.setting_definitions.readiness_impact` is the sole authority. The TypeScript registry no longer classifies readiness. |
| Canonical check set | The evaluator emits exactly the 14 keys of `PHASE3_GATE38_READINESS_MATRIX.md`, with matrix reason codes. |
| Read vs. write separation | `fn_onboarding_evaluate_readiness` is read-only; `fn_onboarding_persist_readiness` is the only snapshot writer. |
| Guarded activation | `fn_onboarding_activate_tenant` is the canonical lifecycle writer: re-evaluates readiness in-transaction, enforces acknowledgement, is idempotent on replay. |
| Mandatory optimistic concurrency | `_expected_version` is mandatory end-to-end; never defaulted, never coerced to `null`. |
| Frozen v1 contract | No status, classification or overall-status literal was widened. |
| Certification | SQL harness + two-session activation race runner, both out of the migration chain. |

---

## 2. Migrations

| Migration | Purpose |
| --- | --- |
| `20260727144439_0f0fff3a-a80d-4823-9ad4-3ef989303b9e.sql` | Pass 3.8.5: `readiness_impact` column and backfill, readiness snapshot columns on `tenant_onboarding`, `private.fn_onboarding_evaluate_readiness_json`, the read-only and persisting evaluators, and the guarded activation routine. |
| `20260727150928_dceb11bb-c3fc-42a7-abac-f62b44e795e2.sql` | Pass 3.8.5B (append-only): superseded the check builder to carry deep links, replaced the evaluator with the 14 canonical matrix keys and reason codes, and made `_expected_version` mandatory on activation (SQLSTATE `40001` when stale or absent). |

No migration file was rewritten; both remain in chronological order.

---

## 3. Application changes

- `src/lib/tenant-onboarding/required-settings.registry.ts` — removed `readinessImpact`, `OnboardingSettingReadinessImpact` and `blockingSettingKeys()`; documents `setting_definitions.readiness_impact` as the authority.
- `src/lib/tenant-onboarding/schemas.ts` — `activateTenantSchema` requires a non-negative integer `expectedVersion`; no client fingerprint is accepted. `onboardingSettingSpecSchema` no longer carries a readiness classification.
- `src/lib/tenant-onboarding/readiness.ts` — `READINESS_CHECK_KEYS` matches the matrix exactly; counts, overall status and fingerprint are mapped from the database, never recomputed.
- `src/lib/tenant-onboarding/server/query-service.server.ts` — the detail read calls the read-only evaluator and degrades to the frozen `not_evaluated` envelope on failure.
- `src/lib/tenant-onboarding/server/command-service.server.ts` — `refreshOnboardingReadinessCommand` (persist) and `activateTenantCommand` (guarded); SQLSTATE mapping `P3848 → readiness_blocked`, `P3849 → warning_acknowledgement_required`, `P384B → lifecycle_state_blocks`, `40001 → version_conflict`, `42501 → permission_denied`.
- `src/lib/tenant-onboarding/commands.functions.ts` — activation requires `platform.tenant.activate` only; refresh requires the update permission.

---

## 4. Certification artifacts

| Artifact | Purpose | Status |
| --- | --- | --- |
| `supabase/tests/pass_3_8_5_readiness_certification.sql` | Fixture-scoped, fully rolled back. Certifies the readiness-impact authority, the 14-key canonical set, frozen literals, read-path write-freedom, snapshot persistence and every activation guard (`P3848`, `P3849`, `P384B`, `40001`) plus idempotent replay. | **NOT EXECUTED — DATABASE UNAVAILABLE FROM THIS ENVIRONMENT** |
| `supabase/tests/pass_3_8_5_activation_concurrency.sh` | Two real sessions race `fn_onboarding_activate_tenant` with the same expected version; asserts exactly one transition, one activation step row, one audit entry and a deterministic loser. Fixtures are trap-cleaned; the shared caller is removed only when this run created it. | **NOT EXECUTED — DATABASE UNAVAILABLE FROM THIS ENVIRONMENT** |

Both files are outside the migration chain and are never applied by deployment.

---

## 5. Verification

| Gate | Result |
| --- | --- |
| `bun run test` | **585 / 585 passed (53 files)** — local Lovable execution |
| `./node_modules/.bin/tsc --noEmit` | **PASS** — local Lovable execution |
| `bun run build` | **PASS** — local Lovable execution |
| SQL readiness certification | NOT EXECUTED — database unavailable |
| Activation concurrency certification | NOT EXECUTED — database unavailable |

New application tests this pass:

- `src/lib/tenant-onboarding/__tests__/activation.test.ts` — mandatory `expectedVersion`, exact RPC argument set, no client fingerprint, no follow-up lifecycle write, full SQLSTATE mapping, read-vs-persist RPC routing, cache-invalidation scoping.
- `src/lib/tenant-onboarding/__tests__/readiness.test.ts` — asserts the exact 14 canonical matrix keys and deterministic ordering.
- `src/lib/tenant-onboarding/__tests__/architecture.test.ts` — asserts no application source keeps a hardcoded blocking-settings list or derives the `required_settings_valid` verdict.

---

## 6. Open items

| Item | Status |
| --- | --- |
| `FINDING-AUTH-SIGNUP-TENANT-FK-20260726` | **REPAIRED IN CODE — LIVE VERIFICATION PENDING** (Pass 3.8.5A). Remains a release blocker until certified against the live database. |
| Live database certification (3.8.4, 3.8.5A, 3.8.5B) | **PENDING** — all harnesses authored; execution requires a reachable Postgres connection string. |

---

## 7. Verdict

Pass 3.8.5B application and database layers are **complete in code**. Gate 3.8 cannot be closed until the three certification harnesses are executed against the live database and the signup finding is verified there.
