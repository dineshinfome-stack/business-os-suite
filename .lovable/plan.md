## Pass 3.8.1 — Architecture and Contracts

Contracts-only pass. Nothing executable touches the database, routes, or UI. Confirmed prerequisites: `docs/60-engineering/PHASE3_GATE38_DISCOVERY.md` exists (312 lines), `src/lib/tenant-onboarding/` does not yet exist, and there is no separate company module under `src/lib` (only `organizations`, `branches`, `financial-years`).

### 1. Baseline capture
Record test count (expected 444), typecheck status, build status, and changed-file list before any edit. Re-read the discovery report and confirm no conflicting company entity; stop and report if one appears.

### 2. Documentation deliverables (authored first)
- `docs/60-engineering/PHASE3_GATE38_POLICY_DECISIONS.md` — decisions G38-POL-001…010 in the required 12-field format (ID, title, status, context, decision, repository evidence, alternatives, consequences, owning module, implementation impact, test impact, deferred implications). Includes the permission reuse plan section.
- `docs/60-engineering/PHASE3_GATE38_ONBOARDING_MATRIX.md` — one row per approved step with all 22 required columns, plus the migration design section for `tenant_onboarding` and `tenant_onboarding_steps` (fields, types, nullability, constraints, indexes, optimistic-concurrency `version`, RLS intent, grants, retention, pre-seed vs lazy step rows). Documented only — no SQL file.
- `docs/60-engineering/PHASE3_GATE38_READINESS_MATRIX.md` — all 18 candidate checks classified as mandatory / conditional / warning / merged / deferred / N/A, with all 17 required columns (Check Key, Description, Classification, Owning Module, Source of Truth, Evaluation Input, Pass Condition, Warning Condition, Block Condition, Operator Explanation, Reason Code, Reason Parameters, Deep Link, Re-evaluation Trigger, Test Requirement, Implementation Pass, Decision Reference) and explicit justification for every merge or omission.
- `PHASE3_GATE38_DISCOVERY.md` updated only to cross-reference ratified decision IDs.

Policy outcomes carried forward: organizations = company (no separate company step), operator-run surface under `/platform/admin/onboarding/:tenantId`, valid invitation mandatory / acceptance warning-only, financial year conditional (authoritative trigger named or marked an unresolved prerequisite for Pass 3.8.5), roles assigned never created, permission reuse by default, DTOs owned at `src/lib/tenant-onboarding/types/v1/`, timeline composed over `audit_logs` + `tenant_onboarding_steps`, readiness evaluation deferred to 3.8.5.

#### Invitation-dependent step policy (binding)
When a valid first-administrator invitation exists but has not yet been accepted:
- `tenant_admin_invitation` may be completed.
- Pending invitation acceptance produces a readiness warning only.
- `tenant_admin_membership` must not block activation; it is classified as conditional or warning until acceptance occurs.
- `roles_assigned` must not require a persisted membership/user-role record before acceptance.
- The role selected on the valid invitation may satisfy the pre-acceptance onboarding requirement when supported by the authoritative invitation model.
- After acceptance, membership existence and effective RBAC assignment may be evaluated as mandatory post-acceptance integrity checks.
- The readiness matrix and onboarding matrix must use the same classification and source-of-truth rules, and must explicitly distinguish "role selected on invitation" from "role granted to an accepted organization member".

### 3. Executable contracts (all pure — no Supabase, no server, no I/O)
```text
src/lib/tenant-onboarding/
  contracts.ts                     step keys, step statuses, metadata contract
  state-machine.ts                 states, intents, rejection codes, transition fn
  schemas.ts                       Zod query + command-input + registry schemas
  query-keys.ts                    tenantOnboardingKeys factory
  required-settings.registry.ts    allow-listed registry (definitions only)
  types/v1/*.dto.ts + index.ts     versioned DTO family
  index.ts                         barrel exports
```

