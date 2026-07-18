## Pass 33.1.0 — Solution Design Identifier Alignment (Final, v4)

Repository-wide controlled renumbering aligning WEB/MOB/API spec IDs with parent Module IDs. Identifier-only migration — zero content, governance-semantic, or traceability changes. Historical audits and execution records preserved immutably. Formalized as the **first Repository Migration**, establishing a reusable, schema-versioned migration governance surface.

### Migration Map (reflects actual repository state)

| Module | Old IDs | New IDs |
| --- | --- | --- |
| MOD-017 Analytics | WEB-001 / MOB-001 / API-001 | WEB-017 / MOB-017 / API-017 |
| MOD-018 AI Workspace | WEB-002 / MOB-002 / API-002 | WEB-018 / MOB-018 / API-018 |
| MOD-001 Platform Admin | WEB-003 (WEB only) | WEB-001 |

MOB-003 and API-003 do not yet exist and are out of scope for this migration.

### Steps

1. **Preflight (read-only)**
   - Inventory `docs/60-solution-design/{web,mobile,api}/`.
   - Repository-wide grep for `WEB-00[123]`, `MOB-00[12]`, `API-00[12]`.
   - Classify hits: **mutable** (current-state artifacts) vs **immutable** (prior audits under `docs/50-audit-reports/`, prior `.lovable/plan.md` execution records).

2. **Two-phase rename (collision-safe)**
   - Phase A: rename current spec files and update mutable references → temporary tokens `WEB-T001/T002/T003`, `MOB-T001/T002`, `API-T001/T002`.
   - Phase B: temporary tokens → final canonical IDs per the migration map.

3. **Frontmatter update (renamed specs only)**
   Update `spec_id`, `related_web_spec`, `related_mobile_spec`, `related_api_spec`. No other fields touched.

4. **Mutable registration surfaces**
   - `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md` — rebuild registration table sorted by Module ID.
   - `docs/60-solution-design/{web,mobile,api}/README.md` — update current-specifications tables.
   - `docs/DOCUMENT_INDEX.md` — replace IDs and link paths.
   - `docs/_meta.json` — rename entries under `60 Solution Design → Web/Mobile/API`; JSON must remain valid.
   - In-body cross-references inside the renamed specs.

5. **Historical preservation (do NOT rewrite)**
   - Prior audit reports under `docs/50-audit-reports/`: byte-for-byte unchanged.
   - Existing `.lovable/plan.md` execution records: unchanged.
   - Reconciliation of any historical identifier is provided by the migration document + manifest (step 6).

6. **Repository Migration Governance Surface (new — first migration)**

   Author three artifacts under `docs/15-governance/`:

   **a. Human-readable migration document** — `SOLUTION_DESIGN_IDENTIFIER_MIGRATION_20260718.md`
   Standard frontmatter. Purpose, effective date, execution ID, canonical Old → New → Reason → Effective From mapping, scope statement (identifier substitution only), historical preservation clause (prior audits and execution records reference old IDs by design and MUST NOT be edited retroactively; this document + manifest are the sole reconciliation surface), links to manifest and registry.

   **b. Machine-readable manifest** — `MIGRATION_MANIFEST_20260718.json`
   Schema-versioned. Top-level `manifest_schema: "v1.0"` precedes all other fields so future migrations can evolve the structure (rollback metadata, dependency graphs, checksums, signatures) without breaking existing tooling. `verification` is a **post-execution report block**: emitted with `null` placeholders in the template, populated with observed values in Step 7 before commit.

   ```json
   {
     "manifest_schema": "v1.0",
     "repository_version": "BusinessOS Repository v1",
     "migration_id": "SD-ID-ALIGNMENT-20260718",
     "status": "completed",
     "effective_date": "2026-07-18",
     "scope": "Solution Design Identifier Alignment",
     "classification": {
       "migration_type": "Identifier Alignment",
       "repository_impact": "Medium",
       "breaking_change": false,
       "content_change": false,
       "business_change": false,
       "governance_change": false,
       "requires_manual_review": false
     },
     "rules": [
       { "module": "MOD-017", "family": "WEB", "old_spec": "WEB-001", "new_spec": "WEB-017" },
       { "module": "MOD-017", "family": "MOB", "old_spec": "MOB-001", "new_spec": "MOB-017" },
       { "module": "MOD-017", "family": "API", "old_spec": "API-001", "new_spec": "API-017" },
       { "module": "MOD-018", "family": "WEB", "old_spec": "WEB-002", "new_spec": "WEB-018" },
       { "module": "MOD-018", "family": "MOB", "old_spec": "MOB-002", "new_spec": "MOB-018" },
       { "module": "MOD-018", "family": "API", "old_spec": "API-002", "new_spec": "API-018" },
       { "module": "MOD-001", "family": "WEB", "old_spec": "WEB-003", "new_spec": "WEB-001" }
     ],
     "verification": {
       "renamed_files": null,
       "updated_documents": null,
       "historical_documents_preserved": null,
       "duplicate_spec_ids": null,
       "broken_links": null,
       "orphan_references": null,
       "json_validation": null,
       "_note": "Post-execution report block. Values populated in Step 7 from observed results; nulls indicate 'not yet measured'."
     }
   }
   ```

   **c. Migration registry** — `MIGRATION_REGISTRY.md`
   Repository-wide index. Standard frontmatter. Table columns: Migration ID | Date | Scope | Classification | Status | Manifest | Document. First row = this migration. Documents the schema-versioning convention: consumers dispatch on `manifest_schema`; unknown values require manual review. Positioned as the authoritative index for all future repository-wide migrations (module renumbering, engine renumbering, ADR renumbering, folder restructuring, governance refactors, repo splits/merges).

   Register all three files in `docs/15-governance/README.md`, `docs/DOCUMENT_INDEX.md`, `docs/_meta.json` (Governance group), and `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json`.

