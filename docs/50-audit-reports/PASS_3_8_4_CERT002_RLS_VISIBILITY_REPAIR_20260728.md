# Pass 3.8.4 — CERT-002 RLS-Visibility Repair, Reconstruction and Recertification

**Gate:** SPR-MOD-001-003 · Gate 3.8
**Pass:** 3.8.4 — Administrator-invitation RPC certification
**Date (UTC):** 2026-07-28
**Type:** Certification-harness repair (reconstructed) + live recertification

---

## 1. Baseline

| Item | Value |
| --- | --- |
| Starting HEAD | `590dd323384d5608c778f9b538b2b23dd7727ecc` |
| Working tree at preflight | clean |
| Original SQL-harness blob | `30fe1ed8fd648f53e0ad74c402a1f63628fc06da` |
| Repaired SQL-harness blob | `7fc0b8b48579b97a8162ea8937b1c10d745316de` |
| Executed harness SHA-256 | `34239d1b697a5415c0085d757b472724a3589f499cb3098e3413f09e4f9d4954` |
| Migration 51 blob (protected) | `05756f180ba3902403994b29932efe7a8fd597c3` — unchanged |
| Concurrency-harness blob (protected) | `d5e5cff401194d848acb0fa46b7210c601d5585a` — unchanged |
| `src/routeTree.gen.ts` blob at baseline | `1b1a72ea930e21a37b33f6ae7d1cedebdc6cb9a2` |
| `src/routeTree.gen.ts` blob published | `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06` — generator-produced |
| Certification target | disposable project `eztufmpddagshnhjcrcf` |
| Migration ledger at preflight | 51 |
| Fixture residue at preflight | zero |

### Published change scope

Certification repair scope: two intentional certification artifacts plus one
generator-produced routeTree change. The final published change contains three
paths:

1. `supabase/tests/pass_3_8_4_admin_rpc_certification.sql`
2. `docs/50-audit-reports/PASS_3_8_4_CERT002_RLS_VISIBILITY_REPAIR_20260728.md`
3. `src/routeTree.gen.ts`

The final routeTree blob is `4a8c46ea9743dcafd6af1cc7c18c7c7f15924d06`. That
change was produced automatically by the platform route generator, which removed
the TanStack Start registration block present in baseline blob
`1b1a72ea930e21a37b33f6ae7d1cedebdc6cb9a2`.

No hand-authored route, application source, migration, RPC or RLS policy
changed. No package or lock file was modified. The routeTree deviation does not
alter the SQL or concurrency certification result.

**EXCEPTION-G38-P384-ROUTETREE-GENERATOR-DRIFT — ACCEPTED**

---

## 2. Historical diagnostic evidence (previous investigation)

The earlier CERT-002 failure — `PASS384-CERT-002: replay rotated the stored
invitation hash` — was diagnosed as **Classification A: RLS visibility false
negative**, not a production defect. That diagnosis established:

* the replay path of `public.fn_onboarding_invite_first_admin_atomic` contains
  no statement that writes `token_hash`;
* privileged inspection of the invitation after an equivalent replay showed the
  stored hash unchanged;
* a direct read performed while the session role was `authenticated` returned
  **zero rows**, because the `org_invitations_select` policy exposes invitation
  rows only to organization members and to the invitation recipient.

The synthetic platform operator used by the harness is deliberately neither an
organization member nor the invitation recipient, so its RLS blindness is
**correct behaviour**. The defect was in the harness, which performed internal
state assertions while still impersonating that caller and interpreted an
invisible row as a mutated hash.

> This section is historical context only. It does **not** certify the
> reconstructed harness content; the ephemeral repaired file from the earlier
> session was not preserved.

---

## 3. Repair design (reconstructed in this pass)

### 3.1 Execution-context model

| Operation class | Role context |
| --- | --- |
| Production RPC calls (the subject under certification) | `SET LOCAL ROLE authenticated` |
| Direct fixture DML on RLS-protected tables | `RESET ROLE` (privileged certification executor) |
| Internal database-state assertions | `RESET ROLE` |

Every privileged excursion is explicitly paired: the harness returns to
`SET LOCAL ROLE authenticated` before the next RPC being certified. The
invitation email was **not** injected into the JWT claims; the operator remains
a non-member, non-recipient principal so the RLS contract is certified rather
than bypassed.

Role transitions were applied to CERT-001 (step-row count), CERT-002 (full
before/after inspection), CERT-006 (invitation status, step-row and pending
counts), CERT-007 (non-default invitation fixture insertion), CERT-008 (direct
status transition to `accepted`) and CERT-010 (default-organization toggling).
CERT-003/004/005/009/011/012 remain pure RPC calls under the intended
authorized or unauthorized `authenticated` caller. CERT-000A/000B/013 are
catalog reads.

### 3.2 CERT-002 sequence

1. CERT-001 creates the invitation through the atomic RPC as `authenticated`.
2. `RESET ROLE`.
3. Read the invitation by returned ID with the privileged executor.
4. Assert exactly one row exists — otherwise
   `PASS384-CERT-002: invitation missing after creation`.
5. Assert the initial `token_hash` equals `c_hash_a` — otherwise
   `PASS384-CERT-002: unexpected initial token hash`.
