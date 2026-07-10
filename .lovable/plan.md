# Pass 8.8.5-A — Register Repository Audit Gate + Retrofit onto SPR-MOD-005-005

## Objective

Promote the **Post-Implementation Repository Audit** into a repository-wide mandatory gate that runs after every implementation pass, and immediately execute it against Pass 8.8.5 (`SPR-MOD-005-005 — Inventory Valuation & Replenishment`).

The audit is **evidence-based, reproducible, versioned, and strict**: every PASS SHALL cite the repository location (file path + line range or uniquely identifiable section heading) together with the exact matching text. Absence of evidence is FAIL. Absence of file access is NOT READY / LOW. Unexpected modification of authoritative sources outside the declared Files Modified list is FAIL. Absence of a change-tracking mechanism caps Confidence at `MEDIUM` — and per the strict-governance stance below, a Pass cannot proceed on `MEDIUM`.

**Audit Specification Version: 1.0**

---

## Part A — Register the Standard

Update `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` — add a new subsection under the existing "Verification Reporting Standard":

**"Post-Implementation Repository Audit (Mandatory Final Gate) — v1.0"**

Contents:

1. **Trigger** — runs after every Stage-2 Sprint PRD pass, every Stage-3 Baseline pass, and any pass that mutates authoritative documents. The pass is not complete until the audit reports `Repository Status: READY` at `Confidence: HIGH`.

2. **Specification versioning.** Every audit record SHALL declare `Audit Specification Version: <MAJOR.MINOR>` (initial value `1.0`). Backward-incompatible changes to the Standard Check Set, Confidence rubric, or Gate rule require a MAJOR bump; additive refinements require a MINOR bump. Older audit records remain valid under the version they were written against; the current version applies to new passes.

3. **Governance stance (explicit — Option A, strict).**
   - `Repository Status: READY` means no evidence-based failures were found.
   - `Confidence: HIGH` additionally requires verified authoritative source integrity via a change-tracking mechanism.
   - The gate to proceed to the next pass requires **both** `READY` and `HIGH`. An environment without change tracking therefore cannot pass the gate, even if every document is otherwise perfect.

4. **Audit Rules**
   - Read every modified file directly; do not rely on the implementation summary, memory, or logs.
   - Every PASS SHALL cite the repository location (file path **plus line range or uniquely identifiable section heading**) together with the **exact matching text**.
   - Missing evidence ⇒ FAIL.
   - Never assume a document exists because it was reported as created.
   - **Access guard clause:** If any file in the Mandatory Read Set cannot be opened or read, the audit SHALL terminate immediately with `Repository Status: NOT READY` and `Confidence: LOW`, listing the inaccessible files. No PASS/FAIL is inferred for unread files.

5. **Audit Reproducibility (mandatory metadata).** Every audit record SHALL include, at minimum:
   - `Audit Specification Version` (e.g. `1.0`).
   - Audit timestamp (ISO-8601 UTC).
   - **Repository revision identifier** (commit SHA, version ID, or equivalent). SHALL be cited as evidence — the auditor SHALL quote the exact command and its verbatim output (e.g. `git rev-parse HEAD` → `<sha>`). Missing revision identifier caps Confidence at `MEDIUM`.
   - **Optional artifact hashes:** for each file in the declared Files Modified list, the auditor MAY additionally record a SHA-256 checksum (or equivalent) of the post-pass contents. Recommended for environments where only exported documents (not live repositories) will be reviewed; the hash SHALL be captured with the command used (e.g. `sha256sum <path>` → `<digest>  <path>`). Optional in Git-enabled environments; hashes provide integrity verification independent of version-control access.
   - Tool / version used for verification (auditor identity and tooling versions).
   - Change-tracking mechanism used, or explicit statement that none was available.
   - Mandatory read set actually opened, with line ranges consulted.
   - Declared Files Modified list and the actual observed change set.

6. **Mandatory Read Set** (per pass; expand as authoritative sources evolve):
   - The newly created / modified artifact(s)
   - Parent Module PRD
   - Parent Sprint Plan (Stage 2 passes)
   - `docs/SPRINT_CATALOG.md`, `docs/DOCUMENT_INDEX.md`, module sprint `README.md`, `docs/_meta.json`, `.lovable/plan.md`
   - `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`
   - `docs/11-adrs/ADR_INDEX.md`
   - `docs/MODULE_CATALOG.md`
   - `docs/02-architecture/event-catalog.md`
   - `docs/MODULE_IMPLEMENTATION_WORKFLOW.md`

