---
title: "Cross-Cutting Services Catalog"
summary: "Canonical registry of platform services consumed by more than one module. Modules MUST consume these; they MUST NOT re-implement them."
document_type: "Governance Catalog"
layer: "governance"
owner: "Platform"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "cross-cutting", "catalog", "shared-services"]
---

# Cross-Cutting Services Catalog

## Purpose

Any capability used by two or more modules belongs here. This catalog is the single source of truth for shared platform services. Modules MUST consume the entries in this catalog and MUST NOT re-implement them.

## Registry Schema

Each entry records:

- **Service** — human-readable name.
- **Owner sprint** — the sprint that first ships the service.
- **Status** — `Planned` · `In Progress` · `Available` · `Deprecated`.
- **Consumer contract** — link to the interface / server-function contract documented for the service.
- **Related ADR / Standard** — anchor decision or rule set.

## Registry

| Service | Owner Sprint | Status | Consumer Contract | Related |
| ------- | ------------ | ------ | ----------------- | ------- |
| Auth & Session | Sprint 0.3 / 0.4A | Available | `src/contexts/auth-context.tsx` | ADR-030 |
| Multi-Tenancy | Sprint 0.4 | Available | `src/lib/organizations.functions.ts` | `TENANCY_STANDARD.md` |
| RBAC / Authorization | Sprint 0.5 | Available | `src/lib/authorization.functions.ts` | `RBAC_STANDARD.md` |
| Audit Logging | Sprint 0.3 | Available | `src/lib/auth-audit.ts` | ADR-014 |
| Notifications | Sprint 0.7 (planned) | Planned | TBD | Charter |
| Attachments & File Storage | Sprint 0.8 (planned) | Planned | TBD | Charter |
| Comments | Sprint 0.9 (planned) | Planned | TBD | Charter |
| Tags | Sprint 0.9 (planned) | Planned | TBD | Charter |
| Activity Timeline | Sprint 0.9 (planned) | Planned | TBD | Charter |
| Search | Sprint 0.10 (planned) | Planned | TBD | Charter |
| Number Generation | Sprint 0.10 (planned) | Planned | TBD | Charter |
| Approval Workflow | Sprint 0.11 (planned) | Planned | TBD | Charter |
| AI Platform Layer | Wave AI | Planned | TBD | `AI_PLATFORM_LAYER_STANDARD.md` |

## Promotion Rules

- A capability appears in this catalog **before** its second consumer is authored.
- Duplicate implementations discovered in an Architecture Review Gate are logged as a MEDIUM finding at minimum.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
