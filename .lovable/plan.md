## Pass 6 — Decision Layer (ADR Repository)

Documentation-only. No code, config, packages, or route changes. Architecture (Passes 1–5) stays frozen; all future architectural evolution flows through ADRs.

### Handling the existing `docs/05-adr/` folder

The repo already contains `docs/05-adr/` with 12 stubs (`ADR-0000` template through `ADR-0011`) and a `docs/decision-register.md` stub. Approach:

- Create the new authoritative tree at `docs/11-adrs/`.
- Leave the old `docs/05-adr/` files in place; mark each with `status: superseded` in frontmatter and a one-line pointer to its replacement ADR ID in `docs/11-adrs/`. No deletions.
- Update `docs/decision-register.md` to a thin redirect to `docs/11-adrs/ADR_INDEX.md`.
- In `docs/_meta.json`, rename the existing "05 ADRs" group to "05 ADRs (Legacy — Superseded)" and add the new "11 Architecture Decision Records" group.

If you'd rather delete `docs/05-adr/` outright, say so before build mode.

### Deliverables

**A. Governance & template**

- `docs/11-adrs/README.md` — purpose, lifecycle, numbering, reading order, relationships to Canon / Architecture / ERP Core Engines / Module & Sprint PRDs, amendment process, references. Contains, in order:

  1. **ADR Categories table** (after Reading Order):

     | Category | Purpose |
     | --- | --- |
     | Architecture | Structural decisions |
     | Data | Data governance decisions |
     | Platform | API / platform decisions |
     | Security | Security decisions |
     | AI | AI governance |
     | Integration | Cross-system integration |
     | DevOps | Runtime & operations |
     | Engineering | Development practices |
     | UI | Design standards |

  2. **ADR Number Ranges** subsection:
     - `ADR-001–009` → Architecture
     - `ADR-010–019` → Data
     - `ADR-020–029` → Platform
     - `ADR-030–039` → Security
     - `ADR-040–049` → AI
     - `ADR-050–059` → Integration
     - `ADR-060–069` → DevOps
     - `ADR-070–079` → Engineering
     - `ADR-080–089` → UI
     - `ADR-090+` reserved for future categories.

     Rule: a new ADR MUST use the next unused number within its category's range. If a range fills, allocate the next unused block of 10 and record the extension here. IDs are permanent; ranges are structural guidance, not license to renumber.

  3. **ADR Review Cadence** subsection:

     > Accepted ADRs are not permanent by default. They SHOULD be reviewed when one or more of the following occurs: a new Foundation baseline is proposed; a major platform capability is introduced or retired; a technology limitation materially affects business goals; security, regulatory, or compliance requirements change; an Accepted ADR is proposed to be superseded. Each ADR SHOULD record its next review trigger or explicitly state that no scheduled review is required.

  4. **Observation for Pass 7+** (closing note):

     > Beginning with Pass 7 (Domain / Module PRDs), platform architecture is considered complete. Module PRDs MUST consume Canon, Architecture, ERP Core Engines, and Accepted ADRs. They MUST NOT redefine platform behavior, architectural patterns, or reusable engine capabilities. If a Module PRD requires a change to platform behavior, the change MUST first be proposed through a new or superseding ADR; only after that ADR is Accepted may the Module PRD reference the updated behavior. Dependency direction: Foundation → Architecture → ERP Core Engines → ADRs → Module PRDs → Sprint PRDs → Implementation.

- `docs/11-adrs/ADR_TEMPLATE.md` — mandatory template with every field: ADR ID, Title, Status, Date, Owner, Decision Type, Related Canon Chapters, Related Architecture Documents, **Affected Documents**, Related ERP Core Engines, Related Module PRDs, Context, Problem Statement, Decision, Alternatives Considered, Trade-offs, Consequences, Migration Strategy, Backward Compatibility, Risks, Rejected Options, Implementation Notes, Future Review Trigger, References.

  Frontmatter schema: `adr_id`, `status`, `owner`, `category`, `created`, `updated`, `related_docs`, `related_engines`, **`affected_documents: []`**, `supersedes`, `superseded_by`.

  **Affected Documents** section (placed immediately after "Related Architecture Documents") reads:

  > List the documentation expected to require updates if this ADR is Accepted (for example: Master Architecture, API Architecture, ERP Core README, specific Engine documents, Module PRDs, or Coding Standards). This is an impact-analysis aid only — it does not authorize changes; it simply records the expected documentation surface affected by the decision.

  The `Future Review Trigger` field is mandatory and MUST either name a trigger from the Review Cadence list or state "No scheduled review required".

**B. ADR Index (master index)**

