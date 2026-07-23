---
title: "Documentation as Artifact Standard"
summary: "No sprint is complete until its documentation artifacts are published alongside the code."
document_type: "Governance Standard"
layer: "governance"
owner: "Platform / Documentation Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "documentation", "artifacts"]
---

# Documentation as Artifact Standard

## Purpose

Treat documentation as a first-class shipped artifact. A sprint is not complete until its documentation set is published.

## Required Artifacts per Sprint

| Artifact | Required When |
| -------- | ------------- |
| Sprint PRD | Always |
| Architecture note | Whenever the sprint changes cross-cutting behavior |
| ADR | Whenever an architectural decision is made or superseded |
| Verification Report | Always |
| Migration Registry entry | Whenever a database migration lands |
| Implementation notes | Whenever behavior deviates from the PRD in a non-trivial way |

## Rules

- No sprint is closed while any required artifact above is missing.
- Every artifact carries the governance frontmatter defined by `STANDARDS_LIFECYCLE_STANDARD.md` where applicable.
- ADRs MUST be registered in `docs/11-adrs/ADR_INDEX.md` in the same change.
- Migrations MUST be registered in `docs/15-governance/MIGRATION_REGISTRY.md` in the same change.

## Verification

Each Wave 0.5+ Architecture Review Gate checks a random sample of the last three sprints for artifact completeness.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