**State machine** — states `not_started | in_progress | blocked | ready_for_activation | activated | cancelled`; intents `start | block | resume | mark_ready | invalidate_readiness | activate | cancel | restart`; discriminated-union result, no throwing on expected invalid transitions. Complete allowed-transition table:

```text
not_started
  → in_progress                  via start

in_progress
  → blocked                      via block
  → ready_for_activation         via mark_ready
  → cancelled                    via cancel

blocked
  → in_progress                  via resume
  → ready_for_activation         via mark_ready
  → cancelled                    via cancel

ready_for_activation
  → in_progress                  via invalidate_readiness
  → blocked                      via block
  → activated                    via activate
  → cancelled                    via cancel

cancelled
  → in_progress                  via restart

activated
  → no transitions
```
Any state-and-intent combination not explicitly listed above must return a typed rejection result. `mark_ready` is the only intent that can produce `ready_for_activation`; `activate` is the only intent that can produce `activated`.

**Step keys** — `provisioning_verified, organization_profile, primary_branch, tenant_admin_invitation, tenant_admin_membership, roles_assigned, required_settings, financial_year, readiness_validation, activation`. A single canonical production registry owns all step keys; type unions, schemas, metadata and other production contracts derive from that registry rather than maintaining duplicate lists. Documentation and tests may reference literal keys where needed for explicit assertions. No company step.

**Step statuses** — `not_started | in_progress | completed | blocked | failed | skipped`, with these rules: `failed` and `blocked` are distinct; `skipped` is valid only for a documented conditional or optional step; completion is later verified from authoritative server data; local form completion must never independently mark a server-owned step complete.

**DTOs** — summary, detail, step, progress, blocker, readiness, readiness-check, organization, branch, invitation, membership, activity (source-discriminated), action-result, activation-result, page, filter. Readiness DTO supports `evaluationStatus: not_evaluated | evaluating | evaluated`. Invitation DTO excludes token/token hash/URL.

**Required-settings registry** — only keys proven to exist in the current settings framework become executable entries; unproven candidates are listed as proposed/deferred in documentation.

### 4. Tests (new files under repository-standard test locations)
State-machine transitions (every allowed edge, every rejected combination, intent exclusivity, determinism, input immutability); step-contract tests (uniqueness, status union, no company step, matrix coverage, single owner, pass assignment, invitation-dependent classification); DTO security tests (forbidden property fragments with a narrow allow-list, serializability, v1 namespace); schema tests (strict-mode unknown keys, invalid states/step keys/pagination/date ranges/setting keys); query-key tests (determinism, normalization, namespace collision, serializability); architecture-boundary tests — no Supabase/db-row/UI imports, no `*.server.ts` file under `src/lib/tenant-onboarding/`, no server-function framework import, no environment-variable access.

### 5. Validation and stop
Run pass-specific suites, typecheck, the production build, and the full regression suite. Confirm every test from the original 444-test baseline remains passing and report the new total, which must include the newly added Pass 3.8.1 tests. Existing tests must not be deleted, skipped, weakened, or rewritten merely to make this pass succeed; any legitimate shared-contract test update requires written justification in the completion inventory.

Diff-review that these remain untouched:
```text
supabase/migrations/**
src/routes/**
src/modules/platform/**
src/lib/platform-admin/**
src/lib/provisioning/**
src/lib/tenant-lifecycle/**
src/lib/organizations/**
src/lib/branches/**
src/lib/financial-years/**
src/lib/notifications/**
src/lib/settings.functions.ts
src/lib/settings-validation.ts
docs/15-governance/permission-catalog.manifest.yaml
src/lib/generated/permission-keys.ts
```
Any generated-file change caused by validation (e.g. `src/routeTree.gen.ts`) must be inspected; when no route or source contract requires it, revert before completion, and any retained generated change requires explicit justification in the inventory. Return the concise completion inventory, then stop and await approval for Pass 3.8.2.