7. **Verification (produces manifest report block)**
   - Re-grep every old token. Remaining hits must all be inside `docs/50-audit-reports/` or pre-existing `.lovable/plan.md` records.
   - No duplicate `spec_id` anywhere.
   - All Markdown links to renamed files resolve.
   - `_meta.json` and `MIGRATION_MANIFEST_20260718.json` parse.
   - Manifest contains `manifest_schema` and `repository_version` at top level.
   - Migration document, manifest, and registry are cross-linked and discoverable from Governance README + DOCUMENT_INDEX.
   - **Populate manifest `verification` block with observed counts, replacing every `null`, before commit.**

8. **Audit report**
   `docs/50-audit-reports/REPOSITORY_AUDIT_<timestamp>.md` per the Verification Reporting Standard. Check / Result / Action rows cover: per-module identifier alignment, no duplicate IDs, no orphan references in mutable surfaces, no broken links, Frontmatter Validation Checklist PASS on renamed specs, catalog updated, three family READMEs updated, DOCUMENT_INDEX updated, `_meta.json` valid, migration document authored + registered, manifest authored + JSON-valid + `manifest_schema` present + `verification` block populated (no residual `null`) + registered, migration registry authored + registered, historical audits/execution records unchanged (directory listing + byte check), traceability preserved (spot-check three specs), diff proves only identifier fields + in-body cross-refs changed, no governance/implementation semantic changes. Status READY only if Failed = 0 and Outstanding Risks = 0.

9. **Execution record (append-only)**
   Append Pass 33.1.0 execution record to `.lovable/plan.md`. No prior entries edited.

### Files Affected

- **Renamed** (7): three Analytics specs, three AI Workspace specs, `WEB-003_PLATFORM_ADMINISTRATION.md → WEB-001_PLATFORM_ADMINISTRATION.md`.
- **Identifier-updated**: Solution Design Catalog, three family READMEs, DOCUMENT_INDEX, `_meta.json`, Governance README, `GOVERNANCE_FRAMEWORK_MANIFEST.json`, in-body cross-refs in renamed specs.
- **New (3)**: migration document, schema-versioned manifest JSON, migration registry.
- **New (2)**: audit report, appended execution record.
- **Untouched**: all prior audit reports, all prior `.lovable/plan.md` execution entries.

### Guardrails

Identifier substitution only, on mutable surfaces only. No business, architecture, ADR, engine, governance-semantic, or traceability changes. Historical audit and execution artifacts are immutable. Manifest `verification` block is a post-execution report — templates ship with `null`, execution populates observed values.

### Post-state

Handoff state: `READY_FOR_MOBILE`. Roadmap: Pass 34.0.1 authors new `MOB-001` (Platform Administration Mobile); Pass 35.0.1 authors new `API-001`; then `PLATFORM_ADMINISTRATION_PLATFORM_COMPLETE`. Convention going forward: `MOD-NNN → WEB-NNN / MOB-NNN / API-NNN`. Schema-versioned Migration Governance Surface (document + manifest + registry) becomes the reusable pattern for all future repository-wide migrations.
