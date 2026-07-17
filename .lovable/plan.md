# Pass 17.0.3 — GT-003 Sprint 003 for MOD-015 POS

Author **SPR-MOD-015-003 — Multi-Tender Payments & Receipts** under GT-003 v1.0 and FROZEN Execution Wrapper v1.0, resolved exclusively from `docs/20-module-prds/pos/MODULE_PRD.md` and `docs/30-sprint-prds/pos/MOD-015_SPRINT_PLAN.md` §2. Zero fabrication. No governance evolution.

## Governance Envelope

- Governance Framework v1.0 — Released
- GT-003 v1.0 — Active
- Execution Wrapper v1.0 — FROZEN
- Previous audit: `REPOSITORY_AUDIT_20260717T000000Z.md` (Repository READY)
- Pass 17.0.2 prerequisite: Complete

## Resolved Target (from approved Sprint Plan §2)

- **Sprint ID:** SPR-MOD-015-003
- **Title:** Multi-Tender Payments & Receipts
- **File:** `docs/30-sprint-prds/pos/SPR-MOD-015-003-multi-tender-payments-and-receipts.md`

## Execution Lifecycle

`preflight → resolving → authoring → registering → validating → auditing → complete | failed`

1. **Preflight** (abort on first failure, `PRECONDITION-FAIL`, exit 20): governance envelope intact; Pass 17.0.2 complete; previous audit READY; approved Sprint Plan present; SPR-MOD-015-003 not previously authored; no open corrective executions.
2. **Snapshot Freeze**: capture repository revision, authoritative source digests, and snapshot metadata declared by the released GT-003 template.
3. **Authoritative Resolution**: resolve scope, canonical slug, capability allocation, ownership boundaries, requirement IDs, engines, ADRs, events, dependencies, integration boundaries dynamically from the Module PRD and Sprint Plan. Previously published Sprint PRDs consulted solely as structural precedent where permitted by GT-003. No business content inherited or inferred.
4. **Sprint Authoring**: emit `docs/30-sprint-prds/pos/SPR-MOD-015-003-<resolved-slug>.md` using the **released GT-003 canonical structure**. Preserve deterministic ordering and full bidirectional traceability (capability ↔ sprint ↔ deliverable). No implementation content beyond the GT-003 lifecycle.
5. **Registration**: update only GT-003-declared registration surfaces. No additional surfaces.
6. **Validation**: execute every GT-003 validation and verification rule via dynamic rule binding. No hard-coded identifiers or counts. All required PASS; INFO only where GT-003 permits.
7. **GT-005 Repository Audit**: emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` covering every audit profile declared by the released audit specification. Require every profile PASS and Repository READY.
8. **Execution Finalization**: append execution record to `.lovable/plan.md`; release execution lock.

## Authoritative Scope (verbatim from Sprint Plan §2, Sprint 003)

- **Objective.** Payment authorization process for POS Sales: multi-tender payment capture (cash, card, digital, mixed), payment terminal integration, receipt printing/reprint.
- **In:** multi-tender payment capture on POS Sale; payment terminal integration; receipt generation and reprint; payment reversal on returns handoff.
- **Out:** foundation masters (001); sale composition (002); offers/loyalty/returns (004); day close (005); ledger posting (owned by MOD-002).
- **Module PRD coverage:** §2 (Multi-tender payments; Receipts and reprints; submodule Payments), §4 (Payment authorization), §8 (Payment terminals).
- **Engines:** ENG-002, ENG-004, ENG-005, ENG-006, ENG-007, ENG-010, ENG-012, ENG-017, ENG-018, ENG-023, ENG-024, ENG-025.
- **ADRs:** ADR-011, ADR-032.
- **Upstream sprint dependencies:** SPR-MOD-015-001, SPR-MOD-015-002.

## Ownership Boundaries (recapitulated, not evolved)

- Identity/permissions → MOD-001 (ENG-001/002/003).
- Ledger effects of payments → MOD-002 via ENG-015/016 posting-rule bindings; MOD-015 owns tender capture only, not double-entry posting.
- Tender validation → ENG-012 Rules; payment lifecycle → ENG-010 Workflow.
- Receipt issuance/reprint → ENG-007 Document; numbering → ENG-017; reprints preserve identity of the original receipt and are audited via ENG-004.
- Payment terminal integration → routed exclusively through ENG-023.
- Receipt notifications → dispatched via ENG-025 where configured.

## Rollback

On failure after Registration: execute the released GT-003 Runtime Rollback — restore registration surfaces in reverse order, remove partially created Sprint PRD artifacts if required, restore the repository to its exact pre-execution state. Wrapper unchanged.

## Success Criteria

- Sprint 003 PRD authored using the released GT-003 canonical structure
- Sprint scope resolved exclusively from authoritative repository artifacts
- Complete bidirectional traceability preserved
- Registration limited to GT-003-declared surfaces
- Every GT-003 validation and verification rule PASS (INFO where permitted)
- GT-005 Repository Audit PASS; Repository READY
- Governance Framework, GT templates, and Wrapper unchanged

## Non-Goals

No additional Sprint PRDs; no Module PRD / Sprint Plan modifications; no Baseline; no GT-004; no governance/template/wrapper evolution; no implementation code.

## Deliverables

- Sprint 003 PRD (path resolved by the released GT-003 template)
- Updated GT-003-declared registration surfaces
- `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md`
- Execution record appended to `.lovable/plan.md`

## Execution Record (shape)

```yaml
execution_status: READY_FOR_STAGE_2
template: GT-003
template_version: v1.0
module: MOD-015 POS
sprint: SPR-MOD-015-003 — Multi-Tender Payments & Receipts
next_template: GT-003
next_target: <resolved dynamically according to the released GT-003 lifecycle>
handoff_state: READY
execution_id: <allocated>
audit_report_id: REPOSITORY_AUDIT_<UTC-ISO8601>
repository_revision_after: <allocated>
snapshot_digest: <allocated>
```

Include `previous_audit_report_id` only if declared by the released GT-003 template. If the released GT-003 lifecycle specifies different terminal execution values, defer to the template-defined values.

## Roadmap

- Pass 17.0.4 — GT-003 Sprint 004 for MOD-015 POS
- Continue remaining GT-003 sprints → GT-004 Baseline Consolidation → GT-005 Publication
- Optional OR / RR / SR read-only governance reviews per established cadence
