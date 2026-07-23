---
document: IMP Chapter 18 — Risk Register
version: 1.0.0
owner: Program Delivery
approval_status: Draft
---

# 18 — Risk Register (Implementation)

## Implementation-Level Risks

| ID | Risk | Impact | Likelihood | Mitigation | Fallback |
|---|---|---|---|---|---|
| IR-01 | Platform (MOD-001) slips → cascades to all waves | Critical | Medium | Freeze scope; add reviewers | Ship subset of shared services |
| IR-02 | ADR-007 boundaries drift during Inventory/Warehouse build | High | Medium | Boundary review before each wave-E sprint | Refactor via ADR amendment |
| IR-03 | API instability causes mobile rework | High | Medium | Mobile waits for Beta APIs | Deprioritize mobile feature |
| IR-04 | Analytics substrate insufficient for AI Workspace | High | Low | Wave H starts after MOD-017 Beta | Delay MOD-018 |
| IR-05 | Sprint mis-classification into wrong wave | Medium | Low | Backlog + audit validation | Reassign in backlog |
| IR-06 | Duplication of governance content in IMP | Medium | Low | R-14 enforcement (Lowest Duplication) | Remove and reference |
| IR-07 | External integration provider outage (payments/tax/telematics) | High | Low | Sandbox first; retries; provider abstraction | Alternate provider |

## Cross-Reference
Full enterprise risk register: `docs/01-master/risk-register.md`.

## References
- `docs/01-master/risk-register.md`
- EEMP Ch. 18 Project Governance
