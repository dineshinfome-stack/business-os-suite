# Plan v19 — Pass 3.8.2 Step 0B-prep (documentation + read-only verification only)

Repository status stays `Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED`. Pass 3.8.3 stays NOT STARTED. No migration, harness, registry, RPC, RLS, grant, DTO, or read-layer change.

## Write allow-list (exactly two files)
- `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md`
- `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json`

## Phase 0A — Capture clean baseline (no repository mutation)
`git rev-parse HEAD`, `git branch --show-current`, `git remote get-url origin` (store canonical owner/repo or the observed URL with any credentials stripped), `git status --porcelain=v1` (must be empty). Held in temporary evidence only:
```json
"step_0b_prep_baseline": {
  "repository": "<observed>", "branch": "<observed>",
  "preparation_start_commit": "<40-char SHA>", "captured_at_utc": "<timestamp>",
  "working_tree_clean": true, "staged_changes": 0, "unstaged_changes": 0, "untracked_files": 0
}
```
Dirty ⇒ `PREPARATION_BASELINE_DIRTY`, repository changes 0, reported externally only, halt.

## Phase 0B — Forensic identity chain, failure-safe (no repository mutation)
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
Required: `RECOVERED_BLOB = 12ce3d2bea99733a79f4ddd7d1ca64a5dd62bae2`; SHA-256 = `584269e1bd01e0a85fc4801dfd941459cb08e8b429f71b9835163037069373c3`; bytes 11460; line count 254. Mismatch ⇒ `FORENSIC_IDENTITY_FAILURE`, repository changes 0, reported externally only, halt.

Path history: exactly one commit ⇒ `ONLY_COMMIT_VERIFIED`, retain "only commit touching this path"; otherwise `CLAIM_NEUTRALLY_CORRECTED`, reword to "commit containing the verified original executable form" and record the other commits.

## Phase 0C — First mutation: persist baseline + forensic results
Only after 0A and 0B pass, write both evidence sets into the two allow-listed files, mirrored so parity holds.

## Phase 0D — Remaining documentation work
1. **Full SHA replacement (4 occurrences):** document §1 table, §1 retrieval command, §7 rollback retrieval reference, manifest `subject_migration.original_commit` ⇒ `1907718fa16ecd48f7e3f0b16091d196909a76c3`. Post-edit search for standalone `1907718` returns zero active occurrences in the two files.
2. **Neutral retention wording:** replace the §4 sentence ending "…this is explicitly acknowledged and accepted." with:
```text
The tombstone does not retroactively undo historical execution against
existing databases.

Retention of the original executable SQL in
supabase_migrations.schema_migrations.statements is disclosed for the
approver and remains pending an explicit disposition under §3.1 and §9.
```
Confirm `historical retention accepted`, `acknowledged and accepted`, `statements[] accepted`, `immutable evidence accepted` appear nowhere outside the labelled non-authoritative template.
3. **Classified version-gate search:** record exact commands; queries `20260726114237 must appear applied`, `version 20260726114237`, `20260726114237`, `20260726114243`, `schema_migrations`, `filename prefix`, `stored version`, `migration version`. Rewrite only inside the two files. Classification: active governing/executable surface ⇒ BLOCK, request scope expansion; superseded doc ⇒ record, request amendment; immutable historical record ⇒ record as historical, do not rewrite; quoted/commented context ⇒ review, no auto-block; false positive ⇒ record excluded with reason. Result states `PASS`, `PASS_WITH_HISTORICAL_HITS`, `SCOPE_EXPANSION_REQUIRED`, `SEARCH_EVIDENCE_FAILURE`. Manifest stores `executed`, `commands`, `queries`, `hits` array (`[]` when empty; `path`, `line`, `matched_text`, `classification`, `reason`, `action`), counts, `result`.
4. **Identity gate (mirrored):**
```json
"clean_replay_identity_gate": {
  "history_table": "supabase_migrations.schema_migrations",
  "identity_column": "name",
  "expected_name": "20260726114237_3ca5092b-b2b6-41c3-a54e-2490f4093466",
  "expected_row_count": 1,
  "version_semantics": "runtime apply timestamp; not filename prefix",
  "observed_existing_version": "20260726114243",
  "expected_clean_replay_version": null,
  "clean_replay_version_rule": "record observed value; do not pre-assert"
}
```
plus document **§3.3** in prose.
5. **ACL evidence + blocker derivation:** inside `BEGIN TRANSACTION READ ONLY; … COMMIT;`, return `current_database()`, `session_user`, `current_user`, `current_setting('transaction_read_only')` and the four `has_schema_privilege`/`has_table_privilege` results. Passing evidence: exit 0, one row, `transaction_read_only = on`, four `false`. Never substitute `false` for a failed query.
```text
acl_exposure     = OR of the four privilege results
evidence_failure = exit != 0 OR row_count != 1 OR transaction_read_only != "on"
                   OR any privilege result null OR not a JSON boolean
security_blocker = acl_exposure OR evidence_failure
```
Store `security_blocker_derivation`, `executed`, `executed_at_utc`, `database_engine`, `history_table`, `database_name`, `session_user`, `current_user`, `transaction_read_only`, `query_exit_status`, `result_row_count`, `project_environment`, exact SQL, four `checks` as JSON booleans, the effective-privilege note, `acl_exposure`, `evidence_failure`, `security_blocker`; mirror into document §3.2.
6. **Approval schema and rules:** §9 gains `Historical statements[] decision`, left null/pending.
```json
"step_0b_approval": {
  "state": "pending", "approver_identity": null, "decision": null,
  "decision_timestamp_utc": null, "approved_tombstone_strategy": null,
  "historical_statements_decision": null, "approval_commit_sha": null
}
```
`pending` ⇒ all approval fields null; `approved` ⇒ `APPROVED_WITH_BINDING_CONDITIONS`, strategy true, disposition `ACCEPTED_AS_IMMUTABLE_MIGRATION_EVIDENCE`, `security_blocker` false, 40-char SHA; `blocked` ⇒ strategy false, disposition `SEPARATE_SANITIZATION_REQUIRED_BEFORE_TOMBSTONE`, SHA null, Commit A blocked, migration byte-identical.
7. **Approval-SHA handling / template:** §9 `Approval commit SHA` = literal `Captured after commit and recorded in the provisional manifest and terminal audit.` Template fenced, prefixed `NON-AUTHORITATIVE APPROVAL TEMPLATE — NOT AN APPROVAL RECORD`, placeholders `<APPROVER_IDENTITY>`, `<DECISION>`, `<UTC_TIMESTAMP>`; no bare `APPROVED` unless prefixed `EXAMPLE ONLY`.

