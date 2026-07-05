---
title: "UX Standards"
summary: "Behavioural standards for BusinessOS: journeys, navigation, keyboard-first entry, search, filters, bulk operations, errors, notifications, mobile, offline, accessibility, and i18n."
layer: "platform"
owner: "Platform"
status: "approved"
updated: "2026-07-05"
tags: ["design", "ux"]
depends_on:
  - "docs/canon.md"
  - "docs/02-architecture/master-architecture.md"
  - "docs/02-architecture/ai-architecture.md"
  - "docs/02-architecture/security-architecture.md"
  - "docs/02-architecture/quality-attributes.md"
  - "docs/03-design/ui-ux-design-system.md"
referenced_by: []
document_type: "Design Standard"
---

# UX Standards

*Part of Pass 4D — the final architecture documentation layer before ERP
Core Engines (shared reusable platform capabilities).*

## Overview

UX Standards define **how users interact with BusinessOS** — the
behavioural rules that make every screen feel like part of one product.
Where the Design System governs *how things look*, this document governs
*how things behave*.

Specific frameworks, runtime versions, vendors, and implementation choices
are intentionally deferred to ADRs and implementation documentation.

## UX Principles

- **UX-01 · Users Work, We Follow.** ERP users are professionals; the UX
  optimizes for repeated expert use, not first-time novelty.
- **UX-02 · Predictable Above All.** The same action produces the same
  result in the same way, across every module.
- **UX-03 · Keyboard is a First-Class Input.** Every critical flow is
  completable without a pointing device.
- **UX-04 · Reversible by Default.** Destructive actions are confirmed;
  irreversible actions are elevated to explicit confirmation with
  identity re-verification when required.
- **UX-05 · Explain, Don't Blame.** Errors describe cause and next step,
  never merely a code.
- **UX-06 · Respect the User's Time.** No unnecessary steps, no
  gratuitous animation, no blocking UI where async will do.
- **UX-07 · Copilot is a Collaborator.** AI assists, suggests, and asks
  for approval; it never surprises.
- **UX-08 · Trust is Earned Every Interaction.** State is honest; sync,
  save, and permission status are always visible.

## User Journey Standards

- Every module documents its **primary journeys** end-to-end.
- Journeys have declared entry points, expected outcomes, and recovery
  paths.
- Cross-module journeys preserve scope (tenant, company, branch, fiscal
  period, currency).
- AI-assisted journeys reveal AI participation and provide human-only
  fallbacks.

## Navigation Standards

- Top-level navigation reflects the domain map and is stable.
- Users can always return to the previous meaningful context.
- Deep links are shareable, permission-aware, and preserve scope.
- Modals do not stack more than one deep; nested modality is a UX
  smell.
- Scope switchers (company, branch, fiscal year) are consistent and
  discoverable.

## Keyboard-first Principles

- Every actionable element is keyboard-reachable in a logical order.
- Focus is always visible.
- Common actions have consistent shortcuts platform-wide.
- Voucher and grid entry supports full-keyboard workflows without
  pointer detours.
- Shortcut inventories are discoverable in-product.

## ERP Data Entry Standards

- Data entry is optimized for speed and correctness of *repeat* users.
- Validation is progressive: field-level on blur, cross-field on save.
- Autosave and draft semantics are explicit.
- Numeric entry supports paste, formula-lite input where applicable, and
  locale-aware formats.
- Reference lookups are keyboard-driven with typeahead and recent items.
- Bulk paste into grids is supported for common cases.

## Search UX

- One consistent search surface per scope (global, module, list).
- Results are ranked with visible rationale where useful.
- Filters and facets are additive and clearable in one action.
- Recent, saved, and shared searches are first-class.
- Permission-filtered: users never see what they cannot access.

## Filter UX

- Filter panels are consistent across modules.
- Applied filters are visible, chip-style, and removable individually.
- Filter state is shareable via URL where privacy permits.
- Numeric, date, enum, and reference filter primitives are governed.

## Bulk Operations UX

- Selection is explicit; "select all" clearly distinguishes page vs
  entire result set.
- Bulk actions preview affected count before execution.
- Long-running bulk actions are asynchronous with progress, cancel, and
  audit trail.
- Partial failures are reported per row with actionable recovery.

## Error UX

- Errors are specific, actionable, and localized.
- System errors carry a correlation identifier for support.
- Field-level errors sit next to the field; global errors sit in a
  consistent location.
- Permission-denied is never disguised as "not found."

## Notification UX

- Notifications distinguish **transient** (toast), **persistent** (inbox),
  and **critical** (blocking) severities.
- Critical notifications require acknowledgment.
- Users can tune notification preferences per channel and per category.
- AI-generated notifications are labeled as such.

## Mobile UX

- Mobile UX is optimized for **field operations**, not full ERP data
  entry.
- Touch targets, gestures, and forms are tuned for handheld use.
- Camera, barcode/QR, signature, and location surfaces follow governed
  patterns.
- Battery-, bandwidth-, and offline-aware behaviour is default.

## Offline UX

- Offline availability is declared per screen.
- Local edits show unambiguous "pending sync" state.
- Sync outcomes (success, conflict, failure) are surfaced clearly.
- Conflict resolution UI presents both sides and a governed choice.
- Offline sessions honour session-timeout policies from Security
  Architecture.

## Accessibility

- Every screen meets the accessibility conformance level declared in
  Quality Attributes.
- Keyboard-only, screen-reader, high-contrast, and reduced-motion
  usage are exercised for critical flows.
- Text alternatives, meaningful headings, and semantic structure are
  mandatory.

## Internationalization UX

- Language, region, calendar, number, currency, and address formats
  follow user or tenant preference.
- Right-to-left languages are fully supported.
- No user-visible string is hard-coded.
- Sort orders and search behaviour respect locale.

## UX Decisions Pending

| Topic | Why Deferred | Rough Window | Owner |
|---|---|---|---|
| Global shortcut inventory | Requires Module PRDs to enumerate primary actions | Rolling, per module | Product + Design |
| Notification-channel matrix | Depends on notification-engine scope in Pass 5 | With Pass 5 notification engine | Product + Platform |
| Offline capability catalogue | Requires Module PRDs | Rolling, per module | Product |
| Copilot-in-UX interaction patterns | Depends on AI capability rollout | With first AI-assisted module | Design + AI |

ADR placeholders: **ADR-UX-001 · Shortcut Inventory**, **ADR-UX-002 ·
Notification Channels**, **ADR-UX-003 · Offline UX Catalogue**,
**ADR-UX-004 · Copilot Interaction Patterns**.

## Conforms to Canon

- Least privilege is reflected in the UI (Canon: Security).
- Accessibility is not optional (Canon: Accessibility).
- AI participation is transparent and reversible (Canon: AI as Scoped
  Principal).
- Non-repudiable audit is preserved for user-visible actions (Canon:
  Audit).

## References

- `docs/03-design/ui-ux-design-system.md`
- `docs/02-architecture/ai-architecture.md`
- `docs/02-architecture/security-architecture.md`
- `docs/02-architecture/quality-attributes.md`
