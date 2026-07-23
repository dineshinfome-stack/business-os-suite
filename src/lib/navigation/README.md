# Navigation Framework (Sprint 0.7)

Shared platform navigation used by every Business OS module.

## 1. Stable `nav_id` contract

`nav_id` is a **permanent identifier** and part of the platform's persisted
data contract. Referenced by favorites, command history, expanded groups,
and future preferences.

Rules:

1. Once shipped, a `nav_id` MUST NOT be renamed.
2. Route changes update the `route` field only — never the id.
3. Removed items are marked `id_status: 'retired'` — never reassigned.
4. Splits produce new ids; the original is retired.

Format: `^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$`

## 1.2 Identity vs routing separation

Two independent keys with distinct responsibilities.

| Concern | Key | Used by |
|---|---|---|
| Persisted navigation identity | `nav_id` | favorites, command history, expanded groups, pinned modules, dashboards, notifications |
| Runtime routing / URL matching | `route` | TanStack Router, `matchRoute()`, breadcrumbs, recent pages, active-state highlighting |

Rules:

- Never key a persisted table by `route` when the entity is a navigation
  reference (routes change; ids don't).
- Never use `nav_id` in TanStack `Link to=` / `useNavigate({ to })` calls —
  always resolve to `route` first.
- Never build URLs by concatenating `nav_id` segments.
- `recent_pages` is the documented exception — it captures URL history, not
  navigation identity, so it stays keyed on `route` (and drops routes that
  no longer resolve via `matchRoute()`).

## 1.3 Retired-id cleanup

Every persisted-reference surface implements:

- **Read-time filter** — list handlers exclude retired (or absent) `nav_id`
  rows before returning.
- **Write-time prune** — the same call fires-and-forgets a delete for the
  filtered rows via `pruneRetiredNavIds()`.

## 1.4 Registry health

- `MAX_CHILDREN_PER_MODULE` (default 25) — parents with more direct active
  children trigger a warn-only assertion in the registry test.
- `MAX_TOTAL_ITEMS` (default 400) — total active registry size threshold.

Both are configurable at the top of `registry.ts` and are structural
health signals only; they never fail CI.
