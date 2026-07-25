---
title: "Glossary"
summary: "Living glossary of BusinessOS ERP terminology, aligned to ADR-017."
layer: "platform"
owner: "Platform"
status: "draft"
updated: "2026-07-25"
tags: ["glossary", "adr-017"]
depends_on: []
---

# Glossary

## Terms A-E

**Branch** — An operating location of a Company. Backed by `public.branches` inside the owning Tenant's dedicated database.

**Company** — A legal entity within a Tenant. Backed by `public.organizations` inside the Tenant database. Owns Branches and Financial Years.

**Dedicated Tenant Database** — The per-Tenant persistence boundary under ADR-017. Every Tenant owns exactly one; it stores all Tenant business data. Cross-tenant table joins are impossible by construction.

## Terms F-J

**Financial Year** — An accounting period belonging to a Company. Backed by `public.financial_years` inside the Tenant database.

## Terms K-O

**Logical Workspace** — See *Workspace*.

## Terms P-T

**Platform** — The Business OS application itself and its Platform database (tenant registry, platform users, licenses, subscriptions, provisioning state, connection routing). Top of the conceptual hierarchy: `Platform → Tenant → [Dedicated DB + Logical Workspace] → Company → Branch / Financial Year`. See ADR-017.

**Platform Database** — The single application-owned database that holds platform metadata only. Holds no Tenant business data. See ADR-017.

**Tenant** — The isolation, licensing, and administration boundary. Under ADR-017, one Tenant = one dedicated database. Registered in `public.tenants` in the Platform database.

## Terms U-Z

**Workspace** — Under ADR-017, reintroduced as a **logical, non-persistent** container within a Tenant. No `workspaces` table, no `workspace_id` column, no independent configuration store; a naming and navigation construct organising Companies, Branches, Financial Years, Users, Roles, Permissions, Settings, AI Workspace, and Modules. ADR-009 (which retired Workspace as a domain concept under the shared-DB posture) is superseded by ADR-017. Historical usages in audit reports remain frozen. The MOD-018 product name "AI Workspace" is a marketed feature name and is unrelated to the hierarchy Workspace concept.


## References

- `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`
- `docs/11-adrs/architecture/ADR-009-workspace-retirement.md` (superseded)
- `docs/15-governance/TENANCY_STANDARD.md`

