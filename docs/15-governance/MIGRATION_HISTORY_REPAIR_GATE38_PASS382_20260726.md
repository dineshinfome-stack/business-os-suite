---
id: MIG-20260726-GATE38-PASS382-HISTORY-REPAIR
title: "Migration-History Repair Exception — Gate 3.8 / Pass 3.8.2 Certification Harness"
type: governance-exception
status: Approved With Binding Conditions
owner: "Architecture Office"
created: "2026-07-26"
last_updated: "2026-07-26"
tags: ["governance", "migration", "exception", "gate-3.8", "pass-3.8.2"]
---

# Migration-History Repair Exception — Gate 3.8 / Pass 3.8.2

**Repository status while this document is `Approved With Binding Conditions`:**
`Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED`.
**Pass 3.8.3 — NOT STARTED.**

No migration file has been modified. Step 0B authority approval is recorded in
§9: Commit A is AUTHORIZED but NOT STARTED, subject to every binding condition
recorded in this document and the manifest. Pass 3.8.3 is not authorized.

---

## 0. Step 0B-prep execution baseline (captured before any repository change)

| Property | Value |
| --- | --- |
| Repository | `https://git.private.lovable-gcp.code.storage/4a3d10fa-b503-47e6-b169-42e0c586ca99.git` (credentials removed) |
| Branch | `edit/edt-5541374b-c9ce-4ee6-8dc3-90f88b9b25b3` |
| Preparation start commit | `77656a1462918c636c94c6c7389570cccc62693e` |
| Captured at (UTC) | `2026-07-26T13:33:45Z` |
| Working tree clean | Yes |
| Staged / unstaged / untracked | 0 / 0 / 0 |

The baseline was captured with `git status --porcelain=v1` returning no output.
A dirty tree would have produced `PREPARATION_BASELINE_DIRTY`, zero repository
changes, and an external-only report; no dirty-tree fallback exists.

## 0.1 Forensic identity chain (verified before any repository change)

Extraction used strict shell handling (`set -euo pipefail`) and exact-byte
recovery to a temporary file, so a `git cat-file` failure cannot be masked by a
downstream pipeline stage.

```bash
set -euo pipefail
ORIGINAL_COMMIT="1907718fa16ecd48f7e3f0b16091d196909a76c3"
MIGRATION_PATH="supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql"
RECOVERED_FILE="$(mktemp)"
trap 'rm -f "${RECOVERED_FILE}"' EXIT
git cat-file -e "${ORIGINAL_COMMIT}^{commit}"
RECOVERED_BLOB="$(git rev-parse "${ORIGINAL_COMMIT}:${MIGRATION_PATH}")"
git cat-file blob "${ORIGINAL_COMMIT}:${MIGRATION_PATH}" > "${RECOVERED_FILE}"
sha256sum "${RECOVERED_FILE}"
wc -c < "${RECOVERED_FILE}"
wc -l < "${RECOVERED_FILE}"
git log --follow --format=%H -- "${MIGRATION_PATH}"
```

| Check | Expected | Observed | Result |
| --- | --- | --- | --- |
| Commit object exists | resolvable `^{commit}` | resolvable | PASS |
| Recovered blob SHA | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` | PASS |
| Recovered SHA-256 | `584269e1bd01e0a85fc4801dfd941459cb08e8b429f71b9835163037069373c3` | identical | PASS |
| Recovered byte count | 11460 | 11460 | PASS |
| Recovered newline count | 254 | 254 | PASS |
| `git log --follow` commit count | — | 1 | recorded |

**Path-history disposition: `ONLY_COMMIT_VERIFIED`.** `git log --follow` for the
subject path returns exactly one commit,
`1907718fa16ecd48f7e3f0b16091d196909a76c3`, so the "only commit touching this
path" claim in §1 is verified rather than neutrally corrected.

**Forensic identity chain: PASS.**

---

## 1. Subject migration

| Property | Value |
| --- | --- |
| Path | `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` |
| Git blob SHA | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` |
| SHA-256 (exact bytes) | `584269e1bd01e0a85fc4801dfd941459cb08e8b429f71b9835163037069373c3` |
| Line count | 254 |
| Byte count | 11460 |
| Commit introducing the executable form | `1907718fa16ecd48f7e3f0b16091d196909a76c3` (only commit touching this path; verified in §0.1) |
| Repository HEAD at investigation | `3fa3657b4945cf8d074ba8142207cccece7e5cdb` |

