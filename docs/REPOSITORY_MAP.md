---
title: "Repository Map"
summary: "Complete map of the BusinessOS documentation repository: folder hierarchy, ownership, purpose, and document authority for every layer."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["repository", "map", "index"]
document_type: "Governance Guide"
---

# Repository Map

> **Derived document.** Projection of the folder layout under `docs/`. On any conflict, the actual folder contents and the layer's own README win; this map is corrected in the same change.

## Purpose

The **Repository Map** shows every documentation layer in the repository, its folder tree, its owner, its purpose, and whether it is authoritative or derived. It is the reader's atlas of `docs/`.

## Overview

```text
docs/
├── FOUNDATION_FREEZE_v1.md        Foundation Freeze         (Authoritative)
├── PRODUCT_DOCUMENTATION_BASELINE_v1.md Product Docs Baseline (Authoritative)
├── canon.md                        Canon                    (Authoritative)
├── glossary.md                     Glossary                 (Authoritative)
├── governance.md                   Governance               (Authoritative)
├── performance.md                  Performance targets      (Authoritative)
├── migration-strategy.md           Migration strategy       (Authoritative)
├── module-dependency-matrix.md     Module dependencies      (Derived)
├── decision-register.md            Redirect → 11-adrs       (Derived)
├── REPOSITORY_MAP.md               This document            (Derived)
├── DOCUMENT_INDEX.md               Master document index    (Derived)
├── DOCUMENT_OWNERSHIP_MATRIX.md    Ownership index          (Derived)
├── DOCUMENT_TRACEABILITY.md        Traceability             (Derived)
├── GLOSSARY_INDEX.md               Glossary index           (Derived)
├── ENGINE_USAGE_MATRIX.md          Engine usage             (Derived)
├── ADR_IMPACT_MATRIX.md            ADR impact               (Derived)
├── MODULE_CATALOG.md               Module catalog           (Derived)
├── 00-vision/                      Vision                   (Authoritative)
├── 01-master/                      Business Blueprint       (Authoritative)
├── 02-architecture/                Enterprise Architecture  (Authoritative)
├── 03-design/                      Design Standards         (Authoritative)
├── 04-domains/                     Legacy domain notes       (Reference)
├── 05-adr/                         Legacy ADRs (Superseded) (Deprecated)
├── 06-integrations/                Integrations             (Reference)
├── 07-reports/                     Reports catalog          (Reference)
├── 08-business-rules/              Business rules           (Reference)
├── 09-ai/                          AI notes                 (Reference)
├── 10-erp-core/                    ERP Core Engines         (Authoritative)
├── 11-adrs/                        ADR Repository           (Authoritative)
├── 11-erd/                         ERD diagrams             (Reference)
├── 12-ui-components/               UI components            (Reference)
├── 13-workflows/                   Workflow catalog         (Reference)
├── 14-localization/                Locale packs             (Reference)
├── 20-module-prds/                 Module PRDs (MOD-001..018) (Authoritative)
├── 30-sprint-prds/                 Sprint PRDs (SPR-MOD-NNN-NNN) (Authoritative — scaffolded)
├── SPRINT_CATALOG.md               Sprint catalog            (Derived)
├── SPRINT_AUTHORING_GUIDE.md       Sprint authoring guide    (Authoritative)
├── SPRINT_ROADMAP.md               Sprint roadmap            (Authoritative)
├── SPRINT_ESTIMATION_GUIDE.md      Sprint sizing framework   (Authoritative)
├── SPRINT_DEPENDENCY_MATRIX.md     Sprint dependency matrix  (Derived)
└── 99-templates/                   Document templates       (Reference)
```

## Layer Details

### Foundation

- **Path:** `docs/FOUNDATION_FREEZE_v1.md`, `docs/PRODUCT_DOCUMENTATION_BASELINE_v1.md`, `docs/canon.md`
- **Owner:** Platform
- **Purpose:** Freezes non-negotiable architectural baselines and canonical vocabulary.
- **Authority:** Authoritative. Only changes through a new Foundation Freeze revision.

