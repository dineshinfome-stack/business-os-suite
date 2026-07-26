# Phase 2 — Implementation Audit (SPR-MOD-001-001)

**Companion to:** `PHASE2_FINAL_CERTIFICATION.md`
**Purpose:** Gate-by-gate file-level evidence for the Tenant Registry implementation.
**Scope:** Audit only — no code was changed while producing this document.

---

## 1. Gate-by-Gate Evidence

### Gate 1 — Tenant Registry Migration

**Files created**
- `supabase/migrations/20260725165518_da545574-8f20-4811-8f97-54ee31ace3ef.sql`

**Change content**
- New enum `public.tenant_provisioning_status` (`not_started`, `in_progress`, `provisioned`, `failed`), created inside a `pg_type` existence guard.
- `ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS` × 10: `code`, `primary_contact_name`, `primary_contact_email`, `primary_contact_phone`, `billing_email`, `primary_domain`, `notes`, `provisioning_status`, `dedicated_database_ref`, `subscription_ref`.
- Partial CI unique indexes: `tenants_code_unique_ci`, `tenants_primary_domain_unique_ci`.
- Query indexes: `tenants_display_name_lower_idx`, `tenants_lifecycle_state_idx`, `tenants_provisioning_status_idx`, `tenants_created_at_id_idx`.
- Grants re-issued: `SELECT, INSERT, UPDATE → authenticated`; `ALL → service_role`.
- `COMMENT ON COLUMN` documenting ownership boundaries for the Phase 3-owned columns.

**Verification**
| Assertion | Evidence |
|---|---|
| Idempotent | every DDL guarded with `IF NOT EXISTS` / `pg_type` check |
| Backward compatible | only `provisioning_status` is NOT NULL, and it carries a default |
| No RLS change | file contains no `POLICY` or `ENABLE ROW LEVEL SECURITY` statement |
| No grant widening | `anon` is not granted anything |

**Result: PASS**

---

### Gate 2 — Validators, Server Functions, Audit

**Files created**
- `src/lib/tenants/registry.ts` — validators and column mapping
- `src/lib/tenants/__tests__/registry.test.ts` — 31 tests

**Files modified**
- `src/lib/tenants/tenants.functions.ts` — added `updateTenant`, `searchTenants`, `getTenantRegistryStats`
- `src/lib/generated/permission-keys.ts` — `platform.tenant.*` keys
- `docs/15-governance/permission-catalog.manifest.yaml` — catalog source of truth

**Exported surface (`tenants.functions.ts`)**

| Function | Method | Permission |
|---|---|---|
| `listTenants` | GET | `platform.tenant.read` |
| `getTenant` | GET | `platform.tenant.read` |
| `createTenant` | POST | `platform.tenant.create` |
| `activateTenant` | POST | `platform.tenant.activate` |
| `suspendTenant` | POST | `platform.tenant.suspend` |
| `archiveTenant` | POST | `platform.tenant.archive` |
| `updateTenant` | POST | `platform.tenant.update` |
| `searchTenants` | GET | `platform.tenant.read` |
| `getTenantRegistryStats` | GET | `platform.tenant.read` |

**Validators (`registry.ts`)**
`TenantCodeSchema`, `EmailSchema`, `PhoneSchema`, `DomainSchema`,
`ProvisioningStatusSchema`, `UpdateTenantMetadataSchema`, `SearchTenantsSchema`,
`toTenantColumnPatch()`.

**Result: PASS**

---

### Gate 3 — Registry UI

**Files modified**
- `src/routes/_authenticated/platform/tenants/index.tsx` — server-side search, lifecycle and provisioning filters, pagination
- `src/routes/_authenticated/platform/tenants/$tenantId.tsx` — metadata detail and edit dialog

**Reused, not rebuilt**
Platform shell, sidebar, `Dialog`/`Table`/`Badge` shadcn primitives, enterprise theme
tokens, `_authenticated` auth gate.

**Verification**
| Assertion | Evidence |
|---|---|
| Filtering happens server-side | UI calls `searchTenants`; no full-table client filter |
| Edit validated before submit | form bound to `UpdateTenantMetadataSchema` |
| RBAC enforced twice | UI gates controls on permission keys; server functions re-check |

**Result: PASS**

---

### Gate 4 — Dashboard Widget

