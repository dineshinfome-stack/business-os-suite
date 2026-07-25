## Goal
Add a platform-wide **Companies** list route at `/platform/companies` that mirrors the pattern of `/platform/tenants` — a filterable list + "New company" dialog — and deep-links into the existing `/platform/companies/$companyId` detail page.

## Scope
1. **New route file** — `src/routes/_authenticated/platform/companies/index.tsx`
   - Mirrors `src/routes/_authenticated/platform/tenants/index.tsx` (React Query + `DataGrid` + shadcn Dialog).
   - `head()` with title/description for "Companies — Platform Administration".
   - Query: `useServerFn(listCompanies)` with no `tenantId` → returns companies across all tenants (the existing server fn already supports this; permission `platform.company.read` is enforced server-side).
   - Columns: Slug (link to `/platform/companies/$companyId`), Name, Tenant (show `tenant_id` for now, or resolve via a lightweight `listTenants` map for a friendlier label), Region, Lifecycle state (badge — reuse the same `LifecycleBadge` pattern from tenants), Created date.
   - "New company" dialog behind `<Can permission="platform.company.create">`, calling `createCompany`. Because `createCompany` requires `tenantId`, the dialog includes a **tenant selector** (populated from `listTenants`) plus slug + display name (and reasonable defaults for region/locale/timezone that the server fn already applies).
   - Invalidates `["platform", "companies"]` on success; toasts on success/error (sonner).
   - Gated on `auth.status === "authenticated"` like the tenants page.

2. **Navigation registry** — `src/lib/navigation/registry.ts`
   - Repoint `administration.platform.companies` from `route: "/platform/tenants"` to `route: "/platform/companies"` so the sidebar entry lands on the new page.
   - Leave `branches` and `financial_years` untouched (they remain company-scoped and continue to link into the tenant detail flow).

## Out of scope
- No changes to the existing `/platform/companies/$companyId` detail page.
- No new server functions or migrations — `listCompanies` / `createCompany` already exist and enforce the correct platform permissions.
- No changes to branches / financial-year nav entries.

## Verification
- Visit `/platform/companies` as a Platform Admin → list renders, row link opens the existing detail page.
- Sidebar "Companies" entry navigates to `/platform/companies`.
- "New company" dialog creates a company under the selected tenant and the list refreshes.