Retrieval of the original executable content (never copied into the active tree,
because doing so would reintroduce the live user UUIDs):

```bash
git cat-file blob 1907718fa16ecd48f7e3f0b16091d196909a76c3:supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql
```

## 2. Why repair is requested

The file is a **certification harness**, not a schema migration. It is
environment-dependent and therefore cannot participate in a clean replay:

- it hard-codes two live user UUIDs
  (`9773aa51-…4489` authorized, `87569669-…e290` denied) that exist only in the
  current development database;
- it impersonates one of them with
  `set_config('request.jwt.claims', …)` + `SET LOCAL ROLE authenticated`;
- it seeds 1,205 `REM382 Tenant …` fixtures inside the migration chain.

A fresh database has neither user, so replay fails for environmental reasons
rather than for any defect in the remediation itself.

The **remediation** migration
`20260726113455_f79b36fd-9178-4def-91a8-cbc298d95e21.sql` — which owns the
grants, permission-based RLS, `public.fn_tenant_onboarding_queue`, parameter
validation, the non-persisted ordering mirror, and server-side pagination —
is **not** in scope and must remain byte-identical.

## 3. Step 0C — Migration runner / history investigation (executed)

Executed against the connected project before requesting approval.

| Question | Finding |
| --- | --- |
| Database engine | PostgreSQL 17.6 |
| Migration runner | Lovable-managed Supabase migration runner (no local `supabase` CLI in the toolchain) |
| Migration history table | `supabase_migrations.schema_migrations` |
| Stored columns | `version` (text), `statements` (text[]), `name` (text), `created_by` (text), `idempotency_key` (text), `rollback` (text[]) |
| Checksum / hash column | **None.** No content hash is stored or compared. |
| Content tracking | `statements[]` retains the full executed SQL text of each applied migration. |
| Version semantics | `version` is the **apply timestamp**, not the filename prefix. The subject file is recorded as version `20260726114243`, name `20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466`. |
| Effect of editing an applied migration file | None on existing databases: the runner keys on recorded versions and stores no checksum, so no drift is detected and no replay or sync is refused. |
| Is a history/checksum repair record required? | **No.** There is no checksum record to repair. |
| Recorded evidence of the original executable form | Retained in the database: for version `20260726114243`, `statements` embeds the admin UUID (`true`) and the `REM382 Tenant` fixture text (`true`), 11,457 bytes, 0 rollback statements. |
| Live residue from the original run | `tenants` 0, `tenant_onboarding` 0, `tenant_onboarding_steps` 0 for all `rem382-%` / `REM382 Tenant%` keys. |

**Material consequence for the approver:** the tombstone changes only the
repository file. The historical executable content — including the live UUIDs —
remains recorded in `supabase_migrations.schema_migrations.statements` for
already-applied databases. The repair reduces *future* replay exposure and
removes environment-dependent content from the active tree; it does not, and is
not intended to, rewrite applied history.

### 3.1 Disclosed disposition item — historical `statements[]` retention

Retention of the original executable SQL in
`supabase_migrations.schema_migrations.statements` is disclosed for the approver
and remains pending an explicit disposition under this section and §9. Lovable
records no disposition of its own.

Available dispositions (approver selects exactly one in §9):

- `ACCEPTED_AS_IMMUTABLE_MIGRATION_EVIDENCE`
- `SEPARATE_SANITIZATION_REQUIRED_BEFORE_TOMBSTONE`

### 3.2 Migration-history ACL evidence (read-only, executed)

Executed inside an explicit read-only transaction; no substitution of `false`
for a failed query is permitted.

```sql
BEGIN TRANSACTION READ ONLY;
SELECT current_database()                                                          AS database_name,
       session_user::text                                                          AS session_user,
       current_user::text                                                          AS current_user,
       current_setting('transaction_read_only')                                    AS transaction_read_only,
       has_schema_privilege('anon','supabase_migrations','USAGE')                   AS anon_schema_usage,
       has_schema_privilege('authenticated','supabase_migrations','USAGE')          AS authenticated_schema_usage,
       has_table_privilege('anon','supabase_migrations.schema_migrations','SELECT') AS anon_table_select,
       has_table_privilege('authenticated','supabase_migrations.schema_migrations','SELECT')
                                                                                    AS authenticated_table_select;
COMMIT;
```

