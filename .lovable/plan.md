## Preconditions verified

- ADR-018 is **Accepted** (ADR_INDEX line 70); ADR-017 Accepted (line 69).
- Gate 3.1 domain foundation present: `src/lib/provisioning/` has constants, lifecycle, types, errors, provider, retry, rollback, status, validators, events, tests.
- **No orchestration exists** — the only match for "orchestrat" in `src/` is a comment in `provider.ts`. Proceed (no STOP condition).

## Deliverables (documentation only)

1. **`docs/11-adrs/architecture/ADR-019-provisioning-orchestrator-architecture.md`** — new, Status: Proposed. Sections exactly as specified: Status, Context, Decision (SHALL / SHALL NOT), Execution Model, Transaction Boundaries, Idempotency, Concurrency, Event Flow, Provider Interaction, Failure Handling, Observability, Security, Non Goals, Alternatives Considered, Consequences, Dependencies, Future Gates. Front-matter matching the ADR-018 convention.
2. **`docs/11-adrs/ADR_INDEX.md`** — one row after ADR-018: `ADR-019 | Provisioning Orchestrator Architecture | Architecture / Platform | Proposed | ... | — | —`.
3. **`docs/60-engineering/ADR019_AUTHORING_SUMMARY.md`** — purpose, files created/modified, architecture validated, cross references, conflicts (expected: none), decision, Gate 3.2 readiness.

## Authoring rules applied

- ADR-019 references but never restates: lifecycle states, retry algorithm, rollback policy, provider contract, job/step schema (all owned by ADR-018 + Gate 3.1 code).
- Orchestrator described as coordination only: validate → create job → execute steps in canonical order → persist → emit → advance; on failure persist error → retry decision → rollback plan → final state.
- One DB transaction per step; never across provider calls; persist before advancing.
- Concurrency: exactly one active job per tenant, enforced by the existing Gate 3.1 constraint.
- Provider access solely through the `ProvisioningProvider` interface — no SDK, HTTP, or infrastructure references.
- Non-goals explicitly include workers, queues, cron, realtime, UI, secrets, provider implementation.

## Stop rule

After the three files are written, stop. No orchestrator code, server functions, migrations, or provider implementation.

## Note

As you observed, this ADR is optional rigor — ADR-018 plus Gate 3.1 already fix the key contracts. It is still worth it if you want the orchestration contract frozen before Gate 3.2 begins; it costs one authoring pass and zero runtime risk.
