---
title: "API Architecture"
summary: "The platform contract for how BusinessOS exposes capabilities: REST-first style, versioning, request/response shape, canonical error model, cursor pagination, idempotency, webhooks, rate limiting, deprecation, and API lifecycle governance."
layer: "platform"
owner: "Platform Architecture"
status: "approved"
updated: "2026-07-05"
tags: ["architecture", "api", "platform", "pass-4c"]
depends_on:
  - "02-architecture/master-architecture"
  - "02-architecture/domain-driven-design"
  - "02-architecture/domain-map"
  - "02-architecture/database-standards"
  - "02-architecture/multi-tenant-architecture"
  - "02-architecture/data-dictionary"
referenced_by: []
---

# API Architecture

> Part of **Pass 4C — Platform Constitution**. Defines the *contract* every BusinessOS API must obey. It does **not** enumerate endpoints, resource schemas, gateway products, SDK code, or transport implementations — those are downstream of this document.

## Overview

Every capability in BusinessOS — voucher posting, inventory movement, payroll runs, AI actions — is eventually exposed as an API. This document establishes the platform-wide contract that every such API must honour, regardless of the module authoring it. Uniformity here is what allows dozens of domains, an AI copilot, external integrators, and future SDKs to interoperate without special-casing.

**Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.**

## API Principles

- **AP-01 — Contract-first.** APIs are specified before they are implemented. The specification is the source of truth; generated code, SDKs, and documentation follow from it.
- **AP-02 — REST-first, exceptions justified.** Resource-oriented HTTP is the default style. Non-REST styles (GraphQL, RPC, streaming) are permitted only when justified by capability need and captured in an ADR.
- **AP-03 — Predictability over cleverness.** The same problem (pagination, errors, filtering, idempotency, concurrency) MUST be solved the same way across every domain.
- **AP-04 — Explicit over implicit.** Tenancy, versioning, correlation, and idempotency are carried on explicit headers or fields; never inferred.
- **AP-05 — Backward compatible by default.** Breaking changes require a new API version and a documented deprecation window.
- **AP-06 — Least surprise.** Names, shapes, verbs, and status codes follow well-known HTTP semantics.
- **AP-07 — Multi-tenant safe.** No API may leak data across tenants; tenant scope is validated on every request, not derived from client hints alone.
- **AP-08 — Idempotent by design.** Mutating operations MUST be safe to retry.
- **AP-09 — Observable by default.** Every API call produces correlation identifiers usable end-to-end.
- **AP-10 — Documented or non-existent.** An API without a published specification does not exist for platform purposes.

## API Style

- **Default style** — REST over HTTPS with JSON payloads and standard HTTP verbs and status codes.
- **When GraphQL is permitted** — for read-heavy composition surfaces (e.g. analytical dashboards, portal aggregation) where cross-domain field selection materially reduces round-trips. Mutations remain REST unless an ADR states otherwise.
- **When RPC-style is permitted** — for internal service-to-service calls where strict schemas and low latency outweigh REST semantics.
- **When streaming is permitted** — for progress feeds, live dashboards, notifications, and long-running operation status. Streaming APIs MUST expose an equivalent polling fallback.
- All non-default styles require an ADR that names the surface, its consumers, and its lifecycle.

## Resource Model & URL Conventions

- Resources are **nouns**, plural, lower-kebab-case.
- URL structure follows the hierarchy of aggregates, not the hierarchy of storage: `/{version}/{domain}/{resource}[/{id}[/{sub-resource}[/{id}]]]`.
- Tenancy is **carried in claims and headers**, not in the URL. Public URLs MUST NOT contain tenant identifiers.
- Company and branch scoping likewise travel in headers or claims; they MAY appear as filter parameters but MUST NOT be positional path segments in general-purpose APIs.
- Actions that do not fit a resource verb are modelled as sub-resources or explicit action paths (e.g. `/vouchers/{id}/post`, `/orders/{id}/cancel`). Verb-only URLs are forbidden.
- Query strings are used for filtering, sorting, pagination, and projection — never for identity.

## Versioning Strategy

- **Major version in the URL path** — `/v1/...`, `/v2/...`. Major versions represent incompatible changes.
- **Minor and patch changes are additive** — new fields, new endpoints, new optional parameters — and do not change the version.
- **Deprecated fields remain** for the deprecation window and are marked in the specification and the response envelope.
- **Version negotiation via `Accept` headers** is permitted for read APIs where multiple representations coexist, but the URL version remains authoritative.
- **Preview APIs** run under a distinct segment (e.g. `/v1-preview/...`) and are subject to different stability rules (see *API Lifecycle Governance*).

## Request Conventions

Every request MUST accept or supply, as applicable:

