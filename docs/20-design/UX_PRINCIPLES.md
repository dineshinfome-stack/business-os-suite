---
title: "UX Principles"
summary: "Premium-enterprise UX philosophy for Business OS: density with clarity, speed to first transaction, and disciplined restraint."
document_type: "Design Standard"
layer: "design"
owner: "Design Council"
status: "Approved"
version: "1.0.0"
last_reviewed: "2026-07-23"
next_review: "2027-01-23"
supersedes: "none"
tags: ["design", "ux", "principles"]
---

# UX Principles

## Philosophy

Business OS is used by operators for hours a day. The UX MUST feel premium the first minute and productive by the tenth. It is not a marketing site; it is not a consumer app.

## Principles

1. **Density with clarity.** Show what operators need to see; hide what they don't. Density is not clutter — it is the absence of wasted space.
2. **Speed is a feature.** Every interaction has a perceived latency target. See `PERFORMANCE_BUDGETS_STANDARD.md`.
3. **Keyboard first, mouse second, touch parity.** Every primary action is reachable from the keyboard.
4. **Progressive disclosure.** Expose complexity when the operator asks for it, never before.
5. **Consistency over cleverness.** The same action in two modules looks and behaves the same way.
6. **Statutory-first, then delight.** Compliance surfaces come first; polish never blocks them.
7. **Fail visibly, recover quickly.** Errors are unambiguous, addressable, and never destructive by default.

## Anti-Patterns

- Generic AI aesthetics (Inter + purple-indigo gradients on white).
- Marketing-style hero sections inside operator surfaces.
- Multi-step wizards where a single dense form would do.
- Modal-on-modal stacking.
- Silent state changes.
- Toasts as the only surface for critical errors.

## Governance

Governed by `STANDARDS_LIFECYCLE_STANDARD.md`.
