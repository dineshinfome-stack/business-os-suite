---
title: "Platform Testing Standard"
summary: "Mandatory automated coverage for shared platform services: permissions, settings precedence, tenant isolation, workflow, numbering, and API contracts."
document_type: "Governance Standard"
layer: "governance"
owner: "Platform / Quality"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "testing", "quality"]
---

# Platform Testing Standard

## Purpose

Shared platform services carry disproportionate blast radius. This standard defines the minimum automated coverage every shared service MUST ship with.

## Mandatory Coverage

Each shared service MUST include automated tests covering:

1. **Permission resolution** — role → permissions transitively resolved, deny paths verified.
2. **Settings precedence** — organization → company → user overrides applied in the documented order.
3. **Multi-tenant isolation** — cross-tenant read/write attempts blocked by RLS and by application-layer guards.
4. **Workflow execution** — happy path, retry, cancellation, and idempotency.
5. **Number generation** — uniqueness under concurrency, gap policy, per-scope sequences.
6. **API contracts** — request/response schemas match `openapi.yaml`; error envelope conforms to ADR-022.

## Coverage Bar

- Unit + integration coverage for shared-service code paths MUST be ≥ 80%.
- Every HIGH-severity bug fixed in a shared service MUST land with a regression test.

## Test Locations

- Unit / integration: co-located with the service module.
- End-to-end: `e2e/`.
- Database: SQL fixtures + policy tests.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
