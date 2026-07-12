---
title: "Governance Template Registry"
summary: "Per-template records for every governance template: identity, lifecycle, compatibility, usage."
layer: "platform"
owner: "Architecture Office"
status: "approved"
updated: "2026-07-12"
tags: ["governance", "templates", "registry"]
document_type: "Governance Registry"
---

# Governance Template Registry

Authoritative per-template record. One entry per template. Fields are verbatim across all records.

## Record Schema

| Field | Description |
|---|---|
| Template ID | `GT-NNN` |
| Template Name | Human-readable name |
| Current Version | SemVer `Major.Minor` |
| Status | `Active` \| `Deprecated` \| `Planned` \| `Draft` \| `Archived` |
| Compatible Governance Version | Governance Specification version this template targets |
| Owner | Accountable role/team |
| Lifecycle State | Draft \| Review \| Active \| Deprecated \| Archived |
| Template SHA256 | Hash over Sections 1–14 and 16, excluding §15 and examples |
| First Release | Version + originating pass |
| Latest Revision | Version + originating pass |
| Superseded By | Template ID + version, or `—` |
| Used By | Consuming passes / modules / execution instance IDs |
| Notes | Free-form |

## Records

### GT-001 — Legacy Reconciliation Corrective

| Field | Value |
|---|---|
| Template ID | GT-001 |
| Template Name | Legacy Reconciliation Corrective |
| Current Version | v1.1 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`.lovable/plan.md` → Template v1.1 → `template_identity.template_sha256`); scope: Sections 1–14 and 16, excluding §15 and Section 11 example |
| First Release | v1.0 — Pass 8.11.1-C v10 |
| Latest Revision | v1.1 — Pass 8.11.1-C v11 |
| Superseded By | — |
| Used By | MOD-006 CRM (Pass 8.11.1-C, execution instance `LEGACY-RECON-CORRECTIVE-v1.1-MOD006-001`) |
| Notes | v1.1 additive enhancements E1–E15. v1.0 remains Deprecated but historically valid. |

### GT-002 — Stage 1 Authoring

| Field | Value |
|---|---|
| Template ID | GT-002 |
| Template Name | Stage 1 Authoring |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.3 |
| Compatible Capabilities Registry | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| Template SHA256 | Recorded in template body (`docs/15-governance/templates/GT-002_STAGE1_AUTHORING.md` → §1 `template_sha256`); scope: Sections 1–14 and 16, excluding §15 and the Example Instantiation |
| Template UUID | 6b9c83b6-abbb-45a9-b52e-7f92762e25c6 |
| First Release | v1.0 — Pass 8.12.1 v10 |
| Latest Revision | v1.0 — Pass 8.12.1 v10 |
| Superseded By | — |
| Used By | — |
| Notes | Module PRD + Sprint Plan authoring template. Applicable to greenfield and legacy reconciliation. Delegates legacy PRD normalization to GT-001. |

### Governance Template Capabilities Registry

| Field | Value |
|---|---|
| Asset Type | Governance Registry (companion to templates) |
| Path | `docs/15-governance/GOVERNANCE_TEMPLATE_CAPABILITIES.md` |
| Current Version | v1.0 |
| Status | Active |
| Compatible Governance Version | v1.0 |
| Compatible Template Standard | v1.3 |
| Owner | Architecture Office |
| Lifecycle State | Active |
| First Release | v1.0 — Pass 8.12.1 v10 |
| Notes | Authoritative `CAP-NNN` capability identifiers referenced by governance templates. Includes optional relationship metadata schema and formal Relationship Semantics (execution / validation / traceability / version_scope). |

### GT-003 — Sprint Authoring

| Field | Value |
|---|---|
| Template ID | GT-003 |
| Template Name | Sprint Authoring |
| Current Version | TBD |
| Status | Planned |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Draft (not started) |
| Template SHA256 | — |
| First Release | — |
| Latest Revision | — |
| Superseded By | — |
| Used By | — |
| Notes | Canonical 18-section Sprint PRD authoring template. |

### GT-004 — Baseline Consolidation

| Field | Value |
|---|---|
| Template ID | GT-004 |
| Template Name | Baseline Consolidation |
| Current Version | TBD |
| Status | Planned |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Draft (not started) |
| Template SHA256 | — |
| First Release | — |
| Latest Revision | — |
| Superseded By | — |
| Used By | — |
| Notes | Stage 3 Module Baseline template, consolidation-only. |

### GT-005 — Repository Audit

| Field | Value |
|---|---|
| Template ID | GT-005 |
| Template Name | Repository Audit |
| Current Version | TBD |
| Status | Planned |
| Compatible Governance Version | v1.0 |
| Owner | Architecture Office |
| Lifecycle State | Draft (not started) |
| Template SHA256 | — |
| First Release | — |
| Latest Revision | — |
| Superseded By | — |
| Used By | — |
| Notes | Extract from Repository Audit Spec v1.0 in MODULE_IMPLEMENTATION_WORKFLOW.md. |
