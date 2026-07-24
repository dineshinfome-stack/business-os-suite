---
title: "ADR-009 — Workspace Retirement: Tenant as the Sole Business Container"
summary: "Retires Workspace as a domain concept across code, routes, navigation, and documentation. Tenant becomes the single, canonical business container in the Business OS hierarchy."
layer: "architecture"
owner: "Platform Architecture"
status: "accepted"
updated: "2026-07-24"
version: "1.0"
tags: ["adr", "architecture", "multi-tenant", "tenant", "hierarchy", "governance"]
document_type: "ADR"
supersedes: "ADR-008"
---

# ADR-009 — Workspace Retirement: Tenant as the Sole Business Container

## Status
Accepted — 2026-07-24. Supersedes [ADR-008](./ADR-008-platform-tenant-workspace-hierarchy.md).

## Context
ADR-008 introduced a five-level hierarchy (Platform → Tenant → Workspace → Company → Branch) where **Workspace** was defined as a *logical 1:1 alias of Tenant* — carrying no table, no identifier, and no independent lifecycle. In practice this produced three recurring problems:

1. **Conceptual noise.** Users, engineers, and documents used "Tenant", "Workspace", "Business", and "Organization" interchangeably. Every onboarding session required disambiguation.
2. **Presentation drift.** SPR-PLT-0002 renamed the UI label from "Workspace" to "Business" without changing the underlying identity, creating a *third* name for the same thing.
3. **No load-bearing use.** No route, table, permission, or policy depended on Workspace as distinct from Tenant. The accessor `useCurrentWorkspace()` had zero consumers.

Keeping a domain concept that has no physical representation, no distinct behaviour, and three competing labels is a governance liability.

## Decision
**Retire Workspace as a domain concept.** Tenant is the single, canonical business container.

The revised hierarchy is:

```text
Platform  →  Tenant  →  Company  →  Branch
                    ↘  Financial Year
```

Scope of retirement:

- **Domain vocabulary** — "Workspace" is removed from Tier A living documentation (architecture, standards, glossary, module publications). Historical audit reports and the product name **AI Workspace (MOD-018)** are preserved verbatim.
- **Code** — `src/lib/workspace/*` is moved to `src/lib/tenant/*` with descriptive filenames (`business-functions.ts`, `business-types.ts`, `query-keys.ts`). The unused `current-workspace.ts` accessor is deleted.
- **Routes** — User-facing routes migrate from `/workspace` to `/tenant`. Old paths remain as **time-boxed redirect shims** to preserve bookmarks and outstanding invitation links.
- **Navigation** — Presentation labels change from "Business" / "Business Profile" to "Tenant". The `nav_id` values (e.g. `workspace.hub`) are treated as a stable persisted contract and are **not renamed**.
- **Permissions** — Permission keys under the `workspace.*` namespace are **not renamed** in this ADR. Renaming is deferred to a dedicated RBAC migration (SPR-PLT-0004, tentative) to keep this change scope-safe. See the *Deferred Work* section below.

## Consequences

**Positive**
- One name, one concept: "Tenant" is the only container above Company.
- Documentation surface shrinks; onboarding no longer requires disambiguation.
- Presentation, code, and docs converge.

**Negative / risks**
- Bookmarks to `/workspace` and outstanding invitation emails pointing at `/workspace/accept` must continue to work. Mitigated by redirect shims (removal reviewed 2027-01-24).
- `nav_id` and permission keys retain the `workspace.*` prefix as internal identifiers. This is intentional (see below) but creates a naming lag between the UI label and the underlying contract.

## Design Constraints
1. `nav_id` values MUST NOT be renamed. They are the stable identity used by `nav_user_preferences`, `nav_favorites`, `nav_recent_pages`, and role-permission bindings. Renaming would invalidate persisted user data.
2. Permission keys under `workspace.*` MUST NOT be renamed in this ADR. RBAC key rotation is a separate, high-risk migration.
3. Historical audit reports under `docs/50-audit-reports/` are **frozen**. They are historical evidence and MUST NOT be rewritten.
4. The MOD-018 product name **AI Workspace** is a marketed feature name and is preserved verbatim.

## Migration Summary

| Layer | Before | After |
|-------|--------|-------|
| Route (user) | `/workspace`, `/workspace/accept` | `/tenant`, `/tenant/accept` (old routes redirect) |
| Server functions module | `src/lib/workspace/functions.ts` | `src/lib/tenant/business-functions.ts` |
| Types module | `src/lib/workspace/types.ts` | `src/lib/tenant/business-types.ts` |
| Query keys | `workspaceKeys` (root key `"workspace"`) | `tenantKeys` (root key `"tenant"`) |
| Accessor | `useCurrentWorkspace()` (unused) | Removed — use `useOrg()` |
| Nav label (top-level) | "Business" | "Tenant" |
| Nav label (hub) | "Business Profile" | "Tenant" |
| `nav_id` | `workspace.hub` (unchanged) | `workspace.hub` (unchanged) |
| Permission keys | `workspace.*` (unchanged) | `workspace.*` (unchanged) |

## Deferred Work
- **SPR-PLT-0004 (tentative) — RBAC key rotation.** Rename `workspace.*` permission keys and (optionally) `nav_id` prefixes to `tenant.*` in a dedicated migration that carries a data-migration plan for persisted role bindings and user nav preferences.
- **Redirect shim retirement.** `/workspace` and `/workspace/accept` shims are reviewed on 2027-01-24; remove once outstanding invitation links are known to have expired.

## References
- Supersedes: [ADR-008 — Platform → Tenant → Workspace → Company Hierarchy](./ADR-008-platform-tenant-workspace-hierarchy.md)
- Related: [Tenancy Standard](../../15-governance/TENANCY_STANDARD.md)
- Related: SPR-PLT-0002 Presentation Simplification (predecessor, superseded)
- Related: [ADR-085 — Tenant Header Architecture](../ui/ADR-085-tenant-header-architecture.md)
