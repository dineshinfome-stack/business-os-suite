## Pass 3.8.2 — Documentation and Governed Migration-History Repair (v7)

Status stays **Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED** until every gate has executed evidence. **Pass 3.8.3 stays NOT STARTED.** The RPC, RLS, grants, DTOs, and read layer do not change — enforced as an executable hash gate.

### Verified facts

- `supabase/migrations/20260726114237_3ca5092b-…sql` hard-codes two live user UUIDs, seeds `REM382 Tenant …`, and impersonates via `set_config('request.jwt.claims', …)` + `SET LOCAL ROLE authenticated`.
- `PHASE3_GATE38_PASS382_COMPLETION_REPORT.md:220` still asserts application-side queue projection.
- `PHASE3_GATE38_ONBOARDING_MATRIX.md` §3.1/§3.2 still document authenticated DML and `service_role = ALL`.
- Closure report REM-382-003 wrongly claims the step sequence is persisted; the migration keeps it TypeScript-registry-owned via a non-persisted `canonical_steps` mirror.
- `MIGRATION_REGISTRY.md` requires additive rows plus document, manifest, and terminal audit per entry.

---

## Pre-flight (corrected order: 0A → 0C → 0B → 0D)

### 0A — Pending exception request + provisional manifest

`docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md` (status `Pending Approval`): original path, **Git blob SHA, SHA-256 over exact bytes, line count, byte count, and the commit that introduced the executable form**, plus the retrieval command `git show <original-commit>:supabase/migrations/<filename>`. The original executable SQL is **never** copied into the active tree (it would reintroduce live UUIDs). Also: why fresh replay is environment-dependent, evidence the original run left zero residue, intended tombstone content, replacement harness path, runtime schema impact (none), approval authority, rollback/recovery.

Environment reconciliation table (required in the document and echoed in the terminal audit):

```text
Environment                       | Version status                  | Runtime action
Existing development DB           | Already applied                 | No new SQL executed
Clean replay DB                   | Recorded applied during replay  | Comment-only, no runtime effect
DB created from older commit      | Original harness may have run   | Verify historical residue
DB created from repaired commit   | Tombstone runs                  | No fixtures, no impersonation
```
The document explicitly acknowledges that the historical executable content was previously applied to existing databases and that the tombstone does not retroactively undo it.

`docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json` — status `Pending Final Hashes`.

### 0C — Migration-runner checksum/history investigation (now BEFORE approval)

Determine and record: migration runner and version, migration history table, stored history columns, whether SQL content/checksum is tracked, what happens when an applied migration's content changes, whether replay or remote/local sync is refused, and whether a history/checksum repair record is required. **If checksum behavior cannot be determined, execution stops before the tombstone** and the status remains unchanged.

### 0B — Explicit authority approval of the *discovered* strategy (binding stop)

The approval record must incorporate the 0C findings verbatim: runner + version, history table, stored columns, checksum/content tracking behavior, effect of changing an applied migration, whether checksum repair is required, the approved checksum-repair action when applicable, and the approved tombstone strategy. Recorded durably: a dedicated approval section (authority, approver identity, UTC timestamp, decision, repair document ID, original path + blob SHA) **plus** the Git commit carrying the approved exception document; that approval commit SHA goes into the terminal audit. Lovable does not self-mark approval; without a recorded decision the migration is untouched.

### 0D — Runtime-immutability baseline

SHA-256 captured now and re-verified byte-identical through Commit C:
```text
supabase/migrations/20260726113455_f79b36fd-9178-4def-91a8-cbc298d95e21.sql
src/lib/tenant-onboarding/server/query-service.server.ts
src/lib/tenant-onboarding/server/mappers.server.ts
src/lib/tenant-onboarding/queries.functions.ts
src/integrations/supabase/types.ts
```

---

## Commit A — Technical repair candidate

Contains only: tombstone, deterministic harness, postcheck, `supabase/tests/README.md`, migration safety/discovery checks.

