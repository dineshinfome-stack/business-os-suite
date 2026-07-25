---
document: Phase 0 — Reuse Inventory, Duplicate Detection & Dependency Readiness
version: 1.0.0
last_reviewed: 2026-07-25
next_review: 2026-08-25
owner: Engineering Readiness
approval_status: Published
lifecycle_state: Active
supersedes: none
---

# Phase 0 — Reuse Inventory

Governed by `docs/15-governance/REUSE_BEFORE_BUILD_STANDARD.md`. Every SPR-MOD-001-001 implementation decision MUST cite an entry in this document.

Schema per row: **Component · Repository Evidence · Current Capability · Gap · Recommendation · Reuse Confidence · Justification · Suggested Owner**.

Recommendations: REUSE · EXTEND · REFACTOR · DEFER · CREATE. Reuse Confidence: High · Medium · Low. Suggested Owner is advisory only and does not modify repository ownership or governance responsibilities.

## 1. Layouts

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| App shell | `src/components/layout/AppShell.tsx` | Wraps non-platform authenticated routes with header/sidebar | None for MOD-001 (MOD-001 uses PlatformShell) | DEFER | High | Not needed for SPR-MOD-001-001 platform surface | Platform UI |
| Platform shell | `src/components/platform/PlatformShell.tsx` | ServiceNow-inspired dark shell for `/platform/*` | None | REUSE | High | Already hosts current tenant/company screens | Platform UI |
| `_authenticated` gate | `src/routes/_authenticated.tsx` | `ssr:false` + `getUser` guard; chooses PlatformShell vs AppShell by pathname | None | REUSE | High | Matches TanStack Supabase pattern | Security |
| Dashboard template scaffold | `src/dashboard/template/*` | Registry-driven dashboard shell (header, widgets, quick actions, notifications, empty state) | Consumer wiring for platform dashboard sections | EXTEND | Medium | Scaffold in place; connect concrete widgets sprint-by-sprint | Platform UI |

## 2. Navigation

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Registry | `src/lib/navigation/registry.ts` | Immutable `NavItem[]` with stable `nav_id` contract | Additive entries per new provisioning surface | EXTEND | High | New surfaces are additive, not restructural | Platform UI |
| Sidebar (platform) | `src/components/platform/PlatformSidebar.tsx` | Searchable sidebar with pinned/unpinned popup | None | REUSE | High | Already consumes the registry | Platform UI |
| Sidebar (app) | `src/components/navigation/AppSidebar.tsx` | Tenant sidebar | None (non-MOD-001 surface) | DEFER | High | Not on the platform path | Platform UI |
| Command Palette | `src/components/navigation/CommandPalette.tsx` + `src/hooks/navigation/useCommandPalette.tsx` | Cmd/Ctrl+K palette | Register new commands per new route | EXTEND | High | Extension via registry additions | Platform UI |
| Breadcrumb | `src/components/navigation/Breadcrumb.tsx` | Route-derived breadcrumbs | None | REUSE | High | — | Platform UI |
| Search | `src/lib/navigation/search.ts`, `src/hooks/search/*`, `src/lib/search/*` | Nav + database + registry search providers | None | REUSE | High | — | Platform UI |

## 3. Pages

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Login | `src/routes/login.tsx` | Email/password + role-based post-login routing | None for MOD-001 | REUSE | High | — | Security |
| Platform landing | `src/routes/_authenticated/platform/index.tsx` | Landing surface | Populate provisioning tiles in Phase 1 | EXTEND | Medium | Landing is a shell; content is sprint work | Platform UI |
| Platform dashboard | `src/routes/_authenticated/platform/dashboard.tsx` | KPI control center scaffold | Wire provisioning KPIs in Phase 1 | EXTEND | Medium | KPIs land with the provisioning schema | Platform UI |
| Tenants list | `src/routes/_authenticated/platform/tenants/index.tsx` | List + create tenants | Extend with provisioning lifecycle actions | EXTEND | High | Existing CRUD is the correct extension point | Platform Backend |
| Tenant detail | `src/routes/_authenticated/platform/tenants/$tenantId.tsx` | Tenant view with lifecycle actions | Add provisioning status pane | EXTEND | High | Existing lifecycle-state UI is the target surface | Platform Backend |
| Companies list | `src/routes/_authenticated/platform/companies/index.tsx` | Company-scoped list | None for MOD-001 provisioning (tenant-scoped) | DEFER | High | Company provisioning is downstream sprint work | Platform Backend |
| Auth callback / password reset | `src/routes/auth.callback.tsx`, `forgot-password.tsx`, `reset-password.tsx` | Standard flows | None | REUSE | High | — | Security |
| Docs | `src/routes/docs.tsx`, `docs.$.tsx`, `docs.index.tsx` | Markdown docs viewer | None | REUSE | High | — | Platform UI |