- **`Authorization`** — bearer credential establishing the caller and, transitively, the tenant.
- **`X-Tenant-Id`** — REQUIRED for cross-tenant-capable principals (integrations, support tooling). For end-user sessions, tenant is derived from claims and this header is validated to match.
- **`X-Company-Id` / `X-Branch-Id`** — OPTIONAL scoping headers where the resource is company- or branch-partitioned. When present, they MUST match the claims' allowable set.
- **`X-Correlation-Id`** — RECOMMENDED on inbound requests; generated by the platform when absent. Propagated to logs, traces, events, and downstream calls.
- **`X-Idempotency-Key`** — REQUIRED on unsafe verbs (POST, PATCH, PUT, DELETE) that mutate state and MAY be retried. Semantics defined in *Idempotency*.
- **`Accept-Language`** — OPTIONAL; drives error message localization and formatting concerns delegated to the platform localization engine.
- **`If-Match` / `If-None-Match`** — used for optimistic concurrency (see *Concurrency*).
- **Request body** — JSON; UTF-8; camelCase field names in the transport envelope. Internal database `snake_case` naming is translated at the edge.

## Response Conventions

- Successful responses use `2xx` status codes with a JSON body whose top-level fields are `data`, `meta`, and (for paginated calls) `pagination`.
- `data` is either the resource, an array of resources, or an operation acknowledgement.
- `meta` carries non-payload information — server time, correlation id, deprecation notices, applied warnings.
- Content negotiation defaults to `application/json`. Alternative representations (CSV, PDF) MUST be explicitly requested via `Accept`.
- `Retry-After` MUST accompany `429` and `503` responses.
- Timestamps in responses are ISO-8601 in UTC, following the Data Dictionary's timezone policy.

## Error Model

A single canonical error envelope applies to every API in the platform.

```text
{
  "error": {
    "code":         "<stable machine-readable code>",
    "message":      "<human-readable summary, localizable>",
    "correlationId":"<X-Correlation-Id>",
    "details":      [
      { "field": "<path>", "code": "<field code>", "message": "<field-level explanation>" }
    ],
    "retryable":    <boolean>,
    "documentation":"<link to error catalogue entry>"
  }
}
```

- **Error codes** are stable, dotted, domain-prefixed strings (`accounting.voucher.period_closed`, `platform.auth.token_expired`). They are part of the public contract and MUST NOT be renamed without a version change.
- **HTTP status** classifies the error at transport level (`400` client, `401/403` auth, `404` missing, `409` conflict, `422` validation, `429` throttled, `5xx` server). The `code` inside the envelope provides the semantic classification.
- **Correlation id** in the envelope MUST equal the value used in server logs and traces.
- **`retryable`** signals whether an idempotent retry may succeed; caller MUST respect it.
- Error messages are **safe to display** — they never leak internal identifiers, SQL, stack traces, or PII.

## Pagination

- **Cursor-based pagination is the default.** Offset/limit pagination is permitted only for small, bounded, non-user-facing lists and MUST be documented as such.
- Paginated responses carry a `pagination` block:

  ```text
  {
    "pagination": {
      "nextCursor": "<opaque>",
      "prevCursor": "<opaque or null>",
      "pageSize":    50,
      "hasMore":     true
    }
  }
  ```

- Cursors are **opaque** to the client. Servers MUST NOT expose internal ordering keys, sequence numbers, or database identifiers through them.
- `pageSize` has a documented default and maximum per API.
- Total counts are **not returned by default** — they are expensive and often stale. When required, an explicit `?includeTotal=true` parameter opts in and the field is `totalApproximate`, not `total`.

## Filtering & Sorting

- Filtering uses named query parameters keyed by field: `?status=posted&customerId=...`. Complex predicates use a documented syntax per API (e.g. `?filter=amount:gte:1000`).
- Sorting uses `?sort=field` and `?sort=-field` for descending. Multi-sort is comma-separated.
- Every filterable and sortable field MUST be declared in the API specification; ad-hoc filtering on undeclared fields is forbidden.
- Filters and sorts MUST respect tenant scope and permission scope; a filter never widens access.

## Search Semantics

- Free-text search endpoints are separate from list endpoints and use `?q=...`.
- Search results carry a `score` in `meta` per item where the underlying engine provides one.
- Search is **eventually consistent** relative to writes; APIs MUST document expected freshness.
- Search MUST respect the same authorization and tenant boundaries as record-level reads.

## Bulk & Batch Operations

- Bulk endpoints accept an array under `data` and return a per-item result array in the same order.
- Each item result carries either a success payload or the canonical error envelope; overall HTTP status is `200` when at least one item succeeded, `207` (multi-status) when partial, or `4xx/5xx` when the batch itself failed.
- Bulk operations MUST be idempotent per item; the idempotency key applies to each item as declared in the payload.
- Batch sizes have documented ceilings; oversize requests are rejected with a specific error code.

## Long-Running Operations

