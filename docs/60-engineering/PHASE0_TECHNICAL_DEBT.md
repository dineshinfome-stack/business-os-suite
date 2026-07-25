---
document: Phase 0 — Technical Debt & Architectural Alignment Report
version: 1.0.0
last_reviewed: 2026-07-25
next_review: 2026-08-25
owner: Engineering Readiness
approval_status: Published
lifecycle_state: Active
supersedes: none
---

# Phase 0 — Technical Debt & Architectural Alignment Report

Covers Folder Structure (2), Authentication (5), Routing (6), UI Framework (7), Security (9), Code Quality (10), Testing (11). Read-only. No fixes.

Dispositions: **Blocker** · **Pre-Phase-2 Recommendation** · **Future Improvement** · **Technical Debt**.

## 2. Folder Structure

Existing top-level layout under `src/`:

```
components/    ui, layout, platform, dashboard, navigation, forms, tables, auth, common, charts,
               notifications, search, settings
contexts/      auth, header, org, permissions, theme
dashboard/     template/ (Enterprise Dashboard Template scaffold)
hooks/         header, navigation, notifications, platform, search, settings, tenants
integrations/  supabase/ (client, client.server, auth-middleware, auth-attacher, org-middleware),
               lovable/
lib/           auth-*, authorization*, branches/, financial-years/, organizations/, tenants/,
               navigation/, notifications/, search/, header/, generated/
routes/        __root, _authenticated, _authenticated/platform/**, auth.*, docs.*, login, index, 403, 500
utils/         date, number, string, storage, theme
constants/     app, auth, currency, dates, language, pagination, theme
```

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-STRUCT-001` — Layout matches EEMP Ch. 04 conventions | Info | Folders align with `tanstack-start`, `tanstack-route-architecture`, `server-side-modern` | Ready for MOD-001 continuation | None | Future Improvement (n/a) |
| `PH0-STRUCT-002` — Overlap between `src/dashboard/template/` and `src/components/dashboard/` | Low | Two dashboard scaffolds coexist | Confusion risk when a new sprint adds a widget | Document scope of each (template = tenant/module-level shell; components/dashboard = reusable widget primitives) — see Reuse Inventory | Technical Debt |
| `PH0-STRUCT-003` — `lib/organizations.functions.ts` sits alongside `lib/organizations/` | Low | Both exist | Import-path ambiguity for new engineers | Consolidate into the folder in a follow-up refactor sprint | Technical Debt |

## 5. Authentication

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-AUTH-001` — `_authenticated` gate uses `ssr: false` + `supabase.auth.getUser()` | Info | `src/routes/_authenticated.tsx` | Matches `tanstack-supabase-integration` protected-subtree pattern | None | Future Improvement (n/a) |
| `PH0-AUTH-002` — RBAC role stored in `user_roles` + `has_role` SQL fn | Info | Prior migrations; login role-routing in `src/routes/login.tsx` | Matches `user-roles` governance rule | None | Future Improvement (n/a) |
| `PH0-AUTH-003` — `permissions-context` + `Can.tsx` present | Info | `src/contexts/permissions-context.tsx`, `src/components/auth/Can.tsx` | Ready to gate SPR-MOD-001-001 UI | None | Future Improvement (n/a) |
| `PH0-AUTH-004` — Login role-routing hardcoded in `login.tsx` | Low | `resolvePostLoginPath` inlined | Fine for now; will need a rule table when more roles land | Extract to `src/lib/auth/post-login-routing.ts` when a third role is added | Future Improvement |

## 6. Routing

Existing routes under `src/routes/`:

