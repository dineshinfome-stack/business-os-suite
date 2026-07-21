## Sprint 0.1 — Project Foundation Setup (v3)

Establish the Business OS application shell, routing, theming, providers, UI wrappers, and development standards on top of the existing TanStack Start + Lovable Cloud scaffold. No ERP modules, no business logic, no business tables.

### Stack alignment

TanStack Start v1 · file-based routing in `src/routes/` · Tailwind v4 (CSS-first in `src/styles.css`) · shadcn/ui (new-york). `src/pages/` will NOT be created.

### 1. Folder scaffold (`src/`)

```text
components/{ui,layout,common,forms,tables,charts,navigation}
contexts/   hooks/   services/   lib/   utils/
types/      constants/   config/   assets/   styles/
```
`.gitkeep` in empty folders. Routes stay in `src/routes/`.

### 2. Import aliases

Configure in `tsconfig.json` + `vite.config.ts`:
`@/*` (already), plus `@components`, `@lib`, `@utils`, `@hooks`, `@services`, `@types`, `@constants`, `@config`, `@contexts`. Prefer alias imports; ban deep relative paths (`../../../`) via ESLint `no-restricted-imports`.

### 3. Provider hierarchy (`__root.tsx` RootComponent)

```text
QueryClientProvider (from route context)
 └── ThemeProvider
      └── TooltipProvider
           └── GlobalErrorBoundary
                └── <Outlet />
                    <Toaster /> (sonner)
```
`QueryClient` created inside `getRouter()` (per-request, SSR-safe). Router keeps `defaultPreloadStaleTime: 0`.

### 4. Routing (TanStack file routes)

| URL | File | Guard |
|---|---|---|
| `/` | `index.tsx` — session-aware redirect to `/dashboard` or `/login` | public |
| `/login` | `login.tsx` (canonical auth entry) | public |
| `/auth` | thin redirect → `/login` (backward-compat only) | public |
| `/forgot-password` | `forgot-password.tsx` | public |
| `/reset-password` | `reset-password.tsx` | public |
| `/_authenticated/dashboard` | leaf | session required |
| `/_authenticated/settings` | leaf | session required |
| `/403` · `/500` | pages | public |
| 404 | root `notFoundComponent` (exists) | — |

### 5. Application layout

`AppShell` inside `_authenticated`: `AppSidebar` + `TopNav` + `Header` + `Breadcrumb` + `PageContainer` + `ContentArea` + `Footer`, renders `<Outlet />`. Built on shadcn `Sidebar` (collapsible icon), `SidebarTrigger` in header.

### 6. Navigation framework

`AppSidebar` with nested menu config, lucide icons, collapsible, search placeholder, Favorites + Recent placeholder sections. Menu: Dashboard, Administration (placeholder), Settings.

### 7. Theme system

`ThemeProvider` (`light | dark | system`) in `src/contexts/theme-context.tsx`, persisted to `localStorage` inside `useEffect` (SSR-safe, no hydration mismatch), toggles `class="dark"` on `<html>`. `ThemeToggle` in header.

### 8. UI wrappers (`src/components/common/`)

Thin BusinessOS wrappers over shadcn: Button, Input, Textarea, Checkbox, Switch, Select, Combobox, Card, Dialog, Drawer, Popover, Tabs, Accordion, Badge, Alert, Toast (sonner), Tooltip, Table, Pagination, Avatar, Skeleton, Loader, EmptyState. Install missing shadcn primitives.

### 9. Form framework

`src/components/forms/`: `FormField`, `FormError`, `FormSection`, `SubmitButton` using `react-hook-form` + `zod` with loading/error/success/disabled states. No business schemas.

### 10. Table framework

`src/components/tables/DataGrid.tsx` on `@tanstack/react-table`: sort, filter, global search, pagination, column visibility, bulk-select, export button (placeholder).

### 11. Dashboard shell

`/_authenticated/dashboard`: Welcome, Quick Actions, Recent Activity (empty), Notifications (empty), Widgets grid (skeletons). No data.

### 12. Error, loading, empty states

- **Global Error Boundary** (`src/components/common/ErrorBoundary.tsx`): fallback UI, `logger.error` hook, retry button (`router.invalidate()` + `reset()`). Wired in provider tree AND used by root `errorComponent`.
- Error pages: `403`, `500` reusable; 404 via root.
- Loaders: `PageLoader`, `ButtonLoader`, `TableLoader`, `CardSkeleton`, `FormSkeleton`.
- Empty states: `NoData`, `NoSearchResults`, `NoPermission`, `ComingSoon`, `UnderDevelopment`.

### 13. Notifications

Sonner `<Toaster />` in root. `src/lib/notify.ts` with `success/error/warning/info`.

