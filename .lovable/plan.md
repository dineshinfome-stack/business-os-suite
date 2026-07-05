# Pass 4B — Data Foundation (Data Constitution) — v2 (Approved)

## Charter

Pass 4A defined the architectural shape of BusinessOS (Master Architecture, DDD, Domain Map).
Pass 4B defines the **data foundation** every engine, domain, and module will rely on.

This pass produces the *Data Constitution*: principles, conventions, standards, vocabulary,
and canonical reference data — **not** physical schemas, SQL, ORM mappings, or migrations.

## Scope

**In scope**
- Data architecture principles (OLTP vs analytical, transaction/aggregate boundaries, partitioning, archival, backup, replication — all as philosophy).
- Multi-tenant model (tenant definition, isolation, RLS strategy, lifecycle, cross-tenant ops).
- Database standards (naming, PK/FK, identity strategy, audit fields, soft delete, versioning, UUID policy, index/constraint conventions).
- Data dictionary (canonical vocabulary, ownership matrix, common data-type conventions incl. expanded money representation, timezone policy, precision).
- Canonical reference data catalog.

**Out of scope**
- CREATE TABLE, columns, indexes, ORM choice, migration tooling, RLS SQL, seed content, per-domain data models.
- Data classification by sensitivity (deferred to Pass 4C / Security Architecture).
- Canonical Master Data Strategy (deferred to ERP Core Engines pass).

## Deliverables

Five documents, vendor-neutral, conforming to Canon and Pass 4A.

### 1. `docs/02-architecture/database-architecture.md`
Overview · Data Architecture Principles (DP-01…DP-N) · OLTP vs Analytical Split · Transaction Boundaries · Aggregate Persistence Philosophy · Partitioning Strategy · Archival & Retention · Backup Philosophy · Replication & Read Scaling · Data Lifecycle · Data Decisions Pending · Conforms to Canon · References.

### 2. `docs/02-architecture/multi-tenant-architecture.md`
Overview · What is a Tenant · Tenant / Organization / Company / Branch hierarchy (Mermaid) · Tenant-Scoped vs Globally Shared Data · Isolation Strategy · Row-Level Security Strategy · Cross-Tenant Operations · Tenant Lifecycle (provision → suspend → deactivate → export → migrate → delete) · Data Residency · Tenancy Decisions Pending · Conforms to Canon · References.

### 3. `docs/02-architecture/database-standards.md`
Overview · Naming Conventions · Primary Key Policy ·
**Identity Strategy**:
  - Natural Keys · Surrogate Keys · UUID Policy · External IDs · Public IDs · Immutable IDs · Cross-System IDs · Integration IDs · Identity Ownership · Identity Lifetime · Identity Stability
  - Clarifies when natural vs surrogate keys apply, how external/public IDs differ from internal ones, and how identities survive import/export/migration/integration.
  - Identity Decisions Pending (ADR placeholders). Vendor-neutral; no UUID versions, libraries, or DB names.
· Foreign Key Rules · Mandatory Audit Fields · Soft Delete Policy · Optimistic Concurrency / Versioning · Constraint Conventions · Index Naming & Strategy · Enum vs Lookup Table Policy · Reserved Column Names · Deprecation & Column Removal Rules · Standards Decisions Pending · Conforms to Canon · References.

### 4. `docs/02-architecture/data-dictionary.md`
Overview · Canonical Entities (Tenant, Organization, Company, Branch, Fiscal Year, Currency, Exchange Rate, Employee, Customer, Vendor, Ledger, Voucher, Warehouse, Item, Project, Asset, Document, Attachment, User, Role) — definition + owning domain + identity rules only ·
**Data Ownership Matrix**:
  - Markdown table with columns: **Entity · Owning Domain · Referenced By · Source of Truth · Notes**.
  - Populated for all canonical entities above.
  - Ownership only — no tables, schemas, or relationships.
· Common Data-Type Conventions:
  - **Money Representation (Amount + Currency + Precision + Rounding Policy)**: amount representation, currency association, precision policy, rounding policy, comparison rules, currency conversion principles, display formatting responsibilities. Conceptual only — no decimal/SQL/float types.
  - Quantity & precision · Percentage · Date · DateTime · Timezone policy (UTC storage, tenant-local display) · Duration · Identifier formats · Text lengths · Boolean · JSON usage rules.
· Status Value Conventions · Naming of Foreign References · Dictionary Decisions Pending · Conforms to Canon · References.

### 5. `docs/02-architecture/reference-data.md`
Overview · What Qualifies as Reference Data · Governance & Ownership · Immutability · Versioning · Catalog: Countries, States/Provinces, Currencies, Languages & Locales, Units of Measure, Tax Categories, Document Statuses, Approval Statuses, Voucher Statuses, Entity Types, Communication Channels, Payment Methods, Address Types, Contact Types — each with purpose, owning domain, mutability, source of truth, distribution model · Reference Data Decisions Pending · Conforms to Canon · References.

## Consistency Requirements

Every document must:
- Include standard frontmatter (`title`, `summary`, `layer`, `owner`, `status: approved`, `updated`, `tags`, `depends_on`, `referenced_by`).
- Include a **Conforms to Canon** section citing specific Canon rules.
- Include a **Decisions Pending** section (topic · why deferred · rough window · owner).
- Remain vendor-neutral. Verbatim clause: *"Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation."*
- Cross-reference Pass 4A docs via `depends_on`.

## Portal / Navigation

Update `docs/_meta.json` `02-architecture` group ordering:
1. Master Architecture
2. Domain-Driven Design
3. Domain Map
4. Database Architecture
5. Multi-Tenant Architecture
6. Database Standards
7. Data Dictionary
8. Reference Data
9. (remaining existing architecture docs)

No route, package, or UI changes.

## Non-Goals

❌ No SQL/DDL · ❌ No column lists · ❌ No ORM/library choice · ❌ No RLS code · ❌ No migration mechanics · ❌ No API contracts · ❌ No module implementation · ❌ No specific UUID version/library · ❌ No data-sensitivity classification (Pass 4C) · ❌ No Master Data Strategy (ERP Core Engines pass).

## Acceptance Criteria

✓ Five documents authored, fully populated (no stub sections).
✓ Identity Strategy section present in Database Standards immediately after Primary Key Policy.
✓ Data Ownership Matrix present in Data Dictionary immediately after Canonical Entities.
✓ Money Representation expanded to *Amount + Currency + Precision + Rounding Policy* with all conceptual sub-topics.
✓ Multi-tenancy model unambiguous.
✓ Every canonical entity has an owning domain from the Domain Map.
✓ Money, quantity, date, timezone conventions singular and unambiguous.
✓ Every doc has a Decisions Pending section.
✓ Portal `_meta.json` reflects new ordering and registers `reference-data.md`.
✓ Tenancy hierarchy Mermaid diagram renders in preview.
✓ Vendor-neutral language preserved throughout.
✓ Zero implementation details leaked.

Only after Pass 4B is approved will Pass 4C begin.
