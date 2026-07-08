## Pass 8.4.1-V+ / 8.4.2 / 8.4.2-V — Repository-Wide Verification Reporting Standard, then Author & Verify SPR-MOD-003-002

Three sequenced passes, documentation-only. No architecture, engine, ADR, Event Catalog, Module PRD, or baseline documents are modified.

---

### Part A — Pass 8.4.1-V+ · Adopt a repository-wide verification reporting standard

**Goal.** Make a **Verification Metadata header + Check / Result / Action table + Verification Summary** the mandatory closing artifacts for **every repository verification pass** (not only Sprint PRD verification), and retrofit all three onto the existing 8.4.1-V record.

1. **Register the standing rule.** Add a "Verification Reporting Standard" subsection to `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` (after the Sprint Lifecycle Clarification) stating:
   - **Scope — repository-wide.** The standard applies to *every* repository verification pass, including but not limited to:
     - Sprint PRD verification (`Pass N-V`)
     - Module Baseline verification
     - Architecture verification
     - ADR verification
     - Governance / repository-wide audit passes
     - Any future pass whose primary purpose is verification against an authoritative source
   - Every such pass MUST close with **three** artifacts, in this order:

     **(a) Verification Metadata header** — fixed shape for auditability:
     ```
     Verification Metadata
     Target Artifact: <file path or artifact ID>
     Verification Pass: <pass id, e.g. 8.4.2-V>
     Verification Date: <YYYY-MM-DD>
     Verifier: <role or agent, e.g. "Lovable agent">
     Authoritative Sources Checked:
       - <path 1>
       - <path 2>
       - …
     ```

     **(b) Check / Result / Action table** — one row per checklist item. Columns fixed: **Check** · **Result** (Pass / Fail / Remediated) · **Action** (edit summary or "no action").

     **(c) Verification Summary block** — fixed, implementation-agnostic shape (works for any checklist length):
     ```
     Verification Summary
     Checklist Items: <n>
     Passed: <n>
     Remediated: <n>
     Failed: <n>
     Outstanding Risks: <R-IDs or "none">
     Repository Status: PASS | BLOCKED
     Next Pass: <pass id or "n/a">
     ```
     Invariants: `Passed + Remediated + Failed = Checklist Items`. `Repository Status: PASS` requires `Failed = 0`; any `Failed ≥ 1` is `BLOCKED` and `Next Pass = n/a` until remediation clears the failure via a full re-check.

   - All three artifacts are written into `.lovable/plan.md` under the pass's Execution Record **and** mirrored in the pass's final chat reply.
   - The checklist length is pass-specific; the reporting shape is universal.

2. **Scope note.** *No governance files other than `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` are modified by Part A.*

3. **Retrofit 8.4.1-V.** Append to the existing Pass 8.4.1-V Execution Record in `.lovable/plan.md`:

   **Verification Metadata**
   ```
   Target Artifact: docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md
   Verification Pass: 8.4.1-V
   Verification Date: 2026-07-07
   Verifier: Lovable agent
   Authoritative Sources Checked:
     - docs/10-erp-core/ENGINE_CATALOG.md
     - docs/ENGINE_USAGE_MATRIX.md
     - docs/11-adrs/ADR_INDEX.md
     - docs/02-architecture/event-catalog.md
     - docs/20-module-prds/sales/MODULE_PRD.md
     - docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md
     - docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md
     - docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md
   ```

   **Check / Result / Action Table**

   | Check | Result | Action |
   | --- | --- | --- |
   | 1. Frontmatter populated correctly | Pass | No action. |
   | 2. Exact 18-section numbering | Pass | No action. |
   | 3. Engine IDs resolved from ENGINE_CATALOG | Pass | No action. |
   | 4. Accepted ADRs only | Remediated | Removed `ADR-012` (Proposed) and `ADR-051` (Proposed) from frontmatter and §9; rewrote R-04 / R-05 accordingly. |
   | 5. Events mapped to Event Catalog or deferred | Pass | All 6 events covered by `R-EV-01`. |
   | 6. Normalized 5-field Risk Register | Pass | No action. |
   | 7. Sprint → Module traceability | Pass | No action. |
   | 8. Both baselines in §7 | Pass | No action. |
   | 9. Module → Sprint bidirectional traceability | Remediated | Added `ENG-018` to Sprint PRD §8; added `ENG-024` to Sprint Plan §SPR-MOD-003-001. |

   **Verification Summary**
   ```
   Checklist Items: 9
   Passed: 7
   Remediated: 2
   Failed: 0
   Outstanding Risks: R-EV-01
   Repository Status: PASS
   Next Pass: 8.4.2
   ```

