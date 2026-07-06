## Pass 8.2.1 — Correction

Verification confirmed a duplicate entry in `docs/DOCUMENT_INDEX.md`. `SPR-MOD-001-001 — Tenancy Foundation` appears twice:

- Line 78 — inside the **M** block (following `MOD-001 … Sprint Plan`), which is out of alphabetical order.
- Line 249 — inside the **S** block, which is the correct location.

The index groups entries alphabetically by first letter (one row per document). The line-78 row is a misplaced duplicate.

### Change

- Remove line 78 from `docs/DOCUMENT_INDEX.md` (the duplicate SPR row inside the M block). Keep the entry in the S block (line 249) as the single canonical row.
- Leave the `MOD-001 … Sprint Plan (Stage 1)` row at line 77 unchanged (that document correctly belongs in the M block).

### Not changed

- No other files touched.
- No changes to the Sprint PRD, catalog, traceability, meta, or plan.
- No code, schema, or route changes.

### Verification after edit

- `grep -n "SPR-MOD-001-001" docs/DOCUMENT_INDEX.md` returns exactly one line (in the S block).