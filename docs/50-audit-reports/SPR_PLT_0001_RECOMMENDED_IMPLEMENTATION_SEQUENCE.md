---
title: "SPR-PLT-0001 — Recommended Implementation Sequence"
sprint_id: "SPR-PLT-0001"
classification: "Platform Experience Sprint (PLT)"
mode: "Repository-first, governance-driven"
status: "Proposal — Awaiting Architecture Board Review"
owner: "Platform"
created: "2026-07-24"
updated: "2026-07-24"
document_type: "Recommended Implementation Sequence"
authority: "Architecture Board (pending)"
tags: ["sprint", "discovery", "platform", "super-admin", "sequence"]
related_docs: ["docs/50-audit-reports/SPR_PLT_0001_DISCOVERY_REPORT.md"]
---

# SPR-PLT-0001 — Recommended Implementation Sequence

## Purpose

Propose a capability-level implementation sequence for the Super Admin Portal
and Tenant Provisioning, derived from the Repository Discovery Report. This is
a proposal only. It prescribes no file paths, no permission names, no component
names, no server-function names, and no schema shapes. Those are Architecture
Board decisions to be scoped in follow-on implementation sprints.

## Governance Posture

- No implementation is authorized by this document.
- Each proposed phase becomes a separate implementation sprint after approval.
- Any recommendation for new permissions, primitives, or schema evolution must
  be reviewed and ratified by the Architecture Board during scoping of the
  relevant phase.

## Proposed Implementation Phase A — Platform Shell & Navigation

- Introduce a Super Admin surface within the existing protected subtree using
  existing routing conventions.
- Extend the navigation registry to expose the Super Admin group to eligible
  roles.
- Assess whether additional permission keys are required and, if so, record
  proposed names as recommendations for Architecture Board review.
- Validation gates: type and lint clean; permission-manifest governance
  respected; sidebar visibility gated correctly.

## Proposed Implementation Phase B — Super Admin Dashboard

- Provide a platform overview covering tenant status counts, recent activity,
  and clearly labelled placeholders for licensing, storage, and health pending
  the licensing carry-forward.
- Determine whether reusable dashboard presentation primitives should be
  introduced, or whether existing primitives can be extended.
- Identify whether new aggregate read capabilities are required, or whether
  existing services can be composed.
- Validation gates: unit coverage for any new aggregate capabilities; visual
  smoke; permission gating verified.

## Proposed Implementation Phase C — Tenant Provisioning Experience

- Deliver a guided multi-step experience capturing tenant identity, primary
  company, primary admin, region, currency, time zone, and desired plan and
  license intent.
- Orchestrate the existing tenant, company, and invitation capabilities;
  assess whether a new orchestration capability is required or whether
  existing services can be composed transactionally.
- Assess whether new provisioning-related permissions are required and record
  recommendations for Architecture Board review.
- Validation gates: happy-path and rollback coverage; permission gating
  verified.

## Proposed Implementation Phase D — Licensing Intent Capture (data only)

- Determine whether existing tenant metadata can store licensing intent, or
  whether schema evolution is required.
- No enforcement, no plans table, no quotas, no billing. Explicitly deferred
  to the licensing carry-forward registered in the Discovery Report.
- Validation gates: schema and migration review if evolution is required;
  typed helpers covered by tests.

## Proposed Implementation Phase E — Testing & Quality

- Unit coverage for any new capabilities introduced across Phases A–D.
- Integration and end-to-end testing remain disclosed repository capability
  gaps (CF-6 and CF-7) and are unchanged by this sprint.
- Validation gates: full test run green; typecheck clean.

## Proposed Implementation Phase F — Sprint Acceptance & Closeout

- Governance-only. Standard six deliverables: Sprint Acceptance Review, Sprint
  Completion Report, SIP archive entry, Program Status Report, IMP CHANGELOG
  entry, and any updated carry-forwards.

## Stop Condition

The Discovery Report and this Recommended Implementation Sequence together
conclude SPR-PLT-0001. **No implementation begins until the Architecture Board
approves both documents.** After approval, each phase is scoped and prompted
separately.
