## Foundation Freeze v1 + Pass 5 — ERP Core Engines (Revised v3)

Two-part scope: (1) freeze the architectural baseline with a formal milestone document; (2) author the ERP Core Engines catalogue as a categorized, dependency-aware, versioned set of vendor-neutral platform capability specs. Documentation only — no routing, UI, package, or code changes.

---

### Part 1 — Foundation Freeze v1

Create `docs/FOUNDATION_FREEZE_v1.md` (informational, 2–3 pages, no `depends_on`).

Contents:
- Baseline identifier `Foundation v1.0` · freeze date · rationale
- Completed passes: 1 (Doc Infra), 2 (Canon), 3 (Business Blueprint), 4A–4D (Architecture)
- Versioned inventory of Canon, Business Blueprint, and Architecture documents
- Governance statement: architectural changes → ADR; business changes → Business Blueprint amendment; engineering practices → Coding Standards
- Readiness statement: cleared to begin Pass 5
- Cross-reference map to Canon, Architecture Index, Domain Map, Decision Register

Register under **Overview** in `docs/_meta.json`.

---

### Part 2 — Pass 5: ERP Core Engines

#### Folder layout

```text
docs/10-erp-core/
  README.md
  foundation/
    identity-engine.md                (new)
    authorization-engine.md           (new)
    permission-management-engine.md   (renamed from permission-engine.md)
    audit-engine.md
    configuration-engine.md           (new)
    localization-engine.md
  document/
    document-engine.md
    attachment-engine.md
    file-storage-engine.md            (new)
  workflow/
    workflow-engine.md
    approval-engine.md
    rules-engine.md
    automation-engine.md
    scheduler-engine.md
  financial/
    voucher-engine.md
    posting-engine.md
    numbering-engine.md
    currency-engine.md
    tax-engine.md
  intelligence/
    search-engine.md
    reporting-engine.md
    dashboard-engine.md
  integration/
    integration-engine.md             (new)
    event-engine.md                   (new)
    notification-engine.md
  data-exchange/
    import-engine.md
    export-engine.md
  ai/
    ai-copilot-engine.md              (new)
```

Total: **1 README + 27 engine documents.** New: 7. Renamed: 1. Moved into subfolders: 20 existing stubs.

#### `docs/10-erp-core/README.md`

Navigational index (informational, no `depends_on`). Sections:

- ERP Core Overview
- Reading Order
- Engine Categories (foundation · document · workflow · financial · intelligence · integration · data-exchange · ai)
- **Dependency Graph** — visual ASCII diagram
- **Dependency Rules** — explicit rules:
  - Foundation engines must not depend on any other category.
  - Financial engines may depend on Foundation and Workflow.
  - Workflow engines may depend on Foundation only.
  - Intelligence engines may consume Foundation, Financial, Document; must not own business logic.
  - Integration engines communicate across boundaries; must not own business logic.
  - AI engines may consume any engine but must not bypass Authorization, Audit, or Workflow.
  - Data Exchange engines depend on Foundation and Document only.
- **Engine Dependency Matrix** — markdown table immediately after the Dependency Graph. Rows = Consumer engines, Columns = Provider engines. Cells use `✓` (allowed), `▲` (event-only, no direct invocation), `—` (no dependency). Must remain synchronized with Dependency Rules. Purpose: validate layering, prevent cycles, support ADR reviews, aid AI retrieval.
- **Engine Versioning Policy** — ERP Core Engines are versioned independently of business modules. Breaking changes require an approved ADR, migration strategy, and backward-compatibility guidance where applicable. Every engine document exposes Version, Status, Stability, and Change History. Business modules reference engine versions rather than assuming latest behavior.
- Engine Ownership
- Engine Lifecycle (draft → stable → deprecated)
- How Modules Consume Engines
- How ADRs Affect Engines

#### Standard structure per engine

Overview · Responsibilities · **Capability Interface (conceptual)** · Data Model (conceptual) · Events Produced · Events Consumed · Configuration · **Capability Rules** *(renamed from "Business Rules" — clarifies these are reusable platform behaviors, not module business logic)* · Extension Points · **Dependencies (Provides To / Consumes From)** · Non-Functionals · Failure Modes · **Change History** · **Conforms to Canon** · **Decisions Pending** · References.

#### Frontmatter (extended)

Every engine document adds:

```yaml
engine_category: foundation | document | workflow | financial | intelligence | integration | data-exchange | ai
engine_type: reusable-platform-capability
stability: core
version: 1.0.0
status: draft | stable | deprecated
```

These fields drive filtering, navigation, dependency visualization, versioning discipline, and AI retrieval.

#### Normative rules

- Vendor-neutral (no framework / SDK / library / cloud names)
- Platform capability only — no module business logic
- Cites the architecture layer(s) it depends on
- Every doc ends with Conforms to Canon + Decisions Pending
- Identity (who), Authorization (what can you do now), Permission Management (who assigns what) are three distinct engines
- Section title inside engine docs is **Capability Rules**, never "Business Rules"

#### `docs/_meta.json` updates

- Add Foundation Freeze under Overview.
- Replace flat "10 ERP Core Engines" group with subcategory groups in order:
  Foundation → Document → Workflow → Financial → Intelligence → Integration → Data Exchange → AI.
- `README.md` appears first under Foundation (or as a dedicated "ERP Core — Index" heading).
- Update paths for the 20 moved stubs and the renamed permission-management engine.

#### File operations summary

- Create: `FOUNDATION_FREEZE_v1.md`, `10-erp-core/README.md`, 7 new engine docs
- Move: 20 existing engine stubs into subfolders
- Rename: `permission-engine.md` → `foundation/permission-management-engine.md`
- Author (fill body of): all 27 engines with the standard structure and extended frontmatter
- Update: `docs/_meta.json`

---

### Non-goals

- No module/domain business logic
- No ADR decisions inside engine docs (only Decisions Pending)
- No source code, schemas, or API implementations
- No vendor, framework, or cloud selection
- No changes to Pass 1–4D documents (architecture remains frozen)

---

### Acceptance Criteria

- `docs/FOUNDATION_FREEZE_v1.md` created and registered under Overview.
- `docs/10-erp-core/README.md` includes: Overview, Reading Order, Engine Categories, Dependency Graph, **Dependency Rules**, **Engine Dependency Matrix** (with ✓ / ▲ / — legend), **Engine Versioning Policy**, Ownership, Lifecycle, Consumption, ADR impact.
- 27 engine docs present under correct subfolders with the full standard structure.
- Every engine contains "Capability Interface (conceptual)", "Capability Rules" (not "Business Rules"), "Dependencies (Provides To / Consumes From)", "Change History", "Conforms to Canon", and "Decisions Pending".
- Every engine frontmatter includes `engine_category`, `engine_type`, `stability`, `version`, and `status`.
- Identity, Authorization, and Permission Management coexist as three distinct engines.
- Engine Dependency Matrix is consistent with Dependency Rules.
- `docs/_meta.json` reflects new subcategory grouping and Foundation Freeze entry.
- No changes outside `docs/`, `docs/10-erp-core/`, and `docs/_meta.json`.
- Architecture layer (Pass 4A–4D) untouched.