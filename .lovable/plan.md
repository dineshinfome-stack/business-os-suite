# Pass 4D — Operational Architecture

**Final architecture documentation layer before ERP Core Engines (shared reusable platform capabilities).** Author ten vendor-neutral, normative documents that complete the architectural baseline before Pass 5.

## Deliverables

Ten documents total. Nine core operational architecture documents plus one navigational index. All replace existing stubs unless marked new. All conform to Canon and Passes 4A/4B/4C.

### Architecture group (`docs/02-architecture/`)

0. **README.md** (new) — Architecture navigation index. Sections: Architecture Overview · Reading Order (Canon → Business Blueprint → Master Architecture → DDD → Domain Map → Data Constitution → Platform Constitution → Operational Architecture → ERP Core Engines) · Architecture Layers (Enterprise, Data, Platform, Operational) · Which Document Answers Which Question (table) · Cross-Reference Map · Architecture Governance (Canon = highest authority; ADRs amend; Engines build upon; PRDs consume) · **Architecture Evolution** (architecture documents are stable; architectural changes happen through ADRs; ERP Core Engines build on architecture; Module PRDs must not redefine architecture; Sprint PRDs implement Module PRDs) · References. Informational only — introduces no new principles.

1. **deployment-architecture.md** (replace stub) — Overview · Deployment Principles · Environment Strategy · Environment Promotion · Runtime Architecture · Scaling Principles · High Availability · Disaster Recovery Philosophy · Backup Philosophy · Restore Principles · Geographic Expansion Strategy · Configuration Management · Decisions Pending · Conforms to Canon · References.

2. **devops-architecture.md** (replace stub) — Overview · DevOps Principles · Release Strategy · Branching Philosophy · Continuous Delivery Principles · Configuration Promotion · Artifact Strategy · Environment Governance · Feature Flag Philosophy · Release Governance · Rollback Principles · Change Management · Operational Readiness Reviews · Decisions Pending · Conforms to Canon · References.

3. **testing-strategy.md** (replace stub) — Overview · Testing Philosophy · Testing Pyramid · Unit · Integration · Contract · E2E · Performance · Security · Accessibility · Regression · Test Data · Test Environments · Quality Gates · Decisions Pending · Conforms to Canon · References.

4. **observability-architecture.md** (new) — Overview · Observability Principles · Logs · Metrics · Traces · Correlation Strategy · Health Model · Telemetry Strategy · Alerting Philosophy · Diagnostics · SLOs · Decisions Pending · Conforms to Canon · References.

5. **integration-architecture.md** (new) — Overview · Integration Principles · Internal Integration · External Integration · Integration Styles · Event Choreography · Event Orchestration · Retry Philosophy · Idempotency · Circuit Breaker · Dead Letter · Data Synchronization · Version Compatibility · Integration Security · Decisions Pending · Conforms to Canon · References.

6. **quality-attributes.md** (new canonical NFR reference in `02-architecture/`) — Overview · Quality Attribute Principles · Availability · Reliability · Scalability · Performance · Maintainability · Extensibility · Security · Accessibility · Localization · Offline Capability · Recoverability · DR Objectives · Supportability · Operability · Quality Trade-offs · Decisions Pending · Conforms to Canon · References.

### Design group (`docs/03-design/`)

7. **ui-ux-design-system.md** (replace stub) — Design Philosophy · Design Tokens · Color Principles · Typography · Spacing · Elevation · Responsive Grid · Component Library Principles · Forms · Tables · Navigation · Dashboard Standards · Mobile Standards · Accessibility · Dark Mode · Localization · Offline UX · Decisions Pending · Conforms to Canon · References.

8. **ux-standards.md** (replace stub / re-author) — UX Principles · User Journey Standards · Navigation Standards · Keyboard-first · ERP Data Entry Standards · Search UX · Filter UX · Bulk Operations UX · Error UX · Notification UX · Mobile UX · Offline UX · Accessibility · Internationalization UX · Decisions Pending · Conforms to Canon · References.

9. **coding-standards.md** (replace stub) — Coding Principles · Clean Architecture Rules · DDD Rules · Type Safety Principles · Naming Standards · Folder Structure · Module Boundaries · Dependency Rules · Error Handling · Logging Rules · Documentation Standards · Code Review Standards · Technical Debt Policy · Decisions Pending · Conforms to Canon · References.

## Consistency Requirements

Every normative doc includes:
- Standard frontmatter with `depends_on` citing Passes 4A/4B/4C.
- **Conforms to Canon** section citing specific Canon rules.
- **Decisions Pending** table (topic · why deferred · rough window · owner) with ADR placeholders.
- Vendor-neutral verbatim clause: *"Specific frameworks, runtime versions, vendors, and implementation choices are intentionally deferred to ADRs and implementation documentation."*
- Cross-references to Master Architecture, API/Security/AI Architecture, Data Constitution, and Quality Attributes where applicable.

The README is the only exception — navigation-index frontmatter; omits Decisions Pending and normative clauses.

## Portal Updates

Update `docs/_meta.json`:
- Under **02-architecture**: register **README as the first entry** (landing page). Then register Quality Attributes, Observability Architecture, Integration Architecture in logical order.
- Under **03-design**: ensure Design System, UX Standards, and Coding Standards are registered.

No routing changes. No package additions. No UI changes.

## Non-Goals

Cloud providers · CI/CD products · monitoring vendors · infrastructure tooling · frameworks · SDKs · module/engine implementation · ADR decisions · source code · test frameworks · lint configuration · Figma components · CSS frameworks.

## Technical Details

- The existing `docs/quality-attributes.md` (root-level stub) is superseded by `docs/02-architecture/quality-attributes.md` and will be removed to avoid a stale duplicate; any references get re-pointed to the new path.
- Wording "Final architecture layer" is replaced throughout Pass 4D artifacts with **"Final architecture documentation layer before ERP Core Engines (shared reusable platform capabilities)."**
- Frontmatter `layer` values follow existing stub conventions (`platform`).
- All ten documents authored in parallel file writes; `_meta.json` updated in the same batch.

## Acceptance Criteria

- Ten documents authored (nine core + README index).
- Architecture README present with reading order, layer explanations, question→document table, cross-reference map, governance section, and **Architecture Evolution** section; introduces no new principles.
- Quality Attributes located at `docs/02-architecture/quality-attributes.md`; old root stub removed.
- Observability and Integration Architecture authored as standalone documents.
- UX Standards authored separately from the Design System.
- Every normative doc contains Decisions Pending with ADR placeholders and Conforms to Canon citations.
- Wording updated to "Final architecture documentation layer before ERP Core Engines."
- `docs/_meta.json` updated: README first under 02-architecture; new architecture entries registered; design-group entries confirmed.
- No implementation details, vendor names, product names, or code leak into any document.

## Completion Gate

With Pass 4D complete, Passes 4A–4D form the full architectural baseline. Pass 5 (ERP Core Engines) may then begin.