7. **Evidence Table Schema** — five columns: `Check | PASS/FAIL | Severity | Repository Evidence | Required Fix`. PASS rows without file-path + line-range/heading + exact quote are invalid.

8. **Severity classification.** Every finding (row) SHALL be tagged with one severity level. Severity is orthogonal to PASS/FAIL: it classifies the *type of finding*, and for FAIL rows it drives remediation priority. PASS rows use `Informational` unless a caveat applies (e.g. reviewer interpretation was required — use `Minor`).
   - **Critical** — violates authoritative-source integrity, governance boundary, engine/ADR/event authority, or capability bidirectionality; blocks the gate unconditionally.
   - **Major** — violates repository consistency, metadata consistency, structural conformance (18 sections, frontmatter, `size` binding), or governance registration exactness; blocks the gate.
   - **Minor** — cosmetic drift, evidence quality reduced to reviewer interpretation, non-normative reordering; does not block the gate but downgrades Confidence to `MEDIUM`.
   - **Informational** — evidence citation for a passing check; no action required.

   Gate impact:
   - Any `Critical` or `Major` FAIL ⇒ `Repository Status: NOT READY`.
   - Any `Minor` FAIL ⇒ `READY` permitted only if remediated; otherwise Confidence capped at `MEDIUM`.
   - Only `Informational` findings ⇒ gate can be `READY / HIGH`.

9. **Standard Check Set** (superset; Stage-2 passes use all applicable rows; suggested default severity in parentheses — actual severity per finding is set by the auditor):
   - Sprint PRD file exists at declared path. *(Critical)*
   - Frontmatter matches specification (including `size` bound to Sprint Plan). *(Major)*
   - Exactly 18 sections; numbering matches template. *(Major)*
   - Sprint scope exactly matches Sprint Plan allocation. *(Critical)*
   - **Capability bidirectionality** — every Sprint capability originates from exactly one Module PRD capability; every allocated Module capability appears exactly once; no additional capability. *(Critical)*
   - **Engine set identity** — identical across Sprint PRD, Sprint Plan, `ENGINE_USAGE_MATRIX`, `ENGINE_CATALOG`; no missing, additional, reordered (where normative), deprecated, or undefined identifiers. *(Critical)*
   - ADR IDs match `ADR_INDEX` (Accepted only). *(Critical)*
   - Event names resolve verbatim in `event-catalog.md` OR are deferred as `R-EV-*`; no invented IDs. *(Critical)*
   - Governance wording preserves ownership boundaries; no prohibited ownership transfer. *(Critical)*
   - Dependencies resolve verbatim from `MODULE_CATALOG.md`. *(Major)*
   - Five governance registrations exist exactly once; no duplicates. *(Major)*
   - **Repository consistency** — cross-references resolve; no broken internal links; no duplicate Sprint IDs, Module IDs, or document identifiers. *(Major)*
   - **Metadata consistency** — agrees across frontmatter, module `README`, `SPRINT_CATALOG`, `DOCUMENT_INDEX`, `_meta.json`. *(Major)*
   - **Authoritative source integrity** — every modified file appears in declared list; no additional authoritative document changed; verified via `git diff` / `git status` **or equivalent repository change-tracking mechanism**. Immutable examples: `MODULE_PRD.md`, `ENGINE_CATALOG.md`, `ADR_INDEX.md`, `MODULE_CATALOG.md`, prior Sprint PRDs, `event-catalog.md`, `REPOSITORY_MAP.md`, `DOCUMENT_TRACEABILITY.md`, `DOCUMENT_OWNERSHIP_MATRIX.md`. If no change-tracking mechanism is available, treat as **unverified** and cap Confidence at `MEDIUM`. *(Critical)*
   - `.lovable/plan.md` updated with verification metadata + summary. *(Major)*

10. **Failure Policy** — on any FAIL: report exact section, quote evidence, tag severity, recommend minimum edit; do not auto-modify authoritative sources; re-run audit after correction.