| Property | Value |
| --- | --- |
| Executed at (UTC) | `2026-07-26T13:34:13Z` |
| Database engine | PostgreSQL 17.6 |
| History table | `supabase_migrations.schema_migrations` |
| Database name | `postgres` |
| `session_user` / `current_user` | `supabase_read_only_user` / `supabase_read_only_user` |
| `transaction_read_only` | `on` |
| Query exit status | 0 |
| Result row count | 1 |
| Project environment | connected development project |
| `anon` schema USAGE | `false` |
| `authenticated` schema USAGE | `false` |
| `anon` table SELECT | `false` |
| `authenticated` table SELECT | `false` |

Effective-privilege note: `has_*_privilege` reports effective privilege
including role inheritance and `PUBLIC` grants, so a `false` result covers both
direct and inherited paths for the named role.

Derivation:

```text
acl_exposure     = OR of the four privilege results          = false
evidence_failure = exit != 0 OR row_count != 1
                   OR transaction_read_only != "on"
                   OR any privilege result null / non-boolean = false
security_blocker = acl_exposure OR evidence_failure           = false
```

### 3.3 Clean-replay identity gate

The clean-replay gate identifies the subject migration by its exact recorded
**name**, never by an expected `version` value derived from the filename prefix.

| Property | Value |
| --- | --- |
| History table | `supabase_migrations.schema_migrations` |
| Identity column | `name` |
| Expected name | `20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466` |
| Expected row count | 1 |
| Version semantics | runtime apply timestamp; not filename prefix |
| Observed existing version | `20260726114243` |
| Expected clean-replay version | not pre-asserted (`null`) |
| Clean-replay version rule | record the observed value at replay time; do not pre-assert |

### 3.4 Obsolete version-gate assumption search (classified)

**Measurement mode: `HISTORICAL_RECONSTRUCTION`.**
The authoritative measurement is pinned to commit
`77656a1462918c636c94c6c7389570cccc62693e` and to the immutable blobs
`67c07fdb8cda5393c1b00dfcaf34d78f98a604d1` (this document) and
`824c7815113e72f5cf1614b9bc37c7581461eac9` (the manifest), extracted with
`git show <commit>:<path>`. All line numbers below refer to that historical
baseline, not to current file contents.

Commands executed (each query run against the extracted historical bytes;
the recorded repository-wide command form is retained for reference):

```bash
rg -n --fixed-strings -i "<query>" --glob '!node_modules' --glob '!.git' .
```

Queries: `20260726114237 must appear applied`, `version 20260726114237`,
`20260726114237`, `20260726114243`, `schema_migrations`, `filename prefix`,
`stored version`, `migration version`.

| Classification | Count | Action |
| --- | --- | --- |
| Active governing / executable surface asserting an obsolete version identity | 0 | none required |
| Superseded documentation outside the allow-list | 0 | none required |
| Immutable historical record | 0 | none required |
| Hits inside the two allow-listed governance files | 18 | no change required |
| False positives (excluded, unrelated phrasing) | 0 | none |

Classification arithmetic: `18 = 18 + 0 + 0 + 0 + 0 + 0`.

#### 3.4.1 Historical hit ledger (18 records, pinned to the historical baseline)

