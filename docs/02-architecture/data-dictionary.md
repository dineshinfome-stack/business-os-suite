---
title: "Data Dictionary"
summary: "Canonical entities, data ownership matrix, and common data-type conventions (money, quantity, date, timezone, precision, identifiers) for the BusinessOS platform."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "data", "dictionary", "pass-4b"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-architecture"
  - "02-architecture/multi-tenant-architecture"
  - "02-architecture/database-standards"
referenced_by: []
---

# Data Dictionary

> Part of **Pass 4B — Data Foundation (Data Constitution)**. Defines the canonical vocabulary, ownership, and data-type conventions used across every domain in BusinessOS. Physical schemas, columns, and DDL are deliberately out of scope.

## Overview

The Data Dictionary is the single source of truth for **what things are called**, **who owns them**, and **how their values are represented** across BusinessOS. When Accounting, Sales, CRM, and HR all speak about a "customer," this document — combined with the Domain Map — ensures they mean the same thing, refer to the same identity, and interpret the same values the same way.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## Canonical Entities

Each canonical entity below is defined by its meaning, its owning domain, and the identity rules that apply to it. Physical shape (columns, relationships) is a downstream concern.

| Entity | Definition | Owning Domain | Identity Rules |
|---|---|---|---|
| **Tenant** | Top-level unit of isolation, billing, and administration. Owns everything below it. | Foundation / Tenancy | Surrogate UUID `id`; immutable; unique globally. No natural key. |
| **Organization** | Optional grouping layer inside a tenant, representing a corporate group or brand family. | Foundation / Tenancy | Surrogate UUID; unique per tenant; optional public code. |
| **Company** | A legal entity inside an organisation. Anchors statutory registrations, books, and fiscal calendars. | Foundation / Tenancy | Surrogate UUID; unique per tenant; carries statutory natural keys (e.g. tax registration numbers) as external IDs. |
| **Branch** | An operating location of a company. Anchors inventory, sales, service, and payroll operations. | Foundation / Tenancy | Surrogate UUID; unique per company; carries a tenant-issued public code. |
| **Fiscal Year** | A named accounting period for a company. | Accounting | Surrogate UUID; unique per company; carries a company-issued public code (e.g. `FY-2026-27`). |
| **Currency** | A monetary unit with ISO alpha code and precision rules. | Reference Data (global) | Natural key = ISO 4217 alpha code; no tenant scope. |
| **Exchange Rate** | Conversion rate between two currencies effective on a date, for a purpose. | Accounting | Surrogate UUID; composite uniqueness across (from, to, effective_date, purpose). |
| **User** | An authenticable principal that can act inside one or more tenants. | Foundation / Identity | Surrogate UUID; external IDs for federated identity providers. |
| **Role** | A named bundle of permissions that can be assigned to users. | Foundation / Identity | Surrogate UUID; unique per tenant; carries a code. |
| **Employee** | A person employed by a company. | HR | Surrogate UUID; company-scoped natural key (employee code); external IDs for statutory registrations. |
| **Customer** | An external party that buys from the platform's tenants. | CRM | Surrogate UUID; unique per tenant; carries a public customer code and optional statutory natural keys. |
| **Vendor** | An external party that supplies the platform's tenants. | Purchase | Surrogate UUID; unique per tenant; carries a public vendor code and optional statutory natural keys. |
| **Ledger** | An account in a company's chart of accounts. | Accounting | Surrogate UUID; unique per company; carries a company-defined account code. |
| **Voucher** | An accounting document representing a single, balanced financial event. | Accounting | Surrogate UUID; unique per company; carries a public voucher number per voucher-series. |
| **Warehouse** | A stocking location for inventory. | Inventory | Surrogate UUID; unique per company; carries a public code. |
| **Item** | A stock-keeping or service unit that can be sold, purchased, manufactured, or serviced. | Inventory | Surrogate UUID; unique per tenant; carries a public SKU and optional external identifiers (HSN, barcode). |
| **Project** | A time-bounded body of work with its own budget, resources, and deliverables. | Projects | Surrogate UUID; unique per company; carries a public project code. |
| **Asset** | A tracked physical or intangible resource owned by a company. | Assets | Surrogate UUID; unique per company; carries a public asset tag. |
| **Document** | A structured business record (quote, order, invoice, delivery note, etc.). | Owning transactional domain | Surrogate UUID; public document number per document-series per company. |
| **Attachment** | A file bound to another entity as supporting content. | Foundation / Documents | Surrogate UUID; tenant-scoped; carries content-addressable identity for storage. |

## Data Ownership Matrix

