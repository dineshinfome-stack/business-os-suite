
# Phase 4 — Testing & QA (SPR-MOD-001-002)

Validation-only phase. No new features, no schema, no new RPCs. Reuse SPR-MOD-001-001 patterns.

## Discovery (pre-plan verification)

Read from the repository this turn:

- `vitest.config.ts` — jsdom + `src/**/*.test.{ts,tsx}` — reuse as-is.
- `playwright.config.ts` — configured but `e2e/` contains only a README placeholder; **no existing Playwright specs**.
- Existing test suites: `src/__tests__/smoke.test.ts`, `src/lib/navigation/__tests__/*`, `src/lib/search/__tests__/*`, `src/lib/tenants/__tests__/{lifecycle,slug}.test.ts`. Pattern: pure-function Vitest suites against `lifecycle.ts` / `slug.ts`, colocated in `__tests__/` next to source.
- Slug normalization for Company/Branch/FY lives in the DB RPC (`private.fn_normalize_slug`); no TS mirror in `src/lib/organizations|branches|financial-years`. The TS mirror `@/lib/tenants/slug` is already covered by `slug.test.ts` — no duplicate needed.
- **No integration-test harness exists** in the repo for authenticated server functions (no Supabase test client, no auth fixtures, no DB reset strategy).
- **No Playwright specs or auth helpers exist**.

Consequence: SIP-018's integration and E2E scope cannot be executed as "reuse existing patterns" — the patterns don't exist. See "Gap disclosure" below.

## In scope this phase

### 1. Unit tests (SIP-018) — matches existing pattern exactly

Add pure-function Vitest suites mirroring `src/lib/tenants/__tests__/lifecycle.test.ts`, colocated under each module's `__tests__/` folder using the existing naming convention:

- `src/lib/organizations/__tests__/lifecycle.test.ts`
  - valid: `created→active`, `active↔inactive`, `active→archived`, `inactive→archived`
  - rejects: `created→inactive/archived`, `archived→*`, self-transitions
  - `assertTransition` throws on illegal
- `src/lib/branches/__tests__/lifecycle.test.ts`
  - valid: `active→archived`; rejects: `archived→*`, self, reverse
  - `assertTransition` throws
- `src/lib/financial-years/__tests__/lifecycle.test.ts`
  - full state-machine coverage of `open`, `close`, `archive` per `financial-years/lifecycle.ts`
  - rejects illegal transitions, self, post-archive
  - `assertTransition` throws

Slug normalization: covered by existing `src/lib/tenants/__tests__/slug.test.ts` (shared normalizer). No new TS slug module is introduced — SIP-018 slug items map to the DB RPC and existing TS coverage.

Data-layer invariants named in SIP-018 that live only in RPCs (overlapping-FY rejection, default-branch/company invariant, `already_*` idempotency branches, archive restrictions) are **not** exercisable from pure unit tests. They are named in the integration section below.

### 2. Integration tests — gap disclosure

The repo has no harness to call `createServerFn` handlers with an authenticated Supabase session and reset DB state between tests. Building one is net-new infrastructure and would exceed "reuse existing patterns" and "no new architectural changes".

Plan: **do not fabricate a harness this phase.** Record integration coverage of Phase 2 server functions (permission enforcement, RPC execution, audit rows, event emission, `already_*` idempotency, overlap/default invariants) as an explicit gap in the Phase 4 summary. Present the gap to the Architecture Board for disposition; do not pre-select a remedy.

### 3. Playwright E2E — gap disclosure

`e2e/` has no specs and no auth helpers. Authoring the Companies / Branches / FY flows requires: a Supabase-session bootstrap for Playwright, seed data for a tenant, and a login helper. All net-new.

Plan: **do not author E2E specs this phase.** Record as a gap on the same terms as integration. Keep `playwright.config.ts` untouched. Disposition is the Board's.

### 4. Regression verification

- Run `bunx vitest run` — full suite must pass (existing + new lifecycle suites).
- Run `bunx tsgo --noEmit` — clean.
- Static sweeps: `rg "console\\." src/lib/organizations src/lib/branches src/lib/financial-years src/routes/_authenticated/platform`, `rg "TODO|\\.only\\(|\\.skip\\(" src/**/*.test.ts` — must be empty (excluding pre-existing approved cases).
- Confirm every added test file follows the existing repository naming and location conventions (`<module>/__tests__/<subject>.test.ts`, Vitest `describe`/`it`, `@/lib/...` imports).

### 5. Defect policy

If any existing suite or typecheck fails, apply the minimum correction inside Phase 1–3 code, re-run, and record in the summary. No new abstractions.

## Files this phase will create

- `src/lib/organizations/__tests__/lifecycle.test.ts`
- `src/lib/branches/__tests__/lifecycle.test.ts`
- `src/lib/financial-years/__tests__/lifecycle.test.ts`

No other files modified unless a defect is discovered.

## Out of scope (per user directive)

Sprint closeout, acceptance report, program status, IMP CHANGELOG, SIP archival, Settings Namespace Bootstrap, Company/Branch Settings UI, any new feature.

## Deliverables at stop

1. SIP-018 execution summary, identifying completed unit-test work and any remaining items that could not be executed because the required repository infrastructure does not exist.
2. Unit test summary (counts, pass/fail).
3. Integration test summary — gap disclosure: absence of repository-supported integration test infrastructure, presented to the Architecture Board for disposition. Possible outcomes (Board's decision, not the implementation team's) include acceptance of the gap, a dedicated infrastructure proposal, or incorporation into an existing approved workstream.
4. Playwright test summary — gap disclosure on the same terms as integration.
5. Defects found + fixes (expected: none).
6. Final validation results: `vitest`, `tsgo`, static sweeps, naming/location conformance.
7. Repository deviations: none proposed; two gaps disclosed for Board disposition.
8. Recommendation for Phase 5: proceed to Sprint Acceptance pending Architecture Board disposition of the disclosed gaps.

## Stop condition

Stop after the three lifecycle test files are added, all suites and typecheck pass, and the summary with the two neutral gap disclosures is produced. Await Architecture Board decision.