| # | Query | Path | Line (historical baseline) | Matched text | Classification | Reason | Action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 27 | \| Path \| `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 2 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 39 | git show 1907718:supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 3 | `schema_migrations` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 71 | \| Migration history table \| `supabase_migrations.schema_migrations` \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 4 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 75 | \| Version semantics \| `version` is the **apply timestamp**, not the filename prefix. The subject file is recorded as version `20260726114243`, name `20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466`. \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 5 | `20260726114243` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 75 | \| Version semantics \| `version` is the **apply timestamp**, not the filename prefix. The subject file is recorded as version `20260726114243`, name `20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466`. \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 6 | `filename prefix` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 75 | \| Version semantics \| `version` is the **apply timestamp**, not the filename prefix. The subject file is recorded as version `20260726114243`, name `20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466`. \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 7 | `20260726114243` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 78 | \| Recorded evidence of the original executable form \| Retained in the database: for version `20260726114243`, `statements` embeds the admin UUID (`true`) and the `REM382 Tenant` fixture text (`true`), 11,457 bytes, 0 rollback statements. \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 8 | `schema_migrations` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 83 | remains immutably recorded in `supabase_migrations.schema_migrations.statements` | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 9 | `migration version` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 90 | \| Environment \| Migration version status \| Runtime action after repair \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 10 | `20260726114243` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 92 | \| Existing development DB \| Already applied (version `20260726114243`) \| No new SQL executed; historical statements retained in history \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 11 | `schema_migrations` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 137 | `supabase_migrations.schema_migrations.statements`. Reverting the tombstone | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 12 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` | 166 | \| Original path \| `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` \| | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 13 | `schema_migrations` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` | 15 | "history_table": "supabase_migrations.schema_migrations", | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 14 | `filename prefix` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` | 19 | "version_semantics": "apply timestamp, not filename prefix", | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 15 | `20260726114243` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` | 20 | "subject_recorded_version": "20260726114243", | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 16 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` | 21 | "subject_recorded_name": "20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466", | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 17 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` | 61 | "path": "supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql", | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |
| 18 | `20260726114237` | `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` | 73 | "supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql", | ALLOW_LIST_CONTEXT_VALID | Match occurs inside an allow-listed governance evidence file and documents the corrected name-based identity gate; it is not an obsolete version-based assumption. | No change required |

Canonical evidence: the four evidence fields (`query`, `path`,
`line_at_historical_search_baseline`, `matched_text`) serialised as JSON Lines
in fixed key order, paths normalised (`./` removed), matched text trimmed,
deduplicated by `path:line:query`, sorted `LC_ALL=C` by path then numeric line
then query, UTF-8, with a final newline.

`canonical_output_sha256`: `2fde824bba0ef0c3267ef73a2e5c059c07c22dee52c66460f017f1bec80172ef`
`raw_output_sha256`: `333f0938027bf036b1b4d2212b54f682c97c41c88947c6b659eb0b709f168ad3`

**Unresolved active assumptions: 0. Historical search result: `PASS`.**

#### 3.4.2 Current-state review (supplemental, excluded from the ledger arithmetic)

The same eight queries were re-run against the working tree at the correction
baseline `ebb14bf25fe75f3afb247520aa3a70a6afe86db9`.

| Measure | Expected reference | Observed |
| --- | --- | --- |
| Canonical records (`path:line:query`) | 57 | 57 |
| Path/line records | 47 | 47 |
| Records in this document | 33 | 33 |
| Records in the manifest | 24 | 24 |
| Records outside the allow-list | 0 | 0 |

Classification: `SELF_REFERENTIAL_GOVERNANCE_CONTEXT_VALID`; unresolved
obsolete assumptions: 0; result: `PASS`.

The current-state result does not contradict the historical measurement. The
two measurements were taken against different bytes at different commits: the
historical figure of 18 describes the repository as it stood at
`77656a14`, while the current figure describes the evidence files after they
were expanded to record that measurement.

The current-state result also does not supersede the historical measurement.
It is a later, self-referential count of governance text about the historical
search, and it is therefore excluded from the historical ledger arithmetic.

#### 3.4.3 Hidden active-surface review

| Property | Value |
| --- | --- |
| Path | `.lovable/plan.md` |
| Command | `rg -n --hidden --fixed-strings -i "<query>" .lovable/plan.md` |
| Matches | 0 |
| Unresolved obsolete assumptions | 0 |
| Result | `PASS` |

The reviewed plan revision contains no obsolete version-identity assertion.
The recorded assertion is that unresolved obsolete assumptions are zero.

## 4. Environment reconciliation

| Environment | Migration version status | Runtime action after repair |
| --- | --- | --- |
| Existing development DB | Already applied (version `20260726114243`) | No new SQL executed; historical statements retained in history |
| Clean replay DB | Recorded as applied during replay | Comment-only; no runtime effect |
| DB created from an older commit | Original harness may have run | Verify historical residue (currently 0) |
| DB created from the repaired commit | Tombstone runs | No fixtures, no impersonation, no seeded tenants |

The tombstone does not retroactively undo historical execution against
existing databases.

Retention of the original executable SQL in
`supabase_migrations.schema_migrations.statements` is disclosed for the
approver and remains pending an explicit disposition under §3.1 and §9.

