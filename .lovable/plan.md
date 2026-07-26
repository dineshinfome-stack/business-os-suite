## Objective

Fix the remaining evidence defect: the manifest declares `total_hits: 18` / `hits_inside_allow_list: 18` while `hits: []` is empty and its terminal object already says `COMPLETE`; the exception document has only the aggregate classification table. Populate a reproducible, decodable seven-field ledger in both files, add the hidden-surface control and missing counter, then rerun only the required revalidation gates. No migration changes, no §9 completion, no new files.

## Scope

Writable (exactly two):

- `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md`
- `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json`

`.lovable/plan.md` must remain byte-identical from the baseline onward.

## Steps

1. **Clean-baseline gate.** Capture `correction_start_commit` only after any platform plan synchronization has finished; `git status --porcelain=v1` must be empty. That 40-character SHA is also `search_baseline_commit`. Record the `.lovable/plan.md` digest at that point.

2. **Historical eight-query reproduction.** Re-run the eight recorded queries with the exact recorded command form (`rg -n --fixed-strings -i "<query>" --glob '!node_modules' --glob '!.git' .`) under `set -euo pipefail`, raw output to `/tmp`. This reproduces the historical 18-match set unchanged.

3. **Hidden active-surface control.** Run the same eight queries with `rg --hidden -n --fixed-strings -i "$query" --glob '!.git/**' --glob '!node_modules/**' .lovable/plan.md`. Classify contextually: current-plan reference → `CURRENT_PLAN_CONTEXT_VALID` (retained, no correction); obsolete identity or executable-gate assumption → `SCOPE_EXPANSION_REQUIRED` (no mutation, approval NOT REQUESTED). Assert only zero **unresolved obsolete assumptions**, never zero matches. These records live outside the historical arithmetic.

4. **Canonical evidence.** Build canonical JSON Lines — one compact UTF-8 object per match, fixed key order `{"query","path","line_at_search_baseline","matched_text"}`, paths with leading `./` stripped, matched text preserved exactly after the second `:`, deduplicated by `path:line:query`, sorted `LC_ALL=C` by path, numeric line, then query, final newline required. `canonical_output_sha256` is the SHA-256 over those exact bytes, and the ledger is generated from that same file. `raw_output_sha256` is retained as the digest of the unmodified combined rg output. Record a `canonicalization` object (record_format, path_normalization, sort_order, deduplication_key, encoding).

5. **Document encoding rule.** Markdown ledger cells escape `\` → `\\` and `|` → `\|`. The parity validator compares **decoded** values, never the escaped Markdown source.

6. **Pre-mutation failure handling — external-only.** `PREPARATION_BASELINE_DIRTY`, `SEARCH_EVIDENCE_FAILURE`, `COUNT_DRIFT` (canonical count != 18), or `SCOPE_EXPANSION_REQUIRED` produce no repository change. The external report must state explicitly: the existing `step_0b_prep_result.status = COMPLETE` is invalid for approval purposes because the search-evidence correction did not complete; Step 0B approval = NOT REQUESTED; the Architecture Office must not rely on the repository `COMPLETE` value.

7. **Manifest ledger.** Under `preflight.obsolete_version_gate_search`, replace `hits: []` with 18 seven-field objects (`query`, `path`, `line_at_search_baseline`, `matched_text`, `classification`, `reason`, `action`), plus `hits_recorded: 18`, `allow_list_context_valid_hits: 18`, `quoted_context_hits: 0`, `deduplication_key`, `search_baseline_commit`, `raw_output_sha256`, `canonical_output_sha256`, `canonicalization`. Add `hidden_active_surface_review` as a **sibling** of `obsolete_version_gate_search` under `preflight`, with `path`, `executed`, `matches` (same seven-field schema), `unresolved_obsolete_assumptions`, `result`. All §9-controlled fields stay `null`.

8. **Document ledger.** After the existing §3 count table, insert the seven-column table with the same 18 decoded rows, preceded by:

```text
All ledger line numbers refer to search_baseline_commit and are not expected
to match line numbers after this ledger is inserted.
```

Then mirror the hidden-surface review's match count, classifications, unresolved count and result. Existing summary table and `Unresolved active assumptions: 0` retained.

9. **Final result object (success path only).** `status: "COMPLETE"`, `search_hits_recorded: 18`, `search_ledger_validation: "PASS"`, `search_baseline_commit`, `canonical_output_sha256`, `corrected_at_utc`.

10. **Two-pass revalidation (candidate, then written bytes — the written-byte pass is final authority):**
    - duplicate-key-aware JSON parse;
    - classification formula `18 = 18 + 0 + 0 + 0 + 0 + 0` (allow_list_context_valid, active_governing_surface, superseded_documentation, immutable_historical, quoted_context, false_positive), plus `len(hits) == hits_recorded == total_hits == hits_inside_allow_list == 18`, `unresolved_active_hits == 0`; hidden-surface records excluded;
    - bidirectional seven-field decoded-value parity between document and manifest;
    - changed-path union of `git diff --name-status --find-renames --find-copies <correction_start_commit>..HEAD`, unstaged, staged, and `git ls-files --others --exclude-standard` — exactly the two `M` governance entries, `.lovable/plan.md` changes 0 (byte-identical), no R/C/A/D, `git diff --numstat` no binary changes. A clean tree with platform auto-commits is acceptable;
    - 12 immutability comparisons (blob SHA + SHA-256 over the subject migration and the five Step 0D runtime files), drift 0.

11. **Stale-COMPLETE prevention.** `status` may remain `COMPLETE` only if the written-byte pass succeeds. On failure: `VALIDATION_FAILURE`, approval NOT REQUESTED, no stale `COMPLETE` left in the file; corrections limited to the two allow-listed files, then JSON, parity, path, binary and immutability checks rerun.

12. **Not repeated:** forensic commit/blob extraction and the database ACL query (1 row, read-only `on`, four privileges false, `security_blocker: false`).

13. **Report and halt** with the terminal state block, then wait for the Architecture Office §9 decision. The approval SHA is captured only in a later turn.

## Technical notes

- JSON rewritten via a duplicate-key-detecting parse/serialize round-trip preserving key order and formatting.
- All shell evidence uses `set -euo pipefail` with temp files so no failure is masked by a downstream pipe stage.
