---
document: EEMP Chapter 20 — Appendix
version: 0.2.0
last_reviewed: 2026-07-23
next_review: 2027-01-23
owner: Project Architecture
approval_status: Draft
lifecycle_state: Draft
supersedes: none
---

# Chapter 20 — Appendix

Orchestration-only appendix. Populated incrementally as later phases discover conflicts, glossary additions, and cross-reference gaps. Governance conflicts are recorded here and resolved elsewhere (R-01, R-18).

## Detected Conflicts

This section records discrepancies detected during Repository Discovery. The EEMP does not resolve them — resolution belongs to the authoritative document owners.

| # | Topic | Documents | Category | Detected By | Recommended Owner | Status |
|---|-------|-----------|----------|-------------|-------------------|--------|
| C-001 | Database standards duplication | `docs/02-architecture/database-standards.md` **vs** `docs/15-governance/DATABASE_STANDARD.md` | Overlapping — similar topic, different scope | Ch. 07 Discovery (Phase 2) | Governance owner + Architecture owner | Open — Informational |
| C-002 | Solution Design corpora | `docs/46-solution-design/` **vs** `docs/60-solution-design/` | Overlapping — one appears superseded by the other | Ch. 09 Discovery (Phase 2) | Solution Design owner | Open — Minor |

Categories: **Duplicate** (same content) · **Overlapping** (similar topic, different scope) · **Conflicting** (contradictory guidance).

## Glossary Additions

Phase 4 discovery surfaced no terms that are not already indexed in `docs/glossary.md` and `docs/GLOSSARY_INDEX.md`. Contributors should propose additions to those authoritative glossaries directly (R-01, R-19) rather than duplicating them here. This section will list Phase-5+ additions if any arise.

## Acronyms

EEMP-specific acronyms only. Domain acronyms live in `docs/GLOSSARY_INDEX.md`.

| Acronym | Expansion |
|---------|-----------|
| EEMP | Engineering Execution Master Plan |
| DoR | Definition of Ready |
| DoD | Definition of Done |
| ADR | Architecture Decision Record |
| RACI | Responsible · Accountable · Consulted · Informed |
| SD | Solution Design (WEB / MOB / API) |
| PRD | Product Requirements Document |
| MOD | Module identifier prefix |

## Revision History

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1.0 | 2026-07-23 | Project Architecture | Initial draft — Detected Conflicts seeded from Phase 2 discovery. |
| 0.2.0 | 2026-07-23 | Project Architecture | Phase 4 finalization — Glossary Additions and Acronyms populated; Detected Conflicts preserved unchanged. |