**Tombstone** — same filename/version, comments only: original commit SHA, original blob SHA, repair document ID, replacement harness path, Git recoverability, no runtime change for existing databases, fresh databases execute only comments while remediation `20260726113455_…` remains responsible for schema and policy. No SQL, no `DO`/`BEGIN`, no JWT impersonation, no live UUIDs, no `REM382 Tenant` text.

**Shared fixture constants** — declared identically in harness and postcheck, synthetic and non-live: authorized fixture UUID, denied fixture UUID, authorized email, denied email, tenant slug prefix.

**Harness** `supabase/tests/pass_3_8_2_queue_certification.sql`: `BEGIN` → preconditions → fixtures → 16 assertions → in-transaction residue checks → `ROLLBACK`.

RBAC preconditions (raise, never pick the first row):
```text
permissions.key = platform.tenant.read AND deprecated_at IS NULL  → exactly 1
roles.key = platform_owner AND scope = platform AND system_role   → exactly 1
role_permissions joining those two rows                           → exactly 1
fixture UUIDs / emails / slug prefix pre-existing                 → 0 rows
```
Only a fixture `user_roles` row is inserted (resolved platform role, `organization_id` NULL, legacy role NULL, `deleted_at`/`expires_at` NULL). `permissions`, `roles`, `role_permissions` are read-asserted, never mutated.

Fixture RBAC assertions before any RPC call:
```text
authorized fixture: exactly one active platform_owner assignment
authorized fixture: platform.tenant.read = true
denied fixture:     zero active platform role assignments
denied fixture:     platform.tenant.read = false
```
After each JWT-claims switch, assert `private.fn_user_has_permission(auth.uid(), NULL, 'platform.tenant.read')` directly **before** invoking the queue, so an RBAC fixture failure is distinguishable from an RPC authorization failure.

**Assertion register** — the harness carries a numbered register (Assertion ID, purpose, inputs, expected result, expected SQLSTATE for rejection cases, observed result, pass/fail) matching the closure report, emitting `PASS382-CERT-001 PASS` … `PASS382-CERT-016 PASS`. The audit must verify all 16 identifiers appear **exactly once** in captured output — a zero exit code alone is not "16/16".

The harness also proves fixture rows **existed** before cleanup, so a trivially empty test cannot pass.

`auth.users` fixture shape is documented in the README before use: the exact columns the replayed Supabase schema requires (`instance_id`, `aud`, `role`, `email`, `encrypted_password`, `email_confirmed_at`, `raw_app_meta_data`, `raw_user_meta_data`, `created_at`, `updated_at` as applicable), deterministic values only, no live values copied. A fixture-insert failure is a failed gate, never grounds to weaken the test.

**Postcheck** `supabase/tests/pass_3_8_2_queue_certification_postcheck.sql` runs in a fresh session keyed on the shared constants; every relevant count must be zero across `auth.users`, `public.profiles` (trigger-created), `public.user_roles`, `public.tenants`, `public.tenant_onboarding`, `public.tenant_onboarding_steps`, plus any tenant-derived rows created by triggers.

**Wrapper** — postcheck runs even when the harness aborts before its explicit `ROLLBACK`:
```bash
harness_status=0
psql "$DATABASE_URL" --set=ON_ERROR_STOP=1 \
  --file=supabase/tests/pass_3_8_2_queue_certification.sql || harness_status=$?
psql "$DATABASE_URL" --set=ON_ERROR_STOP=1 \
  --file=supabase/tests/pass_3_8_2_queue_certification_postcheck.sql
postcheck_status=$?
test "$harness_status" -eq 0
test "$postcheck_status" -eq 0
```

**Verification against Commit A:** safety scans (harness absent from migration discovery; `supabase/migrations/` free of the two live UUIDs and `REM382 Tenant`, with the tombstone filename asserted as a registered comment-only tombstone); clean replay from a clean clone with pinned repo/branch/commit/migration count, runner and PostgreSQL versions, exit code, stderr, both onboarding tables present, RLS state, queue signature and security mode, final privileges; migration-history comparison showing version `20260726114237` still **applied**; harness 16/16 by identifier; failure-path postcheck; residue = 0 before rollback and after session end.

---

## Commit B — Verified closure candidate

Contains: matrix correction, canonical completion-report amendment (substantive amendment finished here), closure-report correction, repair-document update, provisional manifest, all other non-terminal documentation.

