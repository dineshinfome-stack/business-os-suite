## Pass 3.8.1 — Certification Evidence Package

Goal: close the verification gap. No new functional scope, no Pass 3.8.2 work. Deliverable is one report document plus the production build result.

### 1. Run the production build (the missing gate)

- Run the production build and capture the full output (not tail-truncated).
- Re-run the full test suite and typecheck in the same session so all three results are from one repository state.
- If the build fails, the report records the failure and the gate stays open; no scope is added to fix anything beyond a build-blocking defect introduced by Pass 3.8.1.

### 2. Generated-file diff review

- Inspect `src/routeTree.gen.ts` and any other generated artifact after the build.
- Report whether it changed. Expected: unchanged, because Pass 3.8.1 added no route. If it did change, state whether the change was reverted or retained, with justification.

### 3. Author `docs/60-engineering/PHASE3_GATE38_PASS381_COMPLETION_REPORT.md`

Sections, each backed by a verification command run in this pass:

1. **File inventory** — every file created and modified, grouped as: 9 module source files, 15 DTO files under `types/v1/`, 5 test files, 3 documents. Explicit statement on `PHASE3_GATE38_DISCOVERY.md` (authored in Pass 3.8.0; whether Pass 3.8.1 touched it at all, and if so only to add decision references).
2. **Protected-path diff confirmation** — evidence that nothing changed under `supabase/migrations/**`, `src/routes/**`, `src/modules/platform/**`, or the provisioning, lifecycle, organization, branch, financial-year, notification, settings and permission files. Confirmed by commit-scoped file listings for every commit belonging to this pass.
3. **Architecture boundary confirmation** — no `*.server.ts`, no Supabase or database-row imports, no server-function framework imports, no `process.env` / `import.meta.env`, no routes, no UI, no `.sql`. Each item cross-referenced to the assertion in `__tests__/architecture.test.ts` that proves it, so the claim is machine-enforced rather than asserted.
4. **Contract inventory** — 6 workflow states, 8 transition intents, the complete transition table with its rejection codes, 10 canonical step keys, 6 step statuses, the v1 DTO family, Zod schemas, query-key factory and required-settings registry; each with its defining file and symbol.
5. **Policy ratification list** — G38-POL-001 through G38-POL-010, one line each.
6. **Readiness classification** — all 18 candidate checks with their classification, confirming the five invariants hold in both matrices: valid invitation required; acceptance warning-only; membership non-blocking before acceptance; invitation role selection distinct from effective member RBAC; financial year conditional.
7. **Permissions** — the reuse table and the two documented semantic gaps (onboarding view, workspace activate), with confirmation that zero permissions were added.
8. **Non-implementation confirmation** — migration design is documented only; no executable SQL, service, server facade, route or UI exists in the module.
9. **Test integrity** — 481 total, 37 added, 444 baseline; confirmation that no pre-existing test was deleted, skipped or weakened, and identification of any pre-existing test legitimately modified (verified by diffing the pre-existing test files against the pass baseline and by checking for `skip`/`todo`/`only` markers repository-wide).
10. **Build, typecheck and test results** — verbatim summary lines.
11. **Known limitations and deferred items** — unresolved financial-year trigger source (blocking prerequisite for Pass 3.8.5), tenant self-service onboarding deferred, no invitation resend primitive, notification delivery confirmation not evaluable, settings registry limited to keys that exist today.

### 4. Gate status

Report closes with an explicit status line: `Pass 3.8.1 — COMPLETE, EVIDENCE SUPPLIED` (or `VERIFICATION FAILED` with the failing item). Pass 3.8.2 is not started and no persistence, RLS or read-model work is performed.

### Technical notes

- Verification is read-only apart from the single new report document; no source file, test or existing document is edited to make evidence pass.
- Test-integrity and protected-path claims are derived from commit-scoped file listings and marker searches, not from recollection.
- If any claim cannot be substantiated by a command in this pass, the report says so explicitly rather than asserting it.
