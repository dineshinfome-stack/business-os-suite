---
title: "Glossary"
summary: "Living glossary of BusinessOS ERP terminology."
layer: "platform"
owner: "Platform"
status: "draft"
updated: "2026-07-05"
tags: ["glossary"]
depends_on: []
---

# Glossary

## Terms A-E

**Branch** — An operating location of a Company. Backed by `public.branches`.

**Company** — A legal entity within a Tenant. Backed by `public.organizations`. Owns Branches and Financial Years.

## Terms F-J

**Financial Year** — An accounting period belonging to a Company. Backed by `public.financial_years`.

## Terms K-O

> Section stub — content to be filled in a later pass.

## Terms P-T

**Platform** — The Business OS application itself; the top of the conceptual hierarchy (`Platform → Tenant → Workspace → Company → Branch / Financial Year`). See ADR-008.

**Tenant** — The isolation, billing, and administration boundary. Backed by `public.tenants`. The only persistence-level isolation boundary in the platform.

## Terms U-Z

**Workspace** — A **logical business container derived from the Tenant context and associated configuration** (ADR-008). One logical Workspace per Tenant today. **Not backed by a table.** Workspace configuration is currently represented by the Tenant's existing configuration and settings; no separate Workspace configuration store exists until a future ADR introduces one.

## References

> Section stub — content to be filled in a later pass.