- Public: `index`, `login`, `auth`, `auth.callback`, `forgot-password`, `reset-password`, `docs`, `docs.$`, `docs.index`, `403`, `500`.
- Protected (`_authenticated`): `platform/index`, `platform/dashboard`, `platform/tenants/index`, `platform/tenants/$tenantId`, `platform/companies/index`, `platform/companies/$companyId`, `platform/$` (catch-all).

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-ROUTE-001` — Platform Administration lives at `/_authenticated/platform/*` | Info | Route tree | Correct placement for SPR-MOD-001-001 continuation | Add new provisioning routes as siblings of `tenants/` and `companies/` | Future Improvement (n/a) |
| `PH0-ROUTE-002` — No `/tenant` or `/settings*` routes remain | Info | Deletions recorded in prior sprints | Prevents duplicate landing surfaces | None | Future Improvement (n/a) |
| `PH0-ROUTE-003` — Branches and Financial Years nav entries point to `/platform/tenants` | Info | `src/lib/navigation/registry.ts` (`administration.platform.branches`, `financial_years` routes) | Intentional deep-link into scoped tabs; no fabricated list routes | None | Future Improvement (n/a) |

## 7. UI Framework

| Area | Location | State |
|---|---|---|
| App shell | `src/components/layout/AppShell.tsx` | Active for non-platform authenticated routes |
| Platform shell | `src/components/platform/PlatformShell.tsx` | ServiceNow-inspired shell (SPR-PLT-0005) |
| Sidebar | `PlatformSidebar.tsx`, `AppSidebar.tsx` | Two sidebars — one per shell (intentional) |
| Header | `PlatformTopBar.tsx`, `PlatformSecondaryHeader.tsx`, `HeaderSlots.tsx` | Present |
| Command Palette | `src/components/navigation/CommandPalette.tsx` + `useCommandPalette` | Active, Cmd/Ctrl+K wired |
| DataGrid | `src/components/tables/DataGrid.tsx` | Backed by `@tanstack/react-table` |
| Forms | `src/components/forms/{Form,FormField,SubmitButton}.tsx` | RHF + Zod wrappers |
| Widgets | `src/components/dashboard/widgets/*` | StatCard, ActivityFeed, Progress, Table |
| Theme tokens | `src/styles.css` + `src/constants/theme.ts` | Enterprise red + platform `--sn-*` tokens, light/dark |
| Icons | `lucide-react` | Standard set |
| shadcn/ui primitives | `src/components/ui/*` | 45 primitives |

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-UI-001` — Full UI kit already available | Info | 45 shadcn primitives + platform/dashboard scaffolds | SPR-MOD-001-001 UI needs are covered by REUSE / EXTEND | Publish reuse decisions in the sprint plan | Future Improvement (n/a) |
| `PH0-UI-002` — Two dashboard scaffolds (`dashboard/template` vs `components/dashboard`) | Low | See `PH0-STRUCT-002` | Divergent evolution risk | Document scope split in Reuse Inventory | Technical Debt |

## 9. Security

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-SEC-001` — RBAC/permission enforcement plumbed end-to-end | Info | `permissions-context`, `Can.tsx`, `authorization.functions.ts`, `authorization.server.ts` | Server + client gates present | None | Future Improvement (n/a) |
| `PH0-SEC-002` — Route guard via `_authenticated` layout | Info | `src/routes/_authenticated.tsx` | No per-child gates required | None | Future Improvement (n/a) |
| `PH0-SEC-003` — Server-only admin client isolated | Info | `src/integrations/supabase/client.server.ts` (server graph only) | Service role not shipped to browser | None | Future Improvement (n/a) |
| `PH0-SEC-004` — Leaked-password protection disabled | Low | Supabase Auth setting; recorded in security memory | Auth weakness at edge | Enable in Supabase dashboard | Pre-Phase-2 Recommendation |
| `PH0-SEC-005` — `auth-audit`, `auth-fingerprint`, `correlation`, `logger` helpers in place | Info | `src/lib/auth-*.ts`, `src/lib/logger.ts`, `src/lib/correlation.ts` | Observability primitives available for SPR-MOD-001-001 events | None | Future Improvement (n/a) |

## 10. Code Quality

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-CQ-001` — Formatting drift | Medium | `PH0-HEALTH-003` | Blocks strict CI | Format sweep pre-Phase-1 | Pre-Phase-2 Recommendation |
| `PH0-CQ-002` — Dual location for organizations module | Low | `PH0-STRUCT-003` | Import ambiguity | Consolidate in refactor sprint | Technical Debt |
| `PH0-CQ-003` — No dead-code scan performed this pass | Low | Read-only audit scope | Unknown | Add `knip` or equivalent in Pre-Phase-2 sweep | Future Improvement |

## 11. Testing

Existing test surface:

- Vitest unit: `src/__tests__/smoke.test.ts`; `src/lib/{branches,financial-years,organizations,tenants}/__tests__/lifecycle.test.ts`; `src/lib/tenants/__tests__/slug.test.ts`; `src/lib/navigation/__tests__/registry.test.ts`; `src/lib/search/__tests__/{providers,registry}.test.ts`.
- E2E: Playwright config at `playwright.config.ts` + `e2e/README.md` (no specs authored yet in this workspace snapshot).

| Finding | Severity | Evidence | Impact | Recommendation | Disposition |
|---|---|---|---|---|---|
| `PH0-TEST-001` — Unit test framework operational | Info | 49 passing tests | Safe refactor base | None | Future Improvement (n/a) |
| `PH0-TEST-002` — No E2E specs yet | Medium | Only `e2e/README.md` | SPR-MOD-001-001 provisioning flows should ship with at least a smoke E2E | Author first Playwright spec alongside first provisioning route | Pre-Phase-2 Recommendation |
| `PH0-TEST-003` — No coverage report captured | Low | `vitest.config.ts` present; `test:coverage` script defined but not executed this pass | Coverage baseline unknown | Run `bun run test:coverage` at Phase 1 kickoff | Future Improvement |

## Revision History

| Version | Date | Author | Change |
|---|---|---|---|
| 1.0.0 | 2026-07-25 | Engineering Readiness | Initial technical debt & alignment audit. |