- **Closure report REM-382-003** → sequence remains non-persisted and registry-owned; the queue routine holds a parity-tested non-persisted ordering mirror used only for current-step calculation and filtering.
- **Onboarding matrix** §3.1/§3.2 corrected in place (`authenticated`: SELECT only; `service_role`: SELECT only; `anon`: none; RLS via `platform.tenant.read`; registry-owned sequence; SQL queue projection; date filters on `tenants.created_at`); Pass 3.8.1 co-location section preserved; dated decision record appended.
- **Canonical completion report** — body preserved; dated amendment appended noting `public.fn_tenant_onboarding_queue` performs filtering, sorting, exact count, and pagination server-side, with the mapper remaining the DTO boundary.
- **Closure report inventory** split into Modified / Created / previously generated (`src/integrations/supabase/types.ts`, byte-identical), plus:
```text
Protected source-code paths modified: 0
Approved cross-domain database dependency:
additive public.tenants SELECT policy for platform.tenant.read.
No tenant schema, lifecycle rule, member policy, INSERT policy or UPDATE policy
was removed or weakened.
```

**Verification against Commit B:** full test suite (all 512 baseline tests plus new ones; actual final total reported; nothing deleted, skipped, weakened, or marked todo), typecheck clean, production build green, runtime/protected-path diff review, documentation-link validation, JSON validation, and re-hash of the 0D set:
```text
Runtime surface drift: 0 files
Historical certification migration repaired: 1 approved tombstone
Test/governance surfaces: approved allow-list only
```

---

## Commit C — Terminal governance evidence

Explicit allow-list; anything outside it blocks closure:
```text
docs/15-governance/MIGRATION_REGISTRY.md
docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_20260726.md
docs/15-governance/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_MANIFEST.json
docs/50-audit-reports/MIGRATION_HISTORY_REPAIR_GATE38_PASS382_AUDIT_20260726.md
docs/60-engineering/PHASE3_GATE38_PASS382_REMEDIATION_CLOSURE_REPORT.md
```
The canonical completion report appears only if its terminal status also changes here; its substantive amendment lands in Commit B.

Acyclic hash graph:
```text
repair doc → closure report → matrix → completion report → tombstone
→ harness → postcheck → README → registry row appended
        ↓
manifest finalized (registry hash + all surface hashes;
                    audit path only, never audit content, never its own hash)
        ↓
terminal audit finalized (may record final manifest hash + registry hash)
```

Registry row `MIG-20260726-GATE38-PASS382-HISTORY-REPAIR` is additive; historical rows untouched. Every `TBD` hash is replaced with observed Git blob SHA and SHA-256.

Terminal audit records: approval evidence and approval commit SHA, 0C findings, environment reconciliation table, `Technical replay commit SHA = Commit A`, `Final verification commit SHA = Commit B`, replay result, migration-history comparison, 16 assertion identifiers each appearing exactly once, both residue scans and failure-path wrapper evidence, final test count, typecheck and build results, diff/protected-path review, runtime-immutability assertion, original blob SHA + SHA-256 + line/byte counts, final manifest hash, registry-row proof. Attribution is explicit:

```text
Runtime and application verification target: Commit B
Terminal governance-only diff verification target: Commit C
```
and it must not contain its own commit SHA, stating instead:

> This audit is contained in the terminal governance commit that follows the verified Commit B candidate.

**Commit C verification (no re-run of runtime gates, and none claimed):** `git diff --name-status <Commit-B>..<Commit-C>` against the allow-list, hash verification, link validation, JSON parsing, registry-reference validation, status consistency, and runtime files still byte-identical. No manifest-tracked file changes after the manifest is finalized; no evidence file changes after the audit is finalized.

---

### Closure

Only with every gate green does the status become `Pass 3.8.2 — COMPLETE AND CLOSED`. If the replay environment cannot start, checksum behavior cannot be determined, approval is absent, or any binding gate fails, the status stays `Pass 3.8.2 — COMPLETE, REMEDIATION REQUIRED` with the failing gate named. Then stop before Pass 3.8.3.
