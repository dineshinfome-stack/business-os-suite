---
document: SIP Archive
version: 1.0.0
owner: Program Delivery
lifecycle_state: Living
authority: Historical / Immutable
---

# SIP Archive

This directory holds the immutable historical record of completed Sprint Implementation Plans.

## Structure

```
archive/
├── <YYYY>/
│   ├── SIP-SPR-MOD-001-001.md
│   ├── SIP-SPR-MOD-001-002.md
│   └── …
```

Year folders are created on first archival for that year.

## Rules

1. **Immutable.** Archived SIPs are never edited. Corrections issue a new SIP referencing the archived one.
2. **Naming.** `SIP-<SPRINT_ID>.md` (matches the file name used under `active/`).
3. **Sprint Outcome required.** Every archived SIP has §12 populated.
4. **Metadata final.** `execution_status: Archived` and `archive_date` are set on the archived copy.

See `../SIP_LIFECYCLE.md` for the full archival procedure.