11. **Final Report Format**

    ```text
    Repository Audit
    Audit Specification Version: 1.0
    Checks:
    Passed:
    Remediated:
    Failed:
      Critical:
      Major:
      Minor:
    Repository Status: READY | NOT READY
    Confidence:      HIGH  | MEDIUM    | LOW
    Revision:        <commit SHA / version ID>   (evidence: <command + quoted output>)
    Artifact Hashes: <optional SHA-256 lines, one per modified file>
    ```

    Invariants:
    - `Passed + Remediated + Failed = Checks`
    - `Failed = Critical + Major + Minor` (Informational never contributes to Failed)
    - `Repository Status = READY ⇔ Failed(Critical) = 0 ∧ Failed(Major) = 0`
    - **Confidence rubric:**
      - `HIGH` — every PASS supported by repository evidence, authoritative source integrity verified, revision identifier cited, no unresolved `Minor` findings.
      - `MEDIUM` — evidence exists but reviewer interpretation was required, OR integrity/revision unverifiable, OR unresolved `Minor` findings.
      - `LOW` — assumptions / unread files / access guard fired.
    - **Gate rule (strict):** proceed ⇔ `Repository Status = READY` ∧ `Confidence = HIGH`.

12. **Relationship to existing 10-item / 13-item verification** — the audit is a **superset gate**. Existing checklists remain the internal verification step; the audit is the external evidence-based confirmation.

Also add a one-line pointer in `docs/SPRINT_AUTHORING_GUIDE.md` referencing the new subsection.

---

## Part B — Retrofit Audit onto Pass 8.8.5

Execute the audit (v1.0) against `SPR-MOD-005-005-inventory-valuation-replenishment.md`.

Procedure:
1. Open every file in the Mandatory Read Set. If any is inaccessible, invoke the access guard clause and stop.
2. Capture reproducibility metadata: `Audit Specification Version: 1.0`, audit timestamp (UTC), **repository revision identifier cited as evidence** (command + quoted output), auditor identity, change-tracking mechanism, mandatory read set with line ranges, declared Files Modified list, actual change set. Optionally record SHA-256 hashes of each modified file (`sha256sum <path>` → digest).
3. Enumerate the actual change set and compare to the declared list (SPR-MOD-005-005 PRD, `SPRINT_CATALOG.md`, `inventory/README.md`, `DOCUMENT_INDEX.md`, `_meta.json`, `.lovable/plan.md`). Any extra/missing entry ⇒ `Critical` FAIL on Authoritative Source Integrity.
4. For each Standard Check Set row, record `Check | PASS/FAIL | Severity | Repository Evidence | Required Fix`.
5. Append to `.lovable/plan.md` a new section **"Pass 8.8.5-A — Repository Audit (Spec v1.0)"** containing:
   - Reproducibility metadata block (incl. cited revision identifier evidence; optional artifact hashes).
   - Evidence table (five columns).
   - Final Report block in the mandated format (Failed broken down by severity).
6. If any `Critical` or `Major` FAIL: list minimum edits and stop before declaring READY. Only `.lovable/plan.md` is modified by the audit itself. Remediation requires user approval in a follow-up pass.

---

## Part C — Forward Application

From Pass 8.8.6 onward, every pass template SHALL end with the Repository Audit block (Spec v1.0). Existing completed passes are not retroactively audited.

---

## Files Modified

1. `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` — add "Post-Implementation Repository Audit v1.0" subsection.
2. `docs/SPRINT_AUTHORING_GUIDE.md` — add pointer.
3. `.lovable/plan.md` — append Pass 8.8.5-A audit record.

No other authoritative documents are touched.

---

## Outcome

The Repository Audit gate is now versioned (`Spec v1.0`), supports optional artifact hashes for offline / export-only reviews, and classifies findings by severity (`Critical / Major / Minor / Informational`) — enabling prioritized remediation while preserving the strict PASS/FAIL model. Pass 8.8.5 receives its first repository audit under Spec v1.0; the repository proceeds to Pass 8.8.6 only if the audit reports `READY / HIGH` with cited revision identifier and no unresolved `Critical` or `Major` findings.