### 14. HTTP client stub

`src/lib/http.ts`: `fetch`-based wrapper with `baseURL`, request/response interceptor slots, auth header injector placeholder, unified error normalization. No real endpoints wired.

### 15. Feature flags (semantics)

`src/config/features.ts`: flag map sourced from `import.meta.env.VITE_FEATURE_*`.
- `isFeatureEnabled(key)` — always available.
- **Env-derived flags are read-only in production.**
- `enableFeature(key)` / `disableFeature(key)` — **dev-only runtime overrides** (no-op with warning in prod builds).

### 16. State management policy

React Context only for shared UI state (theme, sidebar). **No Redux / Zustand / MobX / Jotai** in Sprint 0.1 — revisit when a business module justifies it. TanStack Query owns server state.

### 17. TanStack Query readiness

Confirm `QueryClient` in `getRouter()`, `QueryClientProvider` in root, `defaultPreloadStaleTime: 0`. Add `src/lib/query-keys.ts` (empty namespace convention). No business queries.

### 18. Services & dependency direction

- `src/services/` holds shared cross-cutting services (logging, http, notify, feature-flag reads).
- Services depend on abstractions declared in `src/types/` — **never import from future business modules**.
- **No circular dependencies.** Enforced via ESLint `import/no-cycle`.
- Dependency direction: `routes → components → services → lib/utils`. Never upward.

### 19. Constants · utils · config · types · logger

- `src/constants/`: `app.ts`, `theme.ts`, `pagination.ts`, `dates.ts`, `currency.ts`, `language.ts`.
- `src/utils/`: `date.ts`, `string.ts`, `number.ts`, `storage.ts`, `theme.ts`.
- `src/config/env.ts`: typed `VITE_*` accessor.
- `src/types/`: `common.ts`, `api.ts`.
- `src/lib/logger.ts`: leveled `info/warn/error/debug` (debug no-op in prod).

### 20. Testing foundation

Install & configure only — no tests authored:
- `vitest` + `@testing-library/react` + `@testing-library/jest-dom` + `jsdom`
- `vitest.config.ts`, `src/test/setup.ts`
- Coverage via `@vitest/coverage-v8`
- `playwright` devDep + `playwright.config.ts` placeholder (no specs)
- Scripts: `test`, `test:watch`, `test:coverage`, `test:e2e`

### 21. Standards

- TS strict already on; ban `any` via ESLint rule.
- Add ESLint plugins: `simple-import-sort`, `unused-imports`, `import/no-cycle`, `no-restricted-imports` (deep relative paths).
- Prettier unchanged.

### 22. Responsive · a11y · performance · metadata

- Sidebar collapses on mobile via `useIsMobile`.
- ARIA labels on icon buttons, focus-visible rings, Radix keyboard nav.
- TanStack auto code-splits routes.
- `__root.tsx` `head()`: title/description → "Business OS"; keep favicon; og/twitter defaults. No content-route metadata (no modules yet).

### Deliverables

Folder scaffold · aliases · providers (Query + Theme + Tooltip + ErrorBoundary + Toaster) · public + gated routes · auth UI · `/auth`→`/login` redirect · AppShell · theme toggle · shadcn wrappers · forms + tables · dashboard shell · 403/404/500 · loaders + empty states · sonner · HTTP client stub · feature flags with prod/dev semantics · logger · Query readiness · Vitest + Playwright configured · ESLint import + cycle rules · updated metadata.

### Out of scope

Auth backend, users/roles/permissions, orgs/companies/branches/FY, real widgets, notifications backend, AI, workflow, any ERP module, business tables, APIs, Redux/Zustand.

### Acceptance

App boots · `/login` renders · `/auth` redirects to `/login` · unauthenticated `/dashboard` redirects to `/login` · theme toggle persists across reload with no hydration warning · sidebar collapses · all wrappers importable via `@/…` aliases · demo form + demo grid render with skeletons · 403/404/500 reachable · Global Error Boundary catches a thrown component and shows retry · `vitest run` exits 0 with 0 tests · `bun run build` succeeds.

### Definition of Done

- Project builds successfully (`bun run build`).
- No TypeScript errors (strict mode).
- No ESLint errors, including `import/no-cycle` and alias rules.
- No console errors or hydration warnings during startup.
- No hardcoded secrets; all env access via `src/config/env.ts` or server-only boundaries.
- No `TODO` / `FIXME` outside explicitly approved placeholders (Favorites, Recent, Export, Widgets, Notifications empty states).
- Every new component has a clear, domain-neutral name and lives under the correct folder per §1 and §18.
- All new modules follow the alias import convention (no deep relative paths).