- `docs/11-adrs/ADR_INDEX.md` — mirrors `ENGINE_CATALOG.md`. Single table with columns **ADR ID | Title | Category | Status | Related Engines | Supersedes | Superseded By**, ordered by ADR ID. Sections: Purpose, How to Read, Status legend (`Draft | Proposed | Accepted | Superseded | Deprecated | Rejected`), Derived-index rule (on any conflict the ADR file wins), Maintenance rule (adding/superseding/status change requires updating this index in the same change).

**C. Category folders** under `docs/11-adrs/`:

```text
architecture/  data/  platform/  security/
ai/            integration/  devops/  engineering/  ui/
```

Each folder gets a short `README.md` describing its scope and its reserved ID range.

**D. Initial ADR set** — each ADR listed below is authored from the template (not stubs): filled Context, Problem Statement, Decision, Alternatives, Trade-offs, Consequences at Pass 5-level detail. Cross-referenced to Canon, relevant Architecture docs, and ERP Core Engine IDs (`ENG-001…ENG-028`). **Every initial ADR populates `affected_documents` where applicable** (empty array only when no downstream docs are affected). All ADRs use numbers within their category's reserved range.

Status assignment:
- **Accepted** (frozen by Canon / Foundation Freeze v1): ADR-001 Modular Monolith, ADR-002 DDD, ADR-003 Event-Driven Communication, ADR-004 Plugin Extension Model, ADR-005 Clean Architecture, ADR-011 Multi-Tenant Isolation, ADR-014 Audit Strategy, ADR-032 RBAC + ABAC.
- **Proposed** (everything else): remains Proposed until implementation validates; each such ADR sets its Future Review Trigger.

Files:

- `architecture/` (001–009): ADR-001..006 (Modular Monolith, DDD, Event-Driven Communication, Plugin Extension Model, Clean Architecture, CQRS Usage Guidelines)
- `data/` (010–019): ADR-010..016 (Postgres SoR, Multi-Tenant Isolation, UUID, Money Representation, Audit, Soft Delete, Versioning)
- `platform/` (020–029): ADR-020..026 (API Style, API Versioning, Error Envelope, Pagination, Webhooks, Feature Flags, Configuration Hierarchy)
- `security/` (030–039): ADR-030..036 (AuthN, AuthZ, RBAC+ABAC, Secrets Mgmt, Encryption, Data Classification, Audit Integrity)
- `ai/` (040–049): ADR-040..045 (Provider Abstraction, Tool Calling, Human Approval, Prompt Governance, RAG, Cost Governance)
- `integration/` (050–059): ADR-050..055 (Event Bus, Outbox, Retry, Idempotency, Dead Letter, External Integration Philosophy)
- `devops/` (060–069): ADR-060..065 (Deployment Model, Environments, Release, Testing, Observability, DR)
- `engineering/` (070–079): ADR-070..075 (Coding Standards, Doc Standards, Module Boundaries, Dependency Rules, Tech Debt, Backward Compatibility)
- `ui/` (080–089): ADR-080..084 (Design Tokens, Accessibility, Localization, Offline UX, Navigation Standards)

**E. Numbering & lifecycle**

- Permanent IDs `ADR-001`..`ADR-999`. Never reused. Deprecated/rejected/superseded ADRs keep their ID with the appropriate status.
- New ADRs claim the next unused number **within their category range**.
- Statuses: `Draft | Proposed | Accepted | Superseded | Deprecated | Rejected`. Superseded ADRs link to their replacement via `superseded_by`.

**F. Portal registration**

- Add group **"11 Architecture Decision Records"** to `docs/_meta.json` with entries: README, ADR Index, ADR Template, and one sub-entry per category folder. Rename the existing "05 ADRs" group to "05 ADRs (Legacy — Superseded)". No route/UI/code changes.

### Non-goals

No code, config, schemas, endpoints, package changes, or edits to Pass 1–5 documents beyond adding ADR cross-references where already planned. No renumbering of existing engines. No new lifecycle states beyond the six listed.

### Acceptance criteria

- `docs/11-adrs/README.md` (ADR Categories table, ADR Number Ranges, ADR Review Cadence, Observation for Pass 7+), `ADR_TEMPLATE.md`, and `ADR_INDEX.md` exist and follow the mandatory schema.
- `ADR_TEMPLATE.md` frontmatter includes `affected_documents: []`; template body has an "Affected Documents" section immediately after "Related Architecture Documents".
- Nine category folders exist, each with a README that names its reserved ID range.
- Each initial ADR is authored from the template with a permanent ID inside its category range, correct status, owner, cross-references, a populated `affected_documents` value where applicable, and a Future Review Trigger value.
- `ADR_INDEX.md` contains one row per ADR authored, in ID order.
- Legacy `docs/05-adr/` files marked `superseded` with pointers; `docs/decision-register.md` redirects to `ADR_INDEX.md`.
- `docs/_meta.json` registers the new group and renames the legacy one; no other structural changes.
- No source, config, or schema files touched.
