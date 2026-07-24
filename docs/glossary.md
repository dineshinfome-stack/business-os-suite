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

**Platform** — The Business OS application itself; the top of the conceptual hierarchy (`Platform → Tenant → Company → Branch / Financial Year`). See ADR-009.

**Tenant** — The isolation, billing, and administration boundary, and the sole business container above Company. Backed by `public.tenants`. See ADR-009.

## Terms U-Z

**Workspace** — Retired as a domain concept in ADR-009. Historical usages in audit reports are preserved verbatim. The MOD-018 product name "AI Workspace" is a marketed feature name and is unrelated to the retired hierarchy concept.


## References

> Section stub — content to be filled in a later pass.