- Operations that cannot complete synchronously return `202 Accepted` with an operation resource: `{ "operationId": "...", "status": "pending", "statusUrl": "..." }`.
- Operation status endpoints report `pending | running | succeeded | failed | cancelled`, a progress hint where meaningful, and a final result location or error envelope.
- Long-running operations MUST support cancellation where the underlying capability permits.
- Notifications for completion are delivered via webhooks or the platform event bus.

## Idempotency

- The `X-Idempotency-Key` is a client-supplied opaque string, unique per logical operation, retained by the server for a documented window.
- Repeat requests with the same key and identical payload return the **original response**; repeat requests with the same key and a differing payload return a specific error (`platform.api.idempotency_conflict`).
- Idempotency keys are scoped by principal and endpoint; keys are not portable across users or resources.
- The retention window is defined by the platform (long enough to cover realistic retry storms; not indefinite).

## Concurrency

- Resources that support optimistic concurrency expose an `ETag` on read and require `If-Match` on unsafe writes.
- A stale `If-Match` returns `412 Precondition Failed` with the canonical error envelope and code `platform.api.version_conflict`.
- Aggregate roots MAY additionally expose a monotonically increasing `version` in the resource; both forms are equivalent and interchangeable in specifications.

## Webhooks

- **Delivery** — webhooks are HTTP POST to a caller-registered URL with a signed JSON payload containing an event envelope: `{ id, type, occurredAt, tenantId, dataVersion, data, correlationId }`.
- **Signing** — every delivery carries a signature header derived from a per-subscription secret. Receivers MUST verify the signature before processing.
- **Retries** — failed deliveries are retried with exponential backoff and a maximum attempt count. After exhaustion, the event moves to a dead-letter surface accessible to the tenant.
- **Replay** — a tenant MAY request replay of past events within the retention window through a dedicated administrative surface. Replayed events are marked as such in the envelope.
- **Ordering** — webhooks are best-effort ordered per aggregate; consumers MUST tolerate out-of-order delivery and use `occurredAt` and `dataVersion` for reconciliation.
- **At-least-once** — deliveries are at-least-once; consumers MUST be idempotent on `event.id`.

## Event Publishing vs API

- **APIs** are pull-and-request contracts owned by the *called* domain.
- **Events** are push contracts owned by the *emitting* domain.
- The same capability is typically exposed both ways; the two contracts evolve independently, and each has its own versioning and deprecation lifecycle.
- Event schemas live in the Event Catalog (Pass 4A) and follow analogous consistency rules.

## Rate Limiting & Quotas

- Rate limits protect the platform and per-tenant fairness. Every API MUST document its limit tier or inherit a default.
- Limits are enforced per principal, per tenant, and (where relevant) per endpoint.
- Exceeded limits return `429 Too Many Requests` with `Retry-After` and the canonical error envelope.
- Quota-oriented limits (daily/monthly budgets, e.g. for AI capabilities) are surfaced through response `meta` where applicable so callers can throttle proactively.
- Rate limiting is coordinated with security controls; abuse patterns are handled by Security Architecture rather than by tightening API limits alone.

## Deprecation Policy

- Deprecation is a **signal**, not an event. Deprecated fields and endpoints continue to function throughout the announced window.
- A deprecated surface MUST carry a `Deprecation` response header and a corresponding entry in `meta.warnings`, including a link to the successor.
- Deprecation windows are proportional to consumer impact: internal-only surfaces MAY deprecate on short notice; publicly consumed surfaces observe extended windows per *API Lifecycle Governance*.
- Removal of a deprecated surface is a **major version change** or, for a specific field, requires an ADR documenting the rationale and the enforced window.

## API Lifecycle Governance

Every public or partner-facing API surface progresses through six lifecycle states. The state is part of the API specification and MUST be published to consumers.

### States

**Draft**
- **Purpose** — capture an emerging capability so downstream teams can align.
- **Intended Audience** — internal designers and reviewers only.
- **Stability Expectations** — none. Shape may change without notice.
- **Compatibility Requirements** — none.
- **Documentation Requirements** — problem statement, proposed shape, open questions.
- **Exit Criteria** — reviewed, approved for external experimentation, and moved to Preview.

**Preview**
- **Purpose** — obtain real-world feedback from selected consumers.
- **Intended Audience** — opt-in internal and design-partner consumers.
- **Stability Expectations** — best effort; breaking changes are possible with advance notice.
- **Compatibility Requirements** — backward-compatible changes preferred; breaking changes documented in changelog.
- **Documentation Requirements** — complete request/response specification, error catalogue, examples, and explicit Preview banner.
- **Exit Criteria** — feature-complete, telemetry adequate, no unresolved consumer blockers, and an owner accountable for GA.

