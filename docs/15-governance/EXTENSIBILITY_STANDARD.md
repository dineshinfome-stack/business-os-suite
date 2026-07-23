---
title: "Extensibility Standard"
summary: "Designed-in extension points that let tenants and downstream modules extend the platform without forking core code."
document_type: "Governance Standard"
layer: "governance"
owner: "Platform"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "extensibility", "plugin", "custom-fields"]
---

# Extensibility Standard

## Purpose

Extensibility is designed in, not bolted on. This standard enumerates the extension points the platform commits to providing and the rules every extension MUST honor.

## Extension Points

1. **Module Registration** — modules register themselves via a manifest; the platform discovers them without hard-coded imports.
2. **Plugin Architecture** — third-party plugins mount into declared extension slots (routes, menus, workflow steps, report widgets).
3. **Custom Fields** — tenants add fields to core entities without schema forks; storage strategy documented per entity.
4. **Workflow Engine** — tenants author workflows over declared triggers and actions.
5. **Approval Engine** — tenants configure approval graphs per document type.
6. **Event Bus** — internal cross-module and external subscribers consume typed events per `docs/02-architecture/event-catalog.md`.
7. **Webhooks** — outbound HTTP delivery of published events with signed payloads (ADR-024).
8. **Reporting Engine** — pluggable data sources and templates.
9. **Automation Engine** — tenant-authored rules combining triggers, conditions, and actions.

## Rules

- Every extension point publishes a versioned contract.
- Extensions MUST NOT bypass RBAC, tenancy isolation, or audit.
- Breaking changes to an extension-point contract require a MAJOR version bump and a deprecation window.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`. Anchored by ADR-004 (Plugin Extension Model) and ADR-010 (Plugin Framework).
