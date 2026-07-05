---
title: "Coding Standards"
summary: "Engineering standards for BusinessOS: clean architecture, DDD, type safety, naming, module boundaries, error handling, logging, docs, review, and technical debt."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["engineering", "standards"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/domain-driven-design.md"
  - "docs/02-architecture/api-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/observability-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
referenced_by: []
document_type: "Engineering Standard"
---

# Coding Standards

*Part of Pass 4D — the final architecture documentation layer before ERP
Core Engines (shared reusable platform capabilities).*

## Overview

Coding Standards define **how BusinessOS code is structured, written,
reviewed, and evolved.** It is language-neutral and tooling-neutral: no
specific language syntax, linter, formatter, or IDE configuration is
prescribed here.

Specific frameworks, runtime versions, vendors, and implementation choices
are intentionally deferred to ADRs and implementation documentation.

## Coding Principles

- **CS-01 · Clarity Over Cleverness.** Code is written to be read.
- **CS-02 · Correctness Before Performance.** Optimize only against a
  measured budget from Quality Attributes.
- **CS-03 · Boundaries are Sacred.** Bounded contexts and module
  boundaries are enforced.
- **CS-04 · Explicit Over Implicit.** Magic is a maintenance debt.
- **CS-05 · Fail Loud, Fail Early.** Invalid states are rejected at the
  boundary, not tolerated internally.
- **CS-06 · Tested by Its Author.** Code arrives with tests.
- **CS-07 · Reviewed Before Merge.** Every change is reviewed by someone
  who did not write it.
- **CS-08 · Documented Where It Isn't Obvious.** Non-obvious intent has a
  written record.

## Clean Architecture Rules

- Dependencies point **inward**: infrastructure depends on application,
  which depends on domain; the domain depends on nothing framework-
  specific.
- The domain has **no I/O**: no HTTP, database, filesystem, or clock
  access.
- Adapters implement ports; ports are declared by the application layer.
- Frameworks are **replaceable**; the domain is not.
- Cross-cutting concerns (logging, auth, tracing) enter via
  infrastructure adapters, never by direct import from the domain.

## DDD Rules

- Each bounded context has its own **ubiquitous language**, model, and
  storage.
- Entities encapsulate identity; value objects are immutable and
  compared by value.
- Aggregates enforce invariants; only aggregate roots are addressable
  from outside.
- Cross-context communication uses **explicit contracts** (APIs and
  events), never shared tables or shared in-process types.
- Anti-corruption layers translate external models at the boundary.

## Type Safety Principles

- Static typing is used pervasively where the language supports it.
- Domain primitives are wrapped in named types; "stringly typed"
  identifiers are prohibited across boundaries.
- Nullability is explicit and narrow.
- Public contracts have exhaustive, machine-readable types (API and
  event schemas per API Architecture and Event Catalog).
- `unknown`/`any`-shaped values entering the system are validated at the
  boundary.

## Naming Standards

- Names reflect **domain intent**, not implementation.
- Abbreviations are avoided unless part of the ubiquitous language.
- Booleans read as predicates (`isPosted`, `hasApproval`).
- Enums use full domain names, not codes.
- Files, folders, and symbols align with the module they inhabit.

## Folder Structure

- Top-level folders reflect **architectural layers**, not framework
  conventions.
- Within a bounded context, structure reflects the domain (aggregates,
  policies, application services) rather than technical taxonomies
  (controllers, services, repos).
- Test code sits next to the code it tests where the language permits.
- Generated code is separated from hand-written code.

## Module Boundaries

- Modules expose an explicit **public surface**; everything else is
  internal.
- Cross-module imports are permitted only through the public surface.
- Circular dependencies between modules are prohibited.
- Cross-cutting utilities live in a governed shared kernel with a
  documented, minimal surface.

## Dependency Rules

- Third-party dependencies require justification and review.
- Every dependency has an owning module and an upgrade cadence.
- Direct dependencies on vendor SDKs live behind an adapter.
- License compatibility is verified at intake and continuously.

## Error Handling

- Errors are **domain-typed** where they express domain outcomes; only
  truly exceptional conditions use language-level exceptions.
- Errors carry enough context to be actionable (correlation id, code,
  category, message) — never raw stack traces to end users.
- Errors respect Data Classification: no sensitive data in messages
  destined for logs, users, or clients.
- The boundary between recoverable and non-recoverable errors is
  explicit.
- Retry, timeout, and circuit-breaker behaviour follows Integration
  Architecture.

## Logging Rules

- Logging is **structured** per Observability Architecture.
- Log levels have consistent meaning across modules.
- No PII, secrets, tokens, or sensitive payload in logs.
- Every log line at warning or higher is actionable.
- Debug logs are gated and time-bounded in production.

## Documentation Standards

- Every module documents: purpose, public surface, invariants,
  dependencies, and observability signals.
- Public APIs and events are documented with contracts, not narratives
  alone.
- Non-obvious decisions are captured either inline (short) or as an
  ADR (durable).
- Documentation lives next to the code it describes and is reviewed
  with it.

## Code Review Standards

- Reviewers verify: correctness, boundary integrity, tests, security,
  observability, accessibility (for UI), and documentation.
- Reviews focus on **design and risk**, not style — style is
  automated.
- Blocking comments name the risk; suggestions name the improvement.
- A review is not a rubber stamp; approving without reading is
  misconduct.
- AI-assisted authorship is permitted; AI-assisted approval is not.

## Technical Debt Policy

- Debt is **explicit**: tracked, owned, sized, and prioritized.
- Debt taken deliberately is annotated with rationale and payoff plan.
- Debt discovered incidentally is captured, not silently tolerated.
- Every release cycle allocates capacity to debt reduction.
- Debt that threatens Canon guarantees is a stop-the-line event.

## Coding Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Primary language(s) and toolchain | Vendor and runtime selection follows Deployment ADRs | With ADR-DEP-001 | Platform |
| Linter and formatter profile | Depends on chosen language | With language ADR | Platform |
| Dependency-intake policy details | Depends on supply-chain posture | With Security Architecture supply-chain ADR | Platform + Security |
| Monorepo vs polyrepo layout | Depends on chosen toolchain and team topology | Before Pass 5 kickoff | Platform |

ADR placeholders: **ADR-CS-001 · Language and Toolchain**, **ADR-CS-002
· Repo Topology**, **ADR-CS-003 · Dependency-Intake Policy**,
**ADR-CS-004 · Lint/Format Profile**.

## Conforms to Canon

- Bounded contexts and least privilege are honoured in code structure
  (Canon: Architecture, Security).
- Auditability is preserved in error paths (Canon: Audit).
- AI-assisted authorship never bypasses review (Canon: AI as Scoped
  Principal).
- Accessibility responsibilities are visible in UI code (Canon:
  Accessibility).

## References

- `docs/02-architecture/master-architecture.md`
- `docs/02-architecture/domain-driven-design.md`
- `docs/02-architecture/api-architecture.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/integration-architecture.md`
- `docs/02-architecture/observability-architecture.md`
- `docs/02-architecture/quality-attributes.md`
- `docs/03-design/ui-ux-design-system.md`
- `docs/03-design/ux-standards.md`