**General Availability (GA)**
- **Purpose** — become part of the platform's stable contract.
- **Intended Audience** — all authorized consumers.
- **Stability Expectations** — full stability guarantees within the major version.
- **Compatibility Requirements** — only additive changes; no breaking modifications without a new major version.
- **Documentation Requirements** — full specification, SLAs where applicable, migration notes from any preceding Preview.
- **Exit Criteria** — a successor surface has reached GA and the current surface has entered Deprecated.

**Deprecated**
- **Purpose** — signal that a successor is preferred and that removal is planned.
- **Intended Audience** — all existing consumers; new consumers are discouraged.
- **Stability Expectations** — behaviour unchanged from GA for the duration of the deprecation window.
- **Compatibility Requirements** — no functional regressions; only bug fixes and security patches.
- **Documentation Requirements** — deprecation notice, successor link, timeline, migration guide.
- **Exit Criteria** — announced sunset date reached and Sunset state entered.

**Sunset**
- **Purpose** — final period before removal.
- **Intended Audience** — remaining consumers who have not yet migrated.
- **Stability Expectations** — behaviour preserved; degraded telemetry may increase caller warnings.
- **Compatibility Requirements** — critical security fixes only.
- **Documentation Requirements** — imminent-removal banner and final migration reminders.
- **Exit Criteria** — removal date reached.

**Retired**
- **Purpose** — the surface no longer exists.
- **Intended Audience** — historical documentation only.
- **Stability Expectations** — n/a; calls return a specific "gone" error.
- **Compatibility Requirements** — none.
- **Documentation Requirements** — tombstone entry retained in the API index for traceability.
- **Exit Criteria** — none.

### Backward Compatibility Expectations

- Removing a field, tightening a constraint, changing a type, or altering error semantics is **breaking**.
- Adding an optional field, a new endpoint, a new enum value in an already open-ended field, or a new optional parameter is **non-breaking**.
- Enum fields that are meant to remain closed MUST be documented as such; consumers MUST NOT assume closure of an enum that is not so declared.

### Version Support Philosophy

- The platform maintains at most two concurrent major versions of any given surface at GA at once. A third major version is permitted only during a transition.
- A previous major version enters Deprecated when its successor reaches GA and progresses through Sunset and Retired on a schedule proportional to consumer impact.

### Deprecation & Sunset Communication

- Deprecation is announced in the API specification, in response headers, in release notes, and in the deprecation register — in that order and simultaneously.
- Sunset dates are announced no later than entry into Deprecated and are not shortened once announced.
- Extensions to a sunset date are permitted; contractions are not.

### Governance Scope

- API Lifecycle Governance describes *policy*, not tooling. Concrete gates (pipelines, contract testing, portal automation) belong to Pass 4D.

## SDK & Contract Generation Principle

- SDKs are **derived artifacts**, not hand-written per language.
- The canonical specification is authoritative; every SDK, portal, mock server, and contract test is generated or driven from it.
- SDK style (naming, error surfacing, pagination iterators, retries) is standardized across languages so consumers moving between languages see analogous patterns.

## API Decisions Pending

| Topic | Why Deferred | Rough Window | Owner | ADR Placeholder |
|---|---|---|---|---|
| Specification format (OpenAPI vs alternative) | Implementation-level choice; governance is style-agnostic. | Before first GA release. | Platform | ADR-TBD |
| GraphQL scope and gateway placement | Only meaningful once analytical/portal surfaces are chartered. | Pass 5 or later. | Platform + Intelligence | ADR-TBD |
| Streaming protocol (SSE vs WebSocket vs long-poll) per capability | Depends on capability profile and infrastructure. | With each streaming capability. | Platform + owning domain | ADR-TBD |
| Rate-limit tiers and default budgets | Requires production telemetry. | Post-GA. | Platform | ADR-TBD |
| Webhook retention and replay window | Cost/compliance trade-off. | Pass 4D (Operational Architecture). | Platform | ADR-TBD |

*Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation.*

## Conforms to Canon

- **A.3 / A.4** — This document defines platform contracts; downstream PRDs and code conform to it.
- **P.2** — Normative keywords (MUST / SHOULD / MAY) are used per RFC 2119.
- **Canon multi-tenancy chapter** — tenancy is carried in claims and headers, validated on every request, never inferred from the URL.
- **Canon observability chapter** — every request carries a correlation identifier propagated end-to-end.
- **Canon security chapter** — errors never leak internal state; authorization scope narrows filters and searches.
- **Canon evolution chapter** — deprecation is a signal with a mandated window; breaking changes require a new major version.

## References

- Master Architecture (Pass 4A)
- Domain-Driven Design (Pass 4A)
- Domain Map (Pass 4A)
- Multi-Tenant Architecture (Pass 4B)
- Database Standards (Pass 4B)
- Data Dictionary (Pass 4B)
- Event Catalog (Pass 4A)
- ADR-0007 — REST-First API Style
- BusinessOS Canon
