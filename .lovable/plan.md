# Plan v23.1 — Step 0B-prep Search-Evidence Correction (Historical Reconstruction)

Disposition: **HISTORICAL RECONSTRUCTION**, incorporating the three binding corrections. The historical count of 18 is preserved; the current-state result is supplemental and excluded from historical arithmetic.

## Confirmed pre-flight facts (read-only)

- Working tree clean; HEAD `e850022b6374cb65d30f5c219e85796faa8703f8` (supersedes `0b92b8fa…`).
- Historical commit `77656a1462918c636c94c6c7389570cccc62693e` resolves; blobs verified as `67c07fdb8cda5393c1b00dfcaf34d78f98a604d1` (document) and `824c7815113e72f5cf1614b9bc37c7581461eac9` (manifest).
- Eight-query reproduction against those immutable bytes: doc 12 + manifest 6 = **18**, distribution identical to the approved table.

## Writable paths (exactly two)

1. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md`
2. `docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json`

All other paths read-only. No migration, runtime, code, or §9 change. §9 stays PENDING; approval-controlled fields stay `null`.

## Phase 1 — New governed baseline

1. After plan synchronization completes, require `git status --porcelain=v1` empty; otherwise `PREPARATION_BASELINE_DIRTY`, external-only report, halt.
2. Capture `correction_start_commit` = new HEAD (40 chars).
3. Capture `.lovable/plan.md` SHA-256; must remain byte-identical through final validation.

## Phase 2 — Historical ledger (immutable source)

1. `git show 77656a14…:<path>` for both files; assert blob SHAs equal the two pinned values.
2. Run the eight fixed-string, case-insensitive queries against those bytes; assert per-query/per-file distribution equals the approved table and total = 18. Any deviation → `COUNT_DRIFT`, external-only, halt.
3. Build 18 seven-field records: `query`, `path`, `line_at_historical_search_baseline`, `matched_text`, `classification`, `reason`, `action`.
4. Build canonical JSON Lines from the **four evidence fields** in fixed key order `{"query","path","line_at_historical_search_baseline","matched_text"}`, `./` stripped, dedup by `path:line:query`, `LC_ALL=C` sort by path → numeric line → query, UTF-8, trailing newline. `canonical_output_sha256` = SHA-256 over exactly those bytes.

## Phase 3 — Current-state review (observed gate, supplemental)

Rerun the same eight queries against the working tree at the **new** baseline and record observations. Expected reference: canonical 57 / path-line 47 / document 33 / manifest 24 / outside-allow-list 0.

- Match → `classification: SELF_REFERENTIAL_GOVERNANCE_CONTEXT_VALID`, `unresolved_obsolete_assumptions: 0`, `result: PASS`.
- Mismatch → `CURRENT_STATE_COUNT_DRIFT`, 0 repository changes, Step 0B approval NOT REQUESTED, report expected vs observed externally, halt.

Hidden-surface review of `.lovable/plan.md` (`rg --hidden`) recorded separately; assert zero unresolved obsolete assumptions, never zero matches.

## Phase 4 — Write the two documents

Manifest `preflight` gains three sibling objects:

- `obsolete_version_gate_search` — `measurement_mode: "HISTORICAL_RECONSTRUCTION"`, `historical_search_baseline_commit`, `historical_source_blobs`, `hits` (18 seven-field objects), `hits_recorded/total_hits/hits_inside_allow_list/allow_list_context_valid_hits: 18`, `unresolved_active_hits: 0`, `canonicalization`, `raw_output_sha256`, `canonical_output_sha256`.
- `current_state_search_review` — observed counts, classification, result.
- `hidden_active_surface_review` — path, executed, matches, unresolved count, result.

Document gains the 18-row markdown ledger (cells escape `\`→`\\`, `|`→`\|`), a note that line numbers refer to the historical baseline, and the two-paragraph statement that the current 57-record result neither contradicts nor supersedes the historical measurement, plus a mirrored current-state and hidden-surface summary.

## Phase 5 — Two-pass validation (candidate, then final bytes = authority)

- Duplicate-key-aware JSON parse.
- Historical arithmetic uses only `obsolete_version_gate_search`: `len(hits) == 18` and classification formula `18 = 18 + 0 + 0 + 0 + 0 + 0`; the 57-record review, hidden-plan matches and current self-referential text are excluded.
- **Digest recomputation:** re-read the final manifest, extract its 18 hit objects, reconstruct the four-field canonical JSONL under the documented key order/sort/normalization/encoding/newline rules, recompute SHA-256 over those bytes, and require equality with the recorded `canonical_output_sha256`. The complete manifest file is never hashed for this comparison. Reported as: ledger objects 18 / reconstructed records 18 / recorded digest / recomputed digest / PASS.
- **Parity:** after decoding Markdown escaping, each document row equals the corresponding manifest hit object field-by-field across all seven fields (`query`, `path`, `line_at_historical_search_baseline`, `matched_text`, `classification`, `reason`, `action`), bidirectionally. Semantic equality with the four canonical evidence fields; no byte-identity claim against the JSONL.
- **Path gate:** union of `git diff --name-status --find-renames --find-copies <correction_start_commit>..HEAD`, staged, unstaged and untracked = exactly the two `M` governance entries; no R/C/A/D; `git diff --numstat` shows no binary changes; `.lovable/plan.md` unchanged and digest identical to Phase 1.
- **Immutability:** 12 comparisons (blob SHA + SHA-256 over the subject migration and five Step 0D runtime files), drift 0.

## Terminal result object (success path only)

```json
{
  "status": "COMPLETE",
  "measurement_mode": "HISTORICAL_RECONSTRUCTION",
  "historical_search_baseline_commit": "77656a1462918c636c94c6c7389570cccc62693e",
  "historical_hits_recorded": 18,
  "historical_ledger_validation": "PASS",
  "current_state_search_review": "PASS",
  "hidden_active_surface_review": "PASS",
  "document_manifest_parity": "PASS",
  "canonical_output_sha256": "<64-char digest>",
  "corrected_at_utc": "<UTC timestamp>",
  "step_0b_authority_approval": "PENDING",
  "commit_a": "NOT STARTED",
  "pass_3_8_3": "NOT STARTED"
}
```

## Failure rules

Pre-mutation failures (`PREPARATION_BASELINE_DIRTY`, `SEARCH_EVIDENCE_FAILURE`, `COUNT_DRIFT`, `CURRENT_STATE_COUNT_DRIFT`, `SCOPE_EXPANSION_REQUIRED`) produce zero repository changes, are reported externally only, and explicitly invalidate the manifest's existing `COMPLETE` claim for approval purposes. Post-mutation failure records `VALIDATION_FAILURE` with no stale `COMPLETE` left in the file; corrections stay within the two allow-listed files and all gates rerun.

## Expected end state (conditional on all gates passing)

```text
Step 0B-prep ................ COMPLETE
Step 0B authority approval .. PENDING
§9 disposition .............. PENDING
Commit A .................... NOT STARTED
Pass 3.8.2 .................. COMPLETE, REMEDIATION REQUIRED
Pass 3.8.3 .................. NOT STARTED
```
