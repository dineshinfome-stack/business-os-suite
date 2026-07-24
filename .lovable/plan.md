# Phase 2 Closeout — SIP-014 Deferral + Implementation Verification (Rev 2)

Architecture Board approved with 10/10 rating. Rev 2 incorporates the two refinements: reclassify the follow-on as an engineering **proposal** (not a reserved sprint) and add **behavioral** checks to V3.

## 1. Governance recording

Update `docs/05_Sprint_Implementation_Plans/active/SIP-SPR-MOD-001-002.md`:

- Mark SIP-014: `Status: Deferred — Dependency on ENG-005 (Settings Framework)`.
- Add **Deferred Items** subsection referencing the Board decision and pointing to the engineering proposal below.
- Update sprint execution status header to `Phase 2: Approved with Conditions`.

Create engineering proposal (governance placeholder, **not** a reserved sprint):

- `docs/30-sprint-prds/engineering/PROPOSAL-settings-namespace-bootstrap.md` — Draft **engineering proposal / PRD stub**. Scope covers: `company` scope, `branch` scope, `initializeNamespace(scope, entityId)` API, definition seeding, lifecycle integration hook.
- Opening note (verbatim intent): *"The Architecture Board will determine at intake whether this becomes SPR-ENG-005-001, is folded into another approved workstream, or is deferred. No sprint identifier is reserved."*

Program status entry:

- `docs/04_Program_Status/reports/PHASE2_SPR-MOD-001-002_CLOSEOUT.md` — records Board decision, deferral rationale, V1–V5 verification results, and the proposal handoff.

## 2. Implementation verification (Board pre-Phase-3 checks)

Read-only audit against five criteria; results captured in the closeout report.

| # | Check | Method |
|---|---|---|
| V1 | Lifecycle mutations use only `private.fn_*` RPCs | `rg` for `.from("organizations"\|"branches"\|"financial_years").(update\|insert\|delete)` inside `src/lib/{organizations,branches,financial-years}/` — expect zero hits |
| V2 | Permission enforcement uses generated `PERMISSIONS.*` constants only | `rg` for raw permission strings (`"platform.company."`, etc.) in the same dirs — expect zero hits |
| V3 | Audit payload — **structural + behavioral** parity with SPR-001 writer | (a) diff `audit.ts` files against `src/lib/tenants/audit.ts` for shape parity (`action`, `entity_type`, `entity_id`, `actor_id`, `created_by`, `updated_by`, `new_values`); (b) trace each `*.functions.ts` call site to confirm **runtime behavior**: required fields always populated (never undefined), `correlationId` propagated from server-fn input into the audit `new_values.correlation_id`, `entity_type` string is the correct literal for the module (`"company"` / `"branch"` / `"financial_year"`), and `from_state`/`to_state` come from RPC return values rather than client input |
| V4 | Event names match PRD §11 exactly | Cross-check `buildXxxEvent` name literals against the PRD event catalog table (spelling + casing): `company.created`, `company.updated`, `company.archived`, `branch.created`, `branch.updated`, `financialyear.created`, `financialyear.opened`, `financialyear.closed` |
| V5 | Events emitted **after** successful RPC completion | Read each `*.functions.ts` handler; confirm `if (error) throw` precedes `logXxxEventFn(...)` and `buildXxxEvent(...)`; confirm idempotent no-op branches (`already_*`) skip both audit and event |

Expected outcome: all five pass. Any deviation is noted in the report and fixed as an implementation defect — not a scope change — then re-verified.

## 3. Deliverables

1. Updated `SIP-SPR-MOD-001-002.md` with SIP-014 marked Deferred.
2. New `PROPOSAL-settings-namespace-bootstrap.md` (engineering proposal; no sprint ID reserved).
3. `PHASE2_SPR-MOD-001-002_CLOSEOUT.md` containing V1–V5 evidence (structural + behavioral for V3).
4. No code changes unless V1–V5 uncover a defect; in that case a targeted fix + re-verify.

## 4. Out of scope

- Phase 1 schema amendments.
- Phase 3 (UI & RBAC) work — starts after this closeout is accepted.
- Authoring a SIP for the settings proposal (Architecture Board intake first).
- Any Phase 3 UI element that edits company- or branch-scoped settings — deferred alongside the settings proposal until the enhancement lands.

## Technical notes

- Verification is `rg` + read-only file inspection; no migrations, no server-function edits expected.
- The follow-on document is explicitly a **proposal**, not a scheduled sprint. Sprint identifier assignment is a Board intake decision.
- V3 behavioral trace is a static reading of call sites (input → audit payload flow), not a runtime harness — sufficient for this closeout given the small surface (≈17 handlers) and consistent pattern.
- SIP-014's deferral does not block Phase 3 organization-structure pages; only settings-editing UI for those scopes is gated on the proposal.