## 4. Shared Components

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| shadcn/ui primitives (45) | `src/components/ui/*` | Full primitive set (button, dialog, table, form, tabs, toast, etc.) | None | REUSE | High | — | Platform UI |
| DataGrid | `src/components/tables/DataGrid.tsx` | @tanstack/react-table wrapper | None | REUSE | High | — | Platform UI |
| Forms | `src/components/forms/{Form,FormField,SubmitButton}.tsx` | RHF + Zod resolver wrapper | None | REUSE | High | — | Platform UI |
| Empty/Error/Loader | `src/components/common/*` | EmptyState, ErrorBoundary, Loader, Skeletons | None | REUSE | High | — | Platform UI |
| Notifications | `src/components/notifications/*` + `sonner` | Toast + notification center | None | REUSE | High | — | Platform UI |
| Settings primitives | `src/components/settings/{SettingField,SettingsSection}.tsx` | Setting form patterns | None (may EXTEND when provisioning config lands) | REUSE | Medium | Pattern is generic | Platform UI |
| Charts | `src/components/charts/*` + `recharts` | Chart wrappers | Wire provisioning metrics later | DEFER | High | Not required for SPR-MOD-001-001 core | Platform UI |
| Header slots | `src/components/layout/HeaderSlots.tsx`, `src/lib/header/slot-registry.ts` | Pluggable header regions | Register new header actions per route | EXTEND | High | — | Platform UI |

## 5. Dashboard Template

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Template shell | `src/dashboard/template/DashboardTemplate.tsx` + siblings | Registry-driven dashboard scaffold | Concrete widget registration for provisioning | EXTEND | Medium | Consumer wiring only | Platform UI |
| Reusable widgets | `src/components/dashboard/widgets/{StatCard,ActivityFeed,Progress,Table}.tsx` | Presentational widgets | Provide provisioning-specific data adapters | REUSE | High | Data comes from server fns | Platform UI |
| `WidgetCard` | `src/components/dashboard/WidgetCard.tsx` | Generic container | None | REUSE | High | — | Platform UI |

## 6. Authentication

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Auth context | `src/contexts/auth-context.tsx` | Session state, status | None | REUSE | High | — | Security |
| Permissions context | `src/contexts/permissions-context.tsx` + `Can.tsx` | Client-side gate | None | REUSE | High | — | Security |
| `has_role` SQL fn + `user_roles` | migrations | Server-side RBAC | Add roles as MOD-001 defines them | EXTEND | High | Additive to enum | Security |
| Auth-fingerprint / audit | `src/lib/auth-fingerprint.ts`, `src/lib/auth-audit.ts` | Session fingerprint + audit trail | None | REUSE | High | — | Security |
| Post-login routing | `src/routes/login.tsx` `resolvePostLoginPath` | Role → landing path | Add rows for new roles when they land | EXTEND | Medium | Extract to `lib/auth/post-login-routing.ts` when third role appears | Security |

## 7. Supabase Integration

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Browser client | `src/integrations/supabase/client.ts` | RLS-bound Supabase client | None | REUSE | High | — | Infrastructure |
| Auth middleware | `src/integrations/supabase/auth-middleware.ts` | `requireSupabaseAuth` for server fns | None | REUSE | High | — | Infrastructure |
| Auth attacher | `src/integrations/supabase/auth-attacher.ts` | Bearer attachment | None | REUSE | High | — | Infrastructure |
| Org middleware | `src/integrations/supabase/org-middleware.ts` | Tenant/org context on server calls | None | REUSE | High | — | Infrastructure |
| Admin client | `src/integrations/supabase/client.server.ts` | Service-role client | None (do not import at module scope) | REUSE | High | — | Infrastructure |
| Migrations | `supabase/migrations/*` (30 files) | Schema through SPR-MOD-001-002 | New provisioning tables land as new migrations | EXTEND | High | Additive per DATABASE_STANDARD | Data |

