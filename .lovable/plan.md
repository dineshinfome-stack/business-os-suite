# Plan v24.1 — Step 0B-prep Path-Gate Correction (effective baseline `64f2a34d…`), with four binding amendments

Documentation-only. Exactly two writable paths; no migration, runtime, code, or §9 change. §9 stays PENDING and untouched; approval-controlled fields stay `null`.

## Writable paths (exactly two)

1. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md`
2. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json`

All other paths read-only.

## Scope of re-execution (Amendment 4)

The ACL query and forensic migration identity extraction are not repeated.

The historical eight-query extraction is rerun only against the already pinned immutable
governance blobs for the strict matched-text fidelity correction. It does not reopen the
historical baseline, count, classification or forensic identity decisions.

## Stage 0 — Pre-mutation recertification (Amendment 1)

Immediately before any write, under `set -euo pipefail` with
`EFFECTIVE_BASELINE=64f2a34dab813c1abe59c4846c4c17a6c506e3e2`:

- `git merge-base --is-ancestor "$EFFECTIVE_BASELINE" HEAD` → baseline is an ancestor of HEAD.
- `git status --porcelain=v1` → empty.
- `git log --format=%H --reverse "$EFFECTIVE_BASELINE"..HEAD -- <two governance paths>` → first entry `698ca914acf0a7c4bca8b0af32f1093bc6f3af0a`.
- `git diff --name-status --find-renames --find-copies "$EFFECTIVE_BASELINE"..HEAD` → exactly the two governance `M` entries, no R/C/A/D.
- `.lovable/plan.md` net change zero; digest `00b23fcf2725822570305a78889999e0b7942ed2228a14b3e1f77b6d7f8c43b1`.

Any deviation → record `EFFECTIVE_BASELINE_DRIFT`, 0 repository changes, Step 0B approval
NOT REQUESTED, report externally only, halt.

## Stage 1 — Effective-baseline correction

In both governance files:

- Set the effective correction baseline to `64f2a34dab813c1abe59c4846c4c17a6c506e3e2`.
- Retain `ebb14bf25fe75f3afb247520aa3a70a6afe86db9` only as `superseded_preparation_baseline`.
- Record the four structured baseline proofs: (a) `64f2a34d` immediately precedes the first
  governance mutation `698ca914`; (b) neither governance file changed at `64f2a34d`
  (`src/routeTree.gen.ts` only); (c) `.lovable/plan.md` at that commit hashes `00b23fcf…`,
  identical to the final state; (d) the union from that commit is exactly the two governance files.
- Remove `platform_generated_paths_excluded` from the manifest.
- Remove the corresponding "Platform-generated path excluded" row from the document.

## Stage 2 — Strict historical-text fidelity (verbatim matched text)

- Re-extract the two pinned immutable blobs: `67c07fdb…` (document) and `824c7815…` (manifest)
  at `77656a1462918c636c94c6c7389570cccc62693e`.
- Rerun the eight fixed-string, case-insensitive queries; reproduce exactly 18 matches
  (document 12 / manifest 6).
- Retain all text after the `path:line:` separator verbatim, including leading indentation.
- Set `matched_text_normalization` to `"none"`; path `./`-stripping, fixed key order, dedup by
  `path:line:query`, `LC_ALL=C` sort (path → numeric line → query), UTF-8 and trailing newline are unchanged.
- Regenerate the four-field canonical JSONL and recompute `canonical_output_sha256`.
- Record `2fde824bba0ef0c3267ef73a2e5c059c07c22dee52c66460f017f1bec80172ef` as superseded, with the
  reason: it was computed under the withdrawn trimming rule.

## Stage 3 — Document update and counters

