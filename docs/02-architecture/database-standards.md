---
title: "Database Standards"
summary: "Naming conventions, primary keys, identity strategy, foreign keys, audit fields, soft delete, versioning, and constraint standards that every table in BusinessOS must follow."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "data", "standards", "pass-4b"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-architecture"
  - "02-architecture/multi-tenant-architecture"
referenced_by: []
---

# Database Standards

> Part of **Pass 4B — Data Foundation (Data Constitution)**. Defines the standards every table, column, index, and constraint in BusinessOS must obey. Concrete DDL, engine-specific syntax, and ORM mappings are downstream of this document.

## Overview

Database standards make the platform's data layer predictable, auditable, and evolvable. Every domain, module, and engine builds on the same conventions, so a developer moving between Accounting, Inventory, and CRM sees the same shapes, the same audit columns, the same identity model, and the same soft-delete semantics.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## Naming Conventions

- **Tables** — `snake_case`, plural, domain-prefixed where ambiguity is possible (e.g. `accounting_ledger_lines`, `sales_orders`, `hr_employees`). Foundation entities may omit domain prefix (`tenants`, `organizations`, `companies`, `branches`).
- **Columns** — `snake_case`, singular, descriptive; no abbreviations except industry-standard ones (`gst`, `hsn`, `iban`).
- **Foreign key columns** — `<referenced_entity>_id` (e.g. `customer_id`, `voucher_id`). No `fk_` prefixes.
- **Boolean columns** — `is_<state>` or `has_<state>` (e.g. `is_active`, `has_attachments`). No negatives (`is_not_deleted` is forbidden).
- **Timestamp columns** — `<verb>_at` (e.g. `created_at`, `posted_at`, `archived_at`).
- **Enum/status columns** — `<noun>_status` or `<noun>_type` (e.g. `voucher_status`, `document_type`).
- **Indexes** — `idx_<table>_<columns>[_<qualifier>]`.
- **Unique indexes** — `uq_<table>_<columns>`.
- **Foreign key constraints** — `fk_<table>_<column>`.
- **Check constraints** — `ck_<table>_<rule>`.
- **Reserved names** — reserved words in the target engine and the following platform-reserved names must not be used as column names: `metadata`, `data`, `value`, `key`, `type` (as a bare column), `status` (as a bare column). Reserved names are captured in this document, not in engine-specific migration files.

## Primary Key Policy

- **Every table has a single-column primary key** named `id`.
- **Primary keys are surrogate**, not natural. Business identifiers (invoice number, employee code, SKU) exist as separate columns with their own uniqueness constraints.
- **Primary keys are immutable** for the lifetime of the row. Mutation of `id` is forbidden.
- **Primary keys carry no business meaning** — they are opaque to end users and to integrations, unless explicitly promoted to a public identifier.
- **Primary keys are non-sequential and non-guessable** — they must not leak record counts or ordering.

## Identity Strategy

Identity in an ERP is not one concept — it is a family of related concepts, each with its own rules. This section defines the canonical identity strategy for BusinessOS.

### Natural Keys

- **Definition** — an identifier that has business meaning outside the platform (invoice number, employee code, SKU, GSTIN, PAN, ISBN).
- **Usage** — natural keys exist as ordinary columns with uniqueness constraints scoped to the appropriate context (e.g. unique per tenant, or per company, or globally, as the business requires).
- **Never used as primary keys** — natural keys can change, be reissued, or carry format changes over time; primary keys cannot.
- **Ownership** — the owning domain defines the format, generation rules, and mutation rules of each natural key.

### Surrogate Keys

- **Definition** — the opaque `id` column defined in *Primary Key Policy*.
- **Purpose** — provide a stable, immutable, business-meaning-free identifier for every row.
- **Applies to every table**, without exception.

### UUID Policy

- **All surrogate primary keys are UUIDs**.
- **UUIDs must be time-ordered** in a way that supports efficient index locality for insert-heavy tables.
- **UUIDs must be globally unique** across all tenants, all environments, and all deployments; a UUID collision must be treated as a platform incident.
- **Concrete UUID version, generator library, and format** are ADR concerns and intentionally not fixed here.

### External IDs

- **Definition** — identifiers assigned by external systems (payment gateway transaction ID, bank reference, e-invoice IRN, GSTN reference).
- **Storage** — stored on the entity that they describe, in columns named `<system>_id` or `<system>_reference` (e.g. `razorpay_payment_id`, `irn_number`).
- **Never used as primary keys.** External systems can revise, revoke, or reformat identifiers; the platform's identity remains stable.
- **Multiple external IDs may attach to the same entity** as it is exchanged with multiple systems.

