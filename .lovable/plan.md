# Pass 34.0.1 — SD-009: MOB-001 Platform Administration (v5)

Two clearly separated deliverables: (A) Governance evolution — a dedicated Screen Identifier Standard as a new repository-wide governance artifact; (B) Solution Design execution — author `MOB-001_PLATFORM_ADMINISTRATION.md` using that standard. Completes the Mobile leg of MOD-001 under canonical identifiers established in Pass 33.1.0.

## Authoritative Inputs (read-only)

- `docs/45-module-publications/platform/MOD-001_MODULE_PUBLICATION.md` — scope authority
- `docs/60-solution-design/web/WEB-001_PLATFORM_ADMINISTRATION.md` — web parity reference
- `docs/60-solution-design/mobile/MOB-018_AI_WORKSPACE.md`, `MOB-017_ANALYTICS.md` — mobile authoring precedents
- `docs/15-governance/GOVERNANCE_FRONTMATTER_STANDARD.md`, `GOVERNANCE_TEMPLATE_REGISTRY.md`, `GOVERNANCE_FRAMEWORK_MANIFEST.json`, `README.md`

No requirements introduced beyond MOD-001 publication.

---

## Deliverable A — Governance: Screen Identifier Standard

Create a **dedicated** governance artifact — do NOT extend the Frontmatter Standard. Screen IDs are internal content identifiers, not frontmatter metadata; keeping them separate preserves clean separation of concerns and leaves room for future identifier standards (UI components, workflows, reports, dashboards, notifications).

### New file

`docs/15-governance/SCREEN_IDENTIFIER_STANDARD.md` (v1.0) with standard governance frontmatter and sections:

1. Purpose & Scope — applies to all Mobile Solution Design specifications (`SD-001_MOB_SPEC`) from Pass 34.0.1 forward; may be extended in future to Web/API specs by separate governance pass.
2. Identifier Syntax — `MOD<NNN>-SCR-<NNN>`, three-digit zero-padded, module-scoped. Example: `MOD001-SCR-001`.
3. Numbering Rules — sequential per module starting at 001; no gaps introduced by re-numbering.
4. Immutability — once assigned, a Screen ID MUST NOT be re-numbered. Deprecated screens retain their ID and are marked deprecated in the Screen Hierarchy.
5. Grandfathering — existing MOB-017 and MOB-018 specifications are not renumbered; a future governance pass may adopt the convention retroactively (out of scope here).
6. Lifecycle — Active | Deprecated | Removed (with retained ID reservation).
7. Validation Rules — uniqueness within a spec; well-formedness (regex `^MOD\d{3}-SCR-\d{3}$`); every Screen ID referenced elsewhere in the spec MUST be defined in the Screen Hierarchy (bidirectional consistency).
8. Examples.
9. References — Frontmatter Standard, Template Registry, this convention's registry entry.

### Governance registration (references only, no embedding)

- `docs/15-governance/README.md` — add a "Screen Identifier Standard" entry to the folder layout and cross-reference list.
- `docs/15-governance/GOVERNANCE_TEMPLATE_REGISTRY.md` — under `SD-001_MOB_SPEC`, add a "References" note pointing to `SCREEN_IDENTIFIER_STANDARD.md`.
- `docs/15-governance/GOVERNANCE_FRAMEWORK_MANIFEST.json` — register the new standard document (JSON must remain valid).
- `docs/DOCUMENT_INDEX.md` and `docs/_meta.json` — register under Governance group.

---

## Deliverable B — Specification: MOB-001

Create `docs/60-solution-design/mobile/MOB-001_PLATFORM_ADMINISTRATION.md`.

### Frontmatter

- `spec_id: MOB-001`
- `template: SD-001_MOB_SPEC`
- `template_version: v1.0`
- `module_id: MOD-001`
- `related_web_spec: WEB-001`
- `related_api_spec: API-001` (forward reference — Pass 35.0.1)

### Content sections

