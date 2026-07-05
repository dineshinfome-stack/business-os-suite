---
title: "Reference Data"
summary: "Governance, ownership, mutability, and distribution rules for globally shared reference catalogs (countries, currencies, tax categories, statuses, units of measure, and more)."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "data", "reference-data", "pass-4b"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-architecture"
  - "02-architecture/multi-tenant-architecture"
  - "02-architecture/database-standards"
  - "02-architecture/data-dictionary"
referenced_by: []
---

# Reference Data

> Part of **Pass 4B — Data Foundation (Data Constitution)**. Defines what qualifies as reference data in BusinessOS, how it is governed, how it flows to tenants, and which canonical catalogs exist. Physical shape, seed content, and distribution mechanics are downstream.

## Overview

Reference data is the shared vocabulary of the platform. Countries, currencies, tax categories, statuses, and units of measure are the same for every tenant; they cannot be redefined tenant-by-tenant without breaking cross-tenant analytics, integrations, and statutory reporting. This document defines what reference data *is* in BusinessOS, who governs it, how it changes, and which catalogs are canonical.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## What Qualifies as Reference Data

An entity qualifies as reference data when *all* of the following are true:

- Its meaning is defined outside any single tenant (ISO standards, statutory taxonomies, platform-wide conventions).
- Every tenant sees the same values with the same interpretation.
- Tenants may *use* reference data but cannot *mutate* it directly.
- Changes are rare, deliberate, and require a governed release process.
- It is safe to cache aggressively and to distribute widely.

By contrast, tenant-configurable lookups (chart of accounts, custom tax templates, branch codes, item categories) are **not** reference data — they are tenant master data owned by their domain.

## Governance and Ownership

- **Platform is the source of truth.** Reference data lives in globally shared tables (no `tenant_id`) and is managed by platform administrators.
- **Every catalog has an owning domain.** The domain named as owner is accountable for the catalog's correctness, versioning, and deprecation.
- **Changes follow a governed release process.** Adding, deprecating, or correcting reference entries is a change-management event, versioned and logged.
- **No tenant-authored writes.** Tenants read; they do not insert, update, or delete.
- **Extensibility is layered, not merged.** Where tenants need "their own tax category" or "their own status," the platform provides a tenant-scoped extension table that references the canonical catalog rather than mutating it.

## Immutability

Reference entries are effectively immutable in meaning:

- **Codes are never reused.** A retired country code is not reassigned to a new country.
- **Existing entries are deprecated rather than deleted.** Historical data referencing a deprecated entry continues to resolve.
- **Corrections vs redefinitions.** Typographical corrections to a name are permitted; semantic redefinitions require a new entry and a deprecation of the old.

## Versioning

- **Every catalog carries a version identifier** that changes when the catalog changes.
- **Every entry carries an effective-from and (optionally) effective-to date** for time-aware reference data (e.g. tax rates within a category, exchange-rate purposes).
- **Consumers snapshot the version they used** when it materially affects auditability (e.g. tax calculations record the tax-category version in force at posting time).

## Distribution Model

- **Read-heavy, write-rare** — the platform optimises for read throughput and cache locality.
- **Globally cached, per-region served** — reference data is safe to serve from edge caches.
- **Point-in-time queryable** — historical reads (e.g. "what was the tax category on this invoice date?") resolve against the effective dates, not the current row state.
- **Exported with tenant data** — tenant exports include the reference-data snapshots referenced by the exported records so the export is self-describing.

## Canonical Reference Data Catalog

Each catalog below is normative. Entries, columns, and seed values are downstream of this document.

### Countries

- **Purpose** — canonical list of sovereign countries and equivalent jurisdictions used for addresses, tax residency, and statutory metadata.
- **Owning Domain** — Reference Data (global).
- **Mutability** — additions rare (new sovereign entities); deprecation for dissolved entities; no reuse of ISO codes.
- **Source of Truth** — ISO 3166-1 alpha-2 and alpha-3 codes, extended with platform-relevant metadata.
- **Distribution** — globally cached; served to every tenant identically.

### States / Provinces

- **Purpose** — subdivisions of countries for addresses, statutory registrations, and tax jurisdiction.
- **Owning Domain** — Reference Data (global).
- **Mutability** — additions and reorganisations are governed events; codes never reused within a country.
- **Source of Truth** — ISO 3166-2 codes, extended with statutory metadata per country.
- **Distribution** — globally cached.

### Currencies

- **Purpose** — monetary units used across all financial computation.
- **Owning Domain** — Reference Data (global).
- **Mutability** — additions when new currencies enter circulation; deprecation for demonetised currencies (kept for historical reference).
- **Source of Truth** — ISO 4217 alpha-3 code plus precision and symbol metadata.
- **Distribution** — globally cached; required by every monetary domain.

### Languages and Locales

- **Purpose** — language tags for content, and locale tags for formatting (number, date, currency display).
- **Owning Domain** — Reference Data (global).
- **Mutability** — additions when the platform adds market support.
- **Source of Truth** — IETF BCP-47 locale tags.
- **Distribution** — globally cached.

### Units of Measure