**Files created**
- `src/dashboard/template/widgets/TenantRegistryWidget.tsx` (widget ID `platform.tenant.registry`)
- `src/dashboard/template/widgets/__tests__/TenantRegistryWidget.test.tsx` (9 tests)

**Files modified**
- `src/routes/_authenticated/platform/dashboard.tsx` — registers `platform.tenant.registry`

**Files removed**
- `src/dashboard/template/widgets/PlatformFoundationWidget.tsx` (Phase 1 placeholder, superseded)

**Verification**
| Assertion | Evidence |
|---|---|
| Single registration | one occurrence of `"platform.tenant.registry"` in `dashboard.tsx` |
| One request per mount | asserted by the "issues a single statistics request per mount" test |
| All states covered | loading / empty / error+retry tests present |
| Placeholder fully removed | repository-wide scan returns zero `PlatformFoundationWidget` references |

**Result: PASS**

---

## 2. Consolidated File Ledger

**Created**
```
supabase/migrations/20260725165518_da545574-….sql
src/lib/tenants/registry.ts
src/lib/tenants/__tests__/registry.test.ts
src/dashboard/template/widgets/TenantRegistryWidget.tsx
src/dashboard/template/widgets/__tests__/TenantRegistryWidget.test.tsx
docs/60-engineering/PHASE2_GATE4_DASHBOARD_SUMMARY.md
docs/60-engineering/PHASE2_FINAL_CERTIFICATION.md
docs/60-engineering/PHASE2_IMPLEMENTATION_AUDIT.md
```

**Modified**
```
src/lib/tenants/tenants.functions.ts
src/lib/generated/permission-keys.ts
docs/15-governance/permission-catalog.manifest.yaml
src/routes/_authenticated/platform/tenants/index.tsx
src/routes/_authenticated/platform/tenants/$tenantId.tsx
src/routes/_authenticated/platform/dashboard.tsx
src/lib/navigation/registry.ts
```

**Removed**
```
src/dashboard/template/widgets/PlatformFoundationWidget.tsx
```

---

## 3. Verification Evidence

| Command | Output | Result |
|---|---|---|
| `bun run build` | `✓ built in 2.78s`, Worker + wrangler config generated | PASS |
| `tsgo --noEmit` | exit 0, no diagnostics | PASS |
| `bunx vitest run` | `Test Files 11 passed (11)` / `Tests 89 passed (89)` | PASS |

**Test distribution**
| File | Tests |
|---|---|
| `src/lib/tenants/__tests__/registry.test.ts` | 31 |
| `src/lib/tenants/__tests__/lifecycle.test.ts` | 7 |
| `src/lib/tenants/__tests__/slug.test.ts` | 4 |
| `src/dashboard/template/widgets/__tests__/TenantRegistryWidget.test.tsx` | 9 |
| Other pre-existing suites (financial-years, organizations, branches, search ×2, navigation, smoke) | 38 |
| **Total** | **89** |

**Integrity scans**
| Scan | Result |
|---|---|
| `PlatformFoundationWidget` references | 0 |
| `platform.tenant.registry` declarations | 1 declaration, 1 registration |
| Duplicate server-function names | 0 |
| Duplicate `platform.tenant.*` permission keys | 0 |
| Forbidden dependency imports (provisioning / worker / realtime / notification services) | 0 |

---

## 4. Lessons Learned

1. **Use the configured test runner.** `bun test` bypasses the Vitest jsdom
   environment and produces false DOM failures. `bunx vitest run` is the gate command.
2. **Reserve opaque columns early.** Storing `provisioning_status` and
   `dedicated_database_ref` as opaque values in Gate 1 lets Phase 3 land without a
   schema migration or registry rewrite.
3. **Retire placeholders only after a reference scan.** Deleting
   `PlatformFoundationWidget` was safe because the scan proved zero live references first.
4. **Re-issue grants explicitly in additive migrations.** Making grants visible in the
   migration removed ambiguity during the security audit.
5. **Keep DB shape behind a mapper.** `toTenantColumnPatch()` meant the UI never
   encoded column names, keeping Gate 3 insulated from Gate 1 details.

---

## 5. Definition of Done

All fourteen Gate 5 DoD items are satisfied; see
`PHASE2_FINAL_CERTIFICATION.md` §10 for the itemized checklist.

**Phase 2 (SPR-MOD-001-001) is formally CLOSED.**
Development stops here. Phase 3 — Provisioning Engine awaits explicit authorization.
