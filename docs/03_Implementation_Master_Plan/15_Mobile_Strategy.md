---
document: IMP Chapter 15 — Mobile Strategy
version: 1.0.0
owner: Mobile Platform
approval_status: Draft
---

# 15 — Mobile Strategy

## Sequencing
Mobile follows stable APIs. A module's mobile surface begins implementation only after that module's API reaches Beta.

## Offline & Sync
Per each Mobile Solution Design under `docs/60-solution-design/mobile/`; the IMP does not restate these.

## Release Sequencing
Mobile ships in a rolling cadence: Platform mobile → Master Data mobile → Commercial mobile → Service mobile → others.

## Dependency Rule
No mobile screen ships against an API below Beta.

## References
- `docs/60-solution-design/mobile/`
- EEMP Ch. 05 UI/UX Standards