## Phase 0E — Two-pass terminal validation, then halt

**Pass 1 — candidate validation (temporary evidence only)**
- Immutability: six files itemised; 6/6 blob PASS; 6/6 SHA-256 PASS; 12/12 total; drift 0.
- Duplicate-key-aware JSON parse of the manifest.
- Document–manifest parity: baseline, forensic chain, exact-name identity, observed version `20260726114243`, clean-replay version not pre-asserted, full 40-char SHA, two disposition values, four ACL booleans, derived blocker, approval pending, SHA in manifest only.
- Changed paths: union of `git diff --name-status --find-renames <start>..HEAD`, `git diff --name-status --find-renames`, `git diff --cached --name-status --find-renames`, `git ls-files --others --exclude-standard`.
- Binary detection: `git diff --numstat <start>..HEAD`, `git diff --numstat`, `git diff --cached --numstat`; both files must show numeric add/delete counts; a `-`/`-` pair is a binary diff and is rejected.
- Required: exactly two paths, statuses `M`,`M`, renames 0, copies 0, additions 0, deletions 0, unexpected paths 0, binary files 0.

**Pass 2 — persist then revalidate the final bytes**
Write:
```json
"step_0b_prep_result": {
  "status": "COMPLETE", "completed_at_utc": "<timestamp>",
  "forensic_identity": "PASS",
  "path_history_disposition": "ONLY_COMMIT_VERIFIED | CLAIM_NEUTRALLY_CORRECTED",
  "obsolete_version_gate_search_result": "PASS | PASS_WITH_HISTORICAL_HITS",
  "unresolved_active_hits": 0, "acl_exposure": false, "evidence_failure": false,
  "security_blocker": false, "document_manifest_parity": "PASS",
  "hash_comparisons_passed": 12, "hash_comparisons_total": 12,
  "changed_paths": 2, "unexpected_paths": 0, "binary_changes": 0
}
```
Then rerun against the final bytes: JSON syntax, duplicate-key detection, required-key cardinality, document–manifest parity, changed-path union, name-status validation, numstat binary detection, approval-field validation. `"status": "COMPLETE"` is permitted only after these post-write checks pass — a COMPLETE result must describe the final bytes, not the candidate versions. If post-write validation fails: set `VALIDATION_FAILURE`, `Step 0B approval = NOT REQUESTED`, and leave no stale COMPLETE result.

Halt at Step 0B.

## Failure-recording rule
- Pre-Phase-0C failures (`PREPARATION_BASELINE_DIRTY`, `FORENSIC_IDENTITY_FAILURE`): temporary evidence and the closing message only; repository changes remain 0.
- Post-Phase-0C failures (`SCOPE_EXPANSION_REQUIRED`, `SEARCH_EVIDENCE_FAILURE`, `SECURITY_BLOCKED`, `VALIDATION_FAILURE`): persisted only within the two-file allow-list.

Out of scope: tombstoning, `supabase/tests` harness, registry updates, marking the exception approved or retention accepted, Commit A, Pass 3.8.3.

## Conditional end state
All gates green ⇒ `Step 0B-prep = COMPLETE`, `Step 0B approval = PENDING`. Otherwise the matching failure status is reported per the recording rule and approval is NOT REQUESTED. In every outcome: Commit A NOT STARTED, `Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED`, Pass 3.8.3 NOT STARTED.