## 5. Proposed repair (requires approval before execution)

1. Replace the file content with a **comment-only tombstone** at the same
   filename and version: original commit SHA, original blob SHA and SHA-256,
   this document's ID, the replacement harness path, Git recoverability, and a
   statement that the remediation migration `20260726113455_…` remains solely
   responsible for schema, grants, RLS, and the queue routine. No SQL, no
   `DO`/`BEGIN`, no JWT impersonation, no live UUIDs, no `REM382 Tenant` text.
2. Relocate certification to a deterministic, discovery-excluded harness:
   - `supabase/tests/pass_3_8_2_queue_certification.sql`
   - `supabase/tests/pass_3_8_2_queue_certification_postcheck.sql`
   - `supabase/tests/README.md`
   with synthetic shared fixture constants, read-only RBAC preconditions
   (`permissions` / `roles` / `role_permissions` are asserted, never mutated),
   a 16-entry numbered assertion register emitting
   `PASS382-CERT-001 PASS` … `PASS382-CERT-016 PASS`, an in-transaction
   `ROLLBACK`, and a fresh-session residue postcheck executed even when the
   harness aborts.
3. Correct the onboarding matrix, canonical completion report, and closure
   report; then emit the manifest, terminal audit, and additive registry row.

## 6. Runtime-immutability baseline (Step 0D, captured)

These files MUST remain byte-identical through the terminal governance commit:

| Path | Git blob SHA | SHA-256 |
| --- | --- | --- |
| `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` | `584269e1bd01e0a85fc4801dfd941459cb08e8b429f71b9835163037069373c3` |
| `supabase/migrations/20260726113455_f79b36fd-9178-4def-91a8-cbc298d95e21.sql` | `7c9f31ff73e5ba8acd882d24c3b3e245b31cfd91` | `70c9aefbfff2bdc3fb40fda5129f9d09c938f8cd55e8a91acc50aa005a5b0b8f` |
| `src/lib/tenant-onboarding/server/query-service.server.ts` | `eaa83f012e548276a275b703ac51e38106bf34c7` | `19791e6e72c765b793067091f8c811cca7edf423a1dbb9a08ca1346830e97a89` |
| `src/lib/tenant-onboarding/server/mappers.server.ts` | `cacfdcda92e32bcc3532809a72eb5569f5722070` | `9ca9718d1f778d6d4b4e1c75655f3262949fe9a0d539bb69954a376536a17d62` |
| `src/lib/tenant-onboarding/queries.functions.ts` | `e39863457a352ce6b9070f308eac120d0044adf1` | `df7662d0fdd1625d5111eb4ab5921889e909ddd28697fdbb5875afe071ccbc55` |
| `src/integrations/supabase/types.ts` | `e0587be8539bb6c9176b962812b44f45aad8876f` | `2a5cf853f3c8ae8df21a036809716004b2b705831453c2a29528b69a24bcf064` |

Step 0B-prep re-verification: six files checked, six Git blob SHAs unchanged,
six SHA-256 digests unchanged, twelve recorded hash comparisons passed,
migration and runtime drift = 0 files.

## 7. Rollback / recovery

The original executable content is recoverable at any time from Git
(`git cat-file blob 1907718fa16ecd48f7e3f0b16091d196909a76c3:<path>`) and is
additionally retained in `supabase_migrations.schema_migrations.statements`.
Reverting the tombstone restores the file byte-for-byte; no database action is
required or implied.

## 8. Known execution constraints (disclosed before approval)

1. **Commit authorship.** Git state is managed by the platform; the executing
   agent cannot create the three evidence commits itself. Commit SHAs for the
   technical-repair, verified-closure, and terminal-governance stages must be
   supplied by the platform and recorded in the terminal audit. Any stage whose
   SHA cannot be pinned is reported as unpinned rather than asserted.
2. **Clean replay environment.** The migration chain assumes Supabase-managed
   `auth`, `private`, and role infrastructure. Whether a fresh replay can be
   stood up is verified as a binding gate before the tombstone is trusted; if it
   cannot start, the status remains `COMPLETE, REMEDIATION REQUIRED` and the
   failing gate is named.

## 9. Approval

This section is completed only by the designated authority. The values below
were supplied as explicit Architecture Office input; the commit carrying this
completed section is the durable approval record whose SHA is cited in the
terminal audit.