## 8. Services / Server Functions

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Tenants | `src/lib/tenants/*.functions.ts`, `slug.ts`, lifecycle tests | List/create/lifecycle transitions for tenants | Provisioning-specific fns land here | EXTEND | High | Owner directory already exists | Platform Backend |
| Organizations (companies) | `src/lib/organizations/*` + `organizations.functions.ts` | Company CRUD + lifecycle | Consolidate the two locations later | EXTEND | Medium | Duplicate location noted (see §Duplicates) | Platform Backend |
| Branches | `src/lib/branches/*` | Branch CRUD + lifecycle | None for MOD-001 provisioning | DEFER | High | Downstream scope | Platform Backend |
| Financial Years | `src/lib/financial-years/*` | FY CRUD + lifecycle | None for MOD-001 provisioning | DEFER | High | Downstream scope | Platform Backend |
| Auth server fns | `src/lib/auth.functions.ts`, `authorization.functions.ts`, `authorization.server.ts` | Auth + authz server surface | None | REUSE | High | — | Security |
| Feature flags | `src/lib/feature-flags.functions.ts` | Flag CRUD & read | None | REUSE | High | — | Infrastructure |
| Settings | `src/lib/settings.functions.ts`, `settings-validation.ts` | Settings CRUD | None | REUSE | High | — | Infrastructure |
| Notifications | `src/lib/notifications/*` | In-app provider + registry + service fn | None | REUSE | High | — | Infrastructure |
| Search | `src/lib/search/*` | Registry + database providers | None | REUSE | High | — | Platform UI |

## 9. Hooks

| Component | Repository Evidence | Current Capability | Gap | Recommendation | Reuse Confidence | Justification | Suggested Owner |
|---|---|---|---|---|---|---|---|
| Navigation hooks | `src/hooks/navigation/*` | `useNavigation`, `useBreadcrumbs`, `useFavorites`, `useRecentPages`, `useNavPreferences`, `useCommandHistory`, `useCommandPalette`, `useModuleLauncher`, `usePinnedNav` | None | REUSE | High | — | Platform UI |
| Tenants | `src/hooks/tenants/useCurrentTenant.ts` | Current tenant fetch (guarded on auth) | None | REUSE | High | — | Platform Backend |
| Settings | `src/hooks/settings/{useFeatureFlag,useSettings}.ts` | Client-facing hooks | None | REUSE | High | — | Infrastructure |
| Search | `src/hooks/search/*` | Search + suggestions + recent | None | REUSE | High | — | Platform UI |
| Notifications | `src/hooks/notifications/useNotifications.ts` | Notification stream | None | REUSE | High | — | Infrastructure |
| Header shortcuts | `src/hooks/header/useHeaderShortcuts.ts` | Keyboard shortcuts | None | REUSE | High | — | Platform UI |
| Platform state | `src/hooks/platform/usePlatformNavState.ts`, `useSecondaryNavTab.tsx`, `useSidebarPopup.tsx` | Platform shell state | None | REUSE | High | — | Platform UI |
| `use-mobile` | `src/hooks/use-mobile.tsx` | Breakpoint | None | REUSE | High | — | Platform UI |

## 10. Contexts

| Component | Evidence | Recommendation | Reuse Confidence | Owner |
|---|---|---|---|---|
| `auth-context` | `src/contexts/auth-context.tsx` | REUSE | High | Security |
| `permissions-context` | `src/contexts/permissions-context.tsx` | REUSE | High | Security |
| `header-context` | `src/contexts/header-context.tsx` | REUSE | High | Platform UI |
| `org-context` | `src/contexts/org-context.tsx` | REUSE | High | Platform Backend |
| `theme-context` | `src/contexts/theme-context.tsx` | REUSE | High | Platform UI |

## 11. Utilities