6. Capture `v_hash_before`, email, role, status, expiry.
7. `SET LOCAL ROLE authenticated`.
8. Execute the equivalent replay (uppercase email, same role, `c_hash_b`).
9. Assert the same invitation ID — otherwise
   `PASS384-CERT-002: replay returned a different invitation`.
10. Assert `created=false` and `replayed=true`.
11. Assert the operator sees **zero** invitation rows under RLS — otherwise
    `PASS384-CERT-002: platform operator unexpectedly saw the invitation row
    through RLS`.
12. `RESET ROLE`; re-read the invitation into `v_hash_after` and metadata.
13. Assert the invitation still exists — otherwise
    `PASS384-CERT-002: invitation missing after replay`.
14. Assert `v_hash_after = v_hash_before` — otherwise
    `PASS384-CERT-002: replay changed the stored token hash`.
15. Assert email, role, status and expiry unchanged — otherwise
    `PASS384-CERT-002: replay changed invitation metadata`.
16. Assert exactly one onboarding-step row — otherwise
    `PASS384-CERT-002: replay created a second invitation step row`.

The ambiguous message *“replay rotated the stored invitation hash”* was removed;
row invisibility and row disappearance now raise distinct, unambiguous errors.

### 3.3 Preserved harness contract

* one explicit transaction (`BEGIN` … `ROLLBACK`);
* `\set ON_ERROR_STOP on`;
* deterministic synthetic identities only;
* no assertion weakened, deleted or skipped;
* final notice retained:
  `PASS384-CERT: all assertions passed (single-session scope).`

---

## 4. Current repository recertification evidence

All evidence below was produced by executing the **reconstructed repository
file** in this pass.

### 4.1 SQL certification

| Item | Value |
| --- | --- |
| Start (UTC) | 2026-07-28T07:14:48Z |
| Finish (UTC) | 2026-07-28T07:14:50Z |
| psql version | 17.9 |
| Executed file SHA-256 | `34239d1b697a5415c0085d757b472724a3589f499cb3098e3413f09e4f9d4954` |
| Executed Git blob | `7fc0b8b48579b97a8162ea8937b1c10d745316de` |
| Exit status | **0** |

| Assertion | Result |
| --- | --- |
| CERT-000A — atomic routine unique, no organization argument, executable by `authenticated` | PASS |
| CERT-000B — legacy six-argument routine retired for callers | PASS |
| CERT-001 — default organization resolved internally, single step row | PASS |
| CERT-002 — replay equivalence, hash and metadata immutability, RLS blindness | PASS |
| CERT-003 — conflicting email rejected (`P3847`) | PASS |
| CERT-004 — conflicting role rejected (`P3843`) | PASS |
| CERT-005 — database-side input validation | PASS |
| CERT-006 — resend revoke + reissue + single step row | PASS |
| CERT-007 — non-default organization rejected (`P3842`) | PASS |
| CERT-008 — accepted invitation cannot be resent (`P3846`) | PASS |
| CERT-009 — role assignment refused without active membership | PASS |
| CERT-010 — missing default organization raises `P3841` | PASS |
| CERT-011 — unauthorized caller denied by every routine (`42501`) | PASS |
| CERT-012 — direct-RPC input validation | PASS |
| CERT-013 — now()-dependent validators are not `IMMUTABLE` | PASS |

Final notice emitted:
`NOTICE: PASS384-CERT: all assertions passed (single-session scope).`
Transaction ended with `ROLLBACK`.

### 4.2 Concurrency certification

| Item | Value |
| --- | --- |
| Start (UTC) | 2026-07-28T07:14:57Z |
| Finish (UTC) | 2026-07-28T07:15:43Z |
| Harness blob (unchanged) | `d5e5cff401194d848acb0fa46b7210c601d5585a` |
| Exit status | **0** |

| Scenario | Result |
| --- | --- |
| A — same email, same role | OK — created=1 replayed=1 conflicts=0 pending=1 step_version=2 |
| B — same email, different roles | OK — created=1 replayed=0 conflicts=1 pending=1 step_version=1 |
| C — different emails | OK — created=1 replayed=0 conflicts=1 pending=1 step_version=1 |

Final output:
`PASS384-CONC: scenarios A, B and C certified across two live sessions each.`

### 4.3 Residue

Post-execution counts on the target:

| Table | Rows |
| --- | --- |
| `auth.users` | 0 |
| `public.tenants` | 0 |
| `public.organization_invitations` | 0 |
| `public.tenant_onboarding_steps` | 0 |
| `public.user_roles` | 0 |
| `supabase_migrations.schema_migrations` | 51 (unchanged) |

No permanent database object was created; no migration was applied or replayed.
No credential, token value or connection string is recorded in this report.

---

## 5. Status

| Item | Status |
| --- | --- |
| Pass 3.8.4 | **CERTIFIED** |
| Pass 3.8.5A | CERTIFIED |
| Pass 3.8.5 | NOT CERTIFIED |
| Fresh 51-migration replay | PENDING |
| FINDING-G38-PRIVATE-SECURITY-DEFINER-EXECUTE-SURFACE | OPEN |
| Gate 3.8 | NOT CERTIFIED |
| Tenant activation | BLOCKED |

**Verdict:** PASS 3.8.4 RECONSTRUCTED, RECERTIFIED AND PUBLISHED — READY FOR
FRESH 51-MIGRATION REPLAY