### Public IDs

- **Definition** — a human-friendly, platform-issued identifier suitable for display, URL segments, and support conversations (e.g. `INV-2026-000123`).
- **Distinct from surrogate keys** — surrogate keys are opaque UUIDs; public IDs are readable and structured.
- **Distinct from natural keys** — natural keys come from the business; public IDs are minted by the platform per configurable numbering scheme.
- **Uniqueness scope** — typically unique per company or per tenant, depending on the entity.
- **Immutable once issued.**

### Immutable IDs

- Once a row is created, its `id` value and any issued public ID for that row are immutable for the lifetime of the row and beyond, including archive and cold-storage tiers.

### Cross-System IDs

- When the platform participates in a multi-system landscape (imports from a predecessor ERP, syncs with a CRM, exchanges with a marketplace), each participating system's identifier for the entity is captured as an external ID.
- The platform's `id` remains the authoritative internal identity. External IDs are metadata.

### Integration IDs

- Integration adapters (bank feeds, payment gateways, tax portals, marketplaces) generate their own request/response identifiers.
- These are captured on the integration transaction record itself, never on the business entity in place of the business entity's identity.

### Identity Ownership

- Every identity (surrogate, natural, public, external) has an owning domain (see *Data Ownership Matrix* in Data Dictionary).
- The owning domain defines the rules for that identity's format, generation, and mutability.
- Consuming domains reference identity — they do not redefine it.

### Identity Lifetime

- Surrogate `id` — for the lifetime of the row and beyond (retained in archives, audit logs, and derived analytics).
- Public ID — for the lifetime of the row and beyond; never reissued to a different row.
- Natural key — for as long as the business defines it as valid; a reissued natural key attaches to a new row.
- External ID — for as long as the external system retains it; the platform captures a snapshot at the time of exchange.

### Identity Stability

- Identity must survive: **import, export, migration, integration, backup, restore, archive, and cold-storage retrieval**.
- No platform operation, other than explicit tenant purge after retention, may cause an identity to be lost, changed, or reassigned.
- Merging two entities (e.g. deduplicating two customer records) is a lifecycle operation that produces an explicit merge record; neither identity is silently dropped.

### Identity Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Concrete UUID version and generation library | Coupled to engine and runtime choice | Pass 4C / ADR | Platform |
| Public ID numbering scheme(s) per entity | Product/UX decision per entity | Module PRDs | Product + Domain owners |
| Deduplication and merge protocol | Depends on CRM and Accounting design | Domain passes | CRM + Accounting owners |
| External-ID retention policy per integration | Depends on integration contracts | Integration pass | Integrations |

## Foreign Key Rules

- **Foreign keys are enforced at the database layer** for all references *inside an aggregate or inside a domain*.
- **Cross-domain references use identity only** — a `customer_id` on a sales order is a UUID; there is no enforced FK across bounded contexts. Referential integrity across domains is the responsibility of the owning domain via events and reconciliation.
- **ON DELETE** — for owned entities inside an aggregate, cascade to the aggregate root's lifecycle. For cross-aggregate references, restrict; deletion is a domain decision, not a database side effect.
- **ON UPDATE** — never used; primary keys are immutable, so cascade-on-update has no purpose.
- **All foreign key columns are indexed**.

## Mandatory Audit Fields

Every tenant-scoped table carries the following columns. These are not optional and are not domain-specific.

| Column | Purpose |
|---|---|
| `id` | Surrogate primary key (see Primary Key Policy and Identity Strategy). |
| `tenant_id` | Tenant scope (see Multi-Tenant Architecture). Non-null on every tenant-scoped row. |
| `created_at` | Timestamp of row creation. UTC. Non-null. |
| `created_by` | Identity of the actor that created the row (user, system, integration). Non-null. |
| `updated_at` | Timestamp of the most recent mutation. UTC. Non-null. |
| `updated_by` | Identity of the actor that performed the most recent mutation. Non-null. |
| `version` | Monotonic version counter for optimistic concurrency. Non-null. |
| `deleted_at` | Null when active; timestamp when soft-deleted. |
| `deleted_by` | Null when active; identity of the actor that soft-deleted the row. |

Globally shared reference tables omit `tenant_id` and `deleted_at`/`deleted_by` (they are not soft-deletable) but retain `created_at`, `created_by`, `updated_at`, `updated_by`, and `version`.

Additional finer-grained audit (before/after diffs, full change history) is captured by the platform's audit facility, not by every domain reimplementing it.

## Soft Delete Policy

