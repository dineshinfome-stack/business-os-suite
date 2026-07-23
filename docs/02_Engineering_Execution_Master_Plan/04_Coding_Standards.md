---
document: EEMP Chapter 04 — Coding Standards
version: 0.1.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 04 — Coding Standards

## Purpose

Establish the baseline conventions for TypeScript, React, and TanStack Start code across Business OS. Reference — never restate — existing rules that live in stack, framework, or governance documents.

## Scope

All application code under `src/**`, all tests under `src/**` and `tests/**`, and all executable scripts.

## Audience

Engineers · AI collaborators · Reviewers.

## Responsibilities

- Contributors: comply with each standard cited below.
- Reviewers: enforce standards in PR review.
- Chapter owner: propagate stack-standard changes into this chapter.

## Stack Baseline

- **Framework:** TanStack Start v1 (Vite 7, React 19, SSR/SSG, server functions).
- **Styling:** Tailwind v4 via `src/styles.css` (no `tailwind.config.js`).
- **UI Kit:** shadcn/ui + Radix primitives.
- **Data:** TanStack Query in loaders (`ensureQueryData`) + `useSuspenseQuery` in components.
- **Server:** `createServerFn` from `@tanstack/react-start` for RPC; server routes under `src/routes/api/` for HTTP endpoints.
- **Auth:** Supabase (self-managed) with `requireSupabaseAuth` middleware. Roles in `public.user_roles` via `has_role`.

Full stack rules live in the platform knowledge base (`tanstack-start`, `server-runtime`, `server-side-modern`, `public-api-endpoints`, `user-roles`).

## Language and Style

- TypeScript strict mode; no implicit `any`.
- ES module imports; no default exports for shared utilities.
- Named exports for components and hooks unless a route file requires default.
- File names: `kebab-case.tsx` for components, `use-*.ts` for hooks, `*.functions.ts(x)` for client-safe server functions, `*.server.ts(x)` for server-only helpers.
- Imports ordered: node → external → alias (`@/`) → relative.

## React

- Function components only; no class components.
- Use hooks from `@/hooks/**` and shared providers from `@/providers/**`.
- No `useEffect` + `fetch` for initial render — use TanStack Query.
- Read browser-only state (localStorage, cookies) inside `useEffect` or `useHydrated()`.

## Server Functions

- Place client-imported server fns in `src/lib/` (never `src/server/`).
- Chain `.inputValidator(zod).handler(fn)` without breaking the chain.
- Read env vars inside `.handler()`, not at module scope.
- Never call `requireSupabaseAuth`-protected server fns from a public route loader; use `useServerFn` in components or the `_authenticated` subtree.

## Database

Governed by `docs/15-governance/DATABASE_STANDARD.md`. Highlights:

- Every `public` table has explicit `GRANT` + `ENABLE ROW LEVEL SECURITY` + policies in the same migration.
- Roles in `public.user_roles`; check via `public.has_role`.
- Sensitive helpers in the `private` schema with `SECURITY DEFINER` and fixed `search_path`.

## RBAC and Tenancy

- Enforce tenant scoping through `private.fn_is_org_member` / `private.fn_org_role`.
- Role checks via `private.fn_has_role` — never on `profiles`.
- Client-side gates via `<Can>`; never make authorization decisions in the browser.

## Errors and Not-Found

Every route with a loader sets `errorComponent` and `notFoundComponent`. Root sets `notFoundComponent`. Router config sets `defaultErrorComponent`.

## Head Metadata

Every content route has unique `head()`: `title`, `description`, `og:title`, `og:description`. Set `og:type` and `twitter:card`. Never use placeholder titles.

## Testing

- Unit and integration via `bunx vitest run`.
- Typecheck via `bunx tsgo --noEmit`.
- Every sprint updates test coverage documented in the sprint audit report.

## Code Review Checklist (summary)

Detailed checklist in `checklists/code-review.md` (Phase 4). Minimum items:

- Standards compliance (this chapter).
- Evidence trail (sprint report references).
- No secrets in code.
- No forbidden repo modifications.
- Tests updated.

## Dependencies

- DATABASE_STANDARD, RBAC_STANDARD, PERMISSION_CATALOG, PLATFORM_TESTING_STANDARD, PLATFORM_OBSERVABILITY_STANDARD, PERFORMANCE_BUDGETS_STANDARD (all under `docs/15-governance/`).

## Related Documents

- [03_Development_Workflow](03_Development_Workflow.md)
- [05_UI_UX_Standards](05_UI_UX_Standards.md)
- [06_Backend_Standards](06_Backend_Standards.md) *(Phase 2)*
- [07_Database_Standards](07_Database_Standards.md) *(Phase 2)*
- [08_Security_Standards](08_Security_Standards.md) *(Phase 2)*
- [15_Testing_Strategy](15_Testing_Strategy.md) *(Phase 3)*

## Cross References

- **Related Documents:** 03_Development_Workflow, 05_UI_UX_Standards
- **Referenced Standards:** DATABASE_STANDARD, RBAC_STANDARD, PERMISSION_CATALOG, PLATFORM_TESTING_STANDARD, PLATFORM_OBSERVABILITY_STANDARD, PERFORMANCE_BUDGETS_STANDARD
- **Referenced ADRs:** ADR Index
- **Referenced Modules:** All
- **Referenced Sprint PRDs:** All
- **Referenced Solution Designs:** All WEB/API specs

## Open Questions

- None at initial draft.

## Approval Status

Draft — pending Technical Lead and Architecture Board sign-off.

## Evidence

```
Source:             docs/15-governance/DATABASE_STANDARD.md
Authority:          Governance Standards
Reference:          Public-schema GRANT and RLS rules
Applicable Modules: All
Confidence:         High
```

```
Source:             docs/15-governance/RBAC_STANDARD.md
Authority:          Governance Standards
Reference:          Roles, has_role, private helpers
Applicable Modules: All
Confidence:         High
```

## Discovery Inventory

- Referenced files: DATABASE_STANDARD, RBAC_STANDARD, PERMISSION_CATALOG, PLATFORM_TESTING_STANDARD, PLATFORM_OBSERVABILITY_STANDARD, PERFORMANCE_BUDGETS_STANDARD, EXTENSIBILITY_STANDARD.
- Referenced standards: as above.
- Referenced ADRs: ADR Index (all engineering and platform ADRs).
- Referenced PRDs: All.
- Referenced Solution Designs: All.
- Referenced Module Publications: All.
- Referenced Sprint Plans: All Wave 0 sprints (0.4 → 1.0).

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — TS/React/TanStack + governance references. |
