## Pass 23.0.4 — GT-003 Sprint 003 Authoring: MOD-018 AI Workspace (Tool Calling on Module Capabilities)

Author Sprint 003 following the pattern established by Sprints 001–002. Zero governance evolution, zero implementation, zero scope expansion.

### Preflight (read-only)
- Verify `docs/20-module-prds/ai/MODULE_PRD.md`, `docs/30-sprint-prds/ai/MOD-018_SPRINT_PLAN.md`, Sprint 001 PRD, and Sprint 002 PRD all exist and are approved.
- Confirm `REPOSITORY_AUDIT_20260718T010000Z` = READY.
- Re-read Sprint Plan §Sprint 003 to extract exact authorities, engines, ADRs, events, configuration keys, and exit criteria.

### Deliverable
Create `docs/30-sprint-prds/ai/sprints/SPR-MOD-018-003_TOOL_CALLING_ON_MODULE_CAPABILITIES.md` using the GT-003 template, mirroring the Sprint 001/002 structure:

1. Metadata
2. Purpose & Scope
3. Traceability (Module PRD §§, Sprint Plan §Sprint 003)
4. Sprint 003 Authorities — derived verbatim from the approved Sprint Plan allocation for Tool Calling on Module Capabilities (Tool Definition master, AI Tool Call transaction, Tool-call-with-approval process).
5. Business Processes — Tool-call-with-approval as allocated by the approved Module PRD and Sprint Plan. Any engine participation and ADR references shall be included only if explicitly allocated by the approved authoritative artifacts.
6. Business Rules — governance-neutral wording, restated verbatim from the approved Module PRD where applicable (approval gate on AI-initiated state changes; versioning and audit of tool definitions; module-level authorization at tool-invocation time).
7. Events — subset of the Module PRD §8 published-event union allocated to Sprint 003.
8. Configuration — subset of Module PRD §10 keys allocated to Sprint 003 (approval policies and related toggles).
9. Ownership & Dependencies — MOD-018 owns the Sprint 003 authorities exclusively; Sprint 001 and Sprint 002 artifacts referenced for traceability only; no ownership reassignment.
10. Engines Consumed — subset of the MOD-018 engine union allocated to Sprint 003 by the approved artifacts.
11. ADRs Consumed — subset of the MOD-018 ADR union allocated to Sprint 003 by the approved artifacts.
12. Validations — using the released GT-003 validation model with dynamic rule binding. Do not hard-code validation identifiers or validation counts.
13. Sprint Exit Criteria — verbatim from Sprint Plan §Sprint 003.
14. References.

All engine/ADR/event/configuration lists must be subsets of the corresponding Module PRD unions.

### Registration (GT-003 surfaces only)
- `docs/30-sprint-prds/ai/README.md` — mark SPR-MOD-018-003 Draft
- `docs/SPRINT_CATALOG.md` — register SPR-MOD-018-003
- `docs/DOCUMENT_INDEX.md` — register SPR-MOD-018-003
- `docs/_meta.json` — add navigation entry; validate JSON

### Audit & Execution Record
- Emit `docs/50-audit-reports/REPOSITORY_AUDIT_<UTC-ISO8601>.md` — Repository Audit PASS in accordance with the released Repository Audit specification, referencing `REPOSITORY_AUDIT_20260718T010000Z` as predecessor.
- Append GT-003 execution record to `.lovable/plan.md` with `execution_status: COMPLETE`, `next_target: MOD-018 Sprint 004`, `handoff_state: READY`.

### Guardrails
- Exclusive derivation from Module PRD + Sprint Plan; no Sprint 004–005 leakage (Copilot Surfaces and Governance/Safety remain untouched).
- Governance-neutral business-rule wording.
- No new authorities beyond the Sprint Plan §Sprint 003 allocation.
- Bidirectional traceability preserved.
- No implementation guidance, architectural redesign, or governance evolution.

### Rollback
On any post-registration failure, execute the released GT-003 Runtime Rollback: reverse registration updates, remove partial Sprint 003 artifacts, and restore the repository to its pre-execution state.

### Completion
Pass 23.0.4 COMPLETE → Repository READY → Next: GT-003 Sprint 004 Authoring (AI Conversations & Copilot Surfaces).