4. **Not changed by Part A.** SPR-MOD-003-001, MOD-003 Sprint Plan, Module PRD, Engine Catalog, ADRs, Event Catalog, Module Baselines, `_meta.json`, `DOCUMENT_INDEX.md`, `SPRINT_CATALOG.md`, module READMEs.

---

### Part B — Pass 8.4.2 · Author SPR-MOD-003-002 (Quotations & Sales Orders)

**Goal.** Author the second Sales Sprint PRD covering the commercial document lifecycle (quotations and sales orders — creation, pricing, approval, amendment, customer commitment). Stage 2 of the Module Implementation Workflow.

1. **Create Sprint PRD.**
   - **File:** `docs/30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md`.
   - Follow `docs/99-templates/sprint-prd-template.md`.
   - **Maintain the identical 18-section order** used by SPR-MOD-002-001/002/003 and SPR-MOD-003-001.
   - Frontmatter fixed values: `sprint_id: SPR-MOD-003-002`, `parent_module: MOD-003`, `iteration: Sprint 2`, `stage: 2`, `pass: 8.4.2`, `size: Large`, `status: Draft`, `owner: Sales`, **`updated: 2026-07-07`**, `document_type: Sprint PRD`, tags `sprint, prd, sales, quotations, sales-orders, mod-003`.
   - `related_engines` and `related_adrs` resolved verbatim from `docs/10-erp-core/ENGINE_CATALOG.md`, `docs/ENGINE_USAGE_MATRIX.md`, `docs/11-adrs/ADR_INDEX.md`. Scope strictly Sprint 2 per Sprint Plan; ADRs Accepted-only (currently `ADR-011, ADR-014, ADR-032`).

2. **Content mapping into the fixed 18-section order.**
   - **§1 Objective & Scope:** Commercial document lifecycle for quotations and sales orders under the Sales Foundation from `SPR-MOD-003-001`. Excludes delivery/fulfilment, invoicing, returns, accounting posting, taxation, analytics, receivables, payment collection. Governance conventions reiterate — do not redefine — Sales ownership from `SPR-MOD-003-001`, closing with: *"These conventions complement — and do not redefine — the Platform governance conventions and the Accounting ownership conventions established in MOD002_ACCOUNTING_BASELINE_v1, or the Sales Foundation ownership established in SPR-MOD-003-001."*
   - **§2 Sprint Deliverables:** Quotation lifecycle (draft, issue, revise, expire, convert); sales order lifecycle (capture, approve, amend, confirm, cancel); pricing/discount evaluation; credit-limit breach approval routing (`ENG-011`); order approval workflows (`ENG-010`/`ENG-011`); numbering (`ENG-017`); attachments (`ENG-008`); notifications (`ENG-025`); events (§11). Out-of-scope forward-references to SPR-MOD-003-003…006.
   - **§3 Traceability:** Every capability traces to sections of `docs/20-module-prds/sales/MODULE_PRD.md` (§2, §4, §6, §7, §8). No orphan requirements.
   - **§4 User Stories:** Sales Executive, Sales Manager, Order Desk, Accountant (secondary), Customer (external actor).
   - **§5 Acceptance Criteria:** Given/When/Then for each lifecycle; pricing/discount resolution; credit-limit routing; numbering; events published via `ENG-024`; tenant isolation (`ADR-011`); audit (`ENG-004`).
   - **§6 Parent Module Reference:** `MOD-003`, link `MODULE_PRD.md`, cite fulfilled sections.
   - **§7 Dependencies:** Upstream — `MOD001_PLATFORM_BASELINE_v1`, `MOD002_ACCOUNTING_BASELINE_v1`, `SPR-MOD-003-001`. Downstream — SPR-MOD-003-003…006, plus downstream consumers of order data.
   - **§8 ERP Core Engine Consumption:** Bulleted `ENG-NNN — name — usage` list resolved verbatim from ENGINE_CATALOG; matches Sprint Plan Sprint 2 allocation exactly.
   - **§9 ADR Consumption:** Accepted-only ADRs (`ADR-011`, `ADR-014`, `ADR-032`). Event envelope governed by Event Catalog + `ENG-024`; formal eventing ADR deferred (`R-EV-01`).
   - **§10 Data Model Impact:** Conceptual entities — Quotation, Quotation Line, Sales Order, Sales Order Line, Discount Scheme ref, Price List ref, Order Approval — physical schema out of scope. Ownership: Item master from Inventory; Customer from Sales Foundation; Tax/Accounting deferred.
   - **§11 Events:** Reference only names present in `docs/02-architecture/event-catalog.md`; illustrative list includes `QuotationIssued`, `SalesOrderConfirmed` (Module PRD §8), plus lifecycle events (`quotation.issued`, `quotation.revised`, `salesorder.created`, `salesorder.confirmed`, `salesorder.amended`, `salesorder.cancelled`). Missing names deferred as `R-EV-*` risks. Event Catalog NOT modified.
   - **§§12–13 DoD & Sprint Exit Criteria:** Structurally identical to prior Sprint PRDs. Exit Criteria copied verbatim from `MOD-003_SPRINT_PLAN.md §SPR-MOD-003-002`.
   - **§14 Risks & Assumptions:** Normalized 5-field Risk Register. Upstream deps (MOD001, MOD002, SPR-MOD-003-001), event-catalog gaps (`R-EV-*`), pricing-rule complexity, credit-limit boundary with Accounting.
   - **§§15–18:** Structurally identical to prior Sprint PRDs.