- Update all 18 Markdown ledger rows.
- Encode every `matched_text` cell as a JSON string literal (all 18 rows follow the one rule, including
  rows with no leading whitespace), e.g. `"      \"history_table\": \"supabase_migrations.schema_migrations\","`,
  then apply Markdown escaping (`\`→`\\`, `|`→`\|`) on top (Amendment 3).
- The manifest continues to store the real decoded string in `matched_text`.
- `query`, `path`, `line_at_historical_search_baseline`, `classification`, `reason`, `action` unchanged.
- Add `"quoted_context_hits": 0` to the machine-readable counters (Amendment 2).

## Stage 4 — Candidate and final-byte validation (run twice; final bytes are authority)

1. Duplicate-key-aware manifest parse.
2. `len(hits) == 18`.
3. Six explicit numeric counters, validated from the actual fields (not the preformatted string):
   `total_hits = allow_list_context_valid_hits + active_governing_surface_hits + superseded_documentation_hits + immutable_historical_hits + quoted_context_hits + false_positive_hits` → `18 = 18+0+0+0+0+0`.
4. Canonical JSONL reconstruction from the final manifest's 18 hit objects.
5. Canonical digest equality with the recorded `canonical_output_sha256` (the whole manifest file is never hashed for this comparison).
6. Seven-field document–manifest parity, bidirectional, after: parse Markdown cell → undo Markdown escaping → JSON-decode the string literal → compare with manifest `matched_text`.
7. Exact two-path union from `64f2a34d` across committed, staged, unstaged and untracked; no R/C/A/D.
8. Binary gate across all three surfaces — `git diff --numstat 64f2a34d..HEAD`, `git diff --numstat`, `git diff --cached --numstat`; any `-\t-\t<path>` row fails.
9. `.lovable/plan.md` digest unchanged (`00b23fcf…`).
10. Immutability: 12 comparisons (blob SHA + SHA-256 over the subject migration and the five Step 0D runtime files); runtime and migration drift 0.

## Terminal result object (success path only)

```json
{
  "status": "COMPLETE",
  "measurement_mode": "HISTORICAL_RECONSTRUCTION",
  "effective_correction_start_commit": "64f2a34dab813c1abe59c4846c4c17a6c506e3e2",
  "superseded_preparation_baseline": "ebb14bf25fe75f3afb247520aa3a70a6afe86db9",
  "changed_path_union": 2,
  "path_gate_result": "PASS",
  "historical_hits_recorded": 18,
  "quoted_context_hits": 0,
  "matched_text_normalization": "none",
  "canonical_output_sha256": "<recomputed 64-char digest>",
  "superseded_canonical_output_sha256": "2fde824bba0ef0c3267ef73a2e5c059c07c22dee52c66460f017f1bec80172ef",
  "document_manifest_parity": "PASS",
  "immutability_comparisons": "12/12",
  "step_0b_authority_approval": "PENDING",
  "commit_a": "NOT STARTED",
  "pass_3_8_3": "NOT STARTED"
}
```

## Failure rules

Pre-mutation failures (`EFFECTIVE_BASELINE_DRIFT`, `PREPARATION_BASELINE_DIRTY`, `COUNT_DRIFT`)
produce zero repository changes, are reported externally only, and explicitly invalidate the
manifest's existing `COMPLETE` claim for approval purposes. Post-mutation failure records
`VALIDATION_FAILURE` with no stale `COMPLETE` left in the file; corrections stay within the two
allow-listed files and all gates rerun.

## Expected end state (conditional on all gates passing)

```text
Path gate ................... PASS
Historical ledger ........... 18/18 PASS
Canonical fidelity .......... PASS
Document–manifest parity .... PASS
Immutability ................ 12/12 PASS
Step 0B-prep ................ COMPLETE
Step 0B authority approval .. PENDING
§9 disposition .............. PENDING
Commit A .................... NOT STARTED
Pass 3.8.2 .................. COMPLETE, REMEDIATION REQUIRED
Pass 3.8.3 .................. NOT STARTED
```

Execution halts here for the Architecture Office §9 decision; Pass 3.8.3 does not start.
