# Phase 3 — Delivery & AI (EEMP) — v2

All seven refinements incorporated. Phase 2 accepted; C-001/C-002 remain observations only.

## Scope

Author under `docs/02_Engineering_Execution_Master_Plan/`, only if not already present:

- `11_Sprint_Execution.md`
- `12_AI_Development_Playbook.md`
- `13_AI_Prompt_Standards.md` — governs **engineering prompt governance** (structure, evidence, tool-calling, safety, review, versioning, approval); **not** a repository of business/application prompts.
- `14_AI_Quality_Gates.md` — must explicitly cover Prompt validation · Tool-invocation validation · Context-window management · Hallucination mitigation · Traceability · Human approval gates.
- `15_Testing_Strategy.md` — orchestrates, does not redefine: Unit · Integration · E2E · Performance · Security · Accessibility · AI evaluation (where applicable). Each references existing standards where they exist.

Supporting updates (only if actually needed):
- `README.md` Chapter Index — status 11–15 → Draft.
- `indexes/chapter_index.md` — same.
- `20_Appendix.md` — append new Detected Conflicts only if discovery uncovers them; existing entries untouched.

Audit report: `docs/50-audit-reports/EEMP_PHASE_3_REPORT.md`.

## Expected Deliverables

Create or update only files required to complete Phase 3. No writes outside `docs/02_Engineering_Execution_Master_Plan/` and `docs/50-audit-reports/`. No edits to `src/**`, migrations, or config.

## Authority Boundary (Normative)

**Implementation artifacts are not authoritative standards.** Files such as `playwright.config.ts`, `vitest.config.ts`, `src/__tests__/**`, `e2e/**`, and any code under `src/**` may be inspected only to understand current implementation practice. They must not become normative sources for EEMP guidance. Authoritative sources remain Master Architecture, Governance Standards, ADRs, and approved delivery/AI/testing documentation.

## Execution Order (single turn)

1. **Repository Discovery (read-only, R-18 order)** with **actual** counts distinguishing:
   - **Documents Scanned** — files enumerated during discovery.
   - **Documents Referenced** — unique authoritative documents actually cited in Ch. 11–15.
   Repository size is not a proxy for documentation quality.

   Possible authoritative sources include, but are not limited to:
   - Sprint Execution: `docs/SPRINT_AUTHORING_GUIDE.md`, `docs/SPRINT_ESTIMATION_GUIDE.md`, `docs/SPRINT_ROADMAP.md`, `docs/SPRINT_DEPENDENCY_MATRIX.md`, `docs/30-sprint-prds/**`, `docs/15-governance/ARCHITECTURE_REVIEW_GATE_STANDARD.md`, EEMP Ch. 03/09/10.
   - AI Development Playbook: `docs/09-ai/**`, `docs/05-adr/ADR-0008-ai-copilot-pattern.md`, `docs/15-governance/AI_PLATFORM_LAYER_STANDARD.md`, `docs/02-architecture/ai-architecture.md`.
   - AI Prompt Standards: `docs/09-ai/prompt-library.md`, `docs/09-ai/ai-guardrails.md`, `docs/09-ai/tool-calling.md`.
   - AI Quality Gates: `docs/09-ai/ai-guardrails.md`, `docs/15-governance/FINDING_SEVERITY_STANDARD.md`, `docs/15-governance/ARCHITECTURE_REVIEW_GATE_STANDARD.md`, `docs/15-governance/PLATFORM_TESTING_STANDARD.md`.
   - Testing Strategy: `docs/15-governance/PLATFORM_TESTING_STANDARD.md`, `docs/02-architecture/testing-strategy.md`, `docs/15-governance/PERFORMANCE_BUDGETS_STANDARD.md`, `docs/15-governance/ACCESSIBILITY_STANDARD.md` if present under `docs/20-design/ACCESSIBILITY_STANDARD.md`.

   Repository Discovery determines the final source of truth. Never assume any file exists. Any approximate count in the audit report is labeled `(approx.)` with reason.

2. **Author chapters 11–15** using the standard template (Purpose · Scope · Audience · Responsibilities · Inputs · Outputs · Dependencies · Related Documents · Revision History · Cross References · Open Questions · Approval Status · Evidence · Discovery Inventory · **Traceability Matrix**). Every chapter:
   - References authoritative sources; does not restate them (R-19, R-20).
   - Marks every major section **Normative** or **Informative** (R-22).
   - Carries Evidence with Confidence per R-21.
   - Includes Traceability Matrix per R-23.
   - For Ch. 12–14: includes a **Lifecycle Note** stating AI-specific guidance is reviewed on a shorter cadence (default **quarterly**) while still following the handbook's versioning and approval workflow (R-08, R-11).
   - For Ch. 13: scoped explicitly to **engineering prompt governance**; excludes business/application prompt content.
   - For Ch. 14: explicitly covers the six required controls (prompt validation, tool-invocation validation, context-window management, hallucination mitigation, traceability, human approval gates).
   - For Ch. 15: orchestrates the seven testing dimensions (Unit, Integration, E2E, Performance, Security, Accessibility, AI evaluation) with references to existing standards; treats config files and test suites as **informative implementation artifacts only**.

3. **Update Chapter Index** in `README.md` and `indexes/chapter_index.md` only where transitions actually change.

4. **Author `docs/50-audit-reports/EEMP_PHASE_3_REPORT.md`** in the same fixed 13-section order:
   1. Discovery Summary (with **Documents Scanned** vs **Documents Referenced** shown separately; approximations flagged)
   2. Files (Created / Modified — actual)
   3. Cross References
   4. Repository Health Findings — severity **and** category
   5. Duplicate Standards
   6. Missing References
   7. Broken Links
   8. Conflicts (mirrors Appendix; **no resolution of C-001/C-002**)
   9. Metrics
   10. **Compliance Verification** — adds two Phase-3-specific checks:
       - Every AI-related chapter references applicable Governance, ADRs, and Architecture documents.
       - No AI workflow or prompt pattern introduced without evidence.
   11. Checklist (R-17)
   12. Outstanding Questions
   13. Approval

5. **Stop.** Do not begin Phase 4 automatically. Do not anticipate future work.

## Non-Goals

- No new architecture, no new standards, no scope changes.
- No resolution of accepted conflicts C-001/C-002.
- No modification of authoritative or implementation documents (findings reported, not fixed).
- No writes outside `docs/02_Engineering_Execution_Master_Plan/` and `docs/50-audit-reports/`.

## Closing Directive

If all Phase 3 completion criteria are satisfied, execute Phase 3. At completion, stop, generate the audit report, request approval, and wait for explicit authorization before beginning Phase 4.