### Business Blueprint

- **Path:** `docs/00-vision/`, `docs/01-master/`
- **Owner:** Product
- **Purpose:** Vision, PRD, roadmap, business model, scope, success metrics, assumptions, risks, FRS, SRS.
- **Authority:** Authoritative. Governed by Product; must not contradict Foundation Freeze or Canon.

### Architecture

- **Path:** `docs/02-architecture/`
- **Owner:** Architecture Governance
- **Purpose:** Enterprise architecture — master, quality attributes, DDD, data, security, API, events, AI, deployment, DevOps, testing, observability, integration.
- **Authority:** Authoritative. Changes propagate through the ADR process.

### Design Standards

- **Path:** `docs/03-design/`
- **Owner:** Design + Engineering
- **Purpose:** UI/UX design system, UX standards, coding standards.
- **Authority:** Authoritative. Changes via ADR (UI or Engineering categories).

### ERP Core Engines

- **Path:** `docs/10-erp-core/`
- **Owner:** Platform
- **Purpose:** 28 reusable ERP engine specifications plus the catalog and dependency matrix.
- **Authority:** Authoritative. `ENGINE_CATALOG.md` is a derived index within this layer.

### Architecture Decision Records

- **Path:** `docs/11-adrs/`
- **Owner:** Platform (ADR lifecycle)
- **Purpose:** Every significant engineering decision that implements the frozen architecture, in nine categories.
- **Authority:** Authoritative. `ADR_INDEX.md` is a derived index within this layer.

### Module PRDs

- **Path:** `docs/20-module-prds/` (18 folders, `MOD-001` … `MOD-018`)
- **Owner:** Product (per module, per `docs/DOCUMENT_OWNERSHIP_MATRIX.md`)
- **Purpose:** Authoritative business specifications for each bounded context. Each folder contains a `README.md` and a `MODULE_PRD.md`.
- **Authority:** Authoritative for the business layer. Consumes ERP Core Engines and Accepted ADRs; never redefines them. Modules identified by permanent `MOD-NNN`.

### Sprint PRDs (Pass 8+)

- **Path:** `docs/30-sprint-prds/` (scaffolded — layer README + 18 module subfolders; sprints authored iteratively in Pass 8.x)
- **Owner:** Engineering
- **Purpose:** Implementation-ready slices of Module PRDs. Every sprint has a permanent `SPR-MOD-NNN-NNN` identifier and a mutable `iteration` label.
- **Authority:** Authoritative for the sprint scope; must not contradict its Module PRD or any upstream layer. `SPRINT_CATALOG.md` is the derived index.

### Reference Documents

- **Path:** `docs/06-integrations/`, `docs/07-reports/`, `docs/08-business-rules/`, `docs/09-ai/`, `docs/11-erd/`, `docs/12-ui-components/`, `docs/13-workflows/`, `docs/14-localization/`, `docs/99-templates/`
- **Owner:** varies (Platform, Product, Engineering)
- **Purpose:** Supporting reference material and templates.
- **Authority:** Reference. Consumed by Module PRDs; not architectural sources of truth.

### Legacy ADRs

- **Path:** `docs/05-adr/`
- **Owner:** Platform (historical)
- **Purpose:** Original ADR set superseded by `docs/11-adrs/`. Retained for historical traceability.
- **Authority:** Superseded / Deprecated. Do not author new content here.

### Cross-cutting Derived Indexes

- **Path:** `docs/` root (files listed in the Overview tree)
- **Owner:** Platform
- **Purpose:** Repository navigation and traceability aids.
- **Authority:** Derived. Source files win on conflict.

## Maintenance Note

This map SHOULD be regenerated or reviewed whenever a top-level folder is added, removed, renamed, or its layer authority changes. It MUST NOT become an independent source of truth.

## References

- `docs/FOUNDATION_FREEZE_v1.md`
- `docs/canon.md`
- `docs/DOCUMENT_TRACEABILITY.md`
- `docs/DOCUMENT_INDEX.md`
- `docs/DOCUMENT_OWNERSHIP_MATRIX.md`