Ownership is the single most important cross-domain rule in BusinessOS: for every canonical entity there is exactly one owning domain, and every other domain that references the entity does so by identity, not by owning its representation.

| Entity | Owning Domain | Referenced By | Source of Truth | Notes |
|---|---|---|---|---|
| Tenant | Foundation / Tenancy | Every domain (implicitly) | Foundation / Tenancy | Root of the tenancy tree; never referenced from another tenant. |
| Organization | Foundation / Tenancy | Accounting, HR, Analytics | Foundation / Tenancy | Optional grouping layer. |
| Company | Foundation / Tenancy | Accounting, HR, Payroll, Inventory, Sales, Purchase, Assets | Foundation / Tenancy | Legal entity anchor. |
| Branch | Foundation / Tenancy | Sales, Purchase, Inventory, Service Desk, POS, HR, Payroll | Foundation / Tenancy | Operating-location anchor. |
| Fiscal Year | Accounting | Every domain that posts to books | Accounting | Defined per company. |
| Currency | Reference Data (global) | Every monetary domain | Reference Data | Platform-governed; tenants read only. |
| Exchange Rate | Accounting | Sales, Purchase, Payroll, Analytics | Accounting | Multi-currency conversion source. |
| User | Foundation / Identity | Every domain (audit, assignment, ownership) | Foundation / Identity | Authenticable principal. |
| Role | Foundation / Identity | Every domain (authorization) | Foundation / Identity | Permission bundle. |
| Employee | HR | Payroll, Projects, Service Desk, Fleet, Assets | HR | HR is the master; other domains reference. |
| Customer | CRM | Sales, Accounting, Projects, Service Desk, AMC, POS | CRM | Single master customer record per tenant. |
| Vendor | Purchase | Accounting, Inventory, Assets, Fleet | Purchase | Single master vendor record per tenant. |
| Ledger | Accounting | Sales, Purchase, Payroll, Inventory (COGS/valuation), Assets, Manufacturing | Accounting | Chart of accounts is the source. |
| Voucher | Accounting | Analytics, Audit | Accounting | Book of prime entry; other domains raise events, Accounting posts. |
| Warehouse | Inventory | Sales, Purchase, Manufacturing, Service Desk, Fleet | Inventory | Stocking-location anchor. |
| Item | Inventory | Sales, Purchase, Manufacturing, Service Desk, POS, Analytics | Inventory | Item master; per-tenant. |
| Project | Projects | Accounting, HR, Sales, Purchase, Service Desk | Projects | Project master. |
| Asset | Assets | Accounting, Fleet, Service Desk, Field Service | Assets | Fixed / tracked asset master. |
| Document | Owning transactional domain | Accounting, Analytics, Audit, Documents | Owning domain | Each document type owned by its business domain. |
| Attachment | Foundation / Documents | Every domain that attaches files | Foundation / Documents | Files/binary storage abstraction. |

This matrix is normative: no domain may declare itself the source of truth for an entity it does not own here. Changes require an ADR.

## Common Data-Type Conventions

### Money Representation (Amount + Currency + Precision + Rounding Policy)

Money is not a scalar. Every monetary value in BusinessOS is a composite governed by the following rules.

- **Amount** — a stored numeric magnitude with fixed precision. Amounts are never floating-point at rest and never floating-point in calculations that must round-trip through storage.
- **Currency** — every amount carries its currency identity (see *Currency* entity). An amount without a currency is not a monetary value and must not be treated as one.
- **Precision** — the precision of an amount is determined by its currency (the platform recognises that different currencies have different minor-unit precisions). Storage precision is at least the currency's natural precision, plus additional decimal places where computations require them (e.g. unit prices for high-precision items, exchange rates).
- **Rounding Policy** — rounding is explicit, deterministic, and applied at the point where a value crosses a boundary (persistence, presentation, ledger posting, tax computation). The default rounding mode is banker's rounding (round-half-to-even) unless a statutory rule requires otherwise; statutory rounding overrides at the point of statutory calculation.
- **Comparison Rules** — two monetary values are comparable only if they share the same currency. Cross-currency comparison requires conversion through an *Exchange Rate* with an explicit rate purpose and effective date; the converted value is a new monetary value with its own currency identity.
- **Currency Conversion Principles** — conversions record the source amount, target amount, rate used, rate source, rate purpose, and effective date; the converted amount and its metadata travel together so downstream consumers can audit the conversion.
- **Display Formatting** — formatting (locale, symbol placement, thousands separator, negative representation) is a presentation concern computed from the amount, its currency, and the user's locale. Stored values are never pre-formatted.