- **Business entities are soft-deleted by default** — deletion sets `deleted_at` and `deleted_by` and preserves the row.
- **Soft-deleted rows are invisible to ordinary queries** and to cross-domain consumers.
- **Soft-deleted rows retain referential integrity** — foreign keys pointing to them continue to resolve; consumers observe a tombstone rather than a broken reference.
- **Hard delete is reserved for**: reference-data corrections, GDPR-style erasure of non-mandatory personal data, and post-retention purge.
- **Soft delete is not a business status** — a cancelled invoice is not a deleted invoice. Business lifecycle uses status columns, not `deleted_at`.

## Optimistic Concurrency and Versioning

- **Every aggregate root has a `version` column** that increments on every mutation.
- **Writers must supply the expected version**; a version mismatch aborts the write with a typed concurrency error.
- **No pessimistic locks** in the transactional path except for narrow, documented cases (e.g. sequence generation).
- **Event handlers are idempotent** and use the aggregate's version to reject stale or duplicate deliveries.

## Constraint Conventions

- **NOT NULL is the default**; nullable columns must be justified by domain meaning.
- **CHECK constraints** encode invariants that the database can cheaply enforce (allowed status values, non-negative quantities, non-empty strings for required text fields).
- **UNIQUE constraints** encode business uniqueness rules and are named per the *Naming Conventions* section; uniqueness scope (global, per-tenant, per-company) is explicit in the index columns.
- **Constraints have named errors** — application code maps constraint violations to typed domain errors, never to raw driver messages.

## Index Strategy

- **Every foreign key column is indexed.**
- **Every column used in a hot query predicate is indexed** with an index chosen to serve that predicate.
- **Composite indexes lead with the highest-selectivity column** consistent with the query pattern; `tenant_id` typically leads on tenant-scoped tables.
- **Partial and expression indexes** are used where they materially reduce index size or serve a specific query pattern.
- **Every index is justified** — indexes are inventory; unused indexes are removed.

## Enum vs Lookup Table Policy

- **Small, stable, code-only enumerations** (e.g. `voucher_status`, `document_type`, `approval_status`) are represented as string enums with a database-enforced allowed-value constraint.
- **Business-facing lookups** (currencies, countries, tax categories, units of measure) live in governed reference tables (see Reference Data).
- **Enums never encode business data users need to configure** — configurable lists are lookups, not enums.
- **Enums are additive** — values may be added; existing values may be deprecated but not removed while any row still uses them.

## Reserved Column Names

The following column names are reserved and must not be used as ordinary business columns:

- `id`, `tenant_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `version`, `deleted_at`, `deleted_by` — reserved for their audit semantics.
- `data`, `metadata`, `value`, `key` — reserved to prevent semantically empty column names; use descriptive names instead.
- `type`, `status` — must be prefixed (`document_type`, `voucher_status`) to disambiguate.

## Deprecation and Column Removal Rules

- **Columns are added additively** — new columns are nullable or defaulted so existing writers keep working.
- **Columns are deprecated before removal** — a deprecated column is marked in this document and the data dictionary, remains readable for a documented deprecation window, and stops being written by the platform before removal.
- **Removal is a migration event**, always paired with an ADR that names the removed column, the deprecation window observed, and the archival disposition of any historical data.
- **No silent renames** — a rename is a deprecate-add-migrate-remove sequence, not a rename in place.

## Standards Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Concrete character set/collation for text columns | Depends on engine choice | Pass 4C / ADR | Platform |
| Standard length caps for common text columns | Product/UX decision | Module PRDs | Product |
| Encryption-at-column policy for sensitive fields | Coupled with Security Architecture | Pass 4C | Security |
| Row-level compression and TOAST-equivalent tuning | Engine-specific | Post-pilot | Platform |
| Change-history table conventions | Coupled to audit facility | Audit domain pass | Foundation |

## Conforms to Canon

- **Canon: Every row is auditable** — `created_*`, `updated_*`, and `version` are mandatory on every table.
- **Canon: Tenancy is a data-layer invariant** — `tenant_id` is mandatory on every tenant-scoped table.
- **Canon: Primary keys are opaque surrogates** — no business meaning in `id`.
- **Canon: Domain Ownership** — cross-domain references use identity, not enforced FKs across boundaries.
- **Canon: Vendor Neutrality** — no engine syntax, ORM, or library is named.
- **Canon: Deferred Decisions Are Named** — every open topic appears in *Identity Decisions Pending* or *Standards Decisions Pending*.

## References

- Database Architecture — data principles that these standards implement.
- Multi-Tenant Architecture — tenant column semantics and RLS.
- Data Dictionary — canonical entities, identity rules per entity, and data-type conventions.
- Reference Data — governed lookups referenced by domain tables.
- Domain Map — domain ownership boundaries.