| Component | Evidence | Recommendation | Reuse Confidence | Owner |
|---|---|---|---|---|
| `utils/{date,number,string,storage,theme}.ts` | `src/utils/*` | REUSE | High | Platform UI |
| `constants/{app,auth,currency,dates,language,pagination,theme}.ts` | `src/constants/*` | REUSE | High | Platform UI |
| `lib/http.ts`, `lib/logger.ts`, `lib/correlation.ts`, `lib/notify.ts` | `src/lib/*` | REUSE | High | Infrastructure |
| `lib/sanitize-next-path.ts` | `src/lib/sanitize-next-path.ts` | REUSE | High | Security |
| `lib/error-page.ts`, `lib/error-capture.ts`, `lib/lovable-error-reporting.ts` | `src/lib/*` | REUSE | High | Infrastructure |

## 12. Styling

| Component | Evidence | Recommendation | Reuse Confidence | Owner |
|---|---|---|---|---|
| Tailwind v4 config | `src/styles.css` (via `@tailwindcss/vite`) | REUSE | High | Platform UI |
| Theme tokens (light/dark + platform `--sn-*`) | `src/styles.css`, `src/constants/theme.ts` | REUSE | High | Platform UI |
| Icons | `lucide-react` | REUSE | High | Platform UI |
| Component variants | `class-variance-authority` + `tailwind-merge` + `clsx` | REUSE | High | Platform UI |

---

# Duplicate & Superseded Detection

Recorded, not deleted, per Phase 0 stop rule.

| Item | Evidence | Classification | Successor | Existing Finding Reference |
|---|---|---|---|---|
| Two dashboard scaffolds | `src/dashboard/template/*` vs `src/components/dashboard/*` | Active (both intentional; different scopes) | Template = scaffold; components = widgets | `PH0-STRUCT-002` (Technical Debt) |
| Organizations module dual location | `src/lib/organizations.functions.ts` vs `src/lib/organizations/*` | Duplicate | Consolidate into folder | `PH0-STRUCT-003` (Technical Debt) |
| Sidebar × 2 | `PlatformSidebar` vs `AppSidebar` | Active (intentional per shell) | — | None (by design) |
| `useCommandPalette` re-export shim | `src/hooks/navigation/useCommandPalette.ts` re-exports `.tsx` | Active (intentional import-path stability) | — | None |
| `super_admin` role key vs "Platform Admin" label | `NAV_REGISTRY` `super_admin` id / login role check | Legacy label, Active id | Label = "Platform Admin"; key retained | Recorded in prior chat (role rename) |
| Retired nav ids | `src/lib/navigation/retired.ts` | Superseded (retired per registry contract) | Active successors in `registry.ts` | Registry contract at file head |
| Retired routes: `/tenant`, `/settings`, `/settings/platform`, `/tenant/accept` | Deleted in prior sprints | Superseded | Redirects folded into `/platform/*` | Prior chat entries |

No duplicate authentication systems, Supabase clients, or command palettes detected.

---

# Dependency Readiness

For each shared platform dependency required by MOD-001: **Availability** (Exists / Missing / Partial / Not Required) and **Implementation Risk** (Low / Medium / High).

| Dependency | Availability | Implementation Risk | Evidence |
|---|---|---|---|
| Authentication | Exists | Low | `src/integrations/supabase/*`, `src/contexts/auth-context.tsx`, `_authenticated` gate |
| RBAC | Exists | Low | `user_roles` + `has_role` in migrations; `permissions-context`, `Can`, `authorization.*` |
| Navigation | Exists | Low | `src/lib/navigation/*`, registry, search, command palette |
| Configuration | Exists | Low | `src/config/{env,features}.ts`, `feature-flags.functions.ts`, `settings.functions.ts` |
| Logging | Exists | Low | `src/lib/logger.ts`, `src/lib/correlation.ts` |
| Notifications | Exists | Low | `src/lib/notifications/*`, `sonner`, `src/components/notifications/*` |
| Feature flags | Exists | Low | `src/lib/feature-flags.functions.ts`, `src/hooks/settings/useFeatureFlag.ts` |
| Audit infrastructure | Partial | Medium | `src/lib/auth-audit.ts`, per-domain `audit.ts` (branches/organizations/tenants/financial-years) — MOD-001 provisioning audit events must be added by Phase 1 |
| Error handling | Exists | Low | `src/lib/error-capture.ts`, `src/lib/error-page.ts`, `src/lib/lovable-error-reporting.ts`, `ErrorBoundary` |

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-25 | Engineering Readiness | Initial reuse inventory, duplicate detection, and dependency readiness. |