- **Purpose** — canonical units for quantity representation in inventory, manufacturing, service, and analytics.
- **Owning Domain** — Reference Data (global), consumed by Inventory as primary.
- **Mutability** — additions rare; deprecations when a unit is superseded by a standard equivalent; conversions between compatible units are catalog metadata.
- **Source of Truth** — SI base and derived units, extended with industry-standard non-SI units (dozen, case, pallet, etc.).
- **Distribution** — globally cached.

### Tax Categories

- **Purpose** — canonical classification of taxes (VAT, GST, sales tax, withholding, excise, customs) that tenant-configured tax rules attach to.
- **Owning Domain** — Reference Data (global), consumed by Accounting as primary.
- **Mutability** — additions when new statutory regimes are supported; effective-dated to preserve historical rates.
- **Source of Truth** — platform-curated taxonomy per jurisdiction.
- **Distribution** — globally cached; used with effective-date semantics.

### Document Statuses

- **Purpose** — canonical status tokens applied to transactional documents (orders, invoices, deliveries, receipts) where cross-domain analytics require consistent semantics.
- **Owning Domain** — Reference Data (global), consumed by every transactional domain.
- **Mutability** — additive; deprecations permitted; no repurposing.
- **Source of Truth** — platform-curated status taxonomy.
- **Distribution** — globally cached.

### Approval Statuses

- **Purpose** — canonical states for workflow approvals (`pending`, `approved`, `rejected`, `withdrawn`, `escalated`).
- **Owning Domain** — Reference Data (global), consumed by Workflow.
- **Mutability** — additive.
- **Source of Truth** — platform-curated.
- **Distribution** — globally cached.

### Voucher Statuses

- **Purpose** — canonical states for accounting vouchers (`draft`, `submitted`, `posted`, `reversed`, `cancelled`).
- **Owning Domain** — Reference Data (global), consumed by Accounting as primary.
- **Mutability** — additive.
- **Source of Truth** — platform-curated, aligned with statutory expectations.
- **Distribution** — globally cached.

### Entity Types

- **Purpose** — canonical classification of external parties (individual, sole-proprietor, partnership, LLP, private-limited, public-limited, government, non-profit, foreign entity).
- **Owning Domain** — Reference Data (global), consumed by CRM and Purchase primarily.
- **Mutability** — additive.
- **Source of Truth** — platform-curated per jurisdiction where classification varies.
- **Distribution** — globally cached.

### Communication Channels

- **Purpose** — canonical channels for outbound and inbound communication (email, SMS, WhatsApp, in-app, push, voice, postal).
- **Owning Domain** — Reference Data (global), consumed by Notifications.
- **Mutability** — additive.
- **Source of Truth** — platform-curated.
- **Distribution** — globally cached.

### Payment Methods

- **Purpose** — canonical classification of tender types (cash, cheque, bank transfer, UPI, card, wallet, credit note).
- **Owning Domain** — Reference Data (global), consumed by Accounting and POS.
- **Mutability** — additive.
- **Source of Truth** — platform-curated per jurisdiction.
- **Distribution** — globally cached.

### Address Types

- **Purpose** — canonical roles an address can play (billing, shipping, registered, warehouse, communication).
- **Owning Domain** — Reference Data (global), consumed by every domain that stores addresses.
- **Mutability** — additive.
- **Source of Truth** — platform-curated.
- **Distribution** — globally cached.

### Contact Types

- **Purpose** — canonical roles a contact can play (primary, billing, technical, escalation, statutory, purchasing).
- **Owning Domain** — Reference Data (global), consumed by CRM, Purchase, HR.
- **Mutability** — additive.
- **Source of Truth** — platform-curated.
- **Distribution** — globally cached.

## Reference Data Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Concrete seed content for each catalog | Depends on target markets at launch | Commercial pass | Product + Domain owners |
| Effective-date modelling per catalog | Coupled to engine and query patterns | Pass 4C / ADR | Platform |
| Change-release cadence and channel | Operational decision | Post-pilot | Platform |
| Tenant-extension mechanism (per catalog) | Depends on per-domain UX | Domain passes | Domain owners |
| Localisation of display names per locale | UX decision | Design pass | Product + Design |
| Cache invalidation protocol on catalog updates | Coupled to runtime and edge topology | Pass 4C | Platform |

## Conforms to Canon

- **Canon: Reference Data is Governed Centrally** — every catalog has an owning domain and a governed release process.
- **Canon: Tenants Read, Do Not Mutate** — reference data is read-only from a tenant's perspective; extension is tenant-scoped and additive, never in-place mutation.
- **Canon: Historical Reads Resolve Correctly** — effective-dated catalogs preserve historical semantics for auditability.
- **Canon: Vendor Neutrality** — no engine, cache, or CDN vendor is named.
- **Canon: Deferred Decisions Are Named** — every open topic appears in *Reference Data Decisions Pending* with an ADR pointer.

## References

- Database Architecture — data principles that reference-data governance implements.
- Multi-Tenant Architecture — globally shared vs tenant-scoped classification.
- Database Standards — naming and audit conventions applied to reference tables.
- Data Dictionary — canonical entities and their references into catalogs.
- Domain Map — domains named as consumers of each catalog.
