# Pass 8.3.4-R — Normalize Risk Register Format (R-EV-01 and siblings)

Documentation-only micro-pass. Introduces a reusable, repository-standard Risk Register format across the four authored Accounting Sprint PRDs so that later baselines (`MOD002_ACCOUNTING_BASELINE_v1`) can consume risks uniformly. No architecture documents modified; no new governance conventions ratified in this pass.

## 1. Scope

Rewrite the **Risks and Assumptions** section (§14) of each authored Accounting Sprint PRD so every risk uses the following fixed shape:

- **Risk ID** — stable identifier (e.g. `R-EV-01`, `R-01`).
- **Description** — the risk in one sentence.
- **Impact** — what breaks or is delayed if the risk materializes.
- **Mitigation** — concrete mitigation or containment action.
- **Status** — one of `Open`, `Mitigated`, `Accepted`, `Deferred` (see §3 for the working status vocabulary).

Preserve every current risk statement verbatim in its Description field; do not delete or invent risks. Assumption clauses embedded inside current risk paragraphs are lifted into the appropriate slot (typically Description or Mitigation) without changing meaning.

R-EV-01 in SPR-MOD-002-004 becomes the canonical example:

- **Risk ID:** R-EV-01
- **Description:** Reporting event definitions are not yet present in the authoritative Event Catalog.
- **Impact:** Financial reporting events cannot be formally referenced or published until Event Catalog governance is updated.
- **Mitigation:** Execute a dedicated Event Catalog governance pass before implementation or baseline freeze; until then, affected report families function without event emission.
- **Status:** Deferred

## 2. Files Rewritten (§14 only)

- `docs/30-sprint-prds/accounting/SPR-MOD-002-001-accounting-foundation.md`
- `docs/30-sprint-prds/accounting/SPR-MOD-002-002-voucher-framework.md`
- `docs/30-sprint-prds/accounting/SPR-MOD-002-003-journal-ledger-posting.md`
- `docs/30-sprint-prds/accounting/SPR-MOD-002-004-financial-statements.md`

All other sections in these files remain unchanged. Structural parity across the 18-section shape is preserved — only §14 rows change form, not location or count.

## 3. Working Status Vocabulary (used by this pass; not yet ratified as a repository standard)

The four rewrites use the following working status vocabulary. Meanings are consumed here only; **no** Sprint Authoring Guide, ADR, or other architecture document is modified in this pass.

| Status | Meaning |
| --- | --- |
| `Open` | Active risk requiring attention. |
| `Mitigated` | Mitigation implemented; residual risk remains. |
| `Accepted` | Risk consciously accepted; no further action planned. |
| `Deferred` | Postponed to a later governance or implementation pass. |
| `Closed` *(optional)* | No longer applicable. |

**Standardization deferred.** Ratifying this vocabulary as a repository-wide standard (via an update to `docs/SPRINT_AUTHORING_GUIDE.md` and/or a dedicated documentation governance ADR) is **out of scope for this pass** and is queued as a future governance pass, ideally executed alongside additional module freezes so the standard is written once and applied uniformly across all modules. Recorded in `.lovable/plan.md` as a follow-up so it does not get lost.

## 4. Not Changed

- No governance conventions added or modified in Sprint PRDs.
- No new risks introduced; no existing risks removed.
- No changes to `SPRINT_CATALOG.md`, `DOCUMENT_INDEX.md`, `_meta.json`, or accounting `README.md` (registrations already correct).
- No changes to Module PRDs, Sprint Plan, baselines, engines, ADRs, architecture docs, event catalog, `SPRINT_AUTHORING_GUIDE.md`, APIs, database, schema, UI, or code.
- No changes to acceptance criteria, DoD, or Exit Criteria.

## 5. Execution Record

Append a short Pass 8.3.4-R record to `.lovable/plan.md` noting:

- The four §14 rewrites and risk-content preservation.
- The working status vocabulary applied by this pass.
- A follow-up entry to ratify the status vocabulary as a repository standard in a future governance pass (Sprint Authoring Guide update).

## 6. Verification

- Every §14 row in the four files uses the five-field shape.
- Every original risk statement remains present (by content, in Description).
- Every Status value is drawn from the working vocabulary in §3.
- No file outside the four Accounting Sprint PRDs changes.
- Diff for each file is confined to §14.

## 7. Outcome

The four authored Accounting Sprint PRDs share a uniform Risk Register format with an explicit working status vocabulary, unblocking clean baseline consumption. Repository-wide ratification of the status vocabulary is queued as a future governance pass. Next step after this micro-pass is **Pass 8.3.5 — SPR-MOD-002-005 (Taxation & Compliance Foundation)** when you share the prompt.
