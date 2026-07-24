# SPR-PLT-0001 — Super Admin Portal & Tenant Provisioning
## Discovery Sprint (No Implementation)

**Classification:** Platform Experience Sprint (PLT)
**Mode:** Repository-first, governance-driven
**Stop condition:** Two governance deliverables published; await Architecture Board approval before any implementation sprint is scoped or executed.

---

## Deliverable 1 — Repository Discovery Report

To be authored at `docs/50-audit-reports/SPR_PLT_0001_DISCOVERY_REPORT.md` using the standard 9-section report structure. Preliminary findings (verified against repo in this planning pass):

### D1. Authentication — EXISTS, REUSE
- Provider: Supabase Auth; contexts, login/callback/reset routes, bearer attacher, and `_authenticated` gate are already in place.
- **Conclusion:** No authentication work required. The portal mounts inside the existing protected subtree.

### D2. Authorization — EXISTS, REUSE
- Generated permission keys, `requirePermission` / `requireAnyPermission` / `requireAllPermissions` server helpers, `Can` component, and the governance-owned permission manifest are present.
- Existing `PLATFORM_TENANT_*`, `PLATFORM_COMPANY_*`, `PLATFORM_AUDIT_VIEW`, `PLATFORM_SETTINGS_MANAGE` cover most Super Admin surfaces.
- **Conclusion:** Reuse in full. Assess whether additional platform permissions are required for Super Admin dashboard access and tenant provisioning; if so, document proposed names as recommendations for Architecture Board review — no permission keys are defined in this sprint.

### D3. Routing & Shell — EXISTS, REUSE
- Shared AppShell (sidebar, breadcrumb, command palette, notifications, org switcher, theme toggle) and the navigation registry already host platform tenant/company nodes.
- **Conclusion:** Extend the existing shell and registry. No parallel admin shell.

### D4. UI Framework — EXISTS, REUSE
- DataGrid, Form primitives, EmptyState, Skeletons, ErrorBoundary, full shadcn set are available.
- **Gap:** No KPI / stat-tile / activity-list primitives; no charting library.

### D5. Tenant Module — EXISTS, REUSE
- Tenant lifecycle, CRUD, activation/suspension/archive, audit, events, and slug helpers exist; list and detail routes are in place.
- **Gap:** No guided multi-step provisioning experience that orchestrates tenant + primary company + admin invitation in one flow.

### D6. Licensing — DOES NOT EXIST, GAP
- No plans, subscriptions, licenses, quotas, or entitlements. Feature flags exist but are not a licensing model.
- **Conclusion:** Register licensing as the next available carry-forward identifier per repository convention. A dedicated future platform sprint should own the licensing engine; this sprint neither designs nor prescribes it.

### D7. Audit — EXISTS, REUSE
- Tenant and auth audit services plus `audit_logs` table and `PLATFORM_AUDIT_VIEW` permission are present.
- **Gap:** No admin-facing audit browser UI; a read-only recent-activity surface may be desirable on the Super Admin dashboard.

### D8. Dashboard Framework — PARTIAL
- The existing dashboard route is a member workspace stub. No shared KPI/stat/health-tile primitives.
- **Conclusion:** Existing dashboard primitives are insufficient; reusable dashboard presentation components will likely be required.

### D9. Architecture Constraints
- ADR-030 (auth model), ADR-032 (RBAC+ABAC), TanStack + Supabase integration standards, `_authenticated` subtree gating rules, permission manifest as source of truth, `createServerFn` for all app-internal server logic (no Edge Functions), migrations via the migration tool only.

### D10. Reuse Strategy Summary
Build the Super Admin Portal by composing existing shell, permissions, tenant services, audit, forms, and DataGrid. Net-new capabilities anticipated at a high level: (a) dashboard presentation primitives, (b) a provisioning orchestration capability that reuses existing tenant, company, and invitation services, (c) navigation registry entries, (d) licensing intent capture on the tenant record — pending assessment of whether existing tenant metadata suffices or schema evolution is required.

### D11. Out of Scope
Licensing enforcement engine; billing; plan catalog; platform-wide settings editor beyond what exists; new charting library; a full audit browser UI beyond recent activity.

### D12. Risks
- R1: Provisioning orchestration must reuse existing invitation flow — verify support for platform-initiated admin invites.
- R2: Dashboard KPIs (active tenants, storage, health) may require new aggregate read capabilities and appropriate permission gating.
- R3: Without a licensing engine, any provisioning-time plan capture is aspirational data with no enforcement.

---

## Deliverable 2 — Recommended Implementation Sequence (proposal only)

Capability-level recommendations. No file paths, permission names, component names, server-function names, or schema shapes are prescribed here — those are Architecture Board decisions and will be scoped in follow-on implementation sprints.

### Proposed Implementation Phase A — Platform Shell & Navigation
- Introduce a Super Admin surface within the existing protected subtree using existing routing conventions.
- Extend the navigation registry to expose the Super Admin group to eligible roles.
- Assess whether additional permission keys are required and, if so, record recommendations for Architecture Board review.
- Validation gates: type/lint clean; permission manifest governance respected; sidebar visibility gated correctly.

### Proposed Implementation Phase B — Super Admin Dashboard
- Provide a platform overview covering tenant status counts, recent activity, and placeholders for licensing/storage/health pending the licensing carry-forward.
- Determine whether reusable dashboard presentation primitives should be introduced or existing primitives extended.
- Identify whether new aggregate read capabilities are required or existing services can be composed.
- Validation gates: unit coverage for any new aggregates; visual smoke; permission gating verified.

### Proposed Implementation Phase C — Tenant Provisioning Experience
- Deliver a guided multi-step experience capturing tenant, primary company, primary admin, region/currency/timezone, and desired plan/license intent.
- Orchestrate existing tenant, company, and invitation capabilities; assess whether a new orchestration capability is required or existing services can be composed transactionally.
- Assess whether new provisioning-related permissions are required and record recommendations for Architecture Board review.
- Validation gates: happy-path and rollback coverage; permission gating verified.

### Proposed Implementation Phase D — Licensing Intent Capture (data only)
- Determine whether existing tenant metadata can store licensing intent or whether schema evolution is required.
- No enforcement, plans table, quotas, or billing in this sprint. Explicitly defer to the licensing carry-forward.
- Validation gates: schema/migration review if evolution is required; typed helpers covered by tests.

### Proposed Implementation Phase E — Testing & Quality
- Unit coverage for any new capabilities introduced in A–D.
- Integration and E2E remain disclosed capability gaps (CF-6 / CF-7) unchanged.
- Validation gates: full test run green; typecheck clean.

### Proposed Implementation Phase F — Sprint Acceptance & Closeout
- Governance-only. Standard six deliverables (Acceptance Review, Completion Report, SIP archive, Program Status Report, IMP CHANGELOG entry, and any updated carry-forwards).

---

## Stop Condition
Discovery Report (Deliverable 1) and Recommended Implementation Sequence (Deliverable 2) published as governance artifacts. **No implementation until Architecture Board approves.** After approval, each phase is scoped and prompted separately.