### Quantity and Precision

- Quantities are stored as fixed-precision numerics with precision determined by the item's unit of measure (see Reference Data).
- Non-negative unless the domain explicitly allows negative quantities (e.g. stock adjustments, returns).
- Unit of measure travels with the quantity in every cross-domain exchange; a bare number is not a quantity.

### Percentage

- Percentages are stored as fixed-precision decimals in the range where the semantic is unambiguous per column (either `0.0000`–`1.0000` fraction, or `0.00`–`100.00` percent) — the choice is captured in the column's documentation and applied consistently within a domain.
- Never floating-point.

### Date

- A calendar date without a time component. Represents a wall-clock day; timezone applies only to the interpretation of "today" for the tenant.

### DateTime

- All datetimes are stored in **UTC**.
- Presentation applies the appropriate timezone: the tenant's default timezone, the user's preference, the branch's local timezone, or the statutory timezone for a filing, as the context requires.
- Datetime precision is at least second-level; sub-second precision is used where events require it (audit, event ordering).

### Timezone Policy

- **Storage** — UTC, always, without exception.
- **Display** — tenant-local by default; overridable per user and per document type where legally required.
- **Business day boundaries** — computed against the applicable local timezone, then converted back to UTC ranges for query.
- **Cross-branch operations** — reconciled against a documented reference timezone per company.

### Duration

- Stored as an unambiguous unit (seconds, minutes, hours, days) declared per column. Never as free-form text.

### Identifier Formats

- Surrogate IDs — UUID (see Database Standards / Identity Strategy).
- Public IDs — structured strings per numbering scheme (per entity, per company).
- External IDs — as issued by the external system, stored verbatim.

### Text Lengths

- Text columns have explicit maximum lengths chosen from a small platform-wide catalogue (short, standard, long, description, unbounded-notes). No arbitrary per-column length experiments.
- Unicode is the default; collation and normalisation rules apply platform-wide.

### Boolean

- Stored as a boolean type, never as `0/1`, `Y/N`, or `TRUE/FALSE` strings.
- Column names are affirmative (`is_active`, `has_gst`) — never negatives.

### JSON Usage Rules

- JSON is used for genuinely schemaless or highly variable data (integration payload snapshots, extensible attribute bags with declared shape).
- JSON is not a substitute for modelling — recurring fields with domain meaning are promoted to columns.
- JSON documents that participate in business logic have a declared shape (schema) and are validated at the domain layer.

## Status Value Conventions

- Status values are `snake_case` string tokens (`draft`, `submitted`, `approved`, `posted`, `cancelled`).
- Each status column has a documented, closed set of allowed values enforced at the database layer.
- Status transitions are documented per entity (state diagrams live in domain PRDs); the database enforces allowed values, not allowed transitions — transition rules live in the domain model.

## Naming of Foreign References

- Foreign-key columns are named `<referenced_entity>_id` (e.g. `customer_id`, `voucher_id`, `warehouse_id`) — no ambiguity, no aliasing except for self-references and role-differentiated references, in which case the role is prefixed (`ship_to_branch_id`, `bill_to_branch_id`).

## Dictionary Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Concrete precision digits per money-computation context | Depends on statutory rules per market | Accounting pass | Accounting |
| Standard text-length catalogue values | Product/UX decision | Design pass | Product + Design |
| JSON shape validation mechanism | Coupled to runtime and ORM choice | Pass 4C / ADR | Platform |
| Locale catalogue and default per market | Commercial decision | Commercial pass | Product |
| Duration column standard units per domain | Domain-specific | Module PRDs | Domain owners |
| Public ID numbering schemes per entity | Product/UX decision per entity | Module PRDs | Product + Domain owners |

## Conforms to Canon

- **Canon: One Owner Per Entity** — the Data Ownership Matrix names exactly one owning domain per canonical entity.
- **Canon: Money is Never a Bare Number** — every monetary value carries currency, precision, and rounding semantics.
- **Canon: UTC-at-Rest, Local-at-Presentation** — timezone policy is uniform across the platform.
- **Canon: Vendor Neutrality** — no engine, ORM, or library is named.
- **Canon: Deferred Decisions Are Named** — every open topic appears in *Dictionary Decisions Pending* with an ADR pointer.

## References

- Database Architecture — data principles the dictionary implements.
- Multi-Tenant Architecture — tenant scope on every entity.
- Database Standards — naming, identity, and audit conventions applied here.
- Reference Data — governed lookups referenced by the entities above.
- Domain Map — the authoritative list of domains named as owners.
