---
title: "Database Architecture"
summary: "Data architecture principles, transaction and aggregate boundaries, OLTP/analytical split, partitioning, archival, backup, and replication philosophy under the ADR-017 dedicated-database-per-Tenant posture."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-25"
tags: ["architecture", "data", "pass-4b", "adr-017"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
referenced_by: []
supersedes_posture: "shared-schema per ADR-011 (for Tenant business data)"
aligned_to: "ADR-017"
---

# Database Architecture

> **Aligned to ADR-017 — Dedicated Database per Tenant Architecture** (supersedes the shared-database posture of ADR-011 for Tenant business data). ADR-011 continues to apply to the Platform database's own single-schema deployment. See `docs/11-adrs/architecture/ADR-017-dedicated-database-per-tenant-architecture.md`.

> Part of **Pass 4B — Data Foundation (Data Constitution)**. Defines the data-layer *philosophy* that every engine, domain, and module must obey. Physical schemas, DDL, ORM choices, and vendor-specific mechanics are intentionally out of scope.

## Overview

The BusinessOS data layer serves a multi-tenant, multi-domain ERP that spans transactional (OLTP) workloads and analytical (read-heavy, historical) workloads. This document defines the principles, boundaries, and lifecycles that govern how data is created, stored, replicated, archived, and retired — independent of any specific database engine, storage service, or ORM.

Under ADR-017, the persistence topology is **one Platform database plus one dedicated database per Tenant**. Concrete engine, provisioning, and routing choices are downstream ADR concerns. **Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## Platform vs Tenant Database Responsibilities

| Concern | Platform Database | Tenant Database |
| --- | --- | --- |
| Tenant registry (slug, display name, region, lifecycle state) | ✔ | — |
| Tenant → Database routing metadata | ✔ | — |
| Platform users and Super Admin / Platform Admin roles | ✔ | — |
| License, subscription, plan limits, entitlements | ✔ | — |
| Platform audit (provisioning, licensing, elevation, cross-tenant admin actions) | ✔ | — |
| Companies, Branches, Financial Years | — | ✔ |
| Tenant users, roles, permission grants | — | ✔ |
| Tenant configuration and feature flags | — | ✔ |
| Tenant audit (business events) | — | ✔ |
| All business module data (Accounting, Sales, Inventory, …) | — | ✔ |

**Cross-tenant table joins are impossible by construction** — there is no shared table to join. Cross-tenant reporting for platform metrics operates on anonymised or pre-aggregated derivations produced inside each Tenant database and delivered to the Platform layer.


## Data Architecture Principles

| ID | Principle | Statement |
|---|---|---|
| DP-01 | Tenancy is a first-class dimension | Every non-global record is unambiguously owned by exactly one tenant. Tenant scope is enforced at the data layer, not left to application code. |
| DP-02 | Aggregates define transaction boundaries | A single transaction mutates exactly one aggregate at a time. Cross-aggregate consistency is achieved through domain events, not distributed transactions. |
| DP-03 | Domain ownership of data | Every entity belongs to exactly one owning domain (see Domain Map). No domain reads or writes another domain's tables directly; access is mediated through domain APIs or replicated read models. |
| DP-04 | OLTP and analytical concerns are separated | Operational reads/writes and analytical queries live on distinct paths. Analytical stores derive from operational data — never the reverse. |
| DP-05 | Time is universal, presentation is local | All timestamps are stored in UTC. Localisation (tenant timezone, fiscal calendar) is a presentation concern. |
| DP-06 | Data is versioned, not overwritten (where it matters) | Financial, legal, and auditable records use append/version semantics; they are never destructively updated. |
| DP-07 | Soft delete over hard delete | Business entities are logically deleted by default; hard deletion is reserved for compliance and lifecycle end-of-life. |
| DP-08 | Referential integrity is guaranteed at the database layer | Foreign keys and constraints are non-negotiable inside an aggregate/domain. Cross-domain references use identity, not relational joins across boundaries. |
| DP-09 | Reference data is governed centrally | Currencies, countries, tax categories, and other canonical lookups have a single source of truth and consistent distribution semantics. |
| DP-10 | Data lifecycle is designed, not accidental | Every entity has a defined lifecycle: create → active → archive → purge, aligned with retention policy. |
| DP-11 | Auditability is a property of the data layer | Who/when/what for every meaningful change is captured as a first-class column set, not an afterthought. |
| DP-12 | Explicit precision and unit rules | Money, quantity, and percentage semantics are defined once and applied everywhere. |
| DP-13 | Failure isolation | A partition, tenant, or shard failure must not cascade to the whole platform. Data topology supports isolation by tenant tier where required. |

## OLTP vs Analytical Split

Operational and analytical workloads have fundamentally different access patterns, latency budgets, and consistency needs. The platform separates them logically and — where warranted — physically.

- **OLTP (system of record)** — normalised, transactional, latency-sensitive, tenant-scoped, aggregate-oriented. Serves the interactive product surfaces.
- **Analytical (system of insight)** — denormalised, historical, throughput-oriented, snapshot-consistent. Serves reporting, BI, ML, and long-range trend analysis.
- **Direction of flow** — analytical data is always *derived* from operational data (via change streams, extract windows, or event projections). Analytical stores are never the write master.
- **Consistency contract** — analytical results are eventually consistent with OLTP; UIs must communicate any lag that materially affects decision-making.
- **Cross-tenant analytics** — permitted only for platform-level metrics and only over anonymised or aggregated derivations; never for tenant-facing reporting.

## Transaction Boundaries

- **One aggregate, one transaction** — a database transaction mutates a single aggregate root and its owned entities. Multi-aggregate consistency is achieved through domain events and idempotent handlers.
- **No cross-domain transactions** — domains never enlist in a shared transaction. Sagas or process managers coordinate long-running, multi-domain workflows.
- **Read consistency** — within a request, reads are snapshot-consistent for the aggregate being modified. Cross-aggregate reads are eventually consistent unless explicitly stated.
- **Idempotency** — every write path that can be retried (webhooks, event handlers, integration adapters) must be idempotent by design (using natural or supplied idempotency keys).

## Aggregate Persistence Philosophy

- **Aggregates are the unit of loading and saving** — an aggregate is loaded and saved as a whole; internal entities are never persisted independently of their root.
- **Invariants live inside the aggregate** — the database enforces referential and structural integrity; business invariants live in the domain model.
- **Optimistic concurrency by default** — aggregates carry a version marker; concurrent writers detect conflicts at commit time rather than through pessimistic locks.
- **No lazy loading across aggregates** — cross-aggregate navigation uses identifiers, not object graphs.
- **Aggregate size discipline** — aggregates stay small enough to load, mutate, and persist within a single transaction under expected concurrency.

## Partitioning Strategy

Partitioning exists to bound working-set size, isolate noisy tenants, and keep hot tables fast. The platform recognises the following partitioning axes; concrete choices are per-entity and captured in ADRs.

- **Tenant partitioning** — the primary axis. Every tenant-scoped table is partitionable by tenant identifier.
- **Time partitioning** — for high-volume, append-mostly entities (vouchers, ledger lines, audit logs, events) to keep recent partitions hot and historical partitions cheap to archive.
- **Domain/region partitioning** — reserved for regulatory data-residency scenarios.
- **Anti-patterns** — partitioning by mutable business status, by user, or by any field that induces cross-partition transactions.

## Archival and Retention

- **Every entity declares a retention class** — operational, legal/financial, audit, ephemeral. Retention drives archival and purge behaviour.
- **Archival is lifecycle transition, not deletion** — archived data leaves the hot store, remains queryable through cold-path interfaces, and retains full audit metadata.
- **Financial and legal records are retained for the statutory horizon** applicable to the tenant's jurisdiction; hard deletion is only permitted after that horizon and only via a controlled purge process.
- **Personal data honours right-to-erasure obligations** through anonymisation of non-mandatory fields while preserving statutory records — never by deletion of legally required entries.

## Backup Philosophy

- **Point-in-time recovery** is a platform capability, not a per-module concern.
- **Under ADR-017, backup and restore operate at Tenant-database granularity.** Each Tenant's dedicated database is backed up independently; a single Tenant can be restored, exported, or replicated without touching another Tenant. The Platform database is backed up independently as platform metadata.
- **Backups are geographically redundant** and encrypted at rest and in transit.
- **Restore is regularly rehearsed** per Tenant tier; an untested backup is treated as no backup.
- **Recovery objectives** (RPO/RTO) are defined per Tenant tier and captured in the platform SLA; concrete numbers are downstream of this document.

## Replication and Read Scaling

- **Replication topology serves availability and read scaling**, not consistency shortcuts.
- **Read replicas are per-Tenant** (or per Tenant-tier) — a replica of one Tenant DB never carries another Tenant's data.
- **Cross-region replication is a data-residency and DR concern**, not a latency-optimisation trick, and is pinned to the Tenant's residency zone.
- **Replicas carry the same access controls as the primary** — replication is not a security boundary.


## Data Lifecycle

Every entity in BusinessOS follows this canonical lifecycle:

```text
draft/created  →  active  →  suspended/inactive  →  archived  →  purged
```

- Transitions are event-generating and audited.
- Only lifecycle transitions cause data to leave the hot store; ordinary business operations never do.
- Purge is a controlled, logged, reversible-until-committed operation.

## Failure Isolation and Blast Radius

- **Tenant isolation** — a single tenant's corruption, load spike, or misuse cannot degrade another tenant's experience beyond documented shared-resource limits.
- **Domain isolation** — a domain outage degrades that domain gracefully; consumers experience typed unavailability, not silent data loss.
- **Blast-radius accounting** — any change that widens blast radius (shared indexes, cross-tenant materialised views, cross-domain joins) requires an ADR.

## Data Decisions Pending

The following are intentionally deferred to ADRs and implementation documentation:

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Concrete database engine(s) and versions | Independent of architecture; changes over time | Pass 4C / ADR | Platform |
| Physical partitioning ranges and thresholds | Depends on tenant sizing and workload data | Post-pilot | Platform |
| Analytical store technology (warehouse vs lakehouse) | Depends on analytics scope and volume | Analytics pass | Analytics |
| Change-data-capture mechanism | Coupled to engine choice | ADR post engine selection | Platform |
| RPO/RTO numeric targets per tenant tier | Depends on commercial tier definitions | Commercial pass | Product + Platform |
| Cold-storage medium and query interface | Depends on retention volumes | Post-pilot | Platform |
| Encryption key management model | Coupled with Security Architecture | Pass 4C | Security |
| Multi-region topology and data-residency zones | Depends on target markets | Commercial pass | Product |

## Conforms to Canon

- **Canon: Domain Ownership** — every entity has exactly one owning domain (DP-03).
- **Canon: Multi-Tenancy First** — tenancy is a data-layer invariant, not application code (DP-01).
- **Canon: Auditability** — who/when/what is a first-class property of every meaningful record (DP-11).
- **Canon: Vendor Neutrality** — this document does not name a database engine, ORM, or cloud vendor.
- **Canon: Deferred Decisions Are Named** — every open topic appears in *Data Decisions Pending* with an ADR pointer.

## References

- Master Architecture — architectural context and layers.
- Domain-Driven Design — bounded contexts, aggregates, and events.
- Domain Map — canonical list of domains and their responsibilities.
- Database Standards — naming, keys, identity, audit, and constraint rules.
- Multi-Tenant Architecture — tenant model, isolation, and lifecycle.
- Data Dictionary — canonical entities and data-type conventions.
- Reference Data — governed lookups and catalogs.
