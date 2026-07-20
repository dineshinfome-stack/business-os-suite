## Objective
Add a centralized "Implementation Readiness Review" sidebar group to `docs/_meta.json`, listing existing IRR documents in numeric order. Navigation-only change; no repository restructuring or document edits.

## Availability Matrix
Based on the current repository inventory, the following IRR documents exist and are eligible for inclusion. Any IRR document not present on disk at execution time SHALL NOT be added to the sidebar.

- `50-audit-reports/MOD002_IMPLEMENTATION_READINESS_20260719T100000Z` → **IRR-002 — Accounting**
- `50-audit-reports/MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z` → **IRR-003 — Sales**

IRR-001 and IRR-004..IRR-019 are not present on disk → excluded (no placeholders, no dead links).

Companion verification reports (`*_VERIFICATION_*`) and Wave-1 readiness dashboards are not IRRs and are not included.

## Change
Edit only `docs/_meta.json`. Insert the **Implementation Readiness Review** group immediately after the Modules section and before the next top-level navigation group:

```
{
  "label": "Implementation Readiness Review",
  "items": [
    { "title": "IRR-002 — Accounting", "path": "50-audit-reports/MOD002_IMPLEMENTATION_READINESS_20260719T100000Z" },
    { "title": "IRR-003 — Sales",      "path": "50-audit-reports/MOD003_IMPLEMENTATION_READINESS_REVIEW_20260719T220000Z" }
  ]
}
```

Consistent with Repository Navigation Standard v2.0 (IRR is a centralized phase gate, not a module artifact).

## Validation
- Every listed path resolves to an existing `.md` file.
- Entries are ordered numerically by IRR ID.
- No changes to module groups, Delivery groups, or any other section.
- Every IRR entry appears only once in the sidebar.
- Every IRR entry is located under the "Implementation Readiness Review" group and not duplicated elsewhere.
- Each IRR title matches the corresponding module (for example, `IRR-002 — Accounting` points to the Accounting implementation readiness review document).

## Non-Goals
No file renames, moves, content edits, or changes to modules, Delivery, governance, Sprint Plans, or WEB/MOB/API/CPC/VR navigation.