3. **Governance registrations (each updated exactly once).**
   - `docs/SPRINT_CATALOG.md` — add Draft row for `SPR-MOD-003-002`.
   - `docs/30-sprint-prds/sales/README.md` — link the new PRD; update Sprint 2 row status.
   - `docs/DOCUMENT_INDEX.md` — one entry.
   - `docs/_meta.json` — one sidebar registration.
   - `.lovable/plan.md` — record Pass 8.4.2.

4. **Stage separation — no Sprint Plan edits.** `MOD-003_SPRINT_PLAN.md` MUST NOT be modified during Part B. If bidirectional verification (Part C, item 9) identifies allocation drift, it is recorded as a verification finding and remediated in a **separate, explicit documentation refinement pass** — not silently during authoring. Part B's only permissible edits are: the new Sprint PRD, and the four governance registrations listed in step 3.

5. **Not changed by Part B.** Sales Module PRD, MOD-003 Sprint Plan, ERP Core Engines, ADRs, Event Catalog, architecture docs, Module Baselines, APIs, database, schema, UI, implementation code, retrofitted 8.4.1-V record.

---

### Part C — Pass 8.4.2-V · Immediate verification of SPR-MOD-003-002

Run the same 9-item verification checklist from Pass 8.4.1-V against `SPR-MOD-003-002-quotations-sales-orders.md`, cross-checking each authoritative source independently.