| Field | Value |
| --- | --- |
| Approval authority | Architecture Office — Migration Authority |
| Approver identity | Dino Loy (GitHub: dineshinfome-stack) |
| Decision | `APPROVED_WITH_BINDING_CONDITIONS` |
| Decision timestamp (UTC) | `2026-07-26T16:03:51Z` |
| Repair document ID | `MIG-20260726-GATE38-PASS382-HISTORY-REPAIR` |
| Original path | `supabase/migrations/20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466.sql` |
| Original blob SHA | `12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2` |
| Step 0C findings incorporated | Yes — §3 above |
| Approved checksum-repair action | Not applicable (no checksum tracking; see §3) |
| Approved tombstone strategy | `true` |
| Historical `statements[]` decision | `ACCEPTED_AS_IMMUTABLE_MIGRATION_EVIDENCE` (see §3.1) |
| Authority decision note | Approval authorizes Commit A only, subject to all binding conditions recorded in the exception document and manifest. It does not authorize Pass 3.8.3. |
| Scope of authorization | Commit A — AUTHORIZED. Pass 3.8.3 — NOT AUTHORIZED. |
| Approval commit SHA | `PENDING_POST_COMMIT_PIN` — captured after this commit and recorded in the manifest and terminal audit. |

### 9.1 Approval template

```text
NON-AUTHORITATIVE APPROVAL TEMPLATE — NOT AN APPROVAL RECORD

Approver identity:                <APPROVER_IDENTITY>
Decision:                         <DECISION>
Decision timestamp (UTC):         <UTC_TIMESTAMP>
Approved tombstone strategy:      <TRUE_OR_FALSE>
Historical statements[] decision: <ACCEPTED_AS_IMMUTABLE_MIGRATION_EVIDENCE
                                   | SEPARATE_SANITIZATION_REQUIRED_BEFORE_TOMBSTONE>
```

Field rules:

- `pending` — every approval field is null / `_pending_`.
- `approved` — decision `APPROVED_WITH_BINDING_CONDITIONS`, tombstone strategy
  true, disposition `ACCEPTED_AS_IMMUTABLE_MIGRATION_EVIDENCE`,
  `security_blocker` false, approval commit SHA a full 40-character SHA.
- `blocked` — tombstone strategy false, disposition
  `SEPARATE_SANITIZATION_REQUIRED_BEFORE_TOMBSTONE`, approval commit SHA null,
  Commit A blocked, subject migration remains byte-identical.

## 10. Step 0B-prep terminal result

| Item | Value |
| --- | --- |
| Preparation baseline | CLEAN |
| Forensic identity chain | PASS |
| Path-history disposition | `ONLY_COMMIT_VERIFIED` |
| Obsolete version-gate search | `PASS` (measurement mode `HISTORICAL_RECONSTRUCTION`) |
| Historical search baseline commit | `77656a1462918c636c94c6c7389570cccc62693e` |
| Historical hits recorded | 18 |
| Historical ledger validation | `PASS` |
| Current-state search review (supplemental) | `PASS` (57 / 47 / 33 / 24 / 0) |
| Hidden active-surface review | `PASS` |
| `canonical_output_sha256` | `2fde824bba0ef0c3267ef73a2e5c059c07c22dee52c66460f017f1bec80172ef` |
| Unresolved active assumptions | 0 |
| ACL result rows / exposure / evidence failure | 1 / false / false |
| Security blocker | false |
| Hash comparisons | 12 / 12 PASS (6 blob + 6 SHA-256), drift 0 files |
| Changed paths (author-attributable) | exactly two `M` entries (this document and the manifest) |
| Platform-generated path excluded | `src/routeTree.gen.ts` in isolated platform commit `64f2a34dab813c1abe59c4846c4c17a6c506e3e2` (router codegen, no governance content) |
| `.lovable/plan.md` | byte-identical, digest `00b23fcf2725822570305a78889999e0b7942ed2228a14b3e1f77b6d7f8c43b1` |
| Renames / copies / additions / deletions / binary changes | 0 / 0 / 0 / 0 / 0 |
| Step 0B-prep | COMPLETE |
| Step 0B authority approval | PENDING |
| Commit A | NOT STARTED |
| Repository status | `Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED` |
| Pass 3.8.3 | NOT STARTED |
