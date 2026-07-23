---
document: IMP Chapter 05 — Release Strategy
version: 1.0.0
owner: Release Management
approval_status: Draft
---

# 05 — Release Strategy

## Philosophy
Ship the platform to General Availability first, then release business modules wave-by-wave. Each wave produces a coordinated Alpha → Beta → RC → GA progression across all modules in that wave.

## Milestones per Module

| Milestone | Definition | Entry | Exit |
|---|---|---|---|
| Alpha | Feature-complete for the critical path of Sprint 001–00N | All Sprint PRDs implemented; unit tests green | Internal demo signed off |
| Beta | End-to-end usable by pilot users | Alpha + integration tests + docs | Pilot org onboarded |
| RC | Zero P0 defects; performance & security validated | Beta + EEMP Ch. 14 gates | Release note signed |
| GA | Production general availability | RC + Go-Live checklist (EEMP Ch. 19) | Published Module Publication updated |
| LTS | Long-term support branch | +3 months post-GA | Maintenance mode |

## Versioning
Semantic versioning per module: `MOD-00N vMAJOR.MINOR.PATCH`. Platform releases (MOD-001) are the anchor version; business modules pin to a minimum platform version.

## Release Trains
- Platform releases: quarterly cadence.
- Wave releases: coordinated GA at the end of each wave.
- Hotfixes: PATCH releases per module as needed.

## References
- EEMP Ch. 19 Go-Live and Release
- EEMP Ch. 17 Documentation Standards
- `indexes/release_matrix.md`
