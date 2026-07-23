---
title: "Search Registry Standard"
summary: "Stability contract, namespace convention, and provider model for the Business OS search framework."
layer: "governance"
owner: "Platform"
status: "active"
updated: "2026-07-23"
tags: ["search", "governance", "sprint-0.9"]
depends_on: ["docs/15-governance/permission-catalog.manifest.yaml"]
---

# Search Registry Standard (Sprint 0.9)

## 1. Purpose

Defines the immutable contract, namespace, provider model, and RBAC/tenancy
rules for the platform-wide search framework introduced in Sprint 0.9.

## 2. Stability Contract

- Each `resourceType` in `src/lib/search/registry.ts` is a **permanent identifier**
  and part of the platform's persisted data contract (search history rows,
  future saved searches, analytics).
- Once a registry entry is shipped with `status: "active"`, its `resourceType`
  MUST NOT be renamed or repurposed.
- Removed types are marked `status: "retired"` and NEVER reassigned.
- Splits produce new types; the original is retired.
- Reserved types (`status: "reserved"`) are permitted to change until they
  transition to `active`.

## 3. Namespace Convention

`resourceType` values are lowercase singular nouns matching the future
business domain (`customer`, `vendor`, `invoice`, `asset`, …). Ids match
`^[a-z][a-z0-9_]*$`.

## 4. Provider Model

Providers implement `SearchProvider` in `src/lib/search/providers/`. Two
providers ship in Sprint 0.9:

| Key        | Source                              | Notes                                                    |
| ---------- | ----------------------------------- | -------------------------------------------------------- |
| `registry` | in-memory nav + search registries   | Zero DB round-trips; always available.                   |
| `database` | RLS-scoped Supabase queries         | Scaffold; iterates active registry entries per lookup.   |

**Reserved** (not shipped): `fulltext` (Postgres FTS), `vector` (pgvector),
`ai` (LLM-assisted semantic search). Adding these requires a new sprint and
a governance amendment.

## 5. RBAC & Multi-tenancy Invariants

1. Every search query is executed under `requireSupabaseAuth` and derives
   `organization_id` from server context — never from client input.
2. Results are filtered against the caller's effective permission set
   (`listEffectivePermissions`). Rows the caller cannot see MUST NOT be
   returned, and their existence MUST NOT be leaked via counts, messages, or
   suggestions.
3. Cross-organization search is prohibited by construction.
4. The `search.global.use` permission gates invocation of the search tab;
   `search.history.manage` gates clearing personal history.

## 6. Audit Events

- `search_executed` — one per query; metadata = `{ orgId, providers, resultCount }`.
- `search_result_selected` — one per selection; metadata = `{ orgId, resourceType }`.
- `search_history_cleared` — one per manual clear.

Raw query text is not persisted in the audit log.

## 7. Amendment Process

Additive changes (new active types, new provider) are ordinary sprint work.
Retirements and provider removals require a governance note in
`docs/50-audit-reports/` referencing this standard.
