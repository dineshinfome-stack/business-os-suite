## Sprint 0.9 — Search & Global Command Framework

**Objective:** Establish a centralized, multi-tenant, RBAC-aware search infrastructure that extends the existing command palette (Sprint 0.7) with a second "Search" tab powered by a pluggable provider architecture. Infrastructure only — no business modules.

---

### 1. Database — Migration `013_search_framework`

Two new tables in `public`:

- **`search_history`** — `id`, `organization_id`, `user_id`, `query`, `resource_type` (nullable), `selected_result_id` (nullable text), `searched_at`. Indexed on `(user_id, organization_id, searched_at desc)`. Pruning to the most recent 20 rows per user handled by a `BEFORE INSERT` trigger calling a `private.fn_prune_search_history` helper (keeps the design consistent with existing `private.*` helpers).
- **`search_preferences`** — `organization_id`, `user_id`, `enable_recent_searches` (bool, default true), `enable_suggestions` (bool, default true), `created_at`, `updated_at`. Unique on `(organization_id, user_id)`.

Each table follows the standard four-step pattern: `CREATE TABLE` → `GRANT` to `authenticated` + `service_role` → `ENABLE ROW LEVEL SECURITY` → policies scoped by `auth.uid() = user_id AND private.fn_is_org_member(organization_id)`. `updated_at` trigger on `search_preferences` using existing `public.fn_set_updated_at()`.

RBAC seed via `docs/15-governance/permission-catalog.manifest.yaml` (regenerated through `bun run gen:permissions`):
- `search.global.use` — permits invoking the search tab.
- `search.history.manage` — permits clearing personal history.

---

### 2. Search Registry — `src/lib/search/registry.ts`

Immutable, code-only registry (mirrors `notifications/registry.ts`). Each entry:

```
{ resourceType, displayName, icon, permission, keywords, routeBuilder(result), providerKey }
```

Ships with placeholder entries for future business resources (customer, vendor, employee, task, project, invoice, quotation, asset, setting, report) marked `status: "reserved"` so the registry contract is published without exposing routes to unimplemented modules. Only `setting` and `report` are `status: "active"` at sprint close (they map to routes that exist today).

A `docs/15-governance/SEARCH_REGISTRY_STANDARD.md` note defines the stability contract (identifiers immutable once active) matching the notifications-registry convention.

---

### 3. Search Result Model — `src/lib/search/types.ts`

```
SearchResult { id, resource_type, organization_id, title, subtitle?, description?, icon?, route, permission?, metadata?, score, created_at?, updated_at? }
```

Plus `SearchQuery`, `SearchResponse`, `SearchProvider` interface (`key`, `search(query, ctx)`, optional `autocomplete`).

---

### 4. Providers — `src/lib/search/providers/`

- **`registry-provider.ts`** — searches the navigation registry and the search registry's active entries (title/keywords match, scored the same way as `lib/navigation/search.ts`). Zero DB roundtrips.
- **`database-provider.ts`** — thin scaffold that iterates active registry entries with a `dbLookup` hook. No business tables exist yet, so it returns `[]` today but demonstrates the RLS-scoped query shape for future modules. Documented as the extension point.
- Provider registry (`providers/index.ts`) exports the active providers in priority order. `FullTextProvider`, `AISearchProvider`, `VectorProvider` are explicitly not created (out of scope) but reserved in the standard doc.

---

### 5. Search Service — `src/lib/search/service.functions.ts`

Server functions, all under `requireSupabaseAuth` + org context, all gated by `search.global.use`:

- `searchGlobal({ query, resourceTypes?, limit? })` — fans out to enabled providers, merges + dedupes by `(resource_type, id)`, filters by caller's permission set (reuses `listEffectivePermissions`), sorts by score, caps at 20. Fires `search.executed` audit event.
- `recordSearchSelection({ query, resourceType, resultId })` — inserts into `search_history`, fires `search.result_selected`.
- `listRecentSearches({ limit? })` — reads the caller's `search_history` under RLS, respecting `enable_recent_searches`.
- `clearSearchHistory()` — deletes caller's rows, fires `search.history_cleared`, gated by `search.history.manage`.
- `getSearchPreferences()` / `updateSearchPreferences(...)` — upsert under RLS.

