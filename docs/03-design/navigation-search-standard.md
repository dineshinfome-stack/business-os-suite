# Navigation Search Standard

Status: **Ratified**
Owner: Tenant Shell / Navigation
Related: `src/lib/navigation/search-index.ts`, ADR-085 (Tenant Header Architecture)

## Purpose

Defines how the tenant navigation search behaves and how matches are ranked.
Consumers (sidebar filter, command palette, future AI search) rely on the
same `NavigationSearchIndex` so behavior stays consistent across surfaces.

## Index

`NavigationSearchIndex` is built once per NAV_REGISTRY identity and cached
via `WeakMap`. Rebuilding requires a new registry reference — the singleton
NAV_REGISTRY guarantees the cache hits on every render in production.

Each `IndexedNavEntry` holds normalized (lowercased, trimmed) tokens for:

| Field         | Source                             | Status      |
|---------------|------------------------------------|-------------|
| `title`       | `NavItem.title`                    | implemented |
| `module`      | `NavItem.module`                   | implemented |
| `keywords`    | `NavItem.keywords ?? []`           | implemented |
| `aliases`     | reserved — `NavItem.aliases`       | deferred    |
| `description` | reserved — `NavItem.description`   | deferred    |

Aliases and description are typed extension points. Wiring is in place; the
NAV_REGISTRY schema change to add these fields is a separate follow-up so it
can be coordinated across all entries in one sprint.

## Match Precedence

Query `q` is normalized (lowercase, trimmed) before matching. Entries are
scored using the highest tier that matches and returned in descending score,
then alphabetical title:

| Tier | Rule                        | Score |
|------|-----------------------------|-------|
| 1    | Exact title match           | 100   |
| 2a   | Title starts-with `q`       | 90    |
| 2b   | Exact alias match           | 85    |
| 2c   | Alias substring match       | 75    |
| 3    | Title contains `q`          | 70    |
| 4    | Keyword contains `q`        | 50    |
| 5    | Module contains `q`         | 40    |
| 6    | Description contains `q`    | 20    |

Retired entries (`id_status === "retired"`) and hidden entries
(`visible === false`) are excluded from indexing.

Tiers 2b, 2c, and 6 are no-ops today (empty source tokens) but keep the
scorer stable so enabling the deferred schema fields is a pure data change.

## Filter vs Search

- `filterNavigationTree(tree, query)` — used by the sidebar. Preserves branch
  structure; keeps parents whose descendants match. Uses the cached
  haystack per node.
- `searchNavigation(query, opts)` — flat, ranked list. Used by command
  palette and future AI search.

Both consult the same cached index; they never rebuild their own.

## Non-Goals

- Fuzzy matching (Levenshtein, n-gram) — deferred until we have telemetry.
- Semantic / embedding search — belongs to the AI Assistant slot, not the
  tenant navigation search.
- Route-based lookup — use `findByRoute` from `src/lib/navigation/tree.ts`.