- **Remediation policy.** Apply the minimum edit needed to the **Sprint PRD only**. After any remediating edit, rerun the FULL 9-item checklist to catch secondary regressions. Iterate until every item is Pass in a single clean run (`Failed = 0`).
- **Sprint Plan drift.** If item 9 identifies drift against `MOD-003_SPRINT_PLAN.md`, record it as a finding in the Part C report (do NOT edit the Sprint Plan during this pass); a separate refinement pass reconciles Stage 1 artifacts.
- **Closing artifacts (mandatory, per Part A's repository-wide standard).** Write all three — **Verification Metadata header**, **Check / Result / Action table**, and **Verification Summary** — into `.lovable/plan.md` under Pass 8.4.2-V, and mirror them in the final chat reply. Metadata `Target Artifact` = the new Sprint PRD path; `Verification Pass` = `8.4.2-V`; `Authoritative Sources Checked` mirrors the 8.4.1-V list.

Pass 8.4.3 (SPR-MOD-003-003 Delivery & Fulfillment) is unblocked only after Part C completes with `Repository Status: PASS` (i.e. `Failed = 0`).

---

### Outcome

- A repository-wide Verification Reporting Standard — Verification Metadata + Check/Result/Action table + implementation-agnostic Verification Summary — is registered in `MODULE_IMPLEMENTATION_WORKFLOW.md`, reusable for Sprint PRD, Module Baseline, Architecture, ADR, and governance audit passes across every module (Sales, Purchase, Inventory, CRM, Projects, Payroll, POS, …). The 8.4.1-V record is retrofitted with all three artifacts for auditability.
- `SPR-MOD-003-002-quotations-sales-orders.md` is authored (with fixed `updated: 2026-07-07`) and verified without silent Sprint Plan edits.
- MOD-003 is verified through Sprint 2 and prepared for **Pass 8.4.3 — SPR-MOD-003-003 (Delivery & Fulfillment)**.

---

## Pass 8.4.1-V+ — Retrofit repository-wide Verification Reporting Standard onto 8.4.1-V

Registered the repository-wide **Verification Reporting Standard** in `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` (Stage 2 area, before "Stage Boundaries"). The standard applies to every repository verification pass — Sprint PRD verification, Module Baseline verification, Architecture verification, ADR verification, and governance/audit passes — and mandates three closing artifacts in fixed order: **(a) Verification Metadata header**, **(b) Check / Result / Action table**, **(c) Verification Summary block** (implementation-agnostic: Checklist Items / Passed / Remediated / Failed / Outstanding Risks / Repository Status / Next Pass, with invariants `Passed + Remediated + Failed = Checklist Items` and `PASS ⇒ Failed = 0`).

No files other than `docs/MODULE_IMPLEMENTATION_WORKFLOW.md` were modified by Part A.

### Retrofit — 8.4.1-V closing artifacts

**Verification Metadata**

```
Target Artifact: docs/30-sprint-prds/sales/SPR-MOD-003-001-sales-foundation.md
Verification Pass: 8.4.1-V
Verification Date: 2026-07-07
Verifier: Lovable agent
Authoritative Sources Checked:
  - docs/10-erp-core/ENGINE_CATALOG.md
  - docs/ENGINE_USAGE_MATRIX.md
  - docs/11-adrs/ADR_INDEX.md
  - docs/02-architecture/event-catalog.md
  - docs/20-module-prds/sales/MODULE_PRD.md
  - docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md
  - docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md
  - docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md
```

**Check / Result / Action Table**

| Check | Result | Action |
| --- | --- | --- |
| 1. Frontmatter populated correctly | Pass | No action. |
| 2. Exact 18-section numbering | Pass | No action. |
| 3. Engine IDs resolved from ENGINE_CATALOG | Pass | No action. |
| 4. Accepted ADRs only | Remediated | Removed `ADR-012` (Proposed) and `ADR-051` (Proposed) from frontmatter and §9; rewrote R-04 / R-05 accordingly. |
| 5. Events mapped to Event Catalog or deferred | Pass | All 6 events covered by `R-EV-01`. |
| 6. Normalized 5-field Risk Register | Pass | No action. |
| 7. Sprint → Module traceability | Pass | No action. |
| 8. Both baselines in §7 | Pass | No action. |
| 9. Module → Sprint bidirectional traceability | Remediated | Added `ENG-018` to Sprint PRD §8; added `ENG-024` to Sprint Plan §SPR-MOD-003-001. |

**Verification Summary**

```
Checklist Items: 9
Passed: 7
Remediated: 2
Failed: 0
Outstanding Risks: R-EV-01
Repository Status: PASS
Next Pass: 8.4.2
```

---

## Pass 8.4.2 — Author SPR-MOD-003-002 (Quotations & Sales Orders)

Authored the second Sales Sprint PRD covering the commercial document lifecycle (quotations and sales orders — creation, pricing, approval, credit-limit routing, amendment, confirmation, cancellation).

**Files created / updated:**

- Created `docs/30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md` (18-section order, `updated: 2026-07-07`, `size: Large`, `status: Draft`, engines `[ENG-002, ENG-004, ENG-005, ENG-007, ENG-008, ENG-010, ENG-011, ENG-012, ENG-017, ENG-018, ENG-024, ENG-025]`, ADRs `[ADR-011, ADR-014, ADR-032]`).
- Registered in `docs/SPRINT_CATALOG.md` as a Draft row.
- Registered in `docs/30-sprint-prds/sales/README.md` (Sprint 2 row → Draft + link).
- Registered in `docs/DOCUMENT_INDEX.md`.
- Registered in `docs/_meta.json` sidebar.

**Stage separation upheld.** `MOD-003_SPRINT_PLAN.md` was **not modified** during Part B. No Module PRD, Engine Catalog, ADR, Event Catalog, or Baseline document was touched.

---

## Pass 8.4.2-V — Verify SPR-MOD-003-002

Ran the same 9-item verification checklist from Pass 8.4.1-V against `SPR-MOD-003-002-quotations-sales-orders.md`, cross-checking each authoritative source independently.

**Verification Metadata**

```
Target Artifact: docs/30-sprint-prds/sales/SPR-MOD-003-002-quotations-sales-orders.md
Verification Pass: 8.4.2-V
Verification Date: 2026-07-07
Verifier: Lovable agent
Authoritative Sources Checked:
  - docs/10-erp-core/ENGINE_CATALOG.md
  - docs/ENGINE_USAGE_MATRIX.md
  - docs/11-adrs/ADR_INDEX.md
  - docs/02-architecture/event-catalog.md
  - docs/20-module-prds/sales/MODULE_PRD.md
  - docs/30-sprint-prds/sales/MOD-003_SPRINT_PLAN.md
  - docs/40-module-baselines/MOD001_PLATFORM_BASELINE_v1.md
  - docs/40-module-baselines/MOD002_ACCOUNTING_BASELINE_v1.md
```

**Check / Result / Action Table**

| Check | Result | Action |
| --- | --- | --- |
| 1. Frontmatter populated correctly | Pass | `sprint_id`, `parent_module`, `iteration`, `stage`, `pass`, `size`, `status`, `owner`, `updated`, `document_type`, `tags`, `related_engines`, `related_adrs` all present and consistent. |
| 2. Exact 18-section numbering | Pass | §1 Objective & Scope · §2 Deliverables · §3 Traceability · §4 User Stories · §5 Acceptance · §6 Parent Module · §7 Dependencies · §8 Engines · §9 ADRs · §10 Data Model · §11 Events · §12 DoD · §13 Exit · §14 Risks · §15 Test · §16 Impl Notes · §17 Review Gate · §18 References — parity with SPR-MOD-002-00x and SPR-MOD-003-001. |
| 3. Engine IDs resolved from ENGINE_CATALOG | Pass | ENG-002, 004, 005, 007, 008, 010, 011, 012, 017, 018, 024, 025 all present in `ENGINE_CATALOG.md`; no placeholders. |
| 4. Accepted ADRs only | Pass | ADR-011, ADR-014, ADR-032 all `Accepted` per `ADR_INDEX.md`; no Proposed/Draft/Superseded ADRs relied upon. |
| 5. Events mapped to Event Catalog or deferred | Pass | None of the 6 event names (`quotation.issued`, `quotation.revised`, `salesorder.created`, `salesorder.confirmed`, `salesorder.amended`, `salesorder.cancelled`) exist in `event-catalog.md`; all covered by `R-EV-01` deferred risk. Event Catalog unmodified. |
| 6. Normalized 5-field Risk Register | Pass | §14 uses Risk ID · Description · Impact · Mitigation · Status; statuses ∈ {Open, Deferred, Accepted}. |
| 7. Sprint → Module traceability | Pass | §3 matrix ties every §2 deliverable to a MOD-003 MODULE_PRD section (§2, §3, §4, §6, §7, §8, §10, §12, §13). |
| 8. Both baselines in §7 | Pass | Upstream lists `MOD001_PLATFORM_BASELINE_v1` and `MOD002_ACCOUNTING_BASELINE_v1` (both frozen), plus `SPR-MOD-003-001` as upstream sprint. |
| 9. Module → Sprint bidirectional traceability | Pass | `related_engines` `[ENG-002, 004, 005, 007, 008, 010, 011, 012, 017, 018, 024, 025]` matches `MOD-003_SPRINT_PLAN.md` §2 Sprint 2 engines exactly. ADRs `[ADR-011, ADR-014, ADR-032]` match Sprint Plan §5. No capability in the Sprint PRD is unallocated by the Sprint Plan, and no Sprint Plan Sprint 2 allocation is missing from the Sprint PRD. No Sprint Plan drift finding recorded. |

All 9 items Pass on a single clean run. No remediation was required. No secondary regressions detected.

**Verification Summary**

```
Checklist Items: 9
Passed: 9
Remediated: 0
Failed: 0
Outstanding Risks: R-EV-01
Repository Status: PASS
Next Pass: 8.4.3
```

Pass 8.4.3 (SPR-MOD-003-003 Delivery & Fulfillment) is unblocked.
