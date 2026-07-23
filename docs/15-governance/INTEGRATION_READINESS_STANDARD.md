---
title: "Integration Readiness Standard"
summary: "Contracts for API versioning, webhooks and events, shared-service consumers, error envelope, and authentication used by internal, external, and mobile callers."
document_type: "Governance Standard"
layer: "governance"
owner: "Platform / API"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["governance", "integration", "api", "webhooks"]
---

# Integration Readiness Standard

## Purpose

Make the platform integrable from day one. Fixes the contracts every internal, external, and mobile caller can rely on before Wave 1.

## 1. API Versioning

- All external and mobile APIs are versioned in the URL: `/api/v1/...` (ADR-021).
- Breaking changes require a new major version and a documented deprecation window of at least two release cycles.
- Non-breaking additions land in the current major version.

## 2. Webhook and Event Contracts

- Every published event is registered in `docs/02-architecture/event-catalog.md`.
- Webhook payloads are signed per ADR-024; consumers verify the signature.
- Events are versioned; renaming or removing fields requires a new event version.

## 3. Shared-Service Consumer Contracts

- Every service listed in `CROSS_CUTTING_SERVICES_CATALOG.md` publishes a typed contract (server function signatures, event schemas, or HTTP contract).
- Consumers MUST import the typed contract, not re-declare the shape.

## 4. Uniform Error Envelope

All API responses use the error envelope defined in ADR-022:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": { "...": "..." },
    "correlation_id": "uuid"
  }
}
```

## 5. Uniform Authentication

- Internal callers: user session (Supabase auth) via `requireSupabaseAuth` middleware.
- External callers: signed API keys with organization scope, resolved through the same authorization pipeline.
- Mobile callers: same session model as web, using `/api/v1/...`.
- Webhook callers to `/api/public/*`: signature verification only; no session.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`. Anchored by ADR-020, ADR-021, ADR-022, ADR-024.