Autocomplete/suggestions in this sprint = title-prefix matches from the registry provider only (no DB call). Cross-org queries structurally impossible (org id derived from context, never from client input).

---

### 6. Hooks — `src/hooks/search/`

- `useSearch(query)` — debounced (200 ms) `useQuery` wrapping `searchGlobal`. Disabled for empty query.
- `useRecentSearches()` — `useQuery` + `useMutation` for clear.
- `useSearchSuggestions(query)` — thin wrapper returning top-5 registry-only matches for instant feedback.

Query keys added to `src/lib/query-keys.ts` under a new `search` namespace, scoped by `(orgId, userId, query)` so org switches invalidate cleanly.

---

### 7. Components — `src/components/search/`

- `SearchInput`, `SearchResults`, `SearchItem`, `RecentSearches`, `SearchEmptyState`, `GlobalSearch` (composed wrapper for standalone usage — e.g. a future `/search` route, not shipped this sprint).

### 8. Command Palette Integration

Extend `src/components/navigation/CommandPalette.tsx` — do **not** replace. Add a two-tab layout (Tabs from shadcn) inside the existing `CommandDialog`:

- **Commands** tab — current behaviour (nav registry, favorites, recent nav) untouched.
- **Search** tab — mounts `SearchInput` + `SearchResults` + `RecentSearches`, wired to `useSearch` + `useRecentSearches`. Selecting a result calls `recordSearchSelection` then navigates via router. Empty state shows recent searches (when the preference is enabled) or `SearchEmptyState`.

Keyboard shortcuts: existing `⌘K` / `Ctrl+K` opens the palette on the last-used tab (persisted in `nav_user_preferences` via a new `command_palette_tab` field — one-row schema addition, added to Migration 013 as an `ALTER TABLE`). Add `⌘K` twice to toggle tabs, and `Esc` to close (already handled).

Gate the Search tab behind `<Can permission="search.global.use">` — users without the permission still see the Commands tab as today.

---

### 9. Audit

Reuse `logAuthEventFn` / audit framework with three new event types registered in the audit constants:
`search.executed`, `search.result_selected`, `search.history_cleared`. Metadata: query hash (not raw query for the `.executed` event, to keep audit log size bounded), result count, org id.

---

### 10. Tests

`src/lib/search/__tests__/`:
- `registry.test.ts` — asserts active vs. reserved entries, unique resource types.
- `service.test.ts` — permission filtering (removes results the caller can't access), org isolation (rows from another org never returned), history cap (21st insert prunes oldest), preferences respected (recent searches hidden when disabled).
- `providers.test.ts` — registry provider scoring, dedupe merge across providers.
- Component smoke test for `SearchResults` (renders items, handles empty state).

Plus `bunx tsgo --noEmit` and full `bunx vitest run` clean.

---

### 11. Verification Report

`docs/50-audit-reports/SPRINT_0_9_SEARCH_FRAMEWORK_REPORT.md` covering: migration + RLS + grants, registry + standard doc, provider abstraction, service functions + RBAC + tenancy, command palette integration, audit events, tests, typecheck, and regression checks against Sprints 0.4–0.8 (Auth, Tenancy, RBAC, Settings, Navigation, Notifications).

### Exit Criteria

Framework implemented, palette integrated, multi-tenant + RBAC compliant, tests + typecheck green, no regressions → advance to `READY_FOR_SPRINT_1_0`.

---

### Technical details

- New files: `src/lib/search/{registry,types,service.functions}.ts`, `src/lib/search/providers/{index,registry-provider,database-provider}.ts`, `src/hooks/search/{useSearch,useRecentSearches,useSearchSuggestions}.ts`, `src/components/search/*`, tests, migration, standard doc, report.
- Edited files: `src/components/navigation/CommandPalette.tsx` (add tabs), `src/lib/query-keys.ts` (search namespace), `src/lib/generated/permission-keys.ts` (regen), `docs/15-governance/permission-catalog.manifest.yaml`, `nav_user_preferences` schema (one added column via Migration 013).
- No changes to auth, notifications, tenancy, or navigation registry logic — only additive integration.
