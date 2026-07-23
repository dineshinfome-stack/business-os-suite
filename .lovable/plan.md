## SPR-MOD-001-002 — Phase 1: Database Foundation

Execute the SIP tasks that belong to the DB layer (SIP-001 → SIP-009). No backend, UI, tests, or closure artefacts in this phase.

### Repository verification rule (applies to every task below)

Before creating any migration, helper, trigger, RPC, or permission seed, inspect the repository for an equivalent implementation from SPR-MOD-001-001. Extend the existing implementation wherever possible. Only create a new object when no suitable implementation exists. Whenever this plan references a specific helper name or pattern, treat it as: **reuse the existing repository implementation if present; if no equivalent helper exists, implement it using the approved SPR-001 architectural pattern rather than introducing a new pattern.**

### Approach

Reuse SPR-001 patterns: `private.fn_*` helpers, `SECURITY DEFINER` RPCs with fixed `search_path`, `platform_admin`-gated via `private.fn_is_platform_admin()`, `citext` slugs via `private.fn_normalize_slug`, immutable-column guard trigger, back-fill in place, resilient audit-on-denial logging, idempotent transitions with `FOR UPDATE`. Permissions are seeded directly in the migration (same pattern as tenant permissions in `20260723172755_*.sql`).

### Migrations (three files, next-in-sequence Lovable timestamps)

**001 Schema Evolution — `organization_lifecycle_schema.sql`** (SIP-001, 002, 003)

- Enums: `public.company_lifecycle_state` (`created|active|inactive|archived`), `public.branch_lifecycle_state` (`active|archived`), `public.financial_year_lifecycle_state` (`created|open|closed|archived`).
- `public.organizations`: add `lifecycle_state` (default `active` for existing rows via back-fill), `is_default`, `slug citext`, `region`, `default_locale`, `timezone`, `activated_at`, `deactivated_at`, `archived_at`, `created_by`. Back-fill `slug` from existing `slug`/`name` using the SPR-001 slug back-fill pattern (reuse if present); then `NOT NULL` + `UNIQUE (tenant_id, slug)` + partial `UNIQUE (tenant_id) WHERE is_default`. Immutable-column trigger on `id`, `tenant_id`, `slug`.
- `public.branches`: add `lifecycle_state` (default `active`), `archived_at`. Keep existing `UNIQUE (organization_id, code)` and default partial index. Immutable-column trigger on `id`, `tenant_id`, `organization_id`, `code`.
- `public.financial_years`: add `lifecycle_state` (default `open` for existing placeholder rows), `is_default` (default `true` for existing single-per-org rows), `opened_at`, `closed_at`, `archived_at`. Add partial `UNIQUE (organization_id) WHERE is_default`. Add non-overlap constraint via `EXCLUDE USING gist (organization_id WITH =, daterange(start_date, end_date, '[]') WITH &&) WHERE (lifecycle_state IN ('created','open'))` — `btree_gist` extension is enabled from Sprint 0.2. Leave existing `is_placeholder` column untouched by RPCs.
- Grants unchanged (already `authenticated`/`service_role`). RLS remains from SPR-001; no policy loosening in this migration.

**002 Lifecycle RPCs — `organization_lifecycle_rpcs.sql`** (SIP-004, 005, 006, 007)

- Lifecycle guards: `private.fn_assert_company_lifecycle_transition`, `_branch_`, `_financial_year_` — pure `IMMUTABLE` plpgsql mirroring PRD state matrices; raise `check_violation` on illegal/no-op transitions.
- Denial logging: reuse the existing SPR-001 resilient denial-logging helper if present; otherwise implement using the SPR-001 pattern (INSERT into `public.audit_logs` inside an exception-swallowing block so denial never suppresses the outer `RAISE`).
- Company RPCs (all `SECURITY DEFINER`, `SET search_path = public`, `REVOKE ALL … FROM PUBLIC, anon` + `GRANT EXECUTE TO authenticated`, `platform_admin` check up front, `SELECT … FOR UPDATE` on the target row, idempotent — return early when target state already reached):
  - `private.fn_create_company(_tenant_id, _slug, _display_name, _region, _default_locale, _timezone) → uuid`
  - `private.fn_activate_company(_id) → void`
  - `private.fn_deactivate_company(_id) → void`
  - `private.fn_archive_company(_id) → void` — rejects when any FY with `lifecycle_state = 'open'` exists for the company.
  - `private.fn_set_default_company(_id) → void` — clears prior default in same tenant then sets.
- Branch RPCs: `_create_branch`, `_update_branch`, `_archive_branch`, `_set_default_branch` — same conventions; requires parent company `lifecycle_state = 'active'` on create.
- Financial-year RPCs: `_create_financial_year`, `_open_financial_year`, `_close_financial_year`, `_archive_financial_year`, `_set_default_financial_year` — open transition relies on the EXCLUDE constraint to enforce non-overlap atomically. Close is only allowed from `open`. Archive only from `closed`.

**003 Permission Seed — `organization_permissions.sql`** (SIP-008)

- Insert the **17** permission keys into `public.permissions` (idempotent `ON CONFLICT (key) DO NOTHING`, matching the tenant seed pattern):
  - `platform.company.{read, create, activate, deactivate, archive, set_default}` — 6
  - `platform.branch.{read, create, update, archive, set_default}` — 5
  - `platform.financial_year.{read, create, open, close, archive, set_default}` — 6
- Grant every key to the `platform_admin` role via `public.role_permissions` `ON CONFLICT DO NOTHING`.

### Post-migration

- Append the same 17 keys to `docs/15-governance/permission-catalog.manifest.yaml` (append-only per its governance rule) so the DB seed and the generator stay in sync.
- Regenerate `src/lib/generated/permission-keys.ts` via `bun run gen:permissions` (SIP-009).

### Validation before stop

- `bunx tsgo --noEmit` clean (permission-keys regen is additive constants only).
- `supabase--linter` — expect no new findings; accepted R-074 unchanged.
- SQL structural sanity via `supabase--read_query` on `information_schema` for the new columns, enums, constraints, and `pg_proc` for the new RPCs. No runtime RPC execution / no fabricated end-to-end evidence.

### Explicitly out of Phase 1

Server functions (`src/lib/organizations/**`, `branches/**`, `financial-years/**`), UI routes, unit/integration tests, Playwright, event catalog docs, API docs, Completion Report, Acceptance Review, Program Status, IMP CHANGELOG, SIP archival. These are Phase 2+.

### Deliverables at stop

- 3 migration files under `supabase/migrations/`
- Updated `docs/15-governance/permission-catalog.manifest.yaml` (+17 keys, append-only)
- Regenerated `src/lib/generated/permission-keys.ts`
- Brief implementation summary listing completed SIP task IDs (SIP-001 … SIP-009), modified files, validation results, and Phase 2 recommendation

### Risks / blockers to flag if hit

- `btree_gist` missing → stop and raise, do not silently `CREATE EXTENSION`.
- Existing `organizations` rows with duplicate normalized slugs per tenant → back-fill collision-suffixes using the SPR-001 pattern.
- Any existing FY row overlapping another in the same org → EXCLUDE will fail on creation; if so, stop and report — do not mutate data to force it.
