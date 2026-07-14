## Pass 9.1.2 — Execute GT-003 for SPR-MOD-006-003 (Opportunities) — v2

### Objective

Invoke released GT-003 to author `SPR-MOD-006-003 Opportunities`, register transactionally, run GT-003 validation, and emit a GT-005 Repository Audit. Inherits the reusable GT-003 Execution Wrapper recorded in `.lovable/plan.md` during Pass 9.1.1.

### Execution Wrapper (inherited)

```yaml
execution_id: GT003-MOD006-003-20260713-001
parent_result_id: GT003-MOD006-002-20260713-001
execution_schema_version: 3
execution_mode: released
lock: { inherit: true }
```

### Preconditions

- SPR-MOD-006-002 exists, `lifecycle_state = Authored` (Draft), GT-003 15/15 PASS, GT-005 18/18 PASS, no corrective execution open — verified from `.lovable/plan.md` and `docs/50-audit-reports/REPOSITORY_AUDIT_20260713T000100Z.md`.
- SPR-MOD-006-003 is currently `Planned` in `docs/30-sprint-prds/crm/README.md` (verified).
- Governance assets (GT-003, GT-005, Matrix v1.0.2, Capabilities v1.1) unchanged.

### Bounded-Context Rules

- **Owns (MOD-006 CRM):** Opportunity, Opportunity Pipeline, Opportunity Stage, Opportunity Forecast, Opportunity Activity linkage.
- **Consumes:** Lead (SPR-MOD-006-002), Account/Contact (SPR-MOD-006-001).
- **Forbidden to author:** Customer master (MOD-003), Sales Order, Quotation, Invoice, Voucher, GL entries (MOD-002 / MOD-003).
- **Configuration source:** SPR-MOD-006-001. Pipeline stage behavior SHALL be resolved from the Engine Allocation defined by the CRM Module PRD (currently including `ENG-005` where applicable) — this execution does not couple to any single engine identifier beyond what the Module PRD authorises.

### Event Resolution (verbatim, no invention)

All opportunity events SHALL resolve verbatim from CRM Module PRD §8 and the Repository Event Catalog.

- **Published.** The Sprint PRD SHALL publish the opportunity outcome events registered in CRM Module PRD §8 (currently `OpportunityWon` and `OpportunityLost`).
- **Consumed.** None required for Sprint 3 core scope. `SalesInvoiceIssued` may be referenced only as forward context; not implemented here.
- If any Sprint Objective item (probability, forecast values, timeline) implies an event that is not present in Module PRD §8, treat as a PRD gap — abort with `PRECONDITION-FAIL` and refer upstream.

### Deliverable 1 — Sprint PRD

Path: `docs/30-sprint-prds/crm/SPR-MOD-006-003-opportunities.md`. Released GT-003 18-section structure.

Content anchors (from Sprint Plan §SPR-MOD-006-003):
- Engines: `ENG-002, ENG-004, ENG-005, ENG-010, ENG-011, ENG-012, ENG-024, ENG-025` (verbatim from Sprint Plan).
- ADRs: `ADR-011, ADR-014, ADR-032`.
- Upstream: SPR-MOD-006-001, SPR-MOD-006-002.
- Exit criteria: create-from-converted-lead; stage transitions per Module PRD Engine Allocation; win/loss classification; opportunity outcome events (per §8) published via `ENG-024`.

### Deliverable 2 — Transactional Registration (4 applicable surfaces)

- `docs/30-sprint-prds/crm/README.md` — flip Sprint 3 row to Authored (Draft) with link.
- `docs/SPRINT_CATALOG.md` — insert SPR-MOD-006-003 row.
- `docs/DOCUMENT_INDEX.md` — insert Delivery/Draft row.
- `docs/_meta.json` — sidebar entry under CRM sprints group.
- `docs/DOCUMENT_TRACEABILITY.md` — Present but N/A (governance-level guide; no per-sprint rows by design; consistent with Passes 9.1.0/9.1.1).

Same-pass rollback semantics apply.

### Deliverable 3 — GT-003 Validation

Bind dynamically to released GT-003 rule set (VAL-001..VAL-014 incl. VAL-013A/B; 15 checks in current release). All rules PASS expected.

### Deliverable 4 — GT-005 Repository Audit

Emit `docs/50-audit-reports/REPOSITORY_AUDIT_20260713T000200Z.md` — 18-item audit across governance, repository, registration, traceability, integrity profiles. Expected: READY, Confidence MEDIUM (D3 inherited).

### Execution Outputs

```yaml
execution_status: READY_FOR_NEXT_SPRINT
next_template: GT-003
next_target: SPR-MOD-006-004
handoff_state: READY
```

Append execution record to `.lovable/plan.md`.

### Success Criteria

Sprint PRD conforms to released GT-003; ownership boundaries preserved; events verbatim from Module PRD §8; engine coupling stated via Module PRD Engine Allocation; 4-surface registration complete; GT-003 validation PASS; GT-005 audit PASS; governance unchanged; repository READY; handoff ready for SPR-MOD-006-004.