1. Mobile Architecture (native shell, offline-first cache, secure storage)
2. Personas — Platform Admin, Tenant Admin, Company Admin, Auditor, Security Officer
3. Navigation Model (tab + drawer covering Tenancy, Org Structure, Users/Roles, Configuration, Localization, Audit Review)
4. **Screen Hierarchy & Inventory** — canonical inventory. Every screen carries a stable ID `MOD001-SCR-NNN` per the Screen Identifier Standard. Every Screen ID reference elsewhere in this document MUST resolve here.
5. User Journeys (invite user, grant/revoke role, approve config change, review audit event, activate locale pack, close financial year) — cite Screen IDs.
6. Mobile UX Patterns
7. Offline Behaviour & Synchronization
8. Authentication & Session Handling (SSO handoff, biometric unlock)
9. Push Notification Integration (via ENG-025)
10. Platform Capabilities & Device Permissions
11. Error Handling
12. Performance Expectations
13. Accessibility (ADR-081)
14. Security (ADR-011, ADR-014, ADR-032)
15. Mobile API Interaction (references API-001 forward)
16. **Traceability Matrix** — standardized 5-column repository standard:

    | MOD Capability | Screen ID(s) | Engine(s) | ADR(s) | Notes |

    One row per MOD-001 capability. Every `Screen ID(s)` entry MUST reference a screen defined in section 4.
17. Web/Mobile Parity Notes (deltas vs WEB-001)
18. References — includes `SCREEN_IDENTIFIER_STANDARD.md`

### Registration surfaces

- `docs/60-solution-design/SOLUTION_DESIGN_CATALOG.md` — add MOB-001 row
- `docs/60-solution-design/mobile/README.md` — add MOB-001
- `docs/DOCUMENT_INDEX.md` — add MOB-001 row
- `docs/_meta.json` — add MOB-001 under 60 Solution Design → Mobile (JSON valid)

---

## Validation

- Frontmatter conforms to `GOVERNANCE_FRONTMATTER_STANDARD.md`; `spec_id = MOB-001` unique.
- Cross-refs to WEB-001, MOD-001, forward API-001 resolve.
- Screen Identifier Standard authored, registered on all four governance surfaces, JSON manifest valid.
- **Screen IDs:** every screen in section 4 has a unique, well-formed `MOD001-SCR-NNN` id (regex check); no duplicates.
- **Traceability completeness:** every MOD-001 capability appears in the matrix.
- **Bidirectional consistency:** every Screen ID referenced in the Traceability Matrix and in User Journeys is defined in section 4; no phantom references.
- Web/Mobile alignment preserved vs WEB-001; no scope beyond published module.

## Audit

`docs/50-audit-reports/SD_MOB001_PLATFORM_ADMINISTRATION_AUDIT_20260718T170000Z.md` per Verification Reporting Standard. Checks include:

```text
Check                                           | Result
------------------------------------------------|-------
Screen Identifier Standard authored             | PASS
Screen Identifier Standard registered (4 surfs) | PASS
Frontmatter validation (MOB-001)                | PASS
Template compliance (SD-001_MOB_SPEC v1.0)      | PASS
Screen IDs unique & well-formed (regex)         | PASS
Module traceability (MOD-001 capabilities)      | PASS
Traceability matrix 5-column standard           | PASS
Traceability ↔ Screen Hierarchy consistency     | PASS
Cross-reference validation                      | PASS
Registration surfaces updated                   | PASS
_meta.json + GOVERNANCE_FRAMEWORK_MANIFEST valid| PASS
Mobile/Web alignment (WEB-001)                  | PASS
No orphan references                            | PASS
Grandfathering respected (MOB-017/018 untouched)| PASS
```

Status READY only if Failed = 0 and Outstanding Risks = 0.

## Execution Record

Append Pass 34.0.1 entry to `.lovable/plan.md`:

- execution_status: COMPLETE
- phase: Solution Design + Governance evolution
- new_governance_artifact: `SCREEN_IDENTIFIER_STANDARD.md` v1.0
- specification: MOB-001_PLATFORM_ADMINISTRATION (template SD-001_MOB_SPEC v1.0)
- module: MOD-001
- repository_state_before: SOLUTION_DESIGN_IDENTIFIERS_ALIGNED
- repository_state_after: READY_FOR_API

## Guardrails

Governance evolution is limited to introducing the Screen Identifier Standard (identifier format + lifecycle + validation only). Zero business, architecture, or module-scope changes. Frontmatter Standard is not modified. Existing MOB-017 / MOB-018 specs are grandfathered and untouched. Documentation-only; no app code changes.

## Success Criteria

Dedicated Screen Identifier Standard registered as a repository-wide governance artifact; MOB-001 authored using stable `MOD001-SCR-NNN` IDs with a 5-column standardized Traceability Matrix and enforced bidirectional consistency against the Screen Hierarchy; all four registration surfaces updated for both the standard and the spec; audit passes (Failed=0, Risks=0); execution record appended; repository advances to `READY_FOR_API`.